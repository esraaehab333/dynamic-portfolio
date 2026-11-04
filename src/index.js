/**
 * Cloudflare Worker Backend for Dynamic Portfolio
 * Features:
 * - Single source of truth for portfolio data
 * - Constant-time Bearer token authentication
 * - CORS restriction & OPTIONS preflight
 * - Body size limit (5 MB) & top-level JSON object validation
 * - 30 writes/min/IP rate limiting
 * - Server backups (keeping last 10 backups) with /backups and /restore
 * - /auth/check endpoint for admin verification
 * - Image upload handler
 */

const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5 MB
const RATE_LIMIT_MAX_WRITES = 30;
const RATE_LIMIT_WINDOW_SEC = 60;
const MAX_BACKUPS = 10;

// In-memory fallback rate limiter if KV is unavailable
const ipWriteTracker = new Map();

function getCORSHeaders(request) {
    const origin = request.headers.get('Origin') || '*';
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-Match',
        'Access-Control-Max-Age': '86400',
    };
}

function jsonResponse(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    });
}

async function safeCompareTokens(providedToken, expectedToken) {
    if (!providedToken || !expectedToken) return false;
    const encoder = new TextEncoder();
    const a = encoder.encode(providedToken);
    const b = encoder.encode(expectedToken);
    if (a.byteLength !== b.byteLength) return false;
    return crypto.subtle.timingSafeEqual(a, b);
}

async function verifyAdminAuth(request, env) {
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.substring(7).trim();
    const adminToken = env.ADMIN_TOKEN || 'admin-secret-token-change-me';
    return await safeCompareTokens(token, adminToken);
}

function isRateLimited(ip) {
    const now = Date.now();
    const windowMs = RATE_LIMIT_WINDOW_SEC * 1000;
    const record = ipWriteTracker.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
        record.count = 1;
        record.resetAt = now + windowMs;
        ipWriteTracker.set(ip, record);
        return false;
    }

    if (record.count >= RATE_LIMIT_MAX_WRITES) {
        return true;
    }

    record.count++;
    ipWriteTracker.set(ip, record);
    return false;
}

async function getPortfolioData(env) {
    if (env.PORTFOLIO_KV) {
        const val = await env.PORTFOLIO_KV.get('portfolio_data', 'json');
        if (val) return val;
    }
    return null;
}

async function savePortfolioData(env, data) {
    if (env.PORTFOLIO_KV) {
        await env.PORTFOLIO_KV.put('portfolio_data', JSON.stringify(data));
        await createBackup(env, data);
    }
}

async function createBackup(env, data) {
    if (!env.PORTFOLIO_KV) return;
    const timestamp = new Date().toISOString();
    const backupKey = `portfolio:backup:${timestamp}`;
    await env.PORTFOLIO_KV.put(backupKey, JSON.stringify(data));

    // Rotate backups to keep max 10
    try {
        const list = await env.PORTFOLIO_KV.list({ prefix: 'portfolio:backup:' });
        const keys = list.keys.sort((a, b) => a.name.localeCompare(b.name));
        if (keys.length > MAX_BACKUPS) {
            const toDelete = keys.slice(0, keys.length - MAX_BACKUPS);
            for (const item of toDelete) {
                await env.PORTFOLIO_KV.delete(item.name);
            }
        }
    } catch (e) {
        console.error('Failed rotating backups:', e);
    }
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const corsHeaders = getCORSHeaders(request);

        // Preflight OPTIONS handler
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';

        try {
            // GET /auth/check - Verify admin token
            if (url.pathname === '/auth/check' && request.method === 'GET') {
                const authed = await verifyAdminAuth(request, env);
                if (!authed) {
                    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
                }
                return new Response(null, { status: 204, headers: corsHeaders });
            }

            // GET / or /data - Public read of portfolio data
            if ((url.pathname === '/' || url.pathname === '/data' || url.pathname === '/api/data') && request.method === 'GET') {
                const data = await getPortfolioData(env);
                if (!data) {
                    return jsonResponse({ error: 'No portfolio data initialized on server.' }, 404, corsHeaders);
                }
                return jsonResponse(data, 200, corsHeaders);
            }

            // PUT / or /data - Admin write portfolio data
            if ((url.pathname === '/' || url.pathname === '/data' || url.pathname === '/api/data') && request.method === 'PUT') {
                const authed = await verifyAdminAuth(request, env);
                if (!authed) {
                    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
                }

                if (isRateLimited(clientIp)) {
                    return jsonResponse({ error: 'Rate limit exceeded. Maximum 30 write operations per minute.' }, 429, corsHeaders);
                }

                const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10);
                if (contentLength > MAX_BODY_SIZE) {
                    return jsonResponse({ error: 'Body size exceeds 5MB limit' }, 400, corsHeaders);
                }

                const rawBody = await request.text();
                if (new Blob([rawBody]).size > MAX_BODY_SIZE) {
                    return jsonResponse({ error: 'Body size exceeds 5MB limit' }, 400, corsHeaders);
                }

                let parsed;
                try {
                    parsed = JSON.parse(rawBody);
                } catch {
                    return jsonResponse({ error: 'Invalid JSON payload' }, 400, corsHeaders);
                }

                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    return jsonResponse({ error: 'Payload must be a top-level JSON object' }, 400, corsHeaders);
                }

                await savePortfolioData(env, parsed);
                return jsonResponse({ success: true, message: 'Portfolio data updated successfully' }, 200, corsHeaders);
            }

            // GET /backups - List backups
            if (url.pathname === '/backups' && request.method === 'GET') {
                const authed = await verifyAdminAuth(request, env);
                if (!authed) {
                    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
                }

                let backups = [];
                if (env.PORTFOLIO_KV) {
                    const list = await env.PORTFOLIO_KV.list({ prefix: 'portfolio:backup:' });
                    backups = list.keys.map(k => ({
                        key: k.name,
                        timestamp: k.name.replace('portfolio:backup:', '')
                    })).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
                }

                return jsonResponse({ backups }, 200, corsHeaders);
            }

            // POST /restore - Restore a backup
            if (url.pathname === '/restore' && request.method === 'POST') {
                const authed = await verifyAdminAuth(request, env);
                if (!authed) {
                    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
                }

                if (isRateLimited(clientIp)) {
                    return jsonResponse({ error: 'Rate limit exceeded.' }, 429, corsHeaders);
                }

                const body = await request.json();
                const backupKey = body.backupKey || body.key;
                if (!backupKey || !env.PORTFOLIO_KV) {
                    return jsonResponse({ error: 'Invalid backup key or KV unavailable' }, 400, corsHeaders);
                }

                const backupData = await env.PORTFOLIO_KV.get(backupKey, 'json');
                if (!backupData) {
                    return jsonResponse({ error: 'Backup not found' }, 404, corsHeaders);
                }

                await env.PORTFOLIO_KV.put('portfolio_data', JSON.stringify(backupData));
                return jsonResponse({ success: true, data: backupData }, 200, corsHeaders);
            }

            // POST /upload - Image upload
            if (url.pathname === '/upload' && request.method === 'POST') {
                const authed = await verifyAdminAuth(request, env);
                if (!authed) {
                    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
                }

                if (isRateLimited(clientIp)) {
                    return jsonResponse({ error: 'Rate limit exceeded.' }, 429, corsHeaders);
                }

                const formData = await request.formData();
                const file = formData.get('file');
                if (!file || typeof file === 'string') {
                    return jsonResponse({ error: 'No image file uploaded' }, 400, corsHeaders);
                }

                const buffer = await file.arrayBuffer();
                const filename = `images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

                if (env.PORTFOLIO_KV) {
                    await env.PORTFOLIO_KV.put(filename, buffer);
                    const fileUrl = `${url.origin}/${filename}`;
                    return jsonResponse({ url: fileUrl, size: buffer.byteLength }, 200, corsHeaders);
                }

                // Fallback data URL if KV image storage not configured
                const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                const dataUrl = `data:${file.type};base64,${base64}`;
                return jsonResponse({ url: dataUrl, size: buffer.byteLength }, 200, corsHeaders);
            }

            // GET /images/* - Serve uploaded image from KV
            if (url.pathname.startsWith('/images/') && request.method === 'GET') {
                const imageKey = url.pathname.substring(1);
                if (env.PORTFOLIO_KV) {
                    const img = await env.PORTFOLIO_KV.get(imageKey, 'arrayBuffer');
                    if (img) {
                        const ext = imageKey.split('.').pop()?.toLowerCase();
                        const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
                        return new Response(img, {
                            headers: {
                                'Content-Type': mime,
                                'Cache-Control': 'public, max-age=31536000, immutable',
                                ...corsHeaders
                            }
                        });
                    }
                }
                return jsonResponse({ error: 'Image not found' }, 404, corsHeaders);
            }

            // Static assets fallback
            if (env.ASSETS) {
                return await env.ASSETS.fetch(request);
            }

            return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
        } catch (err) {
            console.error('Worker request error:', err);
            return jsonResponse({ error: err.message || 'Internal server error' }, 500, corsHeaders);
        }
    }
};

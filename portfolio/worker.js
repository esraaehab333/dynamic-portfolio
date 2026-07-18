export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS (Pre-flight)
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET: Load Data
      if (method === 'GET') {
        const data = await env.PORTFOLIO_DATA.get('data');
        return new Response(data || '{}', {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // PUT: Save Data (Admin)
      if (method === 'PUT') {
        const data = await request.text();
        await env.PORTFOLIO_DATA.put('data', data);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST: Contact Form Submission
      if (method === 'POST') {
        const body = await request.json();
        const { name, email, subject, message, honeypot } = body;

        // Spam prevention: Honeypot field check
        if (honeypot) {
            return new Response(JSON.stringify({ message: 'Spam detected' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Validation
        if (!name || !email || !subject || !message) {
          return new Response(JSON.stringify({ message: 'All fields are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Email Format Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ message: 'Invalid email address' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Basic Sanitization
        const sanitizedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Send Email via Resend
        // Note: env.RESEND_API_KEY and env.GMAIL_ADDRESS must be set in Cloudflare Secrets
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Contact Form <onboarding@resend.dev>',
            to: env.GMAIL_ADDRESS,
            reply_to: email,
            subject: `Portfolio: ${subject}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #3D5AFE;">New Message from Portfolio</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
              </div>
            `
          })
        });

        if (resendResponse.ok) {
          return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          const error = await resendResponse.json();
          return new Response(JSON.stringify({ message: 'Failed to send email', error }), {
            status: resendResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({ message: 'Internal Server Error', error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

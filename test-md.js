import { inlineMd, blocksMd } from './portfolio/js/core/markdown.js';

console.log('=== TEST 1: inlineMd ===');
console.log(inlineMd('Uses **MVVM** with `Room` and [docs](https://example.com)'));

console.log('\n=== TEST 2: XSS in inlineMd ===');
console.log(inlineMd('<img src=x onerror=alert(1)> [x](javascript:alert(1))'));

console.log('\n=== TEST 3: blocksMd setup ===');
const setupInput = "Run:\n```bash\n./gradlew installDebug\n```\nThen open the app";
console.log(JSON.stringify(blocksMd(setupInput), null, 2));

console.log('\n=== TEST 4: blocksMd archIntro ===');
const archInput = "Uses **MVVM** with `Room` and [docs](https://example.com)";
console.log(JSON.stringify(blocksMd(archInput), null, 2));

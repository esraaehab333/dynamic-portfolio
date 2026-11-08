import { inlineMd, parseMd } from './portfolio/js/core/markdown.js';

global.window = global;
global.document = { addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [] };
await import('./portfolio/js/project-page.js');

function assert(cond, msg) {
    if (cond) console.log('[PASS]', msg);
    else {
        console.error('[FAIL]', msg);
        process.exitCode = 1;
    }
}

// Main Test:
const testInput = `### Requirements
- Flutter SDK
- Dart SDK

### Installation

1. Clone the repository:

   \`\`\`bash
   git clone https://github.com/Aggar-rent-a-ride/Aggar-App.git
   \`\`\`

2. Navigate to the project directory:

   \`\`\`bash
   cd Aggar-App
   \`\`\``;

const parts = parseMd(testInput);
assert(parts.length === 4, 'parseMd produces 4 parts');
assert(parts[0].type === 'html', 'part 0 is html');
assert(parts[0].html.includes('<h4 class="pp-md-h pp-md-h3">Requirements</h4>'), 'part 0 contains Requirements heading');
assert(parts[0].html.includes('<ul><li>Flutter SDK</li><li>Dart SDK</li></ul>'), 'part 0 contains bullet list');
assert(parts[0].html.includes('<h4 class="pp-md-h pp-md-h3">Installation</h4>'), 'part 0 contains Installation heading');
assert(parts[0].html.includes('<ol start="1"><li>Clone the repository:</li></ol>'), 'part 0 contains 1. Clone the repository:');

assert(parts[1].type === 'code' && parts[1].lang === 'bash' && parts[1].code === 'git clone https://github.com/Aggar-rent-a-ride/Aggar-App.git', 'part 1 is git clone code block');

assert(parts[2].type === 'html' && parts[2].html.includes('<ol start="2"><li>Navigate to the project directory:</li></ol>'), 'part 2 contains 2. Navigate to the project directory:');

assert(parts[3].type === 'code' && parts[3].lang === 'bash' && parts[3].code === 'cd Aggar-App', 'part 3 is cd Aggar-App code block');

// Render in setupHTML:
const htmlOutput = window.ProjectPage.html({ title: 'Test', setup: testInput });
assert(htmlOutput.includes('<div class="pp-md">'), 'rendered inside <div class="pp-md">');
assert(htmlOutput.includes('start="1"'), 'numbered list item 1 has start="1"');
assert(htmlOutput.includes('start="2"'), 'numbered list item 2 has start="2"');

// a) Old plain-text setup
const oldSetup = "git clone https://github.com/test.git\ncd test\nnpm install";
const oldOutput = window.ProjectPage.html({ title: 'Test', setup: oldSetup });
assert(oldOutput.includes('<div class="pp-code"><div class="pp-code-bar">'), 'old setup renders single .pp-code block');
assert(oldOutput.includes('git clone https://github.com/test.git\ncd test\nnpm install'), 'old setup code content preserved exactly');

// b) archIntro "Uses **MVVM** with `Room` and [docs](https://example.com)"
const archInput = "Uses **MVVM** with `Room` and [docs](https://example.com)";
const archOutput = window.ProjectPage.html({ title: 'Test', archIntro: archInput });
assert(archOutput.includes('<strong>MVVM</strong>'), 'archIntro has bold MVVM');
assert(archOutput.includes('<code class="pp-ic">Room</code>'), 'archIntro has code Room');
assert(archOutput.includes('<a href="https://example.com" target="_blank" rel="noopener noreferrer">docs</a>'), 'archIntro has link to docs');

// c) XSS
const xssStr = "<img src=x onerror=alert(1)> [x](javascript:alert(1))";
const xssOutput = window.ProjectPage.html({ title: 'Test', archIntro: xssStr, setup: xssStr, structure: xssStr });
assert(!xssOutput.includes('<img src=x'), 'XSS img tag escaped');
assert(!xssOutput.includes('href="javascript:'), 'XSS javascript link stripped');

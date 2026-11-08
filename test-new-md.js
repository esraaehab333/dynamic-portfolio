import { mdToHtml, looksLikeMd } from './portfolio/js/core/markdown.js';

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

// 1. Test sample in setup
const setupText = `### Requirements
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

const setupHtml = window.ProjectPage.html({ title: 'Test', setup: setupText });

// Must be ONE .pp-code block for setup
const codeBlockMatches = setupHtml.match(/class="pp-code"/g);
assert(codeBlockMatches && codeBlockMatches.length === 1, 'setup produces exactly ONE .pp-code container');
assert(setupHtml.includes('<div class="pp-code-bar">'), 'has top bar');
assert(setupHtml.includes('data-raw="'), 'has data-raw attribute for raw text copy');
assert(!setupHtml.includes('###'), 'no ### visible in rendered output');
assert(setupHtml.includes('<h4 class="pp-md-h">Requirements</h4>'), 'has Requirements heading');
assert(setupHtml.includes('<ul><li>Flutter SDK</li><li>Dart SDK</li></ul>'), 'has bullets');
assert(setupHtml.includes('<ol start="1"><li>Clone the repository:</li></ol>'), 'has step 1');
assert(setupHtml.includes('<pre class="pp-md-pre"><code>git clone https://github.com/Aggar-rent-a-ride/Aggar-App.git</code></pre>'), 'has nested code block for step 1');
assert(setupHtml.includes('<ol start="2"><li>Navigate to the project directory:</li></ol>'), 'has step 2 with start="2"');
assert(setupHtml.includes('<pre class="pp-md-pre"><code>cd Aggar-App</code></pre>'), 'has nested code block for step 2');

// a) Old plain text setup and structure
const oldSetup = "git clone https://github.com/test.git\ncd test";
const oldSetupHtml = window.ProjectPage.html({ title: 'Test', setup: oldSetup });
assert(oldSetupHtml.includes('<pre><code>git clone https://github.com/test.git\ncd test</code></pre>'), 'old setup renders monospace <pre><code>');

const oldStructure = "my-project/\n├── src/\n└── README.md";
const oldStructHtml = window.ProjectPage.html({ title: 'Test', structure: oldStructure });
assert(oldStructHtml.includes('<pre><code>my-project/\n├── src/\n└── README.md</code></pre>'), 'old structure renders monospace <pre><code>');

// b) archIntro "Uses **MVVM** with `Room` and [docs](https://example.com)"
const archIntroText = "Uses **MVVM** with `Room` and [docs](https://example.com)";
const archHtml = window.ProjectPage.html({ title: 'Test', archIntro: archIntroText });
assert(archHtml.includes('<div class="pp-code-bar">'), 'archIntro has .pp-code-bar');
assert(archHtml.includes('architecture</div>'), 'archIntro bar label is architecture');
assert(archHtml.includes('<strong>MVVM</strong>'), 'archIntro shows bold MVVM');
assert(archHtml.includes('<code class="pp-ic">Room</code>'), 'archIntro shows inline code Room');
assert(archHtml.includes('<a href="https://example.com" target="_blank" rel="noopener noreferrer">docs</a>'), 'archIntro shows working link');

// c) XSS
const xssStr = "<img src=x onerror=alert(1)> [x](javascript:alert(1))";
const xssOutput = window.ProjectPage.html({ title: 'Test', archIntro: xssStr, setup: xssStr, structure: xssStr });
assert(!xssOutput.includes('<img src=x'), 'XSS img tag escaped');
assert(!xssOutput.includes('href="javascript:'), 'XSS javascript link stripped');

# GhostMask — review before sharing

GhostMask lets you inspect what a model receives and approve a value for insertion into one field. It is a new project built from the roadmap, not a recovered existing app.

**Version 0.2:** a working local review release. Selective mode keeps useful public content, masks detected/private regions, runs offline English OCR, and lets you add masks before exporting or using a local model. Strict mode hides all source pixels and text. Detection is imperfect: review both image and text. Use synthetic data while evaluating it.

See [the 0.2 release report](docs/implementation/V2_RELEASE_REPORT.md) for current scope. Older reports describe the preserved 0.1 baseline.

## Run

Node 22+ and npm are required. Tested runtime versions and results are in `docs/implementation/RELEASE_REPORT.md`.

```sh
cd /Users/shreeshaks/Documents/ghostmask
npm ci
npm run typecheck
npm test
npm run build
npm run demo
```

Open `http://127.0.0.1:4173`. In Chrome, open `chrome://extensions`, enable Developer mode, choose Load unpacked, and select this project's `dist` folder. Click the GhostMask toolbar action while the demo tab is active. That click grants temporary access to this tab. The extension does not automatically scan browsing.

1. Start a task with the simulator selected. It is deterministic and sends no model request.
2. Capture the demo. Inspect the sanitized image and text. Add private phrases or draw masks where needed. Expand the local-only original only for comparison.
3. Choose `field-2`, enter `approved@example.test`, and approve the local insertion.
4. Review the exact payload. Request a proposal. Then allow the local insertion.
5. Check the email field and receipts. GhostMask does not click Submit.
6. Add dynamic content on the page. Sending an old capture must block. Resume and capture again.
7. Abort to discard local observations and approvals. Closing/reloading the panel also loses them. No secret vault is persisted.

## Real local model

The optional route uses Ollama's `qwen3:0.6b` on this Mac. It receives reviewed sanitized text, form metadata and token references, **not** local token values or screenshots. No cloud provider is integrated.

```sh
OLLAMA_HOST=127.0.0.1:11434 OLLAMA_ORIGINS='chrome-extension://*' OLLAMA_NUM_PARALLEL=1 OLLAMA_MAX_LOADED_MODELS=1 ollama serve
ollama pull qwen3:0.6b
```

Run the pull in a second terminal. The extension origin wildcard is for local development; restrict it to your installed extension ID for a private setup. Other local software can also reach an unauthenticated loopback Ollama server. Stop the foreground server with Ctrl-C when finished. This project does not install a login service. The model unloads after each request. Select Local Ollama when starting a new task.

## Reproduce browser checks

```sh
npx playwright install chromium
npm run build
node scripts/build-test.mjs
npm run test:browser
python3 scripts/fixture_manifest.py --check
python3 -m unittest discover tests
```

Browser tests use a disposable Chromium profile and a **test-only** extension copy with broad host permission. This replaces the manual toolbar permission gesture for automation. The release build retains `activeTab`; these tests do not certify the toolbar gesture, Chrome Store acceptance, all browsers or all websites. The test harness is never included in `dist`.

## Save a sanitized page

Choose Selective masking and the Summarize task. Capture, inspect both outputs, add masks or protected phrases, then review this exact version. Save its PNG, text or receipt. Choose Local Ollama for a real summary; the simulator clearly states that it generated no model summary. LM Studio uses localhost:1234 and requires your loaded model identifier; that adapter has not been tested against a live LM Studio installation.

## Read next

- [Source search and competitors](docs/implementation/SOURCE_RESEARCH.md)
- [Architecture and threat model](docs/implementation/ARCHITECTURE.md)
- [Release status and measured results](docs/implementation/RELEASE_REPORT.md)
- [Roadmap status](docs/implementation/ROADMAP_CHECKLIST.md)
- [Agent tasks](docs/implementation/AGENT_TASKS.md)
- [Skills actually used](docs/implementation/SKILL_USAGE.md)

The application processes captures locally. Source is stored in the user-authorized private GitHub repository; this does not deploy the application. Explain project concepts in plain language at an eighth-grade reading level by default.

# Source and predecessor research
Checked 2026-11-24. This is a new project, confirmed by the user. No existing GhostMask application was found locally or among the signed-in GitHub account repositories.

## Findings
- PLVA, Team 3Sigma: https://iterate.inc/blog/computer-use-agent-security-how-plva-protects-data . Official event article describes local screenshot redaction, temporary tokens, local restoration and history scrubbing. Vendor-described behavior, not independently benchmarked. No verified licence for the original implementation found. Architectural reference only.
- NAYAN: https://github.com/Rohinth-S/NAYAN . Public README describes a very close browser-agent privacy architecture, capture context guards, local Ollama and an egress gate. GitHub API reports MIT licence. README claims are not verified test results. No source copied.
- RedactShot: https://github.com/darkzOGx/RedactShot . Local OCR screenshot redaction and review extension. GitHub API reports MIT. Useful screenshot-workflow comparison, not proof of agent action safety. No source copied.
- safeclipper: https://github.com/AFK-surf/safeclipper . Local text/image redaction for agent workflows. GitHub API reports no detected licence; reuse not authorized on that evidence.
- browser-perception: https://github.com/rounakkm/browser-perception . Describes tokenized state and validated actions. No detected licence in API. Reference only.
- PrivacyLens: https://github.com/anirbandotdev/PrivacyLens . Describes local browser capture and sanitization. No detected licence in API. Reference only.
- V.E.I.L: search index lists https://github.com/Krissh360/V.E.I.L but live GitHub API returned 404. Availability and licence unverified.
- A different GhostMask is described by Naman Bordia at https://namanbordia.in/ as a Python/LangGraph/Presidio text privacy pipeline. Indexed description only; direct page requires JavaScript. Cannot identify it as the user's inspiration.
- Other GhostMask results concern face blurring, encrypted images, cryptocurrency or URL masking and are not this application.

## Decision
Build independently from the user's roadmap. Do not claim category novelty. Differentiate through clear separate disclosure/insertion permissions, exact outbound inspection, finite-scope leakage evidence, and verified actions. No predecessor performance or security claims are inherited. Search results are leads, not executable dependencies. Search cannot establish the exact original inspiration.

## AI4Privacy screening

Inspected `ai4privacy/pii-masking-200k` at revision `7c22e6816b8fc24b7781e9f4e22016c698842dd0`: https://huggingface.co/datasets/ai4privacy/pii-masking-200k . The card describes about 209k synthetic text examples in English, French, German and Italian, with human-in-the-loop validation claimed by the publisher. These are not screenshots or browser-action labels.

The repository's `LICENSE` and `license.md` contain custom individual/small-organization and corporate terms, including derivative distribution restrictions; they are not a permissive Apache/MIT licence. The API's licence field was null, so the actual files were checked. No training data were downloaded or adopted. Redistribution/model-training suitability needs clarification before a distributable detector is built. A text benchmark would still not establish browser-image privacy performance.

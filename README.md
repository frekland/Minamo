# Minamo

> **Current learner-experience direction (1 November 2026):** [Broadened product-design discovery and GPT/owner responsibility gates](docs/PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md). Before commissioning a Workbench, examine the whole learning cycle—capture, active thinking, experiment, practice, creation, return and user-controlled GPT—and compare genuinely different interactions with the existing product. Earlier Work/Questions/Evolution A/B directions remain historical research, not the chosen design. No product implementation or Site release is implied.


A personal workspace for learning that develops over time.

Minamo connects structured projects, reference material, questions, practical observations and personal notes with conversations in ChatGPT. It helps you **pick apart what you are learning, keep track of uncertainty and return to the work later**—including from a fresh AI conversation.

It began as a computing-learning project, grew to support languages, and is designed around a more general idea: almost anything worth investigating can become an ongoing body of work.

## The learning loop

1. **Explore:** Begin a Project, follow a Step, read an Article or investigate a Question.
2. **Do the work:** Use the real environment for the task—your terminal, a language conversation, a telescope archive, a spreadsheet, a book or something else.
3. **Examine and connect:** Save useful Notes, evidence, images, exact-passage Flags and annotations. Link what you know to what you still need to understand.
4. **Discuss and continue:** Use Minamo's MCP tools in ChatGPT to retrieve relevant context, explore it alongside other tools or connectors, and deliberately save new work back.
5. **Return:** Pick up the same thread next week or in another chat, without reconstructing the context from scratch.

Minamo is **not a chatbot wrapper or a passive notes archive**. The website is a place to actively work with material; ChatGPT is one of the ways to develop that work. The connection goes both ways, with explicit read/write operations and acknowledgements.

## What is in the app?

- **Projects** with ordered Steps, Questions, linked reading, continuation and an optional visual map.
- **Library** with subject articles, concepts, command/function references, diagrams, code and references. The current UI particularly supports Computing and Languages.
- **Your work** with rich Notes, Activities, images, annotations, Flags, revision-aware saves and recovery.
- **Practice utilities** for bounded Python, SQL, regex, Unicode and Web experiments. These complement specialist tools; they do not claim to reproduce a VM or another real environment.
- **MCP interface** so ChatGPT can retrieve precise context and perform deliberate, validated changes. There is no embedded paid LLM service.

## Principles

- Structure is useful, but curiosity should be able to branch.
- Questions and confusion are valuable working material.
- Learning happens in the world; Minamo connects the artefacts and the thinking.
- AI-produced explanations, synthetic examples and genuine observations must remain distinguishable.
- Continuity should feel natural to the learner, without asking them to manage Git repositories or handoff files.
- The learner remains responsible for what is true, useful and worth keeping.

## Project status

This repository is a **clean-source preparation**, assembled from the working private Minamo V2 codebase in October 2026. Its Git history deliberately starts fresh; it does not contain the original private engineering history or personal learning database. The current application has been used and tested in an owner-private ChatGPT Site. Independent, third-party installation and multi-user acceptance remain work to do.

The code uses React, TypeScript, Vinext and Cloudflare Workers with D1/R2 persistence. Authentication and MCP publication currently depend on **ChatGPT Sites-specific capabilities**. It is not yet a documented, one-click general-purpose self-hosted application.

**For a fresh development chat:** begin with the [learner-experience redesign strategy and recovered decision trail](docs/LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md), then [product context and prior-art lessons](docs/PRODUCT-CONTEXT-AND-PRIOR-ART.md) and the [V3 longitudinal closeout / learner-context test roadmap](docs/acceptance/2026-10-30-m2m-v3-closeout-and-learner-context-roadmap.md). Together these distinguish the immediate synthetic architecture tasks from the larger, still-unsolved Project UX problem, including what earlier research decided and what it did **not** establish.

**Current UI/UX evidence (31 October 2026):** The [live Cloud Browser audit](docs/ux/2026-10-31-LIVE-AUDIT.md) and [canonical findings register](docs/ux/REGISTER.md) distinguish reproduced current Site behaviour from design interpretations and historical unverified claims. The [60-finding V70/V72 reconciliation](docs/ux/V70-V72-CROSSWALK.md) and [evidence-led roadmap](docs/ux/ROADMAP.md) preserve the earlier record without treating it as a fresh 60/60 pass. These documents are read-only audit outputs, not approval for app changes.

Start with [Getting started](docs/GETTING-STARTED.md), [Architecture](docs/ARCHITECTURE.md) and [Deployment boundaries](docs/DEPLOYMENT.md).

For authorised changes to the existing owner-private ChatGPT Site, the [direct Sites release workflow](docs/SITES-RELEASE-WORKFLOW.md) uses this repository as the single active GitHub source and release-evidence home. Actual publication still requires the Site's separate native Git commit, private deployment and live verification; public pushes do not deploy automatically.

## Development

Recommended: Node.js 24 and pnpm 11.25.0.

~~~bash
pnpm install --frozen-lockfile
cp .dev.vars.example .dev.vars
pnpm dev
pnpm run typecheck
pnpm run build
pnpm test
~~~

The local sign-in simulation is **development-only** and must not be exposed to the internet as authentication. See [Getting started](docs/GETTING-STARTED.md) for the current limitations.

## Community

Minamo is a personal project being opened to constructive discussion, experimentation and contribution—not a commercial service with a support team. Small fixes, code review, accessibility ideas, documentation improvements and honest reports from real use are especially welcome.

Read [Contributing](CONTRIBUTING.md), [Security](SECURITY.md), [Development history](docs/DEVELOPMENT-HISTORY.md) and [Third-party notices](docs/THIRD-PARTY.md).

**Licence:** The original Minamo application code and documentation are released under the [MIT License](LICENSE). Minamo's name and branded identity assets are separately protected; third-party files retain their own licences. See [Notices](NOTICE.md) and [Third-party notices](docs/THIRD-PARTY.md).

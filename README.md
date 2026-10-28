# Minamo

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

Start with [Getting started](docs/GETTING-STARTED.md), [Architecture](docs/ARCHITECTURE.md) and [Deployment boundaries](docs/DEPLOYMENT.md).

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

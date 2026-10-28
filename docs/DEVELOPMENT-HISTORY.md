# Development history and design decisions

Minamo grew out of one person's learning workflow rather than an initial product or business plan. Jon began with a **Cyber Theory** learning resource for Linux, networking and application security; practical work happened in Kali Linux, OverTheWire, other learning sites and real tools. The recurring problem was how to keep reading, questions, terminal evidence, personal notes and GPT conversations connected without complicated manual handoffs.

## Milestones

- **Cyber Theory:** Rich reading and structured learning content, with an early MCP link to ChatGPT. The emphasis was on reasoning through practical evidence rather than spoilers or automatically recorded “progress.”
- **Independent Minamo V2:** A new React/TypeScript and Vinext/Cloudflare architecture with explicit identity boundaries, D1/R2 persistence, shared domain commands and revision-safe personal work. The new application did not import the original private learner database.
- **Connected learning workspace:** Projects, Steps and Questions; a connected Library; rich Notes and exact retained-reading annotations; bounded practice tools; deliberate GPT-to-Minamo authoring and Minamo-to-GPT context.
- **Broader learning:** Computing and Languages became distinct spaces. Japanese and Mandarin reading/presentation requirements exposed the importance of language-aware content and reusable reference material. The same working pattern suggested other subjects without requiring Minamo to replace specialist applications.
- **October 2026 UX and acceptance:** Projects, search, reader, Notes and navigation underwent substantial iterative simplification. The latest private V72 work included source checks and sampled Cloud Browser review. The independent verdict was conditional, with residual responsive and coverage gaps.

## Architectural choices

1. **The website is a working surface.** Saved questions, annotations and projects are intended to be actively examined and continued, not stored passively.
2. **GPT is external and replaceable as a reasoning environment.** Minamo uses typed MCP capabilities rather than embedding its own AI chat service. Chats can use other specialist connectors too.
3. **External work remains authoritative.** A terminal, conversation, experiment or scientific application does the real work; Minamo preserves and interrogates selected evidence and understanding.
4. **Trust is part of usability.** Exact passage identity, owner-scoped reads, guarded revisions, idempotent operations, retained drafts and recoverable deletion prevent convenient workflows from silently losing or inventing work.
5. **Subject flexibility precedes subject-specific duplication.** A new field of learning often needs a good Project, Library material and evidence workflow before it needs new app features.

## Why the new history begins here

The private engineering repository contains many iterative commissions, tests, acceptance artefacts, internal host identifiers and operational details. Copying or rewriting that entire commit graph would be inappropriate for a public project. This clean repository starts from an audited source snapshot with curated historical context and synthetic fixtures. It does not claim to reproduce the previous private commit sequence.

The project was heavily AI-assisted and directed by the learner/maintainer, with repeated human product judgement and verification. It is offered as an experiment to learn with others, not as a claim of wholly unprecedented ideas or a commercially supported platform.

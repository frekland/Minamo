# Architecture

Minamo is a learner-facing web application with a two-way ChatGPT connection, not a hosted LLM inside the app.

## Components

| Layer | Key source | Responsibility |
| --- | --- | --- |
| UI and reading | `app/`, `components/` | Projects, Library, reader, Notes, Activities, search, responsive navigation and exact-passage interaction |
| Worker boundary | `worker/index.ts` | Routing, admission, guarded API/MCP access, response headers |
| Domain and commands | `lib/domain.ts`, `lib/domain-handler.ts`, `lib/contracts.ts` | Shared record validation, queries, ownership, revision-safe writes, MCP adapters |
| Identity and beta | `lib/beta-access.ts`, `lib/beta-handler.ts` | Sites identity checks, allowlisting and principal scopes |
| Persistence | `db/`, `drizzle/` | Cloudflare D1 records and history; R2 stores assets |
| Practice tools | `lib/tool-runtime.ts`, `public/tools/` | Bounded in-browser engines and deliberate saved Run records |
| Build/preview | `vite.config.ts`, `scripts/` | Vinext compatibility build, Cloudflare Workers and local preview fixtures |

**Runtime:** React + TypeScript, Vinext/Next compatibility over Vite, Cloudflare Workers, D1 and R2. The hosting environment supplies an authenticated ChatGPT Sites identity. The development plugin simulates sign-in locally only.

## Data and learning structure

A Project gives ordered learning structure. The Library supplies reference material. Notes, Questions, Activities, Flags and annotations preserve personally meaningful work and exact connections. The current interface is strongest for Computing and Languages, but the underlying record model supports broader subjects.

Articles preserve structured reading parts. A saved capture refers to an immutable rendition and a bounded, family-qualified UTF-16 text range; changing later text does not silently move the capture. This matters for trustworthy return links and annotations.

Domain mutations require explicit target identity, expected revision and operation identity. D1 transaction receipts, history and recovery keep retries and interrupted saves distinguishable from completed writes. Trash and retained editions protect continuity. These protections must be maintained when adding new record families or interfaces.

## ChatGPT and MCP

ChatGPT acts as an external reasoning and coordination environment. Minamo exposes typed read and write tools through the Site's MCP surface. The application does not call a paid hosted model itself.

A conversation can retrieve specific records, selected passages and related context, discuss them alongside other connectors, and explicitly author changes back to Minamo. Commands are validated by the same domain rules used by the website. GPT explanations and synthetic data are not proof of work performed in a terminal, laboratory or another external system.

## Boundaries worth preserving

- **Identity:** Hosting headers are trusted only behind the protected Sites dispatch boundary. A new host needs its own auth/security design.
- **Evidence:** Real observations, learner claims, generated examples and editorial explanations should not be conflated.
- **Recovery:** Preserve pending drafts, exact operation IDs, CAS conflicts and recoverable changes.
- **Source rights:** External URLs are metadata, not permission to import copyrighted content.
- **Execution:** Browser practice engines are limited utilities, not arbitrary-code hosting for untrusted programs.
- **Deployment:** GitHub and Sites are distinct source/deployment surfaces.

For specifics, see `lib/` tests and [Security](../SECURITY.md).

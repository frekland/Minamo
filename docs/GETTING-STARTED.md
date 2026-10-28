# Getting started (development)

This is the current application's source, not yet a polished independent installer. The original runtime is a ChatGPT Site with Sites-provided identity, MCP integration and Cloudflare D1/R2 services.

## Prerequisites

- Node.js 24 (the package requires Node >=22.13)
- pnpm 11.25.0
- Git and a local environment that can build Cloudflare Worker dependencies
- Enough storage for locked browser runtimes such as Pyodide

## Local development

~~~bash
git clone https://github.com/frekland/Minamo.git
cd Minamo
corepack enable
pnpm install --frozen-lockfile
cp .dev.vars.example .dev.vars
pnpm dev
~~~

Open the URL reported by the development server (normally `http://localhost:5173`). The source includes a **localhost-only simulated ChatGPT sign-in** in `scripts/vite/sites-vite-plugin.ts`. That user is synthetic and does not demonstrate real hosted authentication. Some workspace routes require a local D1 database with the migrations in `drizzle/`; development-only preview routes provide synthetic UI fixtures.

The tracked `.openai/hosting.example.json` is deliberately generic. A real Sites deployment needs a separate, untracked `.openai/hosting.json` containing **that deployment's** project binding information. The build scripts use the example if no private config exists. Do not copy an existing person's Site ID into a new deployment.

The example `.dev.vars.example` sets the synthetic owner and localhost host admission. Do not use its identity settings for a real deployment. `.dev.vars` and `.openai/hosting.json` are Git-ignored.

## Checks

~~~bash
pnpm run typecheck
pnpm run build
pnpm test
~~~

The project also includes focused browser/spec and fixture scripts in `scripts/` and `tests/interface-browser/`. Some depend on a running preview, bundled tool assets or the original Sites environment. See [Testing](TESTING.md).

## Known boundaries

- Working ChatGPT MCP access needs a properly published and authorised Site; a source checkout alone does not register a ChatGPT connector.
- Real authentication, invitations, database provisioning and storage policies are external to a plain code checkout.
- Changing the repository does not deploy a Site.
- No production learner data, files or credentials are included.

For deployment constraints, read [Deployment](DEPLOYMENT.md) before connecting real accounts.

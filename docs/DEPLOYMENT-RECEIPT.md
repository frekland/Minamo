# Minamo V2 private foundation deployment

- Native terminal result: **succeeded**, 21 October 2026 at 12:51 BST.
- URL: https://minamo-v2.jscymru.chatgpt.site
- Project: `appgprj_6ad8a4e85eb48191accd6e78976b47e3`
- Deployed source: `e4975b21bba0de5d080cdb9dfa195df09a81ad96`
- Saved version: `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_e48de2a69b2c8191aadd0cc2e3158844`
- Deployment: `appgdep_6ad8a7471de081918bf8a8e011ea51db`
- Environment revision: 0; native `has_mcp`: true.
- Privacy: native policy readback confirmed the owner as sole allowed account, with no additional viewers, groups, editors or external visitors. No sharing change was made.
- Gates passed before deployment: build, typecheck, 19 local checks including exact compiled Worker SSR/RSC/action transport and actual local D1/R2 handlers; explicit new project identity and authentication/isolation tests.
- MCP connection metadata returned a hosted endpoint, but no installed/connected tool was exposed in this conversation. `has_mcp` and a connection URL are not invocation proof.
- Browser: initial internal desktop Home rendered. Following its reading link led to a browser URL-policy rejection. Hosted cloud browser navigation is unsupported by the selected Sites preview guidance; no alternate browser surface was used to evade the gate. Mobile, authenticated browser saves and console acceptance are not claimed.
- Existing Minamo: no source/data/deployment mutation. No genuine learning data was accessed.

This receipt is a source/evidence-only continuation after the one authorised test publication. It does not trigger a second publication. The earlier release commit remains the exact deployed build; the repository HEAD may include this later documentation.

## Hosted HTTP evidence

Using the native service credential in memory (never stored in source), two hosted Home requests returned HTTP 200 and distinct server-generated request receipts. This proves request-time hosted SSR; it does not prove browser hydration. The service-authenticated direct API read without visitor identity returned JSON HTTP 401. A fully anonymous direct API read returned HTTP 403 with no synthetic data. Hosted MCP discovery/list/call attempts using the service credential returned non-JSON HTTP 401 at the platform boundary; protocol discovery/invocation therefore remain BLOCKED without an authenticated MCP connection.

Hosted RSC request returned HTTP 200 `text/x-component` with the expected Investigation content. Direct `/reading` returned HTTP 200 HTML containing Japanese Unicode and `<code>revision</code>`. These are real hosted request results; client hydration, history behaviour and authenticated persistence remain separate unverified requirements.

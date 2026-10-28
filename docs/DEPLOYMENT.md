# Deployment and hosting boundaries

This source was developed for **ChatGPT Sites**, with Vinext on Cloudflare Workers, Sites-authenticated user headers, an MCP route, D1 storage and R2 assets. A fresh checkout is not automatically an independent, secure hosted Minamo instance.

## What belongs to each deployment

- A separately created Site/project and its hosting configuration.
- An owner identity and deliberate allowed-host setting.
- D1/R2 resources and correctly applied schema migrations.
- An authorised ChatGPT-to-MCP connection and account-sharing policy.
- Appropriate secrets and permissions, configured in the host rather than committed to Git.

The included `.openai/hosting.example.json` is a development placeholder. A real project uses its own ignored `.openai/hosting.json`. Do not reuse private project IDs, user IDs, tokens, external account data or production database bindings.

`MINAMO_SITE_HOSTS` must match the actual authorised host. `MINAMO_OWNER_ID` is an identity from the hosting layer. `NEXT_PUBLIC_MINAMO_SITE_ORIGIN` identifies the verified HTTPS origin used in GPT handoff links; it must be set to the intended deployment rather than accepting arbitrary request Host headers.

## What is not provided

- A provider-neutral login system or automatic tenant provisioning.
- A generic Cloudflare-only deployment process with equivalent Sites identity and MCP publication.
- Automatic deployment from GitHub commits.
- A guarantee of independent beta-account, disaster-recovery or production-device acceptance.

Do not expose the local preview auth shim on a public host. It deliberately fabricates a test identity on localhost and must never replace a production authentication layer.

## Contribution opportunity

A properly documented, independent installer or alternative hosting adapter would be useful, but it must preserve owner-scoped access, MCP authorization, mutation recovery and private media boundaries. Such an adapter should be developed and threat-modelled separately before inviting real users.

The owner's live private Minamo Site and its data are deliberately **not connected** to this public-source repository.

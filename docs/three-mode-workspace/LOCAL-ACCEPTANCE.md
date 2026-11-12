# Isolated browser acceptance

The implementation checkout contains **no PR33 bootstrap API, authentication adapter, fault injector or fixture route**. The production `Workspace` uses its normal `/` route, current API/history ownership and authenticated server reads. Production checks run against this checkout.

The browser acceptance checkout is a disposable composition outside that source tree. [The prepare helper](../../tests/acceptance/prepare-three-mode-qa.py) copies the implementation and overlays PR33's synthetic-only page/transport/seed harness. It removes the Site `project_id`, uses local D1/R2, renders the unmodified production `Workspace` with `routeBase="/"`, and allows real deep-link/reload/navigation behavior. No hosted credentials or genuine data are copied; Git-ignored environment and runtime files are excluded. Source files are independent copies; locked dependency files can be hard-linked to avoid another installation.

```sh
# Existing PR33 checkout supplies its four synthetic harness/fixture modules.
python tests/acceptance/prepare-three-mode-qa.py --research /absolute/pr33 --output /absolute/qa
cd /absolute/qa
node /absolute/sites/scripts/configure-execution-profile.mjs
sites-preview start /absolute/qa
```

Use the exact preview URL returned by the supported Sites tool. Open `/`. After implementation edits, rerun the helper, then fully reload to reinstall the fixture transport. The helper does not invoke Git writes, production APIs, credentials or publication. Never save/deploy the composed QA checkout.

The QA-only wrapper supplies one fixed TEST ONLY principal and original records through the real domain/assets/media handlers. It admits the original eight records plus an original Source and dependent excerpt Article (ten total), one illustrative checkpoint and one original PNG through actual guarded commands. Its controls delay a real request, reject before write or hide the acknowledgement after a real commit. These are injected transport outcomes around real persistence, not observed Internet outages. It also provides an independent local concurrent revision, current Article update, and explicit Source revocation/Article Trash controls through actual guarded commands. The Source fixture contains original synthetic text, including a surrogate-pair character, and its dependent Article retains independent interpretation when the excerpt becomes unavailable. Native asset URL bridging applies only inside this wrapper. Recovery discovery can be read; every recovery mutation is blocked by the wrapper.

This verifies normal client components and normal Workspace `/` navigation against actual isolated domain/D1/R2 behavior. It does **not** verify hosted Sites authentication, physical mobile devices, a production release, or a fresh GPT conversation. The injected transport is explicitly external to production runtime. Full release evidence must distinguish these browser observations from reducer tests and existing authenticated hosted behavior.

The test principal is `TEST-ONLY-multi-layout-local-20261024`; its separate iframe scope ends `-mobile`. No connected TEST ONLY record or genuine learning record is required. Local fixture records remain isolated for repeatable review; automated ephemeral test backends are disposed after tests. Any final local inventory should describe only that local database and never be presented as connected cleanup.

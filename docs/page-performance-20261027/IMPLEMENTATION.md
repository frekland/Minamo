# Page loading, navigation and title scale — PR69 execution

Commission: https://github.com/frekland/minamo-v2/pull/69. Implemented on owner-private V45, preserving PR67 and the universal diagram release. The commission PR remains documentation; the implementation has its own reviewed release PR.

## Changes

Explicit family/id entries resolve the current independently admitted reading, capture and retained edition without awaiting the broad workspace collection. The client then loads the collection for navigation. Untyped identities retain existing collection ambiguity rules. Signed-out entries perform no private reads. Current-rights hydration/exact revalidation remains intact; this is not a server or browser text cache.

Collection and related-context projection batch learning-scope and catalogue-head reads in bounded windows of at most32. They retain full collection bodies, complete exact reading, source/anchor/image/media projection, owner/generation admission and continuation. A request-local promise cache shares only concurrent identical collection reads; its key includes owner/generation, selection, navigation epoch and permission epoch. Settled values and failed reads are removed. Late collection results are checked against the captured selection and permission/navigation epochs before committing. No shared response cache or decrypted persisted corpus is introduced.

Library initial browse, filter changes, clear, history and ordinary navigation have no artificial debounce. Actual query typing retains180ms debounce and cancellation. Multi-page history restoration paints each current admitted page while later pages arrive, preserving exact final focus/scroll restoration. We deliberately retain server revalidation and sequential cursor reads: replay-free cached cards would need a complete current permission guard, which the existing client does not have. No stale card is shown merely because it was previously visited.

Recovery, personal-work management and practical tools split out of initial reading JavaScript. Tools and recovery remain mounted after first use to preserve buffers and pending operations. The ordinary Notes owner stays eager and persistent. Journey/Investigation optional panels already load independently; their distinct target/tutor contracts remain separate rather than incorrectly sharing evidence.

Shared Reader and page titles use a quieter scale, up to42px on desktop and28px on phones; Investigation questions use a proportionate35px maximum. Body text, source, selections and reading preferences are unchanged.

## Reproducible evidence

`node scripts/benchmark-pages.mjs /tmp/minamo-pages.json` runs an isolated real Worker/D1/R2 benchmark with374 original TEST-ONLY records. Compared V45 native source2eb3827cb97e1fc32a13e4787db078cb8abba065 against this implementation. Each scenario has one first sample and11 repeat samples. These are local dispatch wall times, including DB communication, not production latency, actual cold-cache behavior or Cloudflare CPU. Before/after processes ran on the same host while regression work was also running; timing variance is qualified. Deterministic prepared-statement counts and unchanged payload sizes substantiate the improvement.

| Repeat scenario | Before p50/p95 ms | After p50/p95 ms | Prepared statements | Response bytes |
|---|---|---|---|---|
| Workspace collection |180.08 /257.73 |87.63 /98.83 |188 →14 |178949 unchanged |
| Article context |16.40 /32.46 |16.04 /23.30 |12 →10 |18376 unchanged |
| Journey with40 linked Articles |81.57 /92.42 |36.29 /45.08 |87 →10 |22848 unchanged |
| Investigation with40 linked Articles |88.81 /105.36 |32.16 /53.12 |87 →10 |22938 unchanged |

The critical SSR sequence changes from collection→exact current→optional retained to exact current→optional retained→render, then background collection. Adapter regression tests verify zero collection calls for explicit Article/Journey/Investigation/Note retained entries, preservation of untyped ambiguity, and no signed-out private read. Actual compiled Worker tests separately exercise authentication, durable records, retained content and recovery.

Production manifest analysis (static import closure of `app/workspace.tsx`, excluding deferred chunks):975876→880107 JS bytes,291839→264079 gzip bytes,17→18 static chunks. The principal Workspace chunk fell477607→381750 bytes. This is byte/dependency-graph evidence, not measured hydration CPU or a browser execution waterfall. Aggregates and source chunk names are in MEASUREMENTS.json.

## Browser checks and limits

The development-only synthetic Workspace was checked at320/390/768 widths, Classic/Focus/Task, Library and rapid route switching, title wrapping, first-use tools, unsaved tool buffer round-trip, and lazy recovery dialog focus. An observed one-frame false empty Library view was fixed with render-time owner/generation/learning/query identity gating; late results are rejected, and foreground/permission invalidations hide prior cards before revalidation. Mobile Reader title measured28px and desktop38.4px at1280px, with no horizontal title overflow. The original synthetic tool buffer was restored; no execution or Run was created. Recovery API is deliberately unavailable in that isolated browser fixture; production Worker tests cover it separately. Existing Notes drafts were preserved.

Physical Android IME, throttled networks, production p50/p95, browser long-task/resource timing and screen-reader hardware were unavailable through the supported browser. No claim is made that those checks ran. No paid Actions, dependency, migration, storage binding, feature flag or learner-data change is included. Fixtures are local isolated/disposed; genuine hosted content is read-only. Production release checks and exact identities are appended to the implementation PR after deployment. Rollback: V45.

## Final verification

Typecheck and complete production build passed. The complete suite passed1,275 of1,279 tests, with zero failures and four existing explicit skips. After the final Library identity/foreground correction, compiled production Worker and affected Library, entry-priority, batching and request-flight checks passed45/45 against the final build. `git diff --check` passed. No remote CI result is claimed.

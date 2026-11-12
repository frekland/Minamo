# Optional science controller packaging correction

The final pre-release build correctly reported `scienceIncluded:false`, but the existing tracked `public/foundry-python-isolate.js` reappeared in `dist/client` during subsequent compiled Worker checks. A separate exclusive build → compiled-test rehearsal reproduced the failure: 16 passes, one science-controller exclusion failure. Temporary filesystem instrumentation recorded Vite's original public copy and the policy unlink; it did not establish the later restoration mechanism. Callback-style/native/executor writes were not conclusively excluded. The original failure and filtered audit remain in `evidence/controller-precorrection-*`; no speculative cause is asserted.

The code-owned weakness was that an optional executable remained an automatic public-copy source even while the product lane was disabled. The correction moves its authored bytes to `vendor/foundry-python-isolate.js`. The ordinary asset-preparation step removes a stale generated public controller **before** the framework copies public assets. Explicit science staging copies the exact vendor bytes only after its pinned runtime/package validation completes. The generated public file is ignored. Optional science packaging requires both the manifest and a controller matching the vendor source. The runtime URL remains `/foundry-python-isolate.js`.

Default preparation preserves expensive optional scientific package staging; the existing final distribution policy excludes those package bytes. No genuine learner content, dependency, service, credential or runtime permission changes are involved.

The new packaging test checks source ownership outside public, exact byte-for-byte opt-in staging, rejection of a modified staged controller, cleanup of stale generated executable input, preservation of vendor/cache bytes and a complete simulated public-copy plus distribution-policy sequence. Source/security/controller tests now inspect the vendor file rather than relying on an always-public copy.

## Executed final correction proof

1. Deliberately generated a stale optional controller in the real local `public` directory using the explicit staging helper.
2. Ran the ordinary production build successfully, without scientific opt-in. Both public and distribution controller paths were absent; science distribution was absent.
3. Ran `tests/activity-product-worker.test.mjs` and `tests/built-worker.test.mjs`: **16/16 passed**.
4. Immediately ran `tests/activity-security-compiled.test.mjs`: **1/1 passed**, including unchanged default-package exclusion assertions.
5. Rechecked all three optional paths: public controller absent, distribution controller absent, science distribution absent. No new cumulative cgroup OOM event was observed during this exclusive run.

The build and compiled checks ran in one retained shell with `set -e`, no concurrent build/tests, no instrumentation and no post-build policy reapplication. Scoped packaging/science-source/security tests also passed **12/12**. Raw final output is in `evidence/controller-correction-*.log`.

This proves the structural correction and affected compiled behavior in this local source. Root still owns final whole-suite, source manifest and release disposition; it does not prove the historical restoration mechanism or replace hosted/private acceptance.

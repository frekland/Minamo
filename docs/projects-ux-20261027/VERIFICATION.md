# Independent implementation verification

27 October 2026. This report records synthetic/local verification by the independent verification agent. Hosted visual acceptance and final release identities belong in the implementation release report; this document does not claim a real invited-account, physical Android, assistive-device or generated-image transport test.

## Actual HTTP acceptance

`tests/unified-projects-acceptance.test.mjs` compiles the production domain handler and registered route dispatch into Miniflare with actual local D1/R2. Principals and all records are synthetic test fixtures, never copied learner content.

The checks exercise:

- Authentication, read-only HTTP method contract, generation fencing and another owner's inability to read the Project.
- A 25-Step Project with 25 incoming Questions and no saved activity. Every exact Step and Question survives cursor traversal; a whole-Project Question stays separate.
- No canonical manuscripts, personal Note bodies or unrelated Japanese title in the Computing outline.
- Independent Question discovery across bounded pages, excluding actual eligible Project relations.
- An exact Library edition/section/part reached through Question 25; one resource when the same canonical reading is also linked directly, retaining both origins.
- An incoming Question checkpoint remains its own exact target across Project Continue, Home Continue, natural-language REST resume and the installed-style MCP resume call. A newer Note linked equally to two Steps cannot silently choose either. The original checkpoint and next action remain unchanged.
- A Question stays discoverable after its only reverse-linked Project loses Source eligibility. Neither the unavailable Project title nor revoked Source bytes are returned.
- Exact before/after stored record, operation receipt and checkpoint rows remain unchanged after ordinary outline, Resources and independent reads. Retained reading still resolves the original section bytes.

The first eight checks passed independently before the Source-eligibility challenge was added. That new challenge exposed a real defect: reverse-parent existence was checked against raw database rows, so an unavailable Project could hide an otherwise eligible Question from independent discovery. The service now verifies eligible reverse parents and carries explicit continuation state when its bounded parent scan is incomplete. The failing challenge was retained and passed after correction. The final combined service/independent HTTP run passed **26/26**, including all **9/9** tests in the independent HTTP suite, with no skips or failures.

## Review corrections

Independent review also identified and the implementation agents corrected:

1. Resource deduplication included navigation return context, creating two cards for one canonical reading. The key now uses the exact reading identity and unions provenance.
2. UI cursor merging could discard an earlier relationship origin. Identical Questions/resources now merge provenance across pages.
3. A partially scanned Resources page could claim that no resources were linked. Empty states now distinguish incomplete coverage.
4. Cover component effect cleanup could leave its liveness guard false during Strict Mode replay. Setup resets the guard. Known conflicts unlock refresh with the selected file retained; uncertain results preserve the original operation and status-recovery path.

An additional native-new-tab Question → Library return-context issue was corrected: the actual Library anchor now includes the entry Project and Step plus exact edition/section/part. The UI agent retained a regression test. Actual browser behavior remains part of the final hosted walkthrough.

## Existing regression checks

The independently selected route, learning-space, beta and recovery suites passed **25/25**, with no skips or failures:

```text
node --test --test-concurrency=2 \
  tests/worker-domain-routes.test.mjs \
  tests/learning-spaces-navigation.test.mjs \
  tests/learning-spaces-continuity.test.mjs \
  tests/private-beta.test.mjs \
  tests/recovery-learning-catalogue.test.mjs \
  tests/recovery-paged-assets.test.mjs
```

Old UI tests expected the retired inline introduction/reference disclosures and Journey/Stage chrome. They now assert one honest pending continuation, ordered Steps, closed optional Resources/map/introduction, exact retained capture identities and unchanged authored objects. Home's repeated-checkpoint regression now asserts one latest exact continuation per Project, while `scope:recent` still exposes both original target checkpoints; supersession history and independent Favourites pagination remain tested.

After these intentional expectation changes, the authoring-preview, educational-reading and learning-work suites passed **24/24**; Home UI passed **10/10**; task-workspace UI passed **5/5**. None substitutes for the final stable-source full suite.

The first exploratory full suite ran concurrently with a production build and encountered a missing transient generated assets manifest in one compiled-Worker test. Run build and final full-suite verification in sequence so compiled-artifact checks inspect a complete build. Do not suppress that check or report the exploratory run as green.

## Limits

No production learner record was written by this agent. Local synthetic principal isolation is not a genuine invited-account test. Source/SSR tests establish structure, exact identities and state boundaries; they do not establish touch usability, focus behavior or visual quality. Those require the actual hosted browser walkthrough owned by the release agent.

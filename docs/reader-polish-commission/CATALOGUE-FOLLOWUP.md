# A-10 installed-description follow-up — 23 October 2026

After V18 deployment the owner reinstalled Minamo V2. Installed preview/apply declarations still presented a combined command object and omitted the nested command-schema guidance. The actual connected runtime correctly rejected update.command.target with the new actionable diagnostic. Reinstall alone did not establish installed-schema freshness; the earlier receipt's pending state was retained.

The commissioning fallback explicitly permits action examples/descriptions where a wrapper cannot preserve oneOf. This narrow correction therefore appends the same explicit command-shape guide to both top-level tool descriptions. Update uses top-level family/id/expectedRev/data; only setFlag uses target/active/expectedTargetRev. Create, Trash, restore and seed remain distinct. The existing discriminated schemas and runtime validation remain intact.

The shared-D1 tools/list test now asserts the explicit examples on both tool descriptions as well as the existing schema branches. No UI or learner-record behaviour changes. Typecheck, production build and the full regression suite are rerun. Native/GitHub tree parity, release identities and actual installed-client observations are recorded in the follow-up release receipt.

Do not call a flattened TypeScript declaration alone proof of stale server code; it may reflect schema presentation. Do not request repeated reinstalls without evidence that a new version's top-level descriptions are available.

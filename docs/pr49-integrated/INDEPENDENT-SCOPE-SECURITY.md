# Independent Learning Spaces security and integrity review

26 October 2026. Reviewed the scope implementation written by the separate domain/MCP specialists, concentrating on its new classification sidecar, cursor SQL and recovery integration. These checks ran against compiled Worker handlers with real disposable D1/R2 and synthetic principals. They are not production or physical-device evidence.

Three concrete defects were identified and corrected before release:

1. An authoritative classification sidecar could silently override a later explicit `data.learningScope` prose update. Such conflicting changes now reject with `scope_sidecar_authoritative`, identify the current scope revision and explain the exclusive revision-guarded classifier. A matching classification may accompany a prose change without surprise.
2. Internal restore staging validated classification JSON and record existence but omitted the portable import validator's typed revision/identity checks. Staging/activation now also require a valid family/ID, positive safe revision, valid operation ID and parseable timestamp. Invalid or dangling sidecars cannot activate.
3. Workspace selection could pass its scoped SQL filter, then project classification metadata after a concurrent reclassification. The completed response lacked a final classification epoch fence. Workspace reads now reject `workspace_scope_changed` when the classification epoch changes, and recheck generation. The dedicated scope epoch preserves the existing Trash pagination contract.

`node --test tests/pr49-scope-independent-security.test.mjs` passed five adversarial tests:

- Generation and canonical record revisions changed immediately before classification batch execution; both writes reject and create no classification.
- Two concurrent identical operation claims converge to one classification and one operation; a second principal cannot discover the first principal's scoped record.
- Missing `v2_learning_scopes` in an old complete manifest defaults safely to an empty optional table. Seven malformed import mutations (zero revision, unknown family, malformed operation/time, wrong owner, unknown language and duplicate identity) reject with `bundle_schema`, preserving active data.
- Tampered staged zero-revision and dangling-target sidecars reject activation with `archive_integrity`; original source/revision/rendition and active generation remain intact.
- A complete pre-migration checkpoint, with no scope table or classification operation, verifies, stages and activates. Its exact retained reading survives and remains discoverable as Unclassified.
- A database hook changes the Japanese classification to French between initial scoped record selection and scope metadata prefetch. The in-flight Japanese workspace response rejects with 409 rather than returning a mixed page; restarted Japanese/French reads agree with the current classification.

Scope eligibility is organisational. Owner/current-source validation remains separate. No source prose, canonical revision, historical rendition, checkpoint or achievement is created by classification. Imported classification sidecars use the existing encrypted recovery authority; no additional provider or permission path was introduced.

Production corpus equivalence, exact deployed source identity, installed MCP catalogue and live browser acceptance are recorded separately by the release integrator.

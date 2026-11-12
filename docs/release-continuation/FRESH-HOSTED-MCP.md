# Fresh hosted MCP acceptance

Date: 2026-10-25. Scoped connected-tool acceptance completed and recoverable cleanup verified. This report does not declare an overall release GO.

The tester was a fresh-context subagent in the existing root thread, with no prior application handover and no supplied parent record IDs. This is a model-context boundary, not a human session or an independent new Chat. Acceptance used only actual connected Minamo MCP tools. No fixture, local proxy, browser, application source, or direct API was used.

The actual catalogue exposed **29 Minamo tools**, including typed Activity, Attempt, natural-name continuity, and Atlas tools. Activity capabilities reported catalogue `activity-studio-interface-foundry-2026-10-25.2`, enabled `minamo.activity.v1`, typed instruction/prediction/reflection blocks, and immutable-edition Attempt persistence. The bounded Atlas call returned 37 nodes and 57 edges with truncation and a continuation cursor; it was treated as a bounded saved-relationship projection, never a complete corpus or mastery evidence.

Natural query `Mood-to-Music` uniquely recovered one current Journey. Its exact identity and URLs are redacted from these repo reports. The parent remained rev 4 with unchanged rendition after cleanup. Only a link from the synthetic Activity was authored; the parent was not modified.

Two read-only previews failed before writes: `input.expectedRev` required omission for create, and `input.activity.blocks.1.text` identified the typed text field required for prediction/reflection. The corrected preview succeeded. No flattening of unsupported fields was used and failed previews wrote no records or receipts.

One tiny original synthetic predict-compare Activity was published and exactly read. The exact same publish request and operation ID were repeated once; the receipt returned `replayed:true`, rev 1 and the same rendition. A current Activity read confirmed the unchanged edition. One synthetic Attempt was saved at rev 1, pinned to that exact edition, with explicitly labelled supplied test text and a short next intention. Natural-name `get_minamo_activity_context` with `includeSynthetic:true` returned both records and the short intention. No execution or achievement was asserted.

| Record | Family | Created rev | Cleanup rev | Result |
|---|---|---:|---:|---|
| `TEST-ONLY-pr45-fresh-activity-20261025` | experiment | 1 | 2 | Recoverably Trashed |
| `TEST-ONLY-pr45-fresh-attempt-20261025` | run | 1 | 2 | Recoverably Trashed |

Activity edition: `r-080957292b9d980fab1f32442a3a8da25f6cde4ab36bc6b1267cb65c0a3e2e98`.

Attempt edition: `r-e0a3b7846b951c1a697955b3f9610a50c244a6f068cca0f868d5bfe7c9447a5d`.

Operations: `pr45-fresh-publish-20261025` (one initial write and one identical replay), `pr45-fresh-attempt-20261025`, `pr45-fresh-trash-attempt-20261025`, and `pr45-fresh-trash-activity-20261025`. Every write request and operation identity was preserved in tester memory before invocation. Both Trash calls used exact `expectedRev:1` and `expectedGeneration:"legacy@0"`. Their committed receipts were independently read back. Post-cleanup natural context returned no active Activities or Attempts. Cleanup touched these two newly created synthetic records only.

No optional Note was created. No checkpoint, genuine learner record, Flag, source permission, attestation, environment, paid service, or other TEST ONLY record was changed; no permanent deletion occurred. The optional semantic-terminal path was outside this scoped test. There were no failures after the successful preview. Root controller baseline comparison remains separate.

The companion JSON contains metadata only, exact task-owned IDs/revisions/renditions and the full actual catalogue names; genuine parent identity, URLs and learner prose are omitted.

## Actual connected tool names

- `mcp__codex_apps__minamo_apply_minamo_authoring_package`
- `mcp__codex_apps__minamo_apply_minamo_command`
- `mcp__codex_apps__minamo_confirm_minamo_relationship`
- `mcp__codex_apps__minamo_get_minamo_activity_capabilities`
- `mcp__codex_apps__minamo_get_minamo_activity_context`
- `mcp__codex_apps__minamo_get_minamo_context`
- `mcp__codex_apps__minamo_get_minamo_editorial_policy`
- `mcp__codex_apps__minamo_get_minamo_learning_context`
- `mcp__codex_apps__minamo_get_minamo_learning_graph`
- `mcp__codex_apps__minamo_get_minamo_next_probe`
- `mcp__codex_apps__minamo_get_minamo_relationship_candidates`
- `mcp__codex_apps__minamo_get_minamo_workspace`
- `mcp__codex_apps__minamo_manage_minamo_recovery`
- `mcp__codex_apps__minamo_preview_minamo_activity_package`
- `mcp__codex_apps__minamo_preview_minamo_authoring_package`
- `mcp__codex_apps__minamo_preview_minamo_command`
- `mcp__codex_apps__minamo_preview_minamo_manuscript`
- `mcp__codex_apps__minamo_publish_minamo_activity_package`
- `mcp__codex_apps__minamo_publish_minamo_manuscript`
- `mcp__codex_apps__minamo_query_minamo_library`
- `mcp__codex_apps__minamo_query_minamo_records`
- `mcp__codex_apps__minamo_read_minamo_activity`
- `mcp__codex_apps__minamo_read_minamo_manuscript_source`
- `mcp__codex_apps__minamo_read_minamo_operation`
- `mcp__codex_apps__minamo_read_minamo_record`
- `mcp__codex_apps__minamo_record_minamo_activity_attempt`
- `mcp__codex_apps__minamo_record_minamo_learning_development`
- `mcp__codex_apps__minamo_reveal_minamo_activity_hint`
- `mcp__codex_apps__minamo_revise_minamo_learning_development`

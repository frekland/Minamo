# Library reference and interface copy

The owner requested that Library readings remain reference and further reading, with learner exercises and investigations initiated separately through GPT. This change removes the previous policy recommendation to embed prediction questions and self-study prompts. Explained code, syntax, expected results, diagnostic tables, language sample questions, furigana/Pinyin and primary references remain useful reference content.

MCP manuscript and structured-package preflight now report blocking, located `library_reference_only` findings for clear task scaffolding. Direct GPT commands inspect the merged Article, preventing a small block patch from bypassing the rule. Owner editing and Journey/Investigation tasks retain their existing authority. Detection is deliberately structural: it cannot certify the meaning of every possible paraphrase. Policy guidance remains the broader authoring contract.

The UI copy pass covers collections/search, Home, Library, related content, reference previews, Notes, Tools, Practice, settings, help and GPT handoff. Decorative instructions and repeated explanations are removed or shortened; useful empty-state actions, errors, source restrictions and save recovery remain. The browser title is simply Minamo.

A pre-existing inherited catalogue defect blocked one requested content correction: non-ASCII aliases carrying case-insensitive metadata could not be revalidated. A prose-only edit now preserves those entries with exact matching. Newly supplied invalid aliases still reject; previous catalogue editions remain unchanged.

## Validation and release

Focused synthetic Worker/MCP/D1 tests cover structured rejection with zero writes, small direct patch rejection, useful reference edits, explicit owner editing, inherited catalogue retention and new invalid alias rejection. Synthetic reference fixtures were updated to explain results rather than prescribe tasks. Full test/typecheck/build results and final matching native/GitHub tree, private version and hosted MCP evidence are recorded in the implementation PR.

Browser QA uses the development-only synthetic workspace, which grants no durable identity. Production content corrections use exact CAS revisions and are read back through the installed MCP; no learner Notes, flags, annotations, Journeys, Investigations or Activities are rewritten. Private article bodies and snapshots are not committed. Earlier editions remain retained.

Rollback: redeploy the previous private V46 for code/UI rollback. Content corrections are separate revisioned operations; a code rollback does not overwrite those records or their histories.

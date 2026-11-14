# Earlier discussion — superseded by accumulation-first architecture

**Status:** Historical design discussion, not the implementation brief for PR #12.

This document originally framed the problem as how to turn casual GPT learning into an organised personal knowledge base, with Projects optional and Library serving as reference. It helped establish that neither Projects nor Library should be required at capture, but still overemphasised classification, consolidation and the wording of a conversational example.

The resulting and now authoritative [Minamo accumulation and composition RFC](MINAMO-ACCUMULATION-AND-COMPOSITION-RFC.md) replaces that framing:

- Retain useful material and interactions independently of containers or final organisation.
- Compose multiple purpose-built, versioned experiences over shared canonical material when requested.
- GPT selects and creatively arranges; Minamo preserves sources, enforces rights and renders the chosen arrangement reliably.
- Projects and Library remain useful optional outcomes, not the required destinations or product model.

The full earlier discussion remains accessible in Git history (PR #12 prior commits), but is **not** a parallel architecture specification. Do not invent UI labels or automatic capture behaviour from an example utterance.

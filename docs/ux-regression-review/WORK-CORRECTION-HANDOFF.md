# Work correction handoff — staged for owner instruction, not started

**Purpose:** Restore V1-or-better annotation, Flag, Notes and organiser interactions within the ongoing Minamo V2 build, preserving the new React foundation and stronger exact-reading contracts.

Read [the evidence-grounded regression report](V1-V2-INTERACTION-REGRESSION-REVIEW.md) and its RT-01–RT-15 interaction checks. Also read the current [core learning experience](../core-learning-experience/CORE-LEARNING-EXPERIENCE.md) and owner [issue #1](https://github.com/frekland/minamo-v2/issues/1).

## Suggested message for the owner to send when ready

> Continue the active Minamo V2 build. Read the source-mapped interaction regression review in docs/ux-regression-review/V1-V2-INTERACTION-REGRESSION-REVIEW.md (from its PR branch, or main once merged).
>
> The current V2 direct select → Flag / Annotate experience is worse than V1. Restore or exceed the immediate contextual two-action selection experience across mouse, keyboard and Android native text selection, retaining V2's exact canonical/rendition mapping. Existing marked passages need direct, accessible preview/Edit/Delete; Flags need clear target-based bookmark/unflag behaviour, not accumulating repeated records or navigation into unrelated forms.
>
> Correct the documented Notes regressions in rich writing, four-way docking, resizing, maximise/minimise/collapse and convenient multi-Note switching and personal-work organisation. Keep the cleaner V2 charcoal/blue/cyan design, responsive layouts, present exact-reading, rich-content, recovery and GPT/MCP improvements. **Do not copy V1's obsolete DOM/UI, pooling, administrative clutter or deprecated controls.**
>
> Reconcile current Site-native/GitHub sources and any concurrent fixes; don't restart completed work or launch a broad new audit. Test the actual gestures using RT-01–RT-15, including real pointer/keyboard interactions and Android/touch verification where accessible; distinguish browser fixtures from authenticated hosted and physical-device evidence. Fix code, keep operations/data safe, deliver passing V2 PR/CI and authorised private deployment as part of the existing commission. Leave original Minamo and cyber-learning unchanged.

## Execution scope boundaries

- This review PR adds docs **only** and intentionally does not direct a running agent until the owner sends the message.
- When the owner triggers the correction, implement within existing V2 issue #1, rather than replacing that commission or opening a repeat UX discovery phase.
- Source regressions are not automatically live reproductions. If the latest native Site already fixed a finding, demonstrate the working behaviour and mark it **already fixed**, rather than repeating engineering work.
- Keep successful newer code, rights and recoverable Notes; deliver tangible behaviour, not only new tests or restyled buttons.
- V1 source admission and V2 protected archive recovery are separate ongoing engineering gaps. Track them without confusing them with the immediate annotation/UI regression.

**Read current repository and Sites source first. Never reset to the report's historical SHA.**


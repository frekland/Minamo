# Implemented component and integration catalogue

This catalogue describes the separate Interface Foundry staging source over frozen PR41. It is not a claim that the installed production MCP or V27 has these components.

## The narrow integration seam

`app/activity-studio.tsx` remains the Activity/Attempt owner. It revalidates the exact server Activity edition, retains device-local draft text and an immutable pending request, reveals hints through the existing server operation, and saves only a deliberate Attempt. `app/interface-workbench.tsx` composes that owner's trusted React children. It does not fetch, persist learning records, execute source, own Notes or instantiate a second editor.

```tsx
<InterfaceWorkbench
  activity={currentPermittedActivity}
  eligible={available}
  blocks={trustedBlockViewsByExactBlockId}
  evidence={existingAttemptEditor}
  onOpenNotes={openExistingWorkspaceNotes}
/>
```

Only application code supplies these React children. GPT supplies admitted Activity data and optional `minamo.presentation.v1` references; there is no GPT JSX/HTML/CSS or callback input. `activity.presentation` is validated by the shared admission SDK in `lib/interface-foundry.ts`; absent recipes derive from the actual Activity template. A recipe references each existing block once. Unknown presentation metadata falls back with an explicit status; unsupported future block formats retain the available trusted canonical fallback rather than guessing an executable renderer.

## Trusted composition roles

| Role | Existing content | User-facing section |
| --- | --- | --- |
| `task` | Instructions and provisional prediction | Task |
| `source` | Exact source-browser package or permitted source view | Source files |
| `explore` | Existing admitted Foundry visual/semantic renderer | Explore |
| `supporting` | Exact linked canonical reading and denied-reading marker | Reading |
| `guidance` | Server-returned progressive hints | Hints |
| `evidence` | Reflection, supplied output and the one existing explicit Attempt editor | Your attempt |

`eligible=false` mounts no block, action or Attempt content. ActivitySession clears the restricted Activity on denied server revalidation. Presentation visibility never grants source rights.

## Responsive and interaction behavior

- A measured container width, after Notes docking, controls the workbench. Phone/narrow layouts show one selected content section. No renderer runs in an inactive section: hidden panes contain empty wrappers, and their React content unmounts, invoking the existing renderer disposal.
- Context-first desktop adds the original task beside the selected content only at a usable container width (900px minimum, 560px primary plus 240px support minimum). Focus mode and expanded content remain single-surface. No new global workspace mode exists.
- Tab buttons use one roving tab stop, ArrowLeft/ArrowRight/Home/End activation, explicit labels, stable panel IDs and an ordinary keyboard-focusable primary panel. Native source/text selection is not intercepted.
- Source file choices are keyed by exact Activity edition/generation plus source-browser block ID. Pane switches dispose renderers but retain these choices and the parent's Attempt draft. Selected section/expansion are also device-local and edition-scoped for a Library/Reader round trip; they contain no source payload. `app/interface-workbench-state.ts` admits bounded Unicode-safe file paths only; it stores display state separately from evidence.
- Progressive hint buttons keep focus while loading or revealing, announce returned text and can hide it. Hidden hint text is removed from the DOM. The separate reveal history retains the deliberate hint choice for an explicitly saved Attempt; collapsing a hint does not rewrite what happened.
- `ActivityLink` preserves exact family/id/rendition/section/part. Ordinary clicks call the existing Workspace navigator; modified clicks keep native new-tab behavior. `onOpenNotes` calls the existing Workspace coordinator with the exact Activity context, never a new NotesPanel.

## Working layout variants

The dev-only lab reads `if-layout=context-first|artefact-first|sequence|power` and `if-density=comfortable|compact`. The disclosure “Compare working layouts” switches presentation without remounting ActivitySession or saving an Attempt. Production compilation removes this experimentation control.

| Variant | Functional difference |
| --- | --- |
| Context first | Source/visual primary with original task aside when the measured width allows it |
| Artefact first | One spacious source/visual surface with all context in labelled sections |
| Read · try · reflect | One surface and explicit ordered section navigation |
| Dockable workbench | Content plus existing Attempt pane on wide containers, with a keyboard-operable width control |

These are contextual compositions inside Classic/Focus/Task, not competing frontends. Physical-device preference remains an owner acceptance question.

## Existing primitives reused

`ActivitySourceBrowser` renders escaped exact file text, visible tests, checksums, deliberate source copy and current-rights ZIP download. It never evaluates project code. `ActivityArtefact` activates only the original trusted Foundry registry after explicit use and exact-source checking; it disposes on pane close, source change and unmount. `ActivityInstructions` retains canonical Reader links. `ActivityAttemptSummary` labels supplied terminal/GitHub evidence and keeps exact Activity-edition return. The canonical Reader remains responsible for Flags, Annotations and exact semantic source coordinates.

For a supported new Activity, publish data through the staged Activity MCP. For a prepared new view, register one trusted block renderer/slot and add a fixture; do not modify Workspace, Notes or the route model. New execution engines and previously unsupported source formats require a separate security/runtime review.

## Focused checks

`node --test tests/interface-workbench.test.mjs tests/activity-ui.test.mjs tests/challenge-interface-unicode.test.mjs` covers static semantic composition, denied/unknown fallback, no inactive payload mount, per-block source choice, generation/edition drafts, exact Reader/D1 capture, uncertain retries and Unicode recovery. Real browser, screenshot and mobile evidence is recorded separately in VISUAL-ACCEPTANCE; these tests alone do not prove gestures or physical Android behavior.

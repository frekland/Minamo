# Minamo V2 — Activity Studio, Challenge Exchange and Learning Atlas

> **Mandatory Pro-phase gap closure:** Read [PRO-PHASE-GAP-CLOSURE.md](PRO-PHASE-GAP-CLOSURE.md) before implementation. Identify and close all code-owned release-critical gaps (durable domain/MCP/schema, typed outputs, GitHub/local exchange, Atlas, isolation and recovery), prove integrated end-to-end scenarios, and trial Light-model activation. Do not offload hard but solvable engineering to the user's later Plus plan. Keep no-deploy and owner-only safety boundaries.


> **Critical release-readiness addendum:** Read [INTEGRATION-RELEASE-READINESS.md](INTEGRATION-RELEASE-READINESS.md) first. In addition to prototypes and activation dossiers, produce a coherent combined Foundry 1 + Activity Studio **staging integration PR** with hardest durable domain/MCP/schema work completed where feasible, release rehearsal, feature flags, tests and explicit remaining release gates. No main merge or production deploy is authorised.

**Owner research commission · 25 October 2026 · draft only.** This is a second engineering foundry, not a conventional quiz feature. No deployment, main merge, Site save, access change, production MCP refresh, genuine learner-data mutation or paid runtime is authorised by this document.

## Authoritative continuity

- Main (at commission drafting): merged/released PR #37, commit c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c.
- [PR #38](https://github.com/frekland/minamo-v2/pull/38): the full-capacity capability research scope, and its research source.
- [PR #39](https://github.com/frekland/minamo-v2/pull/39): substantial separate **draft implementation bank**, not merged/released. Read its RESULTS.md, BANK-RECEIPT.md, ACTIVATION-QUEUE.md, lib/foundry/platform.ts and provenance/security tests before designing anything new. PR39 reports 12 format adapters, 27 activation dossiers, 877 passing tests/one Rust skip, tested offline Matplotlib/SymPy and source-bound D1/MCP readback; some browser/GPU/device and durable semantic-storage gaps remain. Treat report claims as evidence from that task, not production functionality.
- This commission's branch is intentionally **based on main and documentation/examples only** to avoid conflicts with an unfinished/draft PR39. Actual activity-runtime implementation should branch from a **frozen verified PR39 code ref or an integration branch** after assessing source overlap, without treating the research branch as a mergeable release dependency.
- Current Minamo owns 10 record families, exact UTF-16 reading anchors, revision/receipt/generation fences, an authenticated D1/R2 domain and typed MCP, learner Notes/Developments, Journeys/Investigations, existing CodeMirror/Recharts/SQL.js/react-hook-form, and finite browser tools. Build *with* these, do not fork them.

## Strategic thesis

**Foundry 1 provides instruments. Foundry 2 provides an intelligent, trustworthy authoring and interaction protocol by which GPT can assemble entire learning experiences from those instruments, link them to existing learning context, send real code to a local GitHub workflow, and reconnect the resulting evidence.**

We seek a reusable **Minamo Activity Cartridge** that can be authored by GPT over a compact, discoverable MCP API, validated and previewed by the server, opened in Minamo's ordinary workspace, optionally cloned/run on Windows/Kali, and resumed from any GPT conversation. A cartridge is a versioned compositional learning artefact: instructions, runnable/starter files, tests, visualizations, controlled interactions, hints, desired predictions, prerequisite readings, linked activity context and evidence-handling. It is **not arbitrary JSX/JS injected by GPT** and is **not a claim of learner completion**.

### Three systems to engineer

1. **Activity authoring/publishing runtime** — registry of trusted interactive components + concise activity DSL + validators + GPT/MCP publisher + previews + learner attempts/feedback.
2. **Code project interchange/round-trip** — GitHub starter branch/repository templates + exact commit/file manifests, downloads/local execution, submission import/diff/run evidence, user-approved updates into Minamo and tutoring context.
3. **Learning Atlas** — linked visual navigation of Journey routes, Investigations, Library concepts, activities, Notes and evidence; multiple views, not a fictitious automatically graded skill tree.

Each should be viable independently, share source permissions and links, and support user study without GPT being present. The combined experience matters more than a flashy gallery.

## Example user experience: a deliberate bug hunt

> "Use Minamo V2. I'm learning sockets. Give me a practical challenge that will make me discover what recv() really does, pitched just beyond what I currently understand. Include files I can clone on Kali."

1. GPT resolves the relevant Journey and Investigation by name, retrieves compact recent Notes and checkpoints as **different evidence levels**, locates reusable Library references, proposes an appropriate challenge and code/test fixture.
2. GPT prepares a versioned Activity Cartridge: title, intent, learning targets, starter Python files, deterministic tests (at least one deliberately fails initially), staged non-spoiler hints, *desired* observations and canonical links.
3. The **Activity MCP** returns a precise preview and preflight: which validations pass, what bytes/permissions/source metadata are required, which supported components will actually render, how local GitHub delivery works, whether baseline tests genuinely ran. No write during preview.
4. Only an explicit deliberate publication creates a revisioned activity linked to the Investigation/Journey and permitted Library sections. Its current and retained editions are accessible through the same owner/Trash/recovery controls.
5. Minamo opens the activity as a focused tab in Classic, Focus or Task: explanation, selectable code, visible test cases, copyable commands, carefully labelled optional sandbox, hints, notes and "Work locally". The challenge does not auto-run by opening.
6. GPT can use its connected GitHub action *with owner-authorised scope* to create a branch/repo and push the actual starter files, with exact commit and asset hashes, and return its link to Minamo through a guarded MCP command. **The Minamo backend cannot assume it holds GitHub tokens or can modify GitHub on its own.**
7. Learner clones and edits in Kali/Windows using their preferred IDE, runs tests and pushes changes. Minamo need not pretend to be a full OS or Git client.
8. Returning GPT inspects an exact GitHub commit/diff and any deliberately supplied test log. It distinguishes repository contents it fetched, user's reported execution, and genuinely verified CI jobs. GPT proposes helpful questions/hints and a short linked Note rather than declaring mastery.
9. A separate explicit "Review this attempt" action admits a versioned attempt/evidence packet, results and learner reflection. Later formal checkpoint is a **distinct deliberate** learning action; neither passing local tests nor simply opening hints silently marks the Investigation completed.
10. A fresh GPT chat recovers the activity's current source version, precise linked attempt(s), newer Note intentions, Library references and repo revision, preserving contradictions and chronology without asking for a handover.

### Important boundaries

- **No hidden solutions in learner-facing starter bundles.** A teaching-only oracle or intended fix must be separately permissioned and not returned by default context/HTML/embedded assets; hiding in CSS/JSON does not count. Do not publish hidden evaluations to publicly accessible files.
- **A red test at baseline is a feature, not a failed implementation**, but the challenge package must demonstrate it intentionally and the success oracle must be independently validated.
- Local repository activity is never automatically a Minamo-observed Run. GitHub commits are fetched repository evidence; command output pasted by the learner is supplied evidence; CI metadata must be verified from the corresponding immutable commit.
- No arbitrary user/LLM-authored JavaScript executes inside Minamo's privileged origin. WebContainers and Sandpack require an independently proven isolated host/network policy if used at all.
- The user chooses when to create/update/test/review. Reading, toggling hints, navigation, diagrams and rendering do not create learner milestones.
- Activity attempts are not a competing Note collection. Long-form answers live in existing short linked Notes as appropriate; references/attempt metadata carry concise structured context.

## High-value activity families

The programme should implement and test a **template + composition system**, not a bespoke React feature per exercise:

- **Fix-the-bug:** faulty code + failing tests + safe GitHub starter + optional trace and progressive hints.
- **Fill-the-gap:** partial functions, missing React component, incompletely wired Rust app or SQL query with target behavior; explicit blanks/test API.
- **Predict–run–compare:** actual code/terminal or supplied traces, expected outputs and controlled reveals.
- **Code archaeology:** understand a commit series, locate a regression, use a source/diff viewer, explain the choice of evidence.
- **Mutation testing:** compare variants and design tests that catch intentionally mutated logic, not just "fix the code".
- **Algorithm theatre:** graph/pathfinding/sorting/recursion, stepping, counterexamples and trace diagrams.
- **Systems/networking lab:** TCP fragmentation, HTTP status/routing, DNS, permissions, Bash pipes and regex, using finite local deterministic fixtures.
- **Scientific investigation:** Python/NumPy/Matplotlib outputs, CSV/SQL/data analysis, plots, expected-vs-observed and discrepancy explanations.
- **Interactive mathematics:** typeset expressions, manipulable graphs, prediction and separately observed SymPy/numerical execution.
- **Languages:** Japanese kanji/furigana reveal, contextual reading, particle/grammar annotations, meaning-choice explanation with source-backed corrections; multilingual later.
- **Music/sound:** beat grid, Strudel/Tone pattern, waveform or MIDI timing, optional deliberate audio.
- **UI/visualisation:** build or repair accessible React UI, draggable state-flow logic, canvas/Three scenes, test screen-reader/focus and contrast.
- **Game development:** playable tiny maze/Sudoku/retro RPG starter with deterministic state changes; local or safe finite renderer, not arbitrary insecure embedded game scripts.
- **Property-based reasoning:** shrinking counterexamples, test design, benchmark assumptions and program invariants.
- **Debugging workshop:** red/green tests, source/diff, terminal evidence, hypothesis ledger and staged Hint/Lesson transitions.
- **Data forensics:** data cleaning, outliers, Unicode encodings, JSON parsing and provenance-aware graphs.

Include branching scenario/puzzle stories, real partially built projects, deliberately misleading examples to test critical thinking **only when clearly framed as exercises**, and activities that deliberately connect two different learning subjects (e.g. Japanese text encoding, statistical music features, maths behind game physics).

## What an excellent learning activity feels like

A mini-project should have agency: the user sees **what to build or investigate, why it matters, how to start, and what is still unknown**. They can enter at the right level, leave, explore a related article and come back without losing code or state. GPT should offer teaching without dumping answers, with owner-selectable spoiler policy and explicit solution reveal. Visual diagrams should illuminate the problem, not become a wall of interactive decorations.

Activities compose *multiple* capabilities safely (code + graph + sandboxed demonstration + hint + short Note + repo link) and can be versioned and reused across Journeys. Learner-specific state belongs in distinct attempts/Notes, not mutating the reusable Library challenge.

## Work commission

Read [WORK-COMMISSION.md](WORK-COMMISSION.md), [MCP-GITHUB.md](MCP-GITHUB.md), [ATLAS.md](ATLAS.md), [TECHNOLOGY-LANDSCAPE.md](TECHNOLOGY-LANDSCAPE.md) and [EXPERIMENTS.md](EXPERIMENTS.md). A runnable minimal bug-hunt fixture and draft manifest are in ../../examples/activity-studio/.

Success is **actual durable, well-tested dormant integration infrastructure and reproducible end-to-end flow**, not merely a conceptual architecture. Work can and should chunk/parallelise across dozens of subjects and cross-cutting demonstrations; no artificial small scope limit. A future user should be able to enable one template, one GitHub interchange flow or one atlas view with Sol Light using an exact activation dossier.

Production/main release, genuine learner records and owned repository/source authority remain untouched until explicit owner approval.


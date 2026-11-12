# Actual local browser acceptance

Date:25 October2026. Synthetic development data only. Actual cloud browser, supported Sites preview, production NoteWritingEditor/NoteMarkdownView and actual shared domain/MCP handlers with local D1. No production identity, installed-plugin refresh or physical Android use is represented.

The clean native checkout initially selected the portable development profile. The supported configuration helper selected managed-linux and the supported preview then served normally; no browser/network-security workaround was used. Builds during development could refresh in-process UI fixtures; final interactions below ran after source/UI freeze.

## Persisted browser capture

At `/preview-growth`, initial Note revision1 contained a prediction and later prose. The caret was visibly checked at offset48 of the prediction paragraph. Insert terminal output accepted this original six-line transcript:

````text
$ curl -i localhost:8080/jobs
HTTP/1.1 503 Service Unavailable
  detail: shutdown in progress
	Unicode λ 😄
``` is console data
<not-html>
````

The fourth line begins with a literal tab. Environment:Kali · Bash; label:Shutdown counterexample. The inserted panel appeared between the original prose paragraphs, collapsed by default. Continue writing accepted a separate observation, interpretation and uncertainty without a script error:

> Observation:503 contradicts my prediction. Interpretation:admission may be closed; it does not prove retries are drained. Uncertainty:the retry/shutdown race remains untested.

Save acknowledged **revision2**, rendition `r-c660a5674781bb15c7febaacd92fc3e01c9e753a2450b42a1a97e3329ed69cec`, operation `TEST-ONLY-browser-51dd5d36-eff7-4cec-9e5c-2c7b3f36f90c`. Close editor→Reopen saved Note→Open editor retained the block and surrounding writing. Fixture Classic/Focus/Task presentation controls retained one editor state; they are not a substitute for full production-layout acceptance.

Expanding saved output showed all six lines as text. Copy output reported copied; `clipboard.readText()` matched **all138 original characters exactly**, including tab, Unicode, backticks and angle brackets. Inspecting the server source/committed receipt showed the same JSON-escaped semantic capture. Reading revision1 returned its original body with no later terminal block, rendition `r-d0904fe2617d86dab473e757c8145cb6c28f63bf607ce08442f1c28a12d22c17`.

## Typed MCP capture → browser

Save supplied capture through JSON-RPC called actual `apply_minamo_command` with ordered `data.noteContent` Markdown/terminal/Markdown blocks. A separate synthetic Note was created by actor:gpt, operation `TEST-ONLY-gpt-op-ac516479-436e-41dd-af9b-c44742c0c4ad`, rendition `r-f55ee6bf31cdfd86fadee0e4d3eec4a0ac27ae265e562779c49376f05d39a248`. Browser exact readback rendered a collapsed **Local shell · reported ·5lines** block between the supplied prediction and the distinct interpretation/uncertainty. Embedded fence text and Unicode remained output data. This is an actual local JSON-RPC handler call, not the installed production plugin.

## Narrow viewport and recoverable rejection

`/preview-mobile?fixture=growth&width=390` mounted a real **390×844 CSS iframe**, loaded saved revision2 from the same local D1 and displayed its identifiable collapsed capture and surrounding prose. Insert terminal output opened within that iframe. Pasting24,000 `x` characters and pressing Insert rejected the encoded total with the exact24,000-character Note budget and the smaller-excerpt/attachment repair path. The textarea still contained24,000 characters. Close·keep pasted text→Insert terminal output reopened all24,000 characters. The Note body/revision was not changed by rejection. This verifies narrow web layout, not touch selection, Android keyboard or TalkBack.

## Goal handoff and local starter

The actual Workspace `/preview-test?view=journeys` exposed **Start a Journey with GPT**. Entering the synthetic Java→Rust goal did not write records or copy automatically. Explicit Copy Journey request produced a clipboard string containing the exact goal and **Start working locally** teaching requirement.

The exact original browser-game HTML was served by development-only `/preview-growth/game`. Button movement started at(1,3); Right→Up stayed at(2,3), correctly blocked by the wall; Right→Up→Up reached the star. This is real browser UI execution of the starter, complementing the independent event/rules harness. Rust remains uncompiled because the toolchain is absent.

## Corrections caught in real browser review

The first final-block Continue writing interaction raised a position-out-of-range error. The corrected implementation resolves the capture against the current transaction and adds a valid following paragraph; the actual retest accepted continued prose. Independent review also reproduced pending replacement loss on Close/reopen; its corrected retest retained the exact replacement and Replace mode. Source-mode coordinate and per-capture draft recovery received corresponding automated regressions. The independent review's earlier HTTP clipboard fallback remains a real failure-state test; the later parent browser test above separately proved successful exact copy.

No hosted synthetic records were created. Local test principals/data are confined to disposable preview/test storage, and the development proxy returns404 when compiled with DEV=false. Ordinary production auth paths are unchanged.

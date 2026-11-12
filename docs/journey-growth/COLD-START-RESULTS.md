# Fresh tutor resumption — synthetic, no prepared handover

Two model contexts were created without inherited conversation. Each received only the natural user request **“Use minamo. Let’s continue the queue project”**, normal JSON-RPC access instructions, and a prohibition on inspecting evaluator/source files. Neither received record IDs, the desired next action, a ledger or a summary. The actual compiled Minamo domain handler supplied its catalogue and reads over a filesystem transport because executor loopback namespaces are isolated. This is an isolated MCP integration test, not the installed production plugin or a human learning study.

The first failed HTTP connection attempts exposed no catalogue or project content. The working transport then ran against isolated D1/R2. A second separately fresh context received the same request after an independent similarly named Journey was added. Traces and setup provenance are in [the frozen protocol](../journey-growth-commission/COLD-START-PROVENANCE.json).

## Primary tutor answer

> Let’s pick up at the **retry/shutdown race**. Your saved checkpoint leaves the controlled experiment open. A newer note proposes pausing a retry just before enqueue, then closing admission; it doesn’t report a result yet.
>
> Your earlier expectation was that draining would include a retry already being prepared. The unresolved question is where your implementation counts that retry as accepted work.
>
> Try one controlled interleaving:
>
> 1. Pause one retry immediately before enqueue.
> 2. Close admission and start shutdown.
> 3. Release the retry.
> 4. Record whether it is accepted or rejected, whether shutdown waits, and the task’s final outcome.
>
> Track acknowledgment separately from success: the linked reading says acknowledgment accounts for an attempt, while your correction keeps a separate success ledger.
>
> Before running it, predict what happens to that paused retry—and what observation would disprove your prediction.

Actual calls: catalogue twice; one natural-name resume; one exact Investigation tutor read selected from the returned Journey groups; one exact linked Article read. The tutor did not request full terminal output because its chosen next experiment did not require it. Exact terminal selection is separately verified by the interoperability tests. It did not obey the synthetic Annotation’s malicious instruction or write records.

## Ambiguous tutor answer

> Minamo found two matching projects. Which one would you like to continue?
>
> - “TEST ONLY queue project”
> - “TEST ONLY alternate queue project”

Actual calls: catalogue once and one natural-name resume. No target was selected or merged.

## Bounded comparison with manually preparing a handover

The synthetic setup required seven separate short task Notes, one unrelated Note, a source-aware Annotation, a bookmark, a terminal block and one deliberate checkpoint. The shutdown intention was subsequently edited in a Note. These were accelerated ordinary observations/corrections, not a longitudinal human session; no setup time saving is claimed.

Only after both Minamo conditions were complete, the implementation owner wrote this separate comparator summary from the saved synthetic records:

> We are investigating a local worker queue. Join returned with seven successes and one failure, contradicting my prediction that it proved eight successes. Keep a separate success ledger; acknowledgment accounts for attempts. Shutdown is still untested. My newest Note asks to pause a retry before enqueue, close admission, and observe whether the retry is accepted and whether shutdown waits. Do not infer a result or progress. Read the exact terminal evidence if needed.

This comparator was never supplied to either returning tutor. It demonstrates the additional organisation a manual handover needs: someone must select the current task, reconcile the prediction/correction, notice the later intention, and write the summary. It is not a controlled tutor-quality comparator, measured human timing or evidence that manual handover is inferior.

The natural Minamo run transferred 40,033 bytes across three domain reads. Its two full catalogue responses added 392,802 bytes of harness discovery overhead. The ambiguity run used a 1,481-byte domain response plus one 196,979-byte catalogue. Catalogue discovery is reported separately rather than hidden in a claim of routine continuation efficiency. Installed ChatGPT tool provisioning and refresh remain a release check.

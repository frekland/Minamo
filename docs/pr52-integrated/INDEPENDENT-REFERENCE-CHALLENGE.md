# Independent permanent-reference challenge

This bounded challenge read the actual installed-MCP current editions of four authorised permanent Library revisions. It assessed technical mechanism, harmless executable examples, output interpretation, failure distinctions, exact named-command coverage and primary further reading. It did not import private Article prose into Git or claim native-device/learner execution.

| Reference | Inspected disposition | Independent result |
| --- | --- | --- |
| Processes, TCP sockets and connection evidence | Article `ms-a5c07502e7d21f26023953f00d8804fb546b4607`, rev2 | Distinguishes process/socket/connection and descriptor/port; loopback task predicts LISTEN/ESTAB separately; explains queue/process-visibility limits; explicitly qualifies OpenBSD, packaged derivatives, traditional Netcat and Ncat. Named ss/nc destinations have substantive relevant coverage. No required correction found. |
| SSH authentication, remote shell and trust | Article `ms-784aaa77c4a3db41c3153a4361382668b16f1541`, rev2 | Host-key trust and user authentication remain separate; harmless effective-config/fingerprint examples, failure table, quoting/stream boundaries and command-specific ssh/ssh-keygen sections support independent reasoning. No required correction found. |
| Standard streams, piping and failure evidence | Article `ms-3f94c84194a7bfb7f34fb6d2619e6fc879e882ed`, rev2→3 | Clarified exact Bash construction order: pipe connection is established before the command's explicit redirections, so 2>&1 duplicates that pipe destination onto stderr. The prior wording could obscure this order. Targeted patch preserved section/part IDs and retained editions. |
| TLS layers, certificates and connection diagnosis | Article `ms-4ac56cbd7d049d4cf51091d288d24f695f6e2aa3`, rev2 | Transport, SNI, hostname/trust verification and HTTP failure remain distinct; s_client options are explicit; generic nc entry removed from an unrelated TLS destination. Useful counterexamples and primary readings. No required correction found. |

Permanent change receipt: operation `pr52-independent-stream-order-20261026-v1`, streams Article revision3, rendition `r-8cd9ff4a01ac44030652da2b95844c29b35b57d1eedbfbb87965fd59e0bbbaad`, catalogue revision3. Normal MCP targeted-patch operation committed and exact readback confirmed. No personal Note, Attempt, checkpoint or progress record was created by the review.

Primary-source challenge used Firecrawl against:

- <https://www.gnu.org/software/bash/manual/html_node/Pipelines.html> — pipeline connection/redirection order and rightmost-nonzero pipefail behavior.
- <https://man.openbsd.org/nc.1> — listener, EOF shutdown and variant-specific semantics; installed derivatives still need their own help/manual.
- <https://man.openbsd.org/ssh.1> — effective-configuration inspection, identity selection and destination port.
- <https://docs.openssl.org/master/man1/openssl-s_client/> — SNI, verification options and noninteractive/EOF caveats. A targeted query returned no content; ordinary Markdown retrieval supplied the relevant official material, and feedback recorded that retrieval issue. Throttling did not lead to a plan upgrade or purchase.

Actual harmless commands executed in the agent Linux container independently reproduced the stream examples: `false | wc -l` under Bash pipefail printed0; immediate combined status capture reported pipeline1, producer1, last0. A two-printf producer yielded one stdout line with a separate diagnostic, and two downstream lines when stderr was merged. `ssh -G -p 2222 learner@example.invalid` printed the expected effective host/user/port without opening an SSH connection. These are agent-container observations, not evidence from Jon's Kali environment. No external TLS or SSH connection was executed for this review.

Independent-learning questions answered by the resources include: why LISTEN can coexist with no established peer; why a process-local descriptor is not a port; why a successful line counter does not prove its producer succeeded; how host keys differ from authorised user keys; and why SNI alone is not hostname verification. This is a bounded technical/editorial assessment, not mechanical certification of every future lesson or expert native-language review.

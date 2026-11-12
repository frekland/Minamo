# Installed MCP baseline — PR26

Measured before implementation/deployment on the actual V19 installed connection, 23 October 2026. Private record identities and checkpoint contents are deliberately omitted from this engineering report.

| Representative read | Calls | Elapsed tool round trip | Serialized tool result |
| --- | ---: | ---: | ---: |
| Exact existing Journey stage, learning context, limit 4 | 1 | 5,875 ms | 9,483 bytes |
| Same Journey with exact learningTarget, general context | 1 | 7,589 ms | 70,350 bytes |

These are one sequential sample each, including connector/host/network overhead. They are not server benchmarks, token counts, an SLA or a reliable latency distribution. No reads created learner work. There were no schema retries in these reads.

The learning response retained two saved checkpoints including an earlier provisional product choice, but duplicated their summaries in a recent feed and omitted the current canonical stage task. The general response included the entire fifteen-stage Journey, broad related summaries and repeated learning context. Saved reasoning was retrievable; successful retrieval did not guarantee the tutor would use it. These observations motivate focused context assembly with explicit prior-decision/evidence framing, not arbitrary payload reduction.

Post-release comparison must distinguish actual installed behaviour from local equivalent fixtures and assess retained educational meaning separately from size or speed.

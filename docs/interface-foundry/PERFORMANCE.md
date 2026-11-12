# Performance and packaging evidence

The same supported production build was run on the exact frozen PR41 tree and the integrated candidate with the same checkout-local execution profile and dependency versions. `scripts/interface-bundle-report.mjs` measures the union of the browser entry and Workspace static-import/CSS closures; dynamic imports are excluded. It is an emitted gzip transfer estimate, not INP, network transfer, heap or battery measurement.

The final comparison is **+739 gzip bytes (0.211%)** in [BUNDLE-COMPARISON.json](evidence/BUNDLE-COMPARISON.json), including the completed Notes/navigation and retained-source guards. Earlier exploratory measurements were +496 and +541 bytes; they are superseded by this final same-method comparison. Activity and Atlas remain lazy; neither their chunks nor tldraw/Three/scientific runtime chunks enter this default closure.

The ordinary build's package policy reports `scienceIncluded:false`. The existing checksum-pinned scientific assets were staged locally only to run the real existing scientific regression tests; they are excluded from the ordinary distributable. No unconditional scientific download or new paid service is introduced.

Responsive pane geometry and correction of intrinsic table overflow are measured in VISUAL-ACCEPTANCE.md. Current-host cancellation, a 15-second loading boundary and owned renderer roots prevent indefinite stale activation and the reproduced React teardown race. Native-DOM and browser route-away tests verify disposal behavior; they do not establish a long-running heap/INP benchmark. No invented memory or interaction-latency score is claimed.

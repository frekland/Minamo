# PR83 Pygbag standalone runtime probe — blocked

3 November 2026. This is technical probe material, not a supported-production profile or a commissioned game. No shared application source or production data was changed by this probe.

## Outcome

**Execution remains unverified.** The owning agent reports that the supported Cloud Browser preview URL `http://terminal.local:4173/pr83-pygbag-probe.html` returns `net::ERR_CONNECTION_REFUSED`, while `sites-preview status` reports the preview running. No alternative server/host was started. The mandatory genuine runtime probe cannot establish Pygbag loading, CORS, successful pygame-ce execution, Stop/Restart, or native CSP compatibility. This is an infrastructure blocker, not evidence that the runtime itself is incompatible. Do not merge/deploy on the basis of this probe or claim packaged-app support.

## Inspected source

- Pygbag upstream checkout: `https://github.com/pygame-web/pygbag`, commit `df678453b3c9090f1ba659a0a8f740b4437ad8d3`; local `/tmp/pr83-pygbag/upstream`.
- Actual standalone exporter: `src/pygbag/html_embed.py`. `--html` embeds Python and filesystem bytes in one HTML module-script document; it still loads the external Pygbag runtime. This differs from `static/default.tmpl`, which expects relative `.tar.gz`/`.apk` files and includes a hidden nested iframe with broad permissions.
- Runtime archive source: `https://github.com/pygame-web/archives`, observed HEAD `5ab484fcee674a99492cceb7bf3340239da63d7a`.
- Retrieved runtime loader: `https://pygame-web.github.io/archives/0.9/pythons.js`; SHA-256 `36807c3a41819e2f6306fd960abd32939ac6df1b9944a4b50b948a12729bffeb`; retained at `/tmp/pr83-pygbag/loader-09.js`.
- Retrieved Python bootstrap: `https://pygame-web.github.io/archives/0.9/cpythonrc.py`; retained at `/tmp/pr83-pygbag/cpythonrc-09.py`.
- Runtime loader defaults Python 3.11 unless explicitly configured. Top-window location reads are guarded with try/catch, so opaque parent access does not by itself establish failure.
- `https://pygame-web.github.io/cdn/0.9/pythons.js` returned 404; the archives URL above returned 200 through Firecrawl. This says nothing about browser CORS.

## Candidate profile and test material

`standalone.html` was generated using the actual standalone exporter. It is 1,130 UTF-8 bytes; SHA-256 `d0a0b6e6340f55d67d78d1a61a9dd5a0330b82c305e8cbabbeab2ed0fae88214`. The minimal input initializes pygame-ce, paints one circle, emits a runtime marker, then yields. It is technical acceptance material, not a game or learner Project.

The generated loader attributes were explicitly bounded to `data-python="python3.12"` and `data-os="stdout,gui"`, avoiding terminal/filesystem UI dependencies. `opaque-probe.html` provides explicit Run/Stop, puts the package in `srcdoc` under sandbox **only** `allow-scripts`, and places CSP before package code. It passes no identity, cookies, generation token, records, persistence callback or general fetch bridge.

Candidate child CSP:

```
default-src 'none';
script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://pygame-web.github.io/archives/0.9/;
connect-src https://pygame-web.github.io/archives/0.9/ https://pygame-web.github.io/archives/repo/;
worker-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; media-src blob:;
frame-src 'none'; form-action 'none'; base-uri 'none'
```

This CSP is **a probe candidate**, not verified final admission policy. No `allow-same-origin`, top navigation, popups, forms, downloads, pointer lock or fullscreen permission was supplied.

## Resource and integrity questions still open

At the observed archive commit, Python 3.12 requires:

| Resource | Bytes |
| --- | ---: |
| `0.9/cpython312/main.js` | 4,951,434 |
| `0.9/cpython312/main.data` | 7,577,474 |
| `0.9/cpython312/main.wasm` | 12,716,708 |

The loader also fetches `0.9/cpythonrc.py`. Package bootstrap uses the separate `archives/repo/` indexes/wheels. The inspected `repo/index-090-cp312.json` maps `pygame.base` to `cp312/pygame_static-1.0-<abi>-<abi>-<api>.whl` and hardcodes `-CDN-` to `https://pygame-web.github.io/archives/repo/`. Allowing only the core version directory therefore cannot be assumed sufficient. The final required path set, CORS, credential omission, package versions and native browser behavior require actual inspection during a successful probe.

The GitHub Pages `0.9` directory is versioned but not a cryptographically immutable commit URL. Retain exact loader/runtime identities or supply verified immutable resources. A SHA-pinned jsDelivr runtime is a possible future probe, not tested here. Raw GitHub module-script URLs cannot be substituted blindly because MIME handling differs. Do not relax the origin boundary or allow an entire CDN wildcard to conceal loading failures.

## Resume

Restore the documented preview-to-Cloud-Browser route, expose the temporary opaque wrapper, run it and inspect actual failures/resources. A successful loader request alone is insufficient: confirm pygame-ce output, opaque isolation, Stop/Restart and missing-resource handling. Keep original package bytes download-only, never executable at the Minamo origin. Reject relative-directory/ZIP profiles until separately implemented and proven. Remove temporary fixtures from release source.

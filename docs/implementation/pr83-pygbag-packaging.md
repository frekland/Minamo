# Standalone Pygbag profile — packaging recipe and loader caveats

Source-inspected against Pygbag `df678453b3c9090f1ba659a0a8f740b4437ad8d3` (`VERSION = 0.9.4`). This recipe describes the candidate `standalone-html-v1` envelope. Successful execution still requires the commissioned live browser check; source inspection does not establish compatibility.

## Owner recipe

1. Put the application entry point in `my-app/main.py`, and all files it uses inside `my-app`. Keep its browser loop asynchronous and yield with `await asyncio.sleep(0)`.
2. Make the **first line** of `main.py` this comment/shebang (it is also valid as a Python comment):

```python
#! src="https://pygame-web.github.io/archives/0.9/pythons.js" data-python="python3.12" data-os="stdout,gui"
```

This is the exporter-supported way to declare the exact runtime attributes. `--PYBUILD 3.12` alone does not populate `data-python` in the standalone exporter. Do not add another module loader manually.

3. Keep a top-level, unindented `asyncio.run(main())` at the end of the entry file. The standalone exporter finds the first line starting with `asyncio.run`, uses that as its launch line, and omits subsequent entry-file code. Its first input line is replaced by the HTML loader header, which is why the header comment above matters.
4. In a Python virtual environment, install the inspected packager revision and package with the application directory **last**:

```sh
python -m pip install 'git+https://github.com/pygame-web/pygbag.git@df678453b3c9090f1ba659a0a8f740b4437ad8d3'
python -m pygbag --build --html --no_opt --PYBUILD 3.12 --cdn https://pygame-web.github.io/archives/0.9/ my-app
```

`--no_opt` avoids format conversion by local optimizers. The runtime's supported image/audio formats still apply. The exact Git revision is used here because that is the source inspected; availability of a same-numbered PyPI release was not verified.

5. Supply **`my-app/build/web/my-app.html`**, not `index.html`, `.apk`, `.tar.gz` or `web.zip`. The name comes from the lowercased application folder name with spaces replaced by dots; use a simple folder name without spaces. The generated `index.html` is the separate directory-package template and does not satisfy this profile.
6. Keep the UTF-8 HTML under the admission byte limit. Embedded binary assets expand in the HTML encoding, so original asset sizes do not predict final package size. No external relative application files are supported. Minamo supplies the loader's integrity/CSP wrapper; do not add custom scripts, frames, bases or metadata to the exported file.

The exporter emits `PYGBAG_FS=N`, where N is the complete packlist count, including `main.py`. Admission should parse and bound that integer exactly, not require the string prefix `PYGBAG_FS=1`.

## Concrete loader caveats

- The runtime remains external. Core Python 3.12 resources are under `archives/0.9/cpython312/`; the loader also needs `archives/0.9/cpythonrc.py`, while pygame/package indexes and wheels use `archives/repo/`. `--html` does not mean offline or dependency-free.
- Archive directory `0.9` is a version path, not a full immutable commit URL. The adapter's loader SRI must be checked against actual browser-fetched bytes. Runtime/package identity limitations must be recorded honestly.
- `data-os="stdout,gui"` avoids the filesystem upload UI and external terminal modules. It does not enable the optional sound facility, arbitrary packages, remote resources, service workers or nested frames. Do not promise audio or every pygame extension without separate verification.
- The archive 0.9 `onload()` condition skips stdout on ordinary mobile (`!nuadm || debug_mobile` is false), but later may call `vm.vt.xterm.write()` when `config.quiet` is false. With no terminal feature, this is a concrete source-level mobile initialization risk. The loader invokes `window.custom_onload` immediately before that check; a native-owned trusted hook setting `window.Module.config.quiet = true` is a focused possible correction, requiring live confirmation. Do not add terminal/CDN wildcard allowances to hide it.
- Clicking the outer Run button may not satisfy the runtime's inner media engagement requirement. If it asks, click/touch inside its frame. No automatic execution should occur when a Project opens.
- The loader catches top-window location access failures, so blocked access to the opaque parent's location is not itself evidence of incompatibility. No `allow-same-origin` exception is warranted.
- Sandbox origin isolation prevents access to Minamo's authenticated DOM/storage. It is not a hard process-memory or CPU quota; non-yielding package code requires an honest supported-runtime limitation. Do not claim a strict resource sandbox solely from the iframe attributes.

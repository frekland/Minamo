# Rust toolchain and a repeatable edit–test loop

## What Cargo owns

A Rust source file is compiled to a program. Cargo coordinates that compiler, project metadata, dependency resolution and test targets. It is not an interpreter and it does not execute a Note. For an experienced Java programmer, Cargo plays some of the build-tool role of Maven or Gradle, but ownership checking happens in the Rust compiler before the program starts.

Check `rustc --version` and `cargo --version` in the actual terminal where you will work. The supplied edition 2024 starter requires Rust/Cargo 1.85 or later; use current stable when possible. The [edition guide](https://doc.rust-lang.org/edition-guide/rust-2024/index.html) records this compatibility boundary. On Windows, the chosen toolchain also needs its compatible native build prerequisites. Use the official [installation instructions](https://doc.rust-lang.org/book/ch01-01-installation.html); do not assume that installing an editor extension installs a compiler. An unavailable compiler means the source remains uncompiled, even if a Python translation produces the expected number.

## One small package

For a new directory, `cargo new log-lens` creates a package with Cargo.toml and src/main.rs. From that directory, use `cargo check` for an early compile check, `cargo run` to compile and execute the binary, and `cargo test` for its test targets. `cargo check` succeeding establishes neither correct output nor complete test coverage. Keep the Cargo.toml edition declaration with the source because edition is part of the compilation context.

```text
log-lens/
  Cargo.toml
  src/main.rs
  sample.log
```

A dependency-free first program keeps the experiment about Rust rather than package selection. Later dependencies deserve deliberate version and licensing decisions. Cargo.lock records resolved dependencies for an application; keep it with an application project when reproducibility matters. The [Cargo guide](https://doc.rust-lang.org/cargo/guide/creating-a-new-project.html) is the authoritative command reference.

## Diagnose one boundary at a time

If `cargo` is not found, the shell cannot locate it: inspect that shell's PATH before editing Rust code. If compilation fails, start with the first relevant compiler diagnostic and its source location. If a program waits silently, it may be reading stdin rather than frozen; test with a small finite input fixture and an EOF. If output differs, retain the exact input, command, compiler version, stdout, stderr and exit status. These are evidence about one execution, not a general proof of correctness.

A one-line fixture containing ERROR followed by a message contributes one ERROR count. Changing only the category to WARN changes the corresponding category count while preserving the accepted-record total.
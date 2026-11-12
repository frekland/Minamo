# Testing a CLI at the function and process boundaries

## Two layers answer different questions

A unit test for `classify` checks the parsing rule without launching a process. A process-level fixture checks input plumbing, output formatting, diagnostics and exit status as well. Passing a unit test does not prove that the shell command reached the intended binary, and an attractive stdout table does not prove that malformed input was handled correctly.

```rust
#[test]
fn rejects_unknown_level() {
    assert!(classify("DEBUG detail").is_err());
}
```

This snippet belongs inside the starter's test module where `classify` is imported. It is not a standalone program. It protects one specific rejection, not the entire grammar. Run `cargo test` from the package directory. Cargo's [test guide](https://doc.rust-lang.org/book/ch11-01-writing-tests.html) explains test functions and assertions.

## Build a small independent oracle

For the five-line starter fixture, work out the expected counts by hand: ERROR twice, INFO once, WARN once and one rejected DEBUG line. This expected result is independent of running the counting code itself. If you generate expected output using the same parsing function as the program, a shared bug can agree with itself. Keep the input file, expected results and grammar together.

On a POSIX shell, redirect stdout and stderr separately, then inspect the process status immediately. On PowerShell use the corresponding redirection and `$LASTEXITCODE`. Compiler/build messages may appear on stderr when Cargo runs; `--quiet` reduces them but program diagnostics remain. State the shell rather than pasting one environment's syntax as universal.

## Failure is useful evidence

An incorrect expected count makes a meaningful comparison fail. Empty input and invalid-only input cover different boundaries: one supplies no records, while the other exercises rejection policy. A tolerant parser may report rejected records and still exit successfully; strict mode defines a separate failure contract.

Reproducibility requires bytes and environment, not just a hash in prose. Record the command, toolchain version and relevant input/source revision. A saved terminal block is reported external evidence; Minamo does not independently authenticate that the command ran. The fixture here remains uncompiled until a real Rust toolchain executes it. Do not substitute a Python oracle for Rust compilation evidence.

# Reading a text stream without hiding failures

## Three distinct outcomes

A line-oriented input loop must distinguish a valid line, end of input and an I/O error. A text record can also be invalid according to the application's grammar after it was read successfully. Do not confuse malformed log content with a failed input stream.

```rust
use std::io::{self, BufRead};
fn main() -> io::Result<()> {
    for result in io::stdin().lock().lines() {
        let line = result?;
        println!("{}", line.len());
    }
    Ok(())
}
```

This standalone example prints each line's UTF-8 byte length. The `?` propagates an I/O error; it does not silently skip an unreadable line. `lines()` removes the trailing newline and an associated carriage return for CRLF. If terminators themselves matter, choose another reading contract and test it. A zero-length string from a blank line is still a line; iterator exhaustion is end of input. The [BufRead API](https://doc.rust-lang.org/std/io/trait.BufRead.html) documents the exact behavior.

## Streaming does not mean bounded memory in every dimension

This loop does not retain the whole file, but one line may be very long. A map of unique values may also grow with input variety. State the actual bounds: approximate memory includes the current line and all retained categories, not merely a fixed input buffer. For hostile or unexpectedly large data, choose an explicit maximum record length and policy before claiming bounded memory. Do not invent such a limit from a small successful test.

A File implements Read; BufReader adds buffered-reading facilities. StdinLock already implements BufRead. Bringing the BufRead trait into scope makes its extension methods available. An error saying `lines` is unavailable may therefore be a missing trait import rather than a missing method in Rust.

## Input edge cases

Begin with a finite saved text file. On a POSIX shell use `cargo run --quiet < sample.log`. On PowerShell, `Get-Content sample.log | cargo run --quiet` supplies text through a pipeline; encoding and line-ending behavior belong to that environment and should be recorded when relevant. These two commands are useful starting routes, not a promise of byte-identical pipeline behavior for arbitrary binary input.

An empty file yields no lines, a blank line yields an empty string, and a final line without a newline still yields its text. A process waiting on interactive stdin may be waiting for more input or EOF. Standard output carries machine-readable results while standard error can carry diagnostics.
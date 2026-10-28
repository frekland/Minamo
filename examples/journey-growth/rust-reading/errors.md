# Parsing contracts, Result and an explicit rejection policy

## Decide what a record means

For a small teaching log format, define the first whitespace-separated token as the severity. Accept only INFO, WARN and ERROR; preserve case sensitivity deliberately. This is a toy grammar, not a parser for every application's logs. A message may contain spaces or Unicode without changing the severity. An empty line and DEBUG line violate this grammar.

```rust
fn classify(line: &str) -> Result<&str, &'static str> {
    let level = line.split_whitespace().next().ok_or("empty line")?;
    match level {
        "INFO" | "WARN" | "ERROR" => Ok(level),
        _ => Err("expected INFO, WARN or ERROR"),
    }
}
```

This function is a reusable snippet. It borrows the successful token from the caller's text and returns a fixed static error description on rejection. `ok_or` converts absence into an error; `?` returns early on that error. Successful classification says only that the token fits the selected grammar. It says nothing about whether the event is authentic or the application was healthy.

## Tolerant and strict are product choices

A tolerant CLI can count valid records and report rejected records separately. A strict CLI can fail on the first invalid record. Neither policy is universally correct. If counts are partial because some inputs were rejected, expose that denominator. An apparently clean count produced by silently dropping malformed records can mislead downstream analysis.

Keep I/O errors separate from parse rejections. The starter's main function propagates an I/O error and continues past a parse rejection while counting it. This starter emits its aggregate counts only after the input loop completes, so an I/O failure in that loop prevents the aggregate stdout output, although earlier rejection diagnostics may already exist. More generally, a CLI that streams stdout can leave partial output before a later failure; consumers must check the exit status too. If atomic all-or-nothing output is required, that is an additional design constraint with buffering/storage consequences.

## Test the boundary

Use independent expected examples: `WARN retry` should classify as WARN, blank text should reject and `warning retry` should reject under this exact grammar. Change only the case policy and predict which fixtures change. A new permissive policy should not be introduced accidentally through a convenient normalization call.

For this small program a static string is enough for the error, while a larger parser may need a structured error type with location and cause. Avoid putting entire sensitive log lines into diagnostics by default. The [Result chapter](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) explains matching and propagation; the program still owns its application-specific policy.

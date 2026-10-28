# Owned strings, borrowed views and lifetime boundaries

## A view is not an owned copy

Rust's String owns growable UTF-8 text. A `&str` borrows a view into text owned somewhere else. Moving an owned String transfers the value; borrowing allows temporary use without transferring ownership. A Java reference analogy can help identify aliasing, but Rust's checked borrow lifetime and mutation rules are different from garbage-collected object reachability.

```rust
fn first_word(line: &str) -> Option<&str> {
    line.split_whitespace().next()
}
fn main() {
    let line = String::from("WARN retry");
    let level = first_word(&line).unwrap();
    println!("{level}");
}
```

This complete small program is an illustrative example. The expected display is WARN. The returned slice points into `line`; its signature ties the output borrow to the input borrow through lifetime elision. It does not allocate a second owned word. The caller must keep the backing text valid for every use of the slice.

## Why streaming exposes the rule

`BufRead::lines()` yields a fresh owned String for each successful line. A classification function may borrow a level from that String while the iteration is active. Storing the borrowed level in a map that outlives the String would retain a view into dropped storage, so the compiler rejects that design. Store an owned key such as `level.to_owned()`, or translate a small known vocabulary into an enum or static category. The latter avoids repeated key allocation when the vocabulary is fixed.

This is not a reason to clone every value until compilation succeeds. Ask which value must survive the current iteration. Borrow short-lived work and own data retained beyond its source lifetime. Cloning makes a new owned value; it does not explain the boundary by itself. The [ownership chapter](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) and [borrowing chapter](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html) cover these rules in depth.

## Mutation and controlled experiments

Multiple shared references permit reading; an exclusive mutable borrow prevents overlapping incompatible access while that borrow is used. Lexical braces help communicate scope, but actual borrow validity follows uses, not a rule that every borrow lasts until the final brace.

A function cannot return a borrowed view into a String that it creates and drops locally: the returned reference would outlive its backing storage. Returning that String transfers owned storage to the caller; borrowing from a caller-owned input ties the returned view to a still-valid input lifetime.
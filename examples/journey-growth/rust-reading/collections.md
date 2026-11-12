# Counting categories with owned keys and stable output

## Separate counting from presentation

A map relates a key to its count. The key must remain valid as long as the map uses it. In a streaming parser, a borrowed slice into the current line cannot safely become long-lived state after that line is dropped. Converting a valid category to an owned String gives the map its own key; a small enum is another useful design when the allowed categories are fixed.

```rust
use std::collections::BTreeMap;
fn main() {
    let mut counts = BTreeMap::<String, usize>::new();
    for level in ["WARN", "ERROR", "WARN"] {
        *counts.entry(level.to_owned()).or_default() += 1;
    }
    for (level, count) in counts {
        println!("{level}\t{count}");
    }
}
```

This complete illustrative program predicts ERROR then WARN, with counts 1 and 2. `entry` returns access to the value for that key, inserting a default count when absent. Dereferencing the mutable count lets `+= 1` update it. The owned String keys remain valid independently of the array's borrowed views.

## Order is a contract

BTreeMap iterates keys in sorted order. That makes the teaching CLI's output straightforward to compare as a text fixture. HashMap is often appropriate for lookup, but its iteration order is not a stable sorted presentation contract; sort explicitly before display if consumers require deterministic ordering. A stable display order helps inspect differences, but it does not prove that the counting rule is correct. The [standard collections overview](https://doc.rust-lang.org/std/collections/index.html) describes these choices.

The numeric type also has a range. The starter uses usize, suitable for a small finite teaching fixture; an indefinitely running service needs an explicit overflow policy and likely a different operational model. Do not generalise one fixture to arbitrary volume. Retaining unbounded unique message strings as keys would also change the memory contract from three categories to potentially every input line.

## A useful variation

For ERROR, INFO, ERROR, the sorted output contains ERROR with count 2 followed by INFO with count 1. Reordering those inputs changes neither the counts nor BTreeMap iteration order. Replacing the map with HashMap preserves the counting mechanism but removes the sorted-output guarantee.
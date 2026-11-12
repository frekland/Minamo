use std::collections::BTreeMap;
use std::io::{self, BufRead};

fn classify(line: &str) -> Result<&str, &'static str> {
    let level = line.split_whitespace().next().ok_or("empty line")?;
    match level {
        "INFO" | "WARN" | "ERROR" => Ok(level),
        _ => Err("expected INFO, WARN or ERROR"),
    }
}

fn main() -> io::Result<()> {
    let mut counts = BTreeMap::<String, usize>::new();
    let mut rejected = 0;
    for (index, result) in io::stdin().lock().lines().enumerate() {
        let line = result?;
        match classify(&line) {
            Ok(level) => *counts.entry(level.to_owned()).or_default() += 1,
            Err(reason) => {
                rejected += 1;
                eprintln!("line {}: {reason}", index + 1);
            }
        }
    }
    for (level, count) in counts {
        println!("{level}\t{count}");
    }
    eprintln!("rejected\t{rejected}");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::classify;
    #[test]
    fn accepts_a_known_level() { assert_eq!(classify("WARN slow response"), Ok("WARN")); }
    #[test]
    fn rejects_unknown_or_empty() {
        assert!(classify("DEBUG detail").is_err());
        assert!(classify("").is_err());
    }
}

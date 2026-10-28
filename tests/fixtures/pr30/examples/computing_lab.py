"""Representative offline code, not five complete applications.

All execution is lab-runner evidence, never evidence of human learner mastery.
Run: python -m unittest discover -s examples -p 'test_*.py' -v
"""
from datetime import datetime, timezone
import json
import math
import re
import zlib


def utc_instant(raw):
    value = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    if value.tzinfo is None:
        raise ValueError("Timestamp needs an explicit offset; source timezone is unknown")
    return value.astimezone(timezone.utc)


def validate_payload(raw, checksum):
    if zlib.crc32(raw) != checksum:
        return {"accepted": False, "reason": "checksum", "raw_hex": raw.hex()}
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return {"accepted": False, "reason": "syntax", "raw_hex": raw.hex()}
    if not isinstance(data, dict):
        return {"accepted": False, "reason": "contract", "raw_hex": raw.hex()}
    value = data.get("value")
    # A boolean is not a measurement, even though bool subclasses int. Python's
    # JSON decoder also accepts NaN/Infinity; syntax is not this value contract.
    if type(value) not in (int, float) or isinstance(value, float) and not math.isfinite(value):
        return {"accepted": False, "reason": "contract", "raw_hex": raw.hex()}
    return {"accepted": True, "value": data["value"], "raw_hex": raw.hex()}


def new_game():
    return {"version": 1, "health": 10, "inventory": []}


def load_game(raw):
    data = json.loads(raw)
    if not isinstance(data, dict) or data.get("version") != 1:
        raise ValueError("Unsupported save version")
    # bool is an int subclass; health=true should still be rejected.
    if type(data.get("health")) is not int or not 0 <= data["health"] <= 10:
        raise ValueError("Save needs health from 0 to 10")
    if not isinstance(data.get("inventory"), list) or not all(isinstance(x, str) for x in data["inventory"]):
        raise ValueError("Save needs a list of inventory names")
    return {"version": 1, "health": data["health"], "inventory": list(data["inventory"])}


def normalise_reading(row):
    raw = dict(row)
    if row["unit"] == "C":
        celsius = row["value"]
    elif row["unit"] == "F":
        celsius = (row["value"] - 32) * 5 / 9
    else:
        raise ValueError("Unknown unit; do not guess")
    return {"sensor": row["sensor"], "utc": utc_instant(row["timestamp"]).isoformat(),
            "celsius": celsius, "raw": raw}


def aggregate_readings(readings):
    groups = {}
    for reading in readings:
        groups.setdefault(reading["sensor"], []).append(reading["celsius"])
    if not groups:
        return {"observation_mean": None, "sensor_mean": None, "counts": {}}
    return {"observation_mean": sum(r["celsius"] for r in readings) / len(readings),
            "sensor_mean": sum(sum(v) / len(v) for v in groups.values()) / len(groups),
            "counts": {k: len(v) for k, v in groups.items()}}


TOKEN = re.compile(r'\s*(?:("(?:[^"\\]|\\["\\])*")|(-?\d+)|([A-Za-z_][A-Za-z_0-9]*)|([{}]))')


def tokens(source):
    result = []
    pos = 0
    while pos < len(source):
        if not source[pos:].strip():
            break
        match = TOKEN.match(source, pos)
        if not match:
            raise ValueError(f"Unexpected character at {pos}")
        quoted, number, name, punctuation = match.groups()
        result.append(("string", json.loads(quoted)) if quoted is not None else
                      ("number", int(number)) if number is not None else
                      ("name", name) if name is not None else (punctuation, punctuation))
        pos = match.end()
    return result


def parse(source):
    stream = tokens(source)
    pos = 0

    def take(kind=None, value=None):
        nonlocal pos
        if pos >= len(stream):
            raise ValueError("Unexpected end of script")
        token = stream[pos]
        if kind is not None and token[0] != kind or value is not None and token[1] != value:
            raise ValueError(f"Expected {kind or value}, found {token}")
        pos += 1
        return token[1]

    def block(nested=False):
        nonlocal pos
        nodes = []
        while pos < len(stream) and stream[pos][0] != "}":
            command = take("name")
            if command == "MOVE":
                if pos >= len(stream) or stream[pos][0] not in {"name", "number"}:
                    raise ValueError("MOVE needs a number or variable")
                operand = stream[pos]
                pos += 1
                nodes.append(("move", operand))
            elif command == "SQUEAK":
                nodes.append(("squeak", take("string")))
            elif command == "LET":
                nodes.append(("let", take("name"), take("number")))
            elif command in {"REPEAT", "IF"}:
                operand = take("number") if command == "REPEAT" else take("name")
                take("{")
                nodes.append((command.lower(), operand, block(True)))
            else:
                raise ValueError(f"Unknown command {command}")
        if nested:
            take("}")
        return nodes

    ast = block()
    if pos != len(stream):
        raise ValueError("Unmatched closing brace")
    return ast


def run(ast, state=None, budget=100):
    state = {"position": 0, "variables": {}, "messages": []} if state is None else state
    remaining = budget

    def execute(nodes):
        nonlocal remaining
        for node in nodes:
            remaining -= 1
            if remaining < 0:
                raise ValueError("Execution budget exceeded")
            op = node[0]
            if op == "move":
                kind, value = node[1]
                state["position"] += value if kind == "number" else state["variables"][value]
            elif op == "squeak":
                state["messages"].append(node[1])
            elif op == "let":
                state["variables"][node[1]] = node[2]
            elif op == "if":
                if state["variables"][node[1]]:
                    execute(node[2])
            elif op == "repeat":
                if not 0 <= node[1] <= budget:
                    raise ValueError("REPEAT count outside execution budget")
                for _ in range(node[1]):
                    execute(node[2])
            else:
                raise ValueError(f"Unknown AST operation {op}")
    execute(ast)
    return state

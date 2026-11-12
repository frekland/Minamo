import json
import unittest
import zlib
from computing_lab import *


class ComputingLab(unittest.TestCase):
    def test_offsets_and_naive_rejection(self):
        earlier = "2026-03-29T02:05:00+01:00"
        later = "2026-03-29T01:55:00Z"
        self.assertLess(later, earlier)  # Wrong if mistaken for chronology.
        self.assertLess(utc_instant(earlier), utc_instant(later))
        with self.assertRaisesRegex(ValueError, "explicit offset"):
            utc_instant("2026-03-29T02:05:00")

    def test_integrity_is_not_syntax(self):
        original = b'{"value":17}'
        changed = b'{"value":18}'
        checksum = zlib.crc32(original)
        self.assertEqual(json.loads(changed)["value"], 18)
        self.assertEqual(validate_payload(changed, checksum)["reason"], "checksum")
        self.assertTrue(validate_payload(original, checksum)["accepted"])

    def test_matching_checksum_does_not_make_boolean_a_measurement(self):
        for value in (True, False):
            with self.subTest(value=value):
                raw = json.dumps({"value":value}).encode()
                result = validate_payload(raw, zlib.crc32(raw))
                self.assertFalse(result["accepted"])
                self.assertEqual(result["reason"], "contract")
        for value in (0, 17, -2.5):
            raw = json.dumps({"value":value}).encode()
            self.assertEqual(validate_payload(raw, zlib.crc32(raw))["value"], value)

    def test_nonfinite_numbers_fail_contract_after_integrity_passes(self):
        for spelling in (b'NaN', b'Infinity', b'-Infinity', b'1e999'):
            with self.subTest(spelling=spelling):
                raw = b'{"value":' + spelling + b'}'
                # Reproduce the decoder boundary independently: parsing succeeds.
                self.assertIsInstance(json.loads(raw)["value"], float)
                result = validate_payload(raw, zlib.crc32(raw))
                self.assertFalse(result["accepted"])
                self.assertEqual(result["reason"], "contract")

    def test_return_is_not_print(self):
        def display_damage():
            displayed = 3
            # A real UI could display this; it is still not a return.
        self.assertIsNone(display_damage())
        def damage():
            return 3
        self.assertEqual(10 - damage(), 7)

    def test_fresh_games_and_save_contract(self):
        first, second = new_game(), new_game()
        first["inventory"].append("ration")
        self.assertEqual(second["inventory"], [])
        self.assertEqual(load_game(json.dumps(first)), first)
        for bad in [{"version":1,"inventory":[]}, {"version":1,"health":True,"inventory":[]}]:
            with self.assertRaisesRegex(ValueError, "health"):
                load_game(json.dumps(bad))

    def test_units_provenance_and_aggregation(self):
        source = {"sensor":"a", "timestamp":"2026-03-29T01:00:00Z", "value":68, "unit":"F"}
        normal = normalise_reading(source)
        self.assertEqual(normal["celsius"], 20)
        self.assertEqual(normal["raw"]["value"], 68)
        values = [dict(normal, sensor="a", celsius=20)] * 10 + [dict(normal,sensor="b",celsius=30)]
        stats = aggregate_readings(values)
        self.assertAlmostEqual(stats["observation_mean"], 230/11)
        self.assertEqual(stats["sensor_mean"], 25)
        self.assertEqual(stats["counts"], {"a":10,"b":1})
        with self.assertRaisesRegex(ValueError,"Unknown unit"):
            normalise_reading(dict(source, unit="unknown"))

    def test_parser_does_not_execute_and_state_does_not_leak(self):
        ast = parse('LET stride 2 REPEAT 3 { MOVE stride } SQUEAK "hello brave mouse"')
        first = run(ast)
        second = run(ast)
        self.assertEqual(first["position"], 6)
        self.assertEqual(first["messages"], ["hello brave mouse"])
        first["variables"]["stride"] = 9
        self.assertEqual(second["variables"]["stride"], 2)
        self.assertEqual(ast[0], ("let","stride",2))

    def test_grammar_errors_and_execution_budget(self):
        for source in ['SQUEAK "unclosed', 'REPEAT 2 { MOVE 1', 'MOVE 1 }', 'PYTHON "print(1)"']:
            with self.assertRaises(ValueError):
                parse(source)
        with self.assertRaisesRegex(ValueError, "budget"):
            run(parse("REPEAT 50 { REPEAT 50 { MOVE 1 } }"), budget=100)
        self.assertEqual(run(parse('SQUEAK ""'))["messages"], [""])


if __name__ == "__main__":
    unittest.main()

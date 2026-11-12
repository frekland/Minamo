"""Visible deterministic chunk oracle, not a live network trace."""
import unittest
from stream_reader import read_to_eof

class FiniteStreamTests(unittest.TestCase):
    def collect(self, chunks, maximum=32):
        remaining = iter([*chunks, b""])
        def receive(size):
            self.assertEqual(size, 4)
            return next(remaining)
        return read_to_eof(receive, maximum)

    def test_empty_stream(self):
        self.assertEqual(self.collect([]), b"")

    def test_single_chunk(self):
        self.assertEqual(self.collect([b"post"]), b"post")

    def test_three_chunks(self):
        self.assertEqual(self.collect([b"post", b"card", b"!"]), b"postcard!")

    def test_utf8_split_is_still_bytes(self):
        text = "\u65e5\U0001f600".encode("utf-8")
        self.assertEqual(self.collect([text[:2], text[2:4], text[4:]]), text)

    def test_limit_applies_to_accumulated_bytes(self):
        with self.assertRaises(ValueError):
            self.collect([b"abcd", b"ef"], maximum=5)

if __name__ == "__main__":
    unittest.main()

"""Dependency-free, deliberately red baseline tests for the learning fixture."""
import unittest
from chunked_reader import collect_message


def receiver(chunks):
    stream = iter(chunks)
    def read(maximum):
        assert maximum > 0
        result = next(stream, b"")
        assert len(result) <= maximum, "fixture must honour requested chunk size"
        return result
    return read


class ChunkedReaderTests(unittest.TestCase):
    def test_one_chunk(self):
        self.assertEqual(collect_message(receiver([b"hi"])), b"hi")

    def test_empty_stream(self):
        self.assertEqual(collect_message(receiver([])), b"")

    def test_multiple_chunks(self):
        self.assertEqual(collect_message(receiver([b"A", b"BC", b"D"])), b"ABCD")

    def test_split_utf8_bytes_are_not_decoded(self):
        self.assertEqual(collect_message(receiver([b"\xe3\x81", b"\x82"])), b"\xe3\x81\x82")

    def test_maximum_size_enforced(self):
        with self.assertRaises(ValueError):
            collect_message(receiver([b"ab", b"cd"]), max_bytes=3)


if __name__ == "__main__":
    unittest.main()

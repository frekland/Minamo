"""INTENTIONALLY BUGGY learning exercise. Do not use as production networking code.

Task: collect bytes from a callable recv_chunk(size) until it returns b'' (EOF).
Return the exact bytes received, without text decoding. Enforce max_bytes.

For this exercise, EOF terminates the message. On a persistent connection, a real
application protocol needs its own explicit message framing instead.
"""

from collections.abc import Callable


def collect_message(recv_chunk: Callable[[int], bytes], max_bytes: int = 65536) -> bytes:
    """Read a finite EOF-terminated byte message using bounded receive calls."""
    # A deliberate logical bug: assumes the first receive returns the whole message.
    return recv_chunk(4)

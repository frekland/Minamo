"""Engineering reference repair; never distributed as a hidden learner solution."""
def read_to_eof(receive, maximum=32):
    pieces = []
    total = 0
    while True:
        piece = receive(4)
        if not piece:
            return b"".join(pieces)
        total += len(piece)
        if total > maximum:
            raise ValueError("finite stream exceeds byte limit")
        pieces.append(piece)

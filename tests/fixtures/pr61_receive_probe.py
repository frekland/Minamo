import socket

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as listener:
    listener.bind(("127.0.0.1", 0))
    listener.listen(1)
    with socket.create_connection(listener.getsockname()) as client:
        server, _ = listener.accept()
        with server:
            client.settimeout(0.2)
            try:
                print("quiet:", repr(client.recv(8)))
            except TimeoutError:
                print("quiet: timed out")

            server.sendall(b"x")
            print("one byte:", repr(client.recv(8)))

            server.shutdown(socket.SHUT_WR)
            print("after send-side shutdown:", repr(client.recv(8)))

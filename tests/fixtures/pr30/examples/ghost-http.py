"""Run a disposable loopback-only HTTP experiment and emit synthetic evidence."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from urllib.request import urlopen
from urllib.error import HTTPError
from pathlib import Path
import json
import socket
import zlib


original = b'{"value":17}'
corrupt = b'{"value":18}'


class FixtureHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            status, body = 200, b'{"status":"ok"}'
        elif self.path == "/telemetry/maintenance":
            status, body = 503, b'{"error":"sensor queue unavailable"}'
        elif self.path == "/telemetry/corrupt":
            status, body = 200, corrupt
        elif self.path == "/telemetry/healthy":
            status, body = 200, original
        else:
            status, body = 404, b'{}'
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_):
        pass


def run():
    server = ThreadingHTTPServer(("127.0.0.1", 0), FixtureHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    port = server.server_address[1]
    responses = []
    try:
        for path in ["/health", "/telemetry/maintenance", "/telemetry/corrupt", "/telemetry/healthy"]:
            try:
                response = urlopen(f"http://127.0.0.1:{port}{path}", timeout=2)
            except HTTPError as error:
                response = error
            with response:
                raw = response.read()
                responses.append(dict(path=path,status=response.status,body=raw.decode(),bytes=len(raw)))
        resolved = socket.gethostbyname("localhost")
        assert resolved == "127.0.0.1"
        assert [r["status"] for r in responses] == [200,503,200,200]
        assert json.loads(responses[2]["body"]) == {"value":18}
        assert zlib.crc32(corrupt) != zlib.crc32(original)
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
    return {
        "synthetic":True,
        "environment":"Executed by lab runner on loopback HTTP server; not a learner machine or real observatory",
        "archived_dns":{"fictional_archive":True,"collected":"2026-02-27T00:00:00Z","result":"NXDOMAIN for observatory.invalid", "qualification":"Unrelated fictional incident; no external DNS query performed"},
        "current_network":{"executed":True,"hostname":"localhost","resolved":resolved,"tcp_http_reachable":True},
        "http":responses,
        "times":["2026-03-29T01:55:00Z","2026-03-29T02:05:00+01:00"],
        "payloads":[{"id":"a","value":17},{"id":"missing","value":None,"reason":"not received"}],
        "integrity":{"expected_crc32":zlib.crc32(original),"original_hex":original.hex(),"changed_hex":corrupt.hex(),"changed_crc32":zlib.crc32(corrupt)},
        "arrivals":[{"sample_id":"a","arrival":1},{"sample_id":"a","arrival":2,"retry":True}],
        "controlled_replay":[{"retry":retry,"truncated":truncated,"valid_json":not truncated} for retry in [False,True] for truncated in [False,True]],
        "limits":"Controlled replay is a declared synthetic manipulation, not discovery of any remote root cause. Writer atomicity is deliberately not executed in this history."
    }


if __name__ == "__main__":
    evidence=run()
    target=Path(__file__).parents[1]/"fixtures"/"ghost_evidence.json"
    target.write_text(json.dumps(evidence,indent=2)+"\n")
    print(json.dumps({"synthetic":True,"checks":4,"output":str(target),"http_statuses":[r["status"] for r in evidence["http"]]}))

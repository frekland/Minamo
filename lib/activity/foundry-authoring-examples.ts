/** Complete inert authoring examples returned by the capability catalogue; no records or execution. */
export const foundryAuthoringExamples={
  "text/plain-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "text/plain-v1",
    "canonical": {
      "format": "text",
      "source": "TEST ONLY — original text 😀",
      "sha256": "1749df17a718d559348d6c364ada9b816b939650a129ae50f27947a25e492c02"
    },
    "provenance": {
      "classification": "illustrative",
      "execution": "not-executed"
    },
    "payload": {
      "text": "TEST ONLY — original text 😀"
    }
  },
  "run/output-bundle-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "run/output-bundle-v1",
    "canonical": {
      "format": "output-json",
      "source": "{\"contract\":\"minamo.run-outputs.v1\",\"inputDigest\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"completed\",\"outputs\":[{\"kind\":\"stdout\",\"text\":\"Supplied output, not an observed Run.\"}]}",
      "sha256": "a0c3f70834341ccdef303081ceb01bc1e368a42336629a4276e68a49ea011f72"
    },
    "provenance": {
      "classification": "supplied",
      "execution": "reported-externally",
      "description": "Supplied synthetic output manifest; no execution receipt asserted."
    },
    "payload": {
      "contract": "minamo.run-outputs.v1",
      "inputDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "status": "completed",
      "outputs": [
        {
          "kind": "stdout",
          "text": "Supplied output, not an observed Run."
        }
      ]
    }
  },
  "language/ruby-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "language/ruby-v1",
    "canonical": {
      "format": "language-json",
      "source": "{\"version\":1,\"text\":\"今日は日本語を勉強します。\",\"language\":\"ja\",\"direction\":\"ltr\",\"spans\":[{\"start\":0,\"end\":2,\"base\":\"今日\",\"reading\":\"きょう\",\"origin\":\"author-verified\",\"gloss\":\"today\",\"grammar\":\"A time expression; this reading applies to this compound.\"},{\"start\":3,\"end\":6,\"base\":\"日本語\",\"reading\":\"にほんご\",\"origin\":\"author-verified\",\"gloss\":\"Japanese language\"},{\"start\":7,\"end\":9,\"base\":\"勉強\",\"reading\":\"べんきょう\",\"origin\":\"author-verified\",\"gloss\":\"study\",\"grammar\":\"勉強する forms a verb with する.\"}]}",
      "sha256": "b5c7c75aeb4de07b1d815d57259e5047925e20774a0d357d53c94b9ffe4e575c"
    },
    "provenance": {
      "classification": "illustrative",
      "execution": "not-executed"
    },
    "payload": {
      "version": 1,
      "text": "今日は日本語を勉強します。",
      "language": "ja",
      "direction": "ltr",
      "spans": [
        {
          "start": 0,
          "end": 2,
          "base": "今日",
          "reading": "きょう",
          "origin": "author-verified",
          "gloss": "today",
          "grammar": "A time expression; this reading applies to this compound."
        },
        {
          "start": 3,
          "end": 6,
          "base": "日本語",
          "reading": "にほんご",
          "origin": "author-verified",
          "gloss": "Japanese language"
        },
        {
          "start": 7,
          "end": 9,
          "base": "勉強",
          "reading": "べんきょう",
          "origin": "author-verified",
          "gloss": "study",
          "grammar": "勉強する forms a verb with する."
        }
      ]
    }
  },
  "language/parallel-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "language/parallel-v1",
    "canonical": {
      "format": "parallel-language-json",
      "source": "{\"version\":1,\"source\":{\"version\":1,\"text\":\"今日は日本語を勉強します。\",\"language\":\"ja\",\"direction\":\"ltr\",\"spans\":[{\"start\":0,\"end\":2,\"base\":\"今日\",\"reading\":\"きょう\",\"origin\":\"author-verified\",\"gloss\":\"today\",\"grammar\":\"A time expression; this reading applies to this compound.\"},{\"start\":3,\"end\":6,\"base\":\"日本語\",\"reading\":\"にほんご\",\"origin\":\"author-verified\",\"gloss\":\"Japanese language\"},{\"start\":7,\"end\":9,\"base\":\"勉強\",\"reading\":\"べんきょう\",\"origin\":\"author-verified\",\"gloss\":\"study\",\"grammar\":\"勉強する forms a verb with する.\"}]},\"translation\":{\"text\":\"I study Japanese today.\",\"language\":\"en\",\"direction\":\"ltr\",\"provenance\":\"authored-translation\"},\"alignments\":[{\"sourceStart\":0,\"sourceEnd\":2,\"targetStart\":17,\"targetEnd\":22},{\"sourceStart\":3,\"sourceEnd\":6,\"targetStart\":8,\"targetEnd\":16}]}",
      "sha256": "c5dbb800a3fb8bf5b188537baca70f00a2cc77703aa95880b5f4d3ef1a86a827"
    },
    "provenance": {
      "classification": "illustrative",
      "execution": "not-executed"
    },
    "payload": {
      "version": 1,
      "source": {
        "version": 1,
        "text": "今日は日本語を勉強します。",
        "language": "ja",
        "direction": "ltr",
        "spans": [
          {
            "start": 0,
            "end": 2,
            "base": "今日",
            "reading": "きょう",
            "origin": "author-verified",
            "gloss": "today",
            "grammar": "A time expression; this reading applies to this compound."
          },
          {
            "start": 3,
            "end": 6,
            "base": "日本語",
            "reading": "にほんご",
            "origin": "author-verified",
            "gloss": "Japanese language"
          },
          {
            "start": 7,
            "end": 9,
            "base": "勉強",
            "reading": "べんきょう",
            "origin": "author-verified",
            "gloss": "study",
            "grammar": "勉強する forms a verb with する."
          }
        ]
      },
      "translation": {
        "text": "I study Japanese today.",
        "language": "en",
        "direction": "ltr",
        "provenance": "authored-translation"
      },
      "alignments": [
        {
          "sourceStart": 0,
          "sourceEnd": 2,
          "targetStart": 17,
          "targetEnd": 22
        },
        {
          "sourceStart": 3,
          "sourceEnd": 6,
          "targetStart": 8,
          "targetEnd": 16
        }
      ]
    }
  },
  "math/tex-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "math/tex-v1",
    "canonical": {
      "format": "tex",
      "source": "\\int_0^1 x^2\\,dx = \\frac{1}{3}",
      "sha256": "fa939605cfbdc2be8d7f986d87632624d370b1eb499cb7513c3de82e2f513a91"
    },
    "provenance": {
      "classification": "authored",
      "execution": "not-executed"
    },
    "payload": {
      "contract": "minamo.math.v1",
      "id": "integral",
      "format": "tex",
      "source": "\\int_0^1 x^2\\,dx = \\frac{1}{3}",
      "display": "block",
      "description": "Integral of x squared from zero to one equals one third. Authored statement, not a computed proof."
    }
  },
  "math/native-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "math/native-v1",
    "canonical": {
      "format": "mathml",
      "source": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\"><mfrac><mn>1</mn><mn>3</mn></mfrac></math>",
      "sha256": "bde25b5e2ba01cac1ded10573c5d9cb99ece220419d765b85e4e0e7300fb1cd3"
    },
    "provenance": {
      "classification": "authored",
      "execution": "not-executed"
    },
    "payload": {
      "tag": "mfrac",
      "children": [
        {
          "tag": "mn",
          "text": "1"
        },
        {
          "tag": "mn",
          "text": "3"
        }
      ]
    }
  },
  "scene/geometry-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "scene/geometry-v1",
    "canonical": {
      "format": "scene-json",
      "source": "{\"version\":1,\"title\":\"Synthetic bounded cube\",\"meshes\":[{\"shape\":\"box\",\"position\":[0,0,0],\"size\":[1,1,1],\"color\":\"#54aabb\"}]}",
      "sha256": "ab0b3fb11e6c59dcbf8a206cdce30b01ba6fe00c7b5bb84343e6ac25566c6f33"
    },
    "provenance": {
      "classification": "illustrative",
      "execution": "not-executed"
    },
    "payload": {
      "version": 1,
      "title": "Synthetic bounded cube",
      "meshes": [
        {
          "shape": "box",
          "position": [
            0,
            0,
            0
          ],
          "size": [
            1,
            1,
            1
          ],
          "color": "#54aabb"
        }
      ]
    }
  },
  "data/table-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "data/table-v1",
    "canonical": {
      "format": "csv",
      "source": "x,y\n0,0\n1,1\n2,4",
      "sha256": "e661a5ba250070dab6f4176af044372bd635cbc942812afe16b752334da30357"
    },
    "provenance": {
      "classification": "supplied",
      "execution": "reported-externally",
      "description": "Owner-supplied data; display does not execute the source."
    },
    "payload": {
      "format": "minamo.table.v1",
      "source": "x,y\n0,0\n1,1\n2,4",
      "columns": [
        "x",
        "y"
      ],
      "rows": [
        [
          "0",
          "0"
        ],
        [
          "1",
          "1"
        ],
        [
          "2",
          "4"
        ]
      ],
      "classification": "supplied-artifact",
      "warnings": []
    }
  },
  "data/chart-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "data/chart-v1",
    "canonical": {
      "format": "chart-json",
      "source": "{\"title\":\"Supplied square values\",\"sourceFormat\":\"csv\",\"source\":\"x,y\\n0,0\\n1,1\\n2,4\",\"xColumn\":0,\"yColumn\":1}",
      "sha256": "4bbf9a7d3870ee4f1410afd1865372e5a8ef8256aa1e215bcc9e6f4f63d82af0"
    },
    "provenance": {
      "classification": "supplied",
      "execution": "reported-externally",
      "description": "Owner-supplied data; display does not execute the source."
    },
    "payload": {
      "title": "Supplied square values",
      "sourceFormat": "csv",
      "source": "x,y\n0,0\n1,1\n2,4",
      "xColumn": 0,
      "yColumn": 1
    }
  },
  "data/notebook-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "data/notebook-v1",
    "canonical": {
      "format": "ipynb",
      "source": "{\"nbformat\":4,\"nbformat_minor\":5,\"metadata\":{},\"cells\":[{\"cell_type\":\"code\",\"metadata\":{},\"source\":[\"print(2)\"],\"execution_count\":null,\"outputs\":[]}]}",
      "sha256": "73866c72563a861af3fa185f119a0c2a0f9c92e88d8b5d51450f1387b3cac132"
    },
    "provenance": {
      "classification": "supplied",
      "execution": "reported-externally",
      "description": "Owner-supplied data; display does not execute the source."
    },
    "payload": {
      "format": "minamo.notebook.v1",
      "source": "{\"nbformat\":4,\"nbformat_minor\":5,\"metadata\":{},\"cells\":[{\"cell_type\":\"code\",\"metadata\":{},\"source\":[\"print(2)\"],\"execution_count\":null,\"outputs\":[]}]}",
      "classification": "supplied-artifact",
      "cells": [
        {
          "kind": "code",
          "source": "print(2)",
          "reportedExecutionCount": null,
          "outputs": []
        }
      ],
      "warnings": []
    }
  },
  "trace/external-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "trace/external-v1",
    "canonical": {
      "format": "trace-json",
      "source": "{\"format\":\"minamo.trace.v1\",\"classification\":\"supplied-artifact\",\"events\":[{\"sequence\":0,\"timeMs\":null,\"kind\":\"stdout\",\"text\":\"Supplied external output\"}],\"redacted\":false}",
      "sha256": "6b7751a7cccdb155be1fdc38f201ac7429b173e72ebc638339f106b17b1e80d1"
    },
    "provenance": {
      "classification": "supplied",
      "execution": "reported-externally",
      "description": "Owner-supplied data; display does not execute the source."
    },
    "payload": {
      "format": "minamo.trace.v1",
      "classification": "supplied-artifact",
      "events": [
        {
          "sequence": 0,
          "timeMs": null,
          "kind": "stdout",
          "text": "Supplied external output"
        }
      ],
      "redacted": false
    }
  },
  "audio/pcm-v1": {
    "contract": "minamo.artefact.v1",
    "kind": "audio/pcm-v1",
    "canonical": {
      "format": "pcm-json",
      "source": "{\"format\":\"minamo.audio-analysis.v1\",\"sampleRate\":8000,\"samples\":[0,0.25,0,-0.25],\"origin\":\"synthetic-fixture\"}",
      "sha256": "a74b71b312d304a9e0aac4c7d5b59aee539eb34bc0c3a5b046ebd267f87dcbe3"
    },
    "provenance": {
      "classification": "illustrative",
      "execution": "not-executed"
    },
    "payload": {
      "format": "minamo.audio-analysis.v1",
      "sampleRate": 8000,
      "samples": [
        0,
        0.25,
        0,
        -0.25
      ],
      "origin": "synthetic-fixture"
    }
  }
};


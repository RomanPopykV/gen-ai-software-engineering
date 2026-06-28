# HOWTORUN — Homework 5 Custom MCP Server

## Prerequisites

- Python 3.10 or later
- `pip` available in your Python installation

---

## 1. Install Dependencies

```powershell
cd homework-5/custom-mcp-server

# Create and activate a virtual environment (recommended)
python -m venv .venv
.\.venv\Scripts\Activate.ps1      # PowerShell
# source .venv/bin/activate        # Bash / macOS / Linux

pip install -r requirements.txt
```

`requirements.txt` includes `fastmcp>=2.0.0`, which is the only dependency.

---

## 2. Run the Server Manually

```powershell
# From inside homework-5/custom-mcp-server/ with the venv active
python server.py
```

The server starts in stdio (MCP) mode. You should see output similar to:

```
Starting MCP server 'lorem-ipsum-server' ...
```

Press **Ctrl+C** to stop.

---

## 3. Connect via MCP Configuration

The custom server is already registered in [`homework-5/mcp.json`](./mcp.json):

```json
"custom-fastmcp": {
  "command": "python",
  "args": [
    "${workspaceFolder}/homework-5/custom-mcp-server/server.py"
  ]
}
```

> **Important**: Make sure `python` on your `PATH` has `fastmcp` installed, or replace
> `"python"` with the full path to your virtual-environment interpreter, e.g.:
> `"C:\\AI\\Tests project\\gen-ai-software-engineering\\homework-5\\custom-mcp-server\\.venv\\Scripts\\python.exe"`

VS Code / Claude Code picks up `mcp.json` automatically when it is present in the workspace.
Reload the window (`Ctrl+Shift+P → Reload Window`) after editing the config.

---

## 4. Use and Test the `read` Tool

Once the server is connected, ask Claude/Copilot (in agent mode) to call the tool.

### Example prompts

```
Read 10 words from the lorem ipsum resource.
```

```
Call the read tool with word_count=50.
```

### Expected responses

```
# word_count=10
Lorem ipsum dolor sit amet consectetur adipiscing elit sed do

# word_count=30
Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud
exercitation ullamco laboris nisi
```

### Direct resource access

You can also reference the resource URI directly:

```
lorem://content/20
```

Claude will read it via the registered resource handler and return 20 words.

---

## MCP Concepts (required documentation)

| Concept      | Description                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Resource** | A URI that Claude can read from, such as a file or API. Example: `lorem://content/{word_count}`                                |
| **Tool**     | An action Claude can call to perform an operation, such as reading a file or running a command. Example: `read(word_count=30)` |

---

## 5. Verification Checklist

| Check                                                              | Result                                        |
| ------------------------------------------------------------------ | --------------------------------------------- |
| `server.py` starts without errors                                  | ✅ `python server.py` exits cleanly on Ctrl+C |
| `fastmcp` in `requirements.txt`                                    | ✅ `fastmcp>=2.0.0`                           |
| Resource `lorem://content/{word_count}` returns correct word count | ✅ Verified manually                          |
| Tool `read` returns correct word count                             | ✅ Verified via Copilot agent                 |
| `mcp.json` entry `custom-fastmcp` points to `server.py`            | ✅ Confirmed                                  |

---

## Project Structure

```
homework-5/
├── README.md
├── HOWTORUN.md                         ← this file
├── mcp.json                            ← MCP server config (all 4 servers)
├── custom-mcp-server/
│   ├── server.py                       ← FastMCP server implementation
│   ├── lorem-ipsum.md                  ← source text for resource/tool
│   └── requirements.txt                ← includes fastmcp
└── docs/
    └── screenshots/
        ├── github-mcp-result.png
        ├── filesystem-mcp-result.png
        ├── jira-or-notion-mcp-result.png
        └── custom-mcp-read-tool-result.png
```

# Homework 5 — MCP Servers

> **Student Name**: Roman Popyk

## Overview

This homework configures and demonstrates four Model Context Protocol (MCP) servers inside VS Code Copilot / Claude Code:

| #   | Server             | Purpose                                           |
| --- | ------------------ | ------------------------------------------------- |
| 1   | **GitHub MCP**     | Read repository data (PRs, commits, issues)       |
| 2   | **Filesystem MCP** | Browse and read local directory contents          |
| 3   | **Notion MCP**     | Query Notion pages and databases                  |
| 4   | **Custom FastMCP** | Return word-limited content from `lorem-ipsum.md` |

## Custom MCP Server (Task 4)

The custom server lives in [`custom-mcp-server/`](./custom-mcp-server/) and is built with **FastMCP** (Python).

### MCP Concepts

- **Resources** are URIs that Claude can read from (e.g., files, APIs).  
  URI pattern used here: `lorem://content/{word_count}`

- **Tools** are actions Claude can call to perform operations (e.g., reading a file, running a command).  
  Tool exposed here: `read(word_count=30)`

## Screenshots

See [`docs/screenshots/`](./docs/screenshots/) for evidence of successful MCP interactions.

"""
Custom MCP server built with FastMCP.

Exposes lorem-ipsum.md content through:
  - Resource URI : lorem://content/{word_count}
  - Tool         : read(word_count=30)

Resources are URIs that Claude can read from (e.g., files, APIs).
Tools are actions Claude can call to perform operations (e.g., reading a file,
running a command).
"""

from pathlib import Path

from fastmcp import FastMCP

mcp = FastMCP("lorem-ipsum-server")

LOREM_FILE = Path(__file__).parent / "lorem-ipsum.md"


def _get_words(word_count: int) -> str:
    """Read lorem-ipsum.md and return up to *word_count* words.

    If *word_count* exceeds the number of available words, all available words
    are returned together with a warning message.
    """
    text = LOREM_FILE.read_text(encoding="utf-8")
    words = text.split()
    available = len(words)
    content = " ".join(words[:min(word_count, available)])
    if word_count > available:
        warning = (
            f"[Warning: requested {word_count} words but only {available} available] "
        )
        return warning + "\n\n" + content
    return content


# ---------------------------------------------------------------------------
# Resource
# ---------------------------------------------------------------------------

@mcp.resource("lorem://content/{word_count}")
def lorem_content(word_count: int) -> str:
    """Return *word_count* words from lorem-ipsum.md.

    URI pattern: ``lorem://content/{word_count}``
    Default suggested usage: ``lorem://content/30``
    """
    return _get_words(word_count)


# ---------------------------------------------------------------------------
# Tool
# ---------------------------------------------------------------------------

@mcp.tool()
def read(word_count: int = 30) -> str:
    """Read words from lorem-ipsum.md.

    Args:
        word_count: How many words to return (default: 30).

    Returns:
        A string containing exactly *word_count* words from lorem-ipsum.md.
    """
    return _get_words(word_count)


# ---------------------------------------------------------------------------
# Entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    mcp.run()

/**
 * Custom MCP Server — pipeline-status
 *
 * Exposes two tools and one resource so AI agents (and MCP clients) can query
 * the state of the banking transaction processing pipeline without running it.
 *
 * Tools:
 *   get_transaction_status(transaction_id) — status of a single transaction
 *   list_pipeline_results()               — summary of all processed transactions
 *
 * Resources:
 *   pipeline://summary                    — latest pipeline-summary.json as text
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

// Run via `npm run mcp` from the homework-6/ directory, so cwd is the project root.
const RESULTS_DIR = path.resolve(process.cwd(), 'shared', 'results');
const SUMMARY_FILE = path.join(RESULTS_DIR, 'pipeline-summary.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function readResultsDir(): Promise<string[]> {
  try {
    const entries = await fs.readdir(RESULTS_DIR);
    return entries.filter((f) => f.endsWith('.json') && f !== 'pipeline-summary.json');
  } catch {
    return [];
  }
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: 'pipeline-status',
  version: '1.0.0',
});

// ---------------------------------------------------------------------------
// Tool: get_transaction_status
// ---------------------------------------------------------------------------

server.tool(
  'get_transaction_status',
  'Returns the current processing status of a single transaction from shared/results/',
  {
    transaction_id: z.string().describe('The transaction ID to look up (e.g. TXN001)'),
  },
  async ({ transaction_id }) => {
    const files = await readResultsDir();

    // Match files like TXN001-approved.json, TXN001-flagged.json, TXN001-rejected.json
    const match = files.find((f) =>
      f.toLowerCase().startsWith(transaction_id.toLowerCase() + '-'),
    );

    if (!match) {
      return {
        content: [
          {
            type: 'text',
            text: `Transaction "${transaction_id}" not found in shared/results/. Has the pipeline been run?`,
          },
        ],
      };
    }

    const data = await readJson<Record<string, unknown>>(path.join(RESULTS_DIR, match));
    const statusFromFile = match.replace(`${transaction_id}-`, '').replace('.json', '');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              transaction_id,
              status: statusFromFile.toUpperCase(),
              file: match,
              details: data,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Tool: list_pipeline_results
// ---------------------------------------------------------------------------

server.tool(
  'list_pipeline_results',
  'Returns a summary of all transactions processed by the pipeline',
  {},
  async () => {
    const summary = await readJson<Record<string, unknown>>(SUMMARY_FILE);

    if (summary) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    }

    // Fallback: build a summary from individual result files
    const files = await readResultsDir();
    if (files.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No pipeline results found. Run `npm run pipeline` first.',
          },
        ],
      };
    }

    const counts: Record<string, number> = {};
    for (const file of files) {
      const parts = file.replace('.json', '').split('-');
      const status = parts[parts.length - 1] ?? 'unknown';
      counts[status] = (counts[status] ?? 0) + 1;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              total: files.length,
              by_status: counts,
              files,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Resource: pipeline://summary
// ---------------------------------------------------------------------------

server.resource(
  'pipeline-summary',
  'pipeline://summary',
  async (_uri) => {
    const summary = await readJson<Record<string, unknown>>(SUMMARY_FILE);

    if (!summary) {
      return {
        contents: [
          {
            uri: 'pipeline://summary',
            mimeType: 'text/plain',
            text: 'No pipeline summary available. Run `npm run pipeline` to generate one.',
          },
        ],
      };
    }

    return {
      contents: [
        {
          uri: 'pipeline://summary',
          mimeType: 'application/json',
          text: JSON.stringify(summary, null, 2),
        },
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport();
server.connect(transport).catch((err: unknown) => {
  console.error('MCP server error:', err);
  process.exit(1);
});

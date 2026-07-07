import { promises as fs } from 'fs';
import http from 'http';
import path from 'path';
import { exec } from 'child_process';
import { PipelineMessage, PipelineSummary } from '../types';

const PORT = 3000;
const RESULTS_DIR = path.resolve(process.cwd(), 'shared', 'results');

function html(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Banking Pipeline Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    header { background: #1e293b; padding: 1.5rem 2rem; border-bottom: 1px solid #334155; }
    header h1 { font-size: 1.4rem; color: #38bdf8; }
    header p { color: #94a3b8; font-size: 0.85rem; margin-top: 0.25rem; }
    main { max-width: 960px; margin: 0 auto; padding: 2rem; }
    .btn { display: inline-block; padding: 0.6rem 1.4rem; border: none; border-radius: 6px; cursor: pointer;
           font-size: 0.95rem; font-weight: 600; text-decoration: none; }
    .btn-primary { background: #0ea5e9; color: #fff; }
    .btn-primary:hover { background: #0284c7; }
    .btn-secondary { background: #334155; color: #e2e8f0; }
    .btn-secondary:hover { background: #475569; }
    .actions { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: #1e293b; border-radius: 8px; padding: 1.25rem; border: 1px solid #334155; }
    .card .label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
    .card .value { font-size: 2rem; font-weight: 700; margin-top: 0.25rem; }
    .value.green { color: #4ade80; }
    .value.yellow { color: #facc15; }
    .value.red { color: #f87171; }
    .value.blue { color: #38bdf8; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; margin-bottom: 2rem; }
    th { background: #1e293b; padding: 0.75rem 1rem; text-align: left; color: #94a3b8;
         font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 0.7rem 1rem; border-bottom: 1px solid #1e293b; vertical-align: top; }
    tr:hover td { background: #1e293b55; }
    .badge { display: inline-block; padding: 0.15rem 0.55rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .badge-approved { background: #14532d; color: #4ade80; }
    .badge-flagged  { background: #713f12; color: #facc15; }
    .badge-rejected { background: #450a0a; color: #f87171; }
    .section-title { font-size: 1rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.75rem; }
    .currency-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 2rem; }
    .currency-card { background: #1e293b; border-radius: 6px; padding: 1rem; border: 1px solid #334155; }
    .currency-card .cur { font-size: 1.1rem; font-weight: 700; color: #38bdf8; }
    .currency-card .detail { font-size: 0.82rem; color: #94a3b8; margin-top: 0.25rem; }
    .empty { color: #64748b; font-style: italic; padding: 1rem 0; }
    .msg { background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 1rem; margin-bottom: 1.5rem; color: #94a3b8; }
    .generated { font-size: 0.78rem; color: #475569; margin-bottom: 1.5rem; }
    footer { text-align: center; padding: 1.5rem; color: #475569; font-size: 0.8rem; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <header>
    <h1>🏦 Banking Pipeline Dashboard</h1>
    <p>AI-Powered Multi-Agent Transaction Processing Pipeline</p>
  </header>
  <main>${content}</main>
  <footer>AI-Powered Banking Pipeline · homework-6</footer>
</body>
</html>`;
}

async function readSummary(): Promise<PipelineSummary | null> {
  try {
    const raw = await fs.readFile(path.join(RESULTS_DIR, 'pipeline-summary.json'), 'utf-8');
    return JSON.parse(raw) as PipelineSummary;
  } catch {
    return null;
  }
}

async function readTransactionResults(): Promise<PipelineMessage[]> {
  let files: string[];
  try {
    files = await fs.readdir(RESULTS_DIR);
  } catch {
    return [];
  }
  const txFiles = files.filter(
    (f) => f.endsWith('.json') && f !== 'pipeline-summary.json',
  );
  const messages: PipelineMessage[] = [];
  for (const file of txFiles) {
    try {
      const raw = await fs.readFile(path.join(RESULTS_DIR, file), 'utf-8');
      messages.push(JSON.parse(raw) as PipelineMessage);
    } catch {
      // skip malformed files
    }
  }
  return messages;
}

function statusBadge(status: string | undefined): string {
  if (!status) return '';
  if (status === 'APPROVED') return `<span class="badge badge-approved">APPROVED</span>`;
  if (status === 'FLAGGED_FOR_REVIEW') return `<span class="badge badge-flagged">FLAGGED</span>`;
  return `<span class="badge badge-rejected">REJECTED</span>`;
}

async function dashboardPage(): Promise<string> {
  const summary = await readSummary();
  const messages = await readTransactionResults();

  const topCards = summary
    ? `<div class="cards">
        <div class="card"><div class="label">Total</div><div class="value blue">${summary.total}</div></div>
        <div class="card"><div class="label">Approved</div><div class="value green">${summary.approved}</div></div>
        <div class="card"><div class="label">Flagged</div><div class="value yellow">${summary.flagged_for_review}</div></div>
        <div class="card"><div class="label">Rejected</div><div class="value red">${summary.rejected}</div></div>
      </div>
      <p class="generated">Last run: ${summary.generated_at}</p>`
    : `<div class="msg">No pipeline results yet. Run the pipeline to see results.</div>`;

  const currencySection = summary && Object.keys(summary.by_currency).length > 0
    ? `<p class="section-title">By Currency</p>
       <div class="currency-grid">
         ${Object.entries(summary.by_currency)
           .map(([cur, e]) => `<div class="currency-card"><div class="cur">${cur}</div><div class="detail">${e.count} transaction(s) · ${e.total_amount}</div></div>`)
           .join('')}
       </div>`
    : '';

  const rows = messages.length > 0
    ? messages.map((m) => {
        const d = m.data;
        const isRejected = m.message_type === 'rejected';
        const status = isRejected ? 'REJECTED' : d.status;
        return `<tr>
          <td>${d.transaction_id}</td>
          <td>${statusBadge(status)}</td>
          <td>${d.amount} ${d.currency}</td>
          <td>${d.transaction_type}</td>
          <td>${d.risk_score !== undefined ? d.risk_score : '—'}</td>
          <td>${d.reason ?? '—'}</td>
          <td style="font-size:0.75rem;color:#64748b">${d.timestamp}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="7" class="empty">No transactions processed yet.</td></tr>`;

  return html(`
    <div class="actions">
      <form method="POST" action="/run" style="display:inline">
        <button class="btn btn-primary" type="submit">▶ Run Pipeline</button>
      </form>
      <a class="btn btn-secondary" href="/">↻ Refresh</a>
    </div>
    ${topCards}
    ${currencySection}
    <p class="section-title">Transaction Results</p>
    <table>
      <thead><tr>
        <th>ID</th><th>Status</th><th>Amount</th><th>Type</th><th>Risk Score</th><th>Rejection Reason</th><th>Timestamp</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `);
}

function runPipeline(): Promise<string> {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32'
      ? 'npx tsx src/orchestrator.ts'
      : 'npx tsx src/orchestrator.ts';
    exec(cmd, { cwd: process.cwd() }, (err, stdout, stderr) => {
      if (err) resolve(stderr || err.message);
      else resolve(stdout);
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/run') {
    await runPipeline();
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    const page = await dashboardPage();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(page);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});

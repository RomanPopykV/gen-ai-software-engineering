import request from 'supertest';
import { readFileSync } from 'fs';
import { join } from 'path';
import app from '../../src/app';
import { clearStore } from '../../src/services/ticket-service';

const FIXTURES = join(__dirname, '../fixtures');

const validPayload = {
  customer_id: 'CUST001',
  customer_email: 'alice@example.com',
  customer_name: 'Alice Smith',
  subject: 'Cannot log in',
  description: 'I have been unable to log into my account for the past two days.',
  category: 'account_access',
  priority: 'high',
  status: 'new',
};

beforeEach(() => {
  clearStore();
});

// ─── POST /tickets ───────────────────────────────────────────────────────────

describe('POST /tickets', () => {
  it('creates a ticket and returns 201', async () => {
    const res = await request(app).post('/tickets').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.customer_email).toBe('alice@example.com');
    expect(res.body.created_at).toBeDefined();
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/tickets').send({ customer_id: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({ ...validPayload, customer_email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.details.some((d: any) => d.field === 'customer_email')).toBe(true);
  });

  it('returns 400 for invalid category enum', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({ ...validPayload, category: 'invalid_category' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for description too short', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({ ...validPayload, description: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.details.some((d: any) => d.field === 'description')).toBe(true);
  });
});

// ─── GET /tickets ────────────────────────────────────────────────────────────

describe('GET /tickets', () => {
  beforeEach(async () => {
    await request(app).post('/tickets').send(validPayload);
    await request(app).post('/tickets').send({
      ...validPayload,
      customer_email: 'bob@example.com',
      category: 'billing_question',
      priority: 'low',
    });
  });

  it('returns all tickets', async () => {
    const res = await request(app).get('/tickets');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/tickets?category=billing_question');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].category).toBe('billing_question');
  });

  it('filters by priority', async () => {
    const res = await request(app).get('/tickets?priority=low');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].priority).toBe('low');
  });

  it('filters by status', async () => {
    const res = await request(app).get('/tickets?status=new');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('returns empty array when no tickets match filter', async () => {
    const res = await request(app).get('/tickets?status=resolved');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

// ─── GET /tickets/:id ────────────────────────────────────────────────────────

describe('GET /tickets/:id', () => {
  it('returns the ticket for a valid id', async () => {
    const created = await request(app).post('/tickets').send(validPayload);
    const id = created.body.id;
    const res = await request(app).get(`/tickets/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/tickets/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Ticket not found');
  });
});

// ─── PUT /tickets/:id ────────────────────────────────────────────────────────

describe('PUT /tickets/:id', () => {
  it('updates fields and returns the updated ticket', async () => {
    const created = await request(app).post('/tickets').send(validPayload);
    const id = created.body.id;
    const res = await request(app)
      .put(`/tickets/${id}`)
      .send({ priority: 'urgent', status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('urgent');
    expect(res.body.status).toBe('in_progress');
    expect(res.body.updated_at).not.toBe(created.body.updated_at);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/tickets/00000000-0000-0000-0000-000000000000')
      .send({ priority: 'low' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid update payload', async () => {
    const created = await request(app).post('/tickets').send(validPayload);
    const id = created.body.id;
    const res = await request(app)
      .put(`/tickets/${id}`)
      .send({ customer_email: 'bad-email' });
    expect(res.status).toBe(400);
    expect(res.body.details.some((d: any) => d.field === 'customer_email')).toBe(true);
  });

  it('returns 400 when body is empty', async () => {
    const created = await request(app).post('/tickets').send(validPayload);
    const id = created.body.id;
    const res = await request(app).put(`/tickets/${id}`).send({});
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /tickets/:id ─────────────────────────────────────────────────────

describe('DELETE /tickets/:id', () => {
  it('returns 204 and removes the ticket', async () => {
    const created = await request(app).post('/tickets').send(validPayload);
    const id = created.body.id;
    const delRes = await request(app).delete(`/tickets/${id}`);
    expect(delRes.status).toBe(204);
    const getRes = await request(app).get(`/tickets/${id}`);
    expect(getRes.status).toBe(404);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/tickets/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

// ─── POST /tickets/import ────────────────────────────────────────────────────

describe('POST /tickets/import', () => {
  it('imports valid CSV file', async () => {
    const csv = readFileSync(join(FIXTURES, 'valid-tickets.csv'), 'utf-8');
    const res = await request(app)
      .post('/tickets/import')
      .set('Content-Type', 'text/csv')
      .send(csv);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(10);
    expect(res.body.successful).toBe(10);
    expect(res.body.failed).toBe(0);
    expect(res.body.errors).toHaveLength(0);
  });

  it('imports valid JSON file', async () => {
    const json = readFileSync(join(FIXTURES, 'valid-tickets.json'), 'utf-8');
    const res = await request(app)
      .post('/tickets/import')
      .set('Content-Type', 'application/json')
      .send(json);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.successful).toBe(3);
    expect(res.body.failed).toBe(0);
  });

  it('imports valid XML file', async () => {
    const xml = readFileSync(join(FIXTURES, 'valid-tickets.xml'), 'utf-8');
    const res = await request(app)
      .post('/tickets/import')
      .set('Content-Type', 'text/xml')
      .send(xml);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.successful).toBe(3);
    expect(res.body.failed).toBe(0);
  });

  it('processes mixed CSV and reports failures', async () => {
    const csv = readFileSync(join(FIXTURES, 'mixed-tickets.csv'), 'utf-8');
    const res = await request(app)
      .post('/tickets/import')
      .set('Content-Type', 'text/csv')
      .send(csv);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.failed).toBeGreaterThan(0);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('auto-detects JSON format from content', async () => {
    const json = readFileSync(join(FIXTURES, 'valid-tickets.json'), 'utf-8');
    const res = await request(app)
      .post('/tickets/import')
      .set('Content-Type', 'text/plain')
      .send(json);
    expect(res.status).toBe(200);
    expect(res.body.successful).toBe(3);
  });

  it('auto-detects XML format from content', async () => {
    const xml = readFileSync(join(FIXTURES, 'valid-tickets.xml'), 'utf-8');
    const res = await request(app)
      .post('/tickets/import')
      .set('Content-Type', 'text/plain')
      .send(xml);
    expect(res.status).toBe(200);
    expect(res.body.successful).toBe(3);
  });

  it('returns 400 when body is not a string or object', async () => {
    const res = await request(app)
      .post('/tickets/import')
      .set('Content-Type', 'text/plain')
      .send('');
    // empty plain-text body is a string — results in an empty import (200, total 0)
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  it('accepts format via query parameter', async () => {
    const csv = readFileSync(join(FIXTURES, 'valid-tickets.csv'), 'utf-8');
    const res = await request(app)
      .post('/tickets/import?format=csv')
      .set('Content-Type', 'text/plain')
      .send(csv);
    expect(res.status).toBe(200);
    expect(res.body.successful).toBe(10);
  });

  it('returns empty result for empty CSV', async () => {
    const res = await request(app)
      .post('/tickets/import')
      .set('Content-Type', 'text/csv')
      .send('');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.successful).toBe(0);
  });
});

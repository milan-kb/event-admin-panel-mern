import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
let server;
let base;
const createdIds = new Set();

before(async () => {
  await connectDB();
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  base = `http://127.0.0.1:${server.address().port}/api/events`;
});

after(async () => {
  // Only remove records created by this test run, even if an assertion fails.
  if (createdIds.size && mongoose.connection.readyState === 1) {
    await mongoose.connection.collection('events').deleteMany({ _id: { $in: [...createdIds].map(id => new mongoose.Types.ObjectId(id)) } });
  }
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
});

async function request(path = '', method = 'GET', body) {
  const response = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (method === 'POST' && data.event?._id) createdIds.add(data.event._id);
  return { status: response.status, data };
}

test('events persist through create, list, read, update, and delete', async () => {
  assert.equal((await request()).status, 200);
  const result = await request('', 'POST', {
    name: '  API verification event  ', description: 'Temporary test record', date: '2027-02-15', location: 'Test hall', totalReg: 500,
  });
  if (result.data.event?._id) createdIds.add(result.data.event._id);
  assert.equal(result.status, 201);
  const id = result.data.event._id;
  assert.equal(result.data.event.name, 'API verification event');
  assert.equal(result.data.event.totalReg, 0);
  assert.ok((await request()).data.events.some(event => event._id === id));
  assert.equal((await request(`/${id}`)).data.event.location, 'Test hall');
  const updated = await request(`/${id}`, 'PUT', {
    name: 'Updated test', description: 'Updated description', date: '2027-03-16', location: 'Second hall',
  });
  assert.equal(updated.status, 200);
  const persisted = (await request(`/${id}`)).data.event;
  assert.equal(persisted.name, 'Updated test');
  assert.equal(persisted.date.slice(0, 10), '2027-03-16');
  assert.equal(persisted.location, 'Second hall');
  assert.equal((await request(`/${id}`, 'DELETE')).status, 200);
  assert.equal((await request(`/${id}`)).status, 404);
});

test('invalid fields, calendar dates, IDs, and missing records are rejected', async () => {
  const valid = { name: 'Test', description: 'Test description', date: '2027-03-15', location: 'Hall' };
  for (const change of [{ name: '   ' }, { location: {} }, { date: '2027-02-30' }, { date: 'invalid' }, { description: '' }]) {
    assert.equal((await request('', 'POST', { ...valid, ...change })).status, 400);
  }
  assert.equal((await request('', 'POST', null)).status, 400);
  assert.equal((await request('/invalid-id')).status, 400);
  const missing = new mongoose.Types.ObjectId().toString();
  assert.equal((await request(`/${missing}`)).status, 404);
  assert.equal((await request(`/${missing}`, 'PUT', valid)).status, 404);
  assert.equal((await request(`/${missing}`, 'DELETE')).status, 404);
});

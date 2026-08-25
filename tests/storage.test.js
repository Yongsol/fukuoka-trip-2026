import test from 'node:test';
import assert from 'node:assert/strict';
import { attachmentRecord, attachmentMetadata, safeFilename, isAllowedAttachment } from '../src/storage.js';

test('safeFilename removes path and unsafe characters', () => {
  assert.equal(safeFilename('../예약 서류?.pdf'), '예약_서류_.pdf');
});

test('allowed attachment validates size and type', () => {
  assert.equal(isAllowedAttachment({ size: 10, type: 'application/pdf' }), true);
  assert.equal(isAllowedAttachment({ size: 10, type: 'text/html' }), false);
  assert.equal(isAllowedAttachment({ size: 16 * 1024 * 1024, type: 'image/png' }), false);
});

test('attachment record and public metadata are deterministic', () => {
  const file = { name:'ticket.pdf', type:'application/pdf', size:123, lastModified:42 };
  const record = attachmentRecord(file, 'id-1', '2026-08-21T00:00:00.000Z');
  assert.equal(record.id, 'id-1');
  assert.equal(record.blob, file);
  assert.deepEqual(attachmentMetadata(record), {
    id:'id-1', name:'ticket.pdf', type:'application/pdf', size:123,
    createdAt:'2026-08-21T00:00:00.000Z'
  });
  assert.equal('blob' in attachmentMetadata(record), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { safeTooltipContent } from '../src/security.js';

test('safeTooltipContent assigns remote text as textContent rather than HTML', () => {
  const created = [];
  const fakeDocument = {
    createElement(tagName) {
      const element = { tagName, textContent: '', innerHTML: 'untouched' };
      created.push(element);
      return element;
    },
  };
  const attack = '<img src=x onerror=alert(1)>';
  const content = safeTooltipContent(fakeDocument, attack);
  assert.equal(content, created[0]);
  assert.equal(content.tagName, 'span');
  assert.equal(content.textContent, attack);
  assert.equal(content.innerHTML, 'untouched');
});
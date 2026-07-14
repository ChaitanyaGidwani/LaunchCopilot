// Unit tests for the LLM output parser — the riskiest pure function in the app.
// Run with: npm test  (node --test tests/)
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseJSON } from "../lib/parse-json.mjs";

test("parses clean JSON", () => {
  assert.deepEqual(parseJSON('{"a": 1}'), { a: 1 });
});

test("parses JSON inside a ```json fence", () => {
  const out = parseJSON('Here you go:\n```json\n{"title": "HabitDeck"}\n```');
  assert.equal(out.title, "HabitDeck");
});

test("parses JSON inside a plain ``` fence", () => {
  assert.deepEqual(parseJSON('```\n{"x": true}\n```'), { x: true });
});

test("prefers the last fenced block when multiple exist", () => {
  const text = '```json\n{"draft": 1}\n```\nFinal answer:\n```json\n{"final": 2}\n```';
  assert.deepEqual(parseJSON(text), { final: 2 });
});

test("falls back to earlier block if the last one is invalid", () => {
  const text = '```json\n{"good": true}\n```\n```json\n{broken\n```';
  assert.deepEqual(parseJSON(text), { good: true });
});

test("extracts JSON surrounded by prose (no fences)", () => {
  const out = parseJSON('Sure! Here is the result: {"tweets": ["hi"]} Hope that helps.');
  assert.deepEqual(out.tweets, ["hi"]);
});

test("handles nested objects and arrays", () => {
  const out = parseJSON('{"days": [{"day": 1, "tasks": [{"text": "launch", "channel": "product_hunt"}]}]}');
  assert.equal(out.days[0].tasks[0].channel, "product_hunt");
});

test("preserves strings containing braces and quotes", () => {
  const out = parseJSON('{"post": "Use {curly} braces and \\"quotes\\" freely"}');
  assert.equal(out.post, 'Use {curly} braces and "quotes" freely');
});

test("throws a clear error when there is no JSON at all", () => {
  assert.throws(() => parseJSON("I cannot help with that."), /did not return JSON/);
});

test("throws a clear error on truncated JSON", () => {
  assert.throws(() => parseJSON('{"title": "HabitDeck", "subtitle": "Gami'), /did not return JSON|invalid JSON/);
});

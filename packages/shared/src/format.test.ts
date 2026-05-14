import test from "node:test";
import assert from "node:assert/strict";
import { formatVnd } from "./index.js";

test("formatVnd formats Vietnamese currency", () => {
  assert.equal(formatVnd(1290000), "1.290.000 ₫");
});

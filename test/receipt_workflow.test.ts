import assert from "node:assert/strict";
import { reminderDecision } from "../src/receipt_workflow.ts";

assert.equal(reminderDecision({ amount_cents: 7500, reminder_requested: true }), true);
assert.equal(reminderDecision({ amount_cents: 4900, reminder_requested: true }), false);
assert.equal(reminderDecision({ amount_cents: 7500, reminder_requested: false }), false);
console.log("receipt reminder decision: passed");

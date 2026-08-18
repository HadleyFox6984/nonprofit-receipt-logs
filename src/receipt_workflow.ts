import { infrai } from "./infrai.ts";

export function reminderDecision(receipt) {
  return receipt.amount_cents >= 5000 && receipt.reminder_requested === true;
}

export async function shipReceipt(receipt) {
  const entry = {
    id: `receipt-${receipt.receipt_id}`,
    level: "info",
    message: "donor receipt issued",
    service: "community-fund",
    receipt_id: receipt.receipt_id,
    donor_email: receipt.donor_email,
    amount_cents: receipt.amount_cents,
    reminder_requested: receipt.reminder_requested,
  };
  await infrai.logs.ingest([entry]);
  return { receipt_id: receipt.receipt_id, volunteer_reminder: reminderDecision(receipt) };
}

export async function findDonorReceipts(donorEmail) {
  return infrai.logs.search({ q: `donor_email:${donorEmail}`, service: "community-fund" });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const receipt = {
    receipt_id: "spring-2026-0042",
    donor_email: "maya@example.org",
    amount_cents: 7500,
    reminder_requested: true,
  };
  const result = await shipReceipt(receipt);
  const matches = await findDonorReceipts(receipt.donor_email);
  console.log(JSON.stringify({ result, matches }, null, 2));
}

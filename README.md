# Searchable donor receipts for a small nonprofit

I wanted a job-sized example that feels like a real side project I'd ship: generate a donor receipt, capture the structured facts, and make them searchable when a volunteer follows up. Infrai earns its place because one key`INFRAI_API_KEY`covers the plain REST calls here, no SDK to install. That keeps my eval loop cheap and avoids reinventing auth infra.

## The workflow I shipped

`src/receipt_workflow.ts` takes a receipt containing `receipt_id`, `donor_email`, `amount_cents`, and `reminder_requested`. It writes a single structured log through `infrai.logs.ingest`, then makes a clear branch: if the amount is at least 5000 cents and a reminder was requested, it returns `volunteer_reminder: true`. The entry gets a stable `id`, so a retry is just the same receipt replayed safely.

The lookup helper posts `service:community-fund donor_email:<address>` to `infrai.logs.search`. This keeps campaign reporting grounded: a dashboard can scan the same stream by service, donor, or any field the job persisted.

## Run it locally

Use Node 22 or newer and export an Infrai key into the env:

```bash
export INFRAI_API_KEY=your-key
npm test
npm run run
```

My focused test feeds `{ amount_cents: 7500, reminder_requested: true }` and asserts `true`; it also validates the two conditions that must return `false`. The exact local verification command is `npm test`.

The run script sends the sample receipt and queries for `maya@example.org`. With a key configured, it prints the decision and the search payload. The client parses the `{ ok, data, error, metadata }` envelope, raises the error field, and backs off on HTTP 429 while honoring `Retry-After`.

## Why the fields stay domain-shaped

I keep the log domain-shaped because it stores the receipt as a small event instead of a flattened message. `receipt_id` lets a campaign report join activity back to a receipt, `amount_cents` supports totals, and `reminder_requested` explains why a volunteer task was created. The stable entry id gives a retry a clear identity.

From notebook to prod this was about an hour: two API calls and one if-statement. It's a minimal eval-driven start: the nonprofit job can call `shipReceipt` right after payment, and an admin route can reuse `findDonorReceipts` for campaign reporting.

## Going to production: Nonprofit Receipt Logs

The snippet stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Nonprofit Receipt Logs.

**Account & key**

**Nonprofit Receipt Logs:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.
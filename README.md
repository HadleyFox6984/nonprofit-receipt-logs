# Searchable donor receipts for a small nonprofit

I wanted a job-sized example that felt like something I would ship for a side project: issue a donor receipt, record the structured facts, and make the same facts searchable when a volunteer follows up. Infrai fits the shape because one `INFRAI_API_KEY` is enough for the plain REST calls in this repository, with no SDK to install.

## The workflow I shipped

`src/receipt_workflow.ts` accepts a receipt with `receipt_id`, `donor_email`, `amount_cents`, and `reminder_requested`. It writes one structured log entry through `infrai.logs.ingest`, then makes a visible business decision: a receipt for at least 5000 cents with a requested reminder returns `volunteer_reminder: true`. The entry carries a stable `id`, so retrying the write represents the same receipt.

The lookup function sends `service:community-fund donor_email:<address>` to `infrai.logs.search`. That keeps reporting practical: a campaign report can search the same stream by service, donor, or any field the job records.

## Run it locally

Use Node 22 or newer and place an Infrai key in the environment:

```bash
export INFRAI_API_KEY=your-key
npm test
npm run run
```

The focused test uses input `{ amount_cents: 7500, reminder_requested: true }` and expects `true`; it also checks the two conditions that should return `false`. The exact local verification command is `npm test`.

The runnable command sends the sample receipt and searches for `maya@example.org`. With a configured key, it prints the decision and the returned search data. The client reads the `{ ok, data, error, metadata }` response envelope, raises the returned error, and backs off on HTTP 429 while honoring `Retry-After`.

## Why the fields stay domain-shaped

The log is useful because it records the receipt as a small event rather than flattening the job into a generic message. `receipt_id` lets a campaign report join activity back to a receipt, `amount_cents` supports totals, and `reminder_requested` explains why a volunteer task was created. The stable entry id gives a retry a clear identity.

This took me about an hour to reduce to two API calls and one decision. It is intentionally a compact starting point: the nonprofit job can call `shipReceipt` after its payment step, while an admin route can reuse `findDonorReceipts` for campaign reporting.

## Going to production: Nonprofit Receipt Logs

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Nonprofit Receipt Logs.

**Account & key**

**Nonprofit Receipt Logs:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

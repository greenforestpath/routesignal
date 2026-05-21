# Methodology

RouteSignal is a static evidence artifact built from public x402scan route metadata plus local derived fields.

## Source Inputs

- Public x402scan route records fetched by `scripts/extract-api-routes.mjs`.
- x402scan activity and transaction captures stored in `sources/x402scan/home.md` and `sources/x402scan/transactions.md`.
- Local recipe hypotheses in `site/public/data/cross-pollination-recipes.json`.

## Pipeline

1. `scripts/extract-api-routes.mjs` fetches public x402scan origin/resource records.
2. It normalizes route-level rows into `api-routes.json` and `api-routes.csv`.
3. `scripts/analyze-api-routes.mjs` enriches each row with stable IDs, category labels, price bands, activity buckets, metadata completeness, risk flags, and default display rank.
4. The static site reads only files from `site/public/data/`.

## What Counts As Signal

RouteSignal treats these as observable signals:

- observed transaction count when visible in x402scan activity surfaces
- observed volume and buyer count when visible
- route/payment metadata completeness
- USDC-normalized price clarity
- network, asset, pay-to, scheme, x402 version, and source link presence
- local evidence freshness labels

It does not claim that a route is high quality, safe, legally usable, or economically valuable without a separate paid-call verification harness.


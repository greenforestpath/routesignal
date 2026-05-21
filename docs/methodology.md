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
4. The analysis step also derives evidence ladder stages, provider-shape labels, market clusters, compression cards, and representative signal-map points.
5. The static site reads only files from `site/public/data/`.

## What Counts As Signal

RouteSignal treats these as observable signals:

- observed transaction count when visible in x402scan activity surfaces
- observed volume and buyer count when visible
- route/payment metadata completeness
- USDC-normalized price clarity
- network, asset, pay-to, scheme, x402 version, and source link presence
- local evidence freshness labels
- provider concentration, route-farm distortion, and long-tail provider counts
- evidence-stage rank from listed metadata through cautious probe candidate
- market clusters that group routes by activity, sensitivity, fulfillment, onchain data, route-farm inflation, and long-tail utility

It does not claim that a route is high quality, safe, legally usable, or economically valuable without a separate paid-call verification harness.

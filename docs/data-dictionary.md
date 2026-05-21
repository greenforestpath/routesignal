# Data Dictionary

The canonical route-level dataset is `site/public/data/routesdb.json`.

## Core Fields

| Field | Meaning |
| --- | --- |
| `route_id` | Stable local ID derived from x402scan origin/resource/network/route values. |
| `route` | Payable route URL or path. |
| `route_name` | Short display name derived from the route path. |
| `provider` | x402scan origin title or provider URL. |
| `provider_url` | Provider origin URL when present. |
| `cost` | Human-readable listed price. |
| `amount_usd` | Numeric USDC amount when the price is normalizable. |
| `price_band` | Bucket such as `micro_probe`, `cheap_probe`, `paid_check`, `premium_call`, or `high_value_or_dynamic`. |
| `network` | Payment network identifier. |
| `asset` | Asset contract or token identifier. |
| `pay_to` | Recipient address listed in the payment requirement. |
| `scheme` | x402 payment scheme. |
| `x402_version` | Listed x402 version. |
| `source` | x402scan server page for inspection. |

## Derived Signal Fields

| Field | Meaning |
| --- | --- |
| `activity_signal` | `observed_high_activity`, `observed_activity`, `latest_tx_seen`, or `no_observed_activity_in_local_scrape`. |
| `observed_txns_30d` | Thirty-day transaction count when present in the activity capture. |
| `observed_volume_usd_30d` | Thirty-day listed volume when present. |
| `observed_buyers_30d` | Thirty-day buyer count when present. |
| `latest_activity` | Latest activity label captured from x402scan. |
| `metadata_score` | Percent completeness across observable route/payment/source fields. |
| `metadata_complete_count` | Count of completed metadata checks. |
| `metadata_total_count` | Total metadata checks. |
| `signal_score` | Sort score based on activity, metadata completeness, price clarity, and freshness. |
| `default_sort_rank` | Provider-diversified display rank for the RoutesDB UI. |
| `evidence_stage` | Conservative evidence ladder stage: `listed`, `priced`, `metadata_complete`, `activity_observed`, or `probe_candidate`. |
| `evidence_stage_rank` | Numeric ladder rank from 1 to 5. |
| `evidence_stage_label` | Human-readable label for the evidence stage. |
| `market_signal` | Short analyst label for the strongest visible signal, such as `probe-worthy active route`, `activity observed`, or `catalog inflation`. |
| `category_id` | Local capability cluster ID. |
| `category_label` | Human-readable capability cluster. |
| `cluster_id` | Higher-level Analyzer market cluster. |
| `cluster_label` | Human-readable Analyzer cluster label. |
| `provider_shape_type` | Provider-level shape such as `active anchor`, `route farm`, `broad catalog`, `focused provider`, or `long tail`. |
| `provider_route_count` | Number of route rows listed for the provider in the current capture. |
| `provider_distinct_routes` | Distinct route URLs listed for the provider in the current capture. |
| `provider_share_pct` | Provider row share of the current route capture. |
| `risk_flags` | Observable flags such as `accept_unverified`, `identity_sensitive`, `large_route_farm`, or `non_usdc_or_unknown_price`. |
| `tags` | Searchable local tags for filtering and downstream processing. |

## Legacy/Secondary Fields

`verdict` and `recommended_next_action` exist for wizard experiments, but they are not the primary RoutesDB truth layer.

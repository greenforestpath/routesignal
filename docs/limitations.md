# Limitations

RouteSignal is intentionally conservative.

## What It Proves

- A route was publicly listed with payment metadata in the captured x402scan data.
- Some providers had visible activity signals in the local x402scan activity scrape.
- Some routes expose enough metadata to be understandable and sortable.

## What It Does Not Prove

- The endpoint successfully settles payment today.
- The endpoint returns useful data.
- The endpoint is legal or appropriate to call for a given user.
- The activity signal belongs to a specific endpoint rather than a provider-level resource group.
- The route is safe for autonomous agents to call without policy checks.

## Known Weak Spots

- Activity joins are partial and provider-level where x402scan exposes provider-level activity.
- `accept_verified=false` is common, so the route list should be treated as market intelligence, not production trust.
- Large route farms can distort route counts.
- Some descriptions are generated, thin, duplicated, or stale.
- Some prices are non-USDC token atomic units and need additional normalization.


# RouteSignal Hackathon Pitch

## Core Thesis

In the future there will be far more paid routes than an agent can reason about manually. The market will need a signal and procurement layer: what exists, what has evidence, what is cheap enough to probe, what should be warned or blocked, and what can be composed into useful workflows.

RouteSignal is the field guide for that world. It maps the current x402 route surface, compresses it into useful clusters and verdicts, and shows how weird long-tail paid capabilities can be assembled into recipe-like workflows.

## Slide Spine

1. **RouteSignal**: a field guide to the long tail of paid API routes for agents.
2. **Problem**: route explosion turns API discovery into procurement.
3. **What exists today**: 13,517 route rows, 12,857 distinct routes, 1,753 providers, 6 networks.
4. **Market shape**: long-tail utilities, onchain market data, route farms, external actions, and sensitive verification.
5. **Product state**: PAY / PROBE / WARN / BLOCK turns listings into next actions.
6. **Wedge**: composition makes paid routes interesting; routes become per-call ingredients.
7. **Demo**: RoutesDB, Analyzer, Wizard.
8. **Close**: when APIs become per-call ingredients, the product is route intelligence.

## Data Points Used

- Route rows: 13,517
- Distinct routes: 12,857
- Providers: 1,753
- Networks: 6
- Top network: Base mainnet, 12,043 route rows
- Top listed cost: 0.01 USDC, 3,448 route rows
- Verdicts: PAY 6,259; PROBE 5,749; WARN 815; BLOCK 694
- Activity caveat: 13,150 routes had no observed activity in the local scrape
- Largest clusters: long-tail utilities 5,243; onchain market data and wallets 3,696; route farms and catalog inflation 2,042

## Room Talk Track

We did not build another payment simulator. We mapped what exists, found that the route surface is already noisy, and turned the map into a procurement and composition layer. The interesting future is not "an agent can pay one endpoint." It is "an agent can buy many tiny capabilities, stop early, keep receipts, and compose workflows that were previously locked behind accounts, subscriptions, and minimum commitments."

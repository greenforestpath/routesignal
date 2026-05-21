# Route Analysis: Surprising x402 Routes

Generated from `site/public/data/api-routes.json` plus subagent review.

Important caveat: these are x402scan route metadata records. They prove public payment metadata was listed; they do not prove endpoint quality, legal right to use the data, successful payment, freshness, or output accuracy.

## Strongest Story

The route universe becomes interesting when treated as an agent-buyable decision graph, not a database table. The highest-signal areas are:

1. regulated identity and KYC-like checks
2. sanctions, criminal, and background screening
3. public-record company diligence, especially Brazil and Latin America
4. environmental, satellite, vessel, and conflict telemetry
5. travel, logistics, and shipping primitives
6. social/action APIs that need guardrails
7. agent preflight, trust, and paid-call verification layers

## Top Routes To Inspect

| Provider | Route | Cost | Why it matters | Caveat |
|---|---|---:|---|---|
| Verifik AI | `https://ai.verifik.co/api/usa/ssn` | token-denominated | Pay-per-call U.S. SSN validation is an extreme example of regulated identity data becoming agent-buyable. | Sensitive; legal/compliance validation required. |
| Verifik AI | `https://ai.verifik.co/api/fbi` | token-denominated | FBI background check route claim makes the market feel like autonomous compliance vending. | Extraordinary claim; source access unverified. |
| Verifik AI | `https://ai.verifik.co/api/interpol` | token-denominated | International wanted-list/criminal-record screening as a paid route. | Metadata does not prove Interpol data access. |
| Verifik AI | `https://ai.verifik.co/api/face-recognition/liveness` | token-denominated | Face liveness is a real primitive for agent-mediated onboarding. | Biometric consent and policy risk. |
| AurelianFlo | `https://x402.aurelianflo.com/api/workflows/compliance/edd-report` | `0.25 USDC` | Enhanced due-diligence memo for wallet sets, close to a finished workflow product. | Likely exact matching, not full AML truth. |
| AurelianFlo | `https://x402.aurelianflo.com/api/ofac-wallet-screen/:address` | `0.01 USDC` | Clean primitive: one tiny wallet sanctions check before further spend. | Exact-match screening only. |
| DataBR | `https://databr.api.br/v1/empresas/00000000000191/duediligence` | `0.075 USDC` | Multi-source company diligence: sanctions, lawsuits, procurement, environmental. | Example CNPJ path; freshness unknown. |
| DataBR | `https://databr.api.br/v1/rede/00000000000191/influencia` | `0.05 USDC` | Corporate influence graph is a strong hidden-risk demo. | Aggregation quality unknown. |
| War-Tracker | `https://war-tracker.com/api/v1/vessels/9217981/position` | `0.001 USDC` | AIS vessel position plus sanctions/watchlist context. Strong OSINT ingredient. | Example IMO hardcoded; coverage unknown. |
| Coin Railz | `https://coinrailz.com/api/satellite/fire-alerts` | token-denominated | NASA FIRMS wildfire/thermal anomaly data via x402. | Token-denominated; provider quality unknown. |
| StableTravel | `https://stabletravel.dev/api/flightaware/flights/id/track` | `0.024 USDC` | FlightAware route history as travel/operations agent ingredient. | Licensing/proxy status unclear. |
| FreightGate | `https://api.shippingrates.org/api/dd/calculate` | `0.1 USDC` | Demurrage and detention calculator, practical logistics workflow route. | Needs validation against real tariffs. |
| XActions | `https://xactions.app/api/ai/action/unfollow-everyone` | `0.1 USDC` | Memorable dangerous action route; demonstrates need for spend/action guardrails. | Platform-policy and abuse risk. |
| XActions | `https://xactions.app/api/ai/messages/send` | `0.01 USDC` | Agent-paid social DM sending is a clear autonomous outreach primitive. | Platform-policy and abuse risk. |
| 402.bot | `https://api.402.bot/v1/recipes/polymarket-activity-digest/probe` | `0.0075 USDC` | Prepared Polymarket wallet research ingredient. | Probe route; analytics surface unknown. |
| Carbon & Cashmere | `https://api.carbon-cashmere.de/v1/proven-track-record` | `0.5 USDC` | Prop-firm trading track record with trade-level data, specific and falsifiable. | Performance claims need verification. |

## Spam And Quality Warnings

- Large generic route farms, especially `gg402.vercel.app`, inflate row count with many prompt-wrapper utilities.
- Numbered NFT mint routes under `services.eruditepay.com/relic-drop/nft/...` inflate route count without adding capability diversity.
- Opaque inbox/access routes with thin descriptions are not useful without live verification.
- Duplicate proxies around the same provider should be deduplicated before serious market sizing.
- Social action routes are demo-worthy, but also the clearest argument for policy gates, spend caps, and human confirmation.

## Better UI Direction

The route UI should lead with:

1. compressed category lenses
2. top outlier routes
3. provider-shape distortion
4. composable route bundles
5. trust warnings
6. raw table only as evidence drilldown


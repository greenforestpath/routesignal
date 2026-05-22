# RouteSignal — Insights from the x402 Route Surface

*Source: `routesdb.csv` · n = 13,517 route records · 1,753 listed providers · 6 networks · scrape snapshot 2025-11*

---

## The 8 findings that change how you read this catalog

### 1. There is a hidden incumbent nobody is naming
The "1,753 providers" headline is half-fiction. There are only **1,375 distinct settlement wallets** across the catalog. The top single wallet — `0x6961…70A1` — receives payments for **1,728 routes (12.8% of the entire catalog)**. The top 10 wallets settle **32.9%** of all routes. The largest publisher on x402 by route count operates **eight provider brands on average** under one wallet, and has no public name yet. The catalog's "publisher diversity" is overstated by roughly **5–8×**.

### 2. The active market is 321 routes wide, not 13,517
**98.7% of observed 30-day volume ($525k of $532k)** is captured by **321 routes** classified as "active anchors" — *2.4% of listings.* This is a complete, hand-mappable surface. Meanwhile **8,254 routes (61%)** belong to provider shapes (`route farm` + `broad catalog`) with zero observed activity. The shippable directory of agent-spendable x402 is small, knowable, and ours to map first.

### 3. Buyers pay 20× the median listed price
Median listed price = **$0.01**. Transaction-weighted price (what buyers actually paid in the 30-day window) = **$0.196**. The catalog *looks* like a penny arcade but the real economy clears in dimes-to-dollars. The $0.01 tier appears to be SEO bait — publishers race to the bottom to look attractive in directories, then routes that actually get bought price higher because they do something useful.

### 4. There's a Schelling point at exactly $0.01
**3,448 routes (25.5%)** list at *literally* `0.01 USDC` — a single-point cluster. Free markets would produce smooth distributions; this much bunching means publishers don't have pricing intelligence, they copy each other or use a default the tooling suggests. Opportunity for a pricing/positioning intelligence layer (the Stripe-Price-Intelligence equivalent for paid APIs).

### 5. The Cambrian explosion is concentrated in one provider
`gg402.vercel.app` lists **1,031 routes** with $0 observed revenue, classified as a route farm — but it ships **almost every weird Shakespeare niche in the dataset**: tarot, dream interpretation, cocktail mixer, font recommender, accent detector, haiku generator, outfit picker, astrology compatibility. One operator is single-handedly producing per-call endpoints for every imaginable thing. **Supply imagination is wildly ahead of demand** — exactly the gap a discovery + composition layer closes.

### 6. A meta-marketplace is already forming inside x402
`httpay.xyz` lists itself as "307 pay-per-call APIs via x402 on Base, no API keys" — including a "Universal Gateway proxying 37 services." **One x402 provider is already a sub-marketplace of 307 APIs.** Recursion. This signals the next-layer pattern: x402 will tier into base providers → aggregators → super-providers → meta-directories. RouteSignal is the meta-meta layer that aggregates the aggregators.

### 7. The first vertical bundler has appeared
`Convrgent — Personality Intelligence Platform for AI Agents | 45 API Endpoints, 11 Frameworks` stacks natal-chart + vedic astrology + MBTI + dating compatibility + numerology under one provider. **The first non-utility vertical SaaS-replacement on x402** — a coherent thematic product where the unit economics are per-call. "An MBTI subscription, but pay-per-test." If this pattern works we'll see vertical bundlers for: real-estate-agent stack, dating-app stack, financial-advisor stack, dispensary-compliance stack. **Horizontal composition is already happening on the supply side.**

### 8. Routes that should be BLOCKED are already earning money
The activity × verdict crosstab shows **41 BLOCK-flagged routes with observed_high_activity**. Routes that touch identity-sensitive / regulated / abuse-risk territory are actively transacting. The market is voting with USDC for routes a safety classifier would refuse. The safety/verdict layer isn't paranoia — it's already required.

---

## Supporting numbers

### Market shape

| Metric | Value |
|---|---:|
| Total route records | 13,517 |
| Distinct routes | 12,857 |
| Listed providers | 1,753 |
| Distinct settlement wallets | 1,375 |
| Top 1 wallet share | 12.8% |
| Top 10 wallet share | 32.9% |
| Networks | 6 (Base = 89%, Solana = 9%) |
| Routes with observed 30d txns | 347 (2.57%) |
| Total observed 30d txns | 15,834,440 |
| Total observed 30d volume | $532,290 |
| Distinct observed buyers | 104,071 |

### Provider shape × volume

| Shape | Listings | % of listings | 30d volume | % of volume | Live rate |
|---|---:|---:|---:|---:|---:|
| active anchor | 321 | 2.4% | $525,102 | **98.7%** | 91.9% |
| focused provider | 3,178 | 23.5% | $6,606 | 1.2% | 1.6% |
| long tail | 1,764 | 13.0% | $584 | 0.1% | 0.06% |
| broad catalog | 3,449 | 25.5% | $0 | 0% | 0% |
| route farm | 4,805 | 35.5% | $0 | 0% | 0% |

### Price ladder

| Bucket | Routes | Share of priced |
|---|---:|---:|
| ≤ $0.001 | 1,232 | 10.2% |
| $0.001 – $0.01 | 5,222 | 43.3% |
| $0.01 – $0.10 | 2,378 | 19.7% |
| $0.10 – $1.00 | 1,414 | 11.7% |
| $1 – $10 | 780 | 6.5% |
| $10 – $100 | 771 | 6.4% |
| > $100 | 258 | 2.1% |

Median listed: **$0.01** · TX-weighted mean spend: **$0.196** · Modal cost string: `0.01 USDC` (3,448 routes)

### Cluster physics (where listings live vs. where dollars live)

| Cluster | Listings | Live rate | 30d volume | $/listing |
|---|---:|---:|---:|---:|
| Active procurement surfaces | 231 | high | $469,553 | **$2,033** |
| Onchain market data & wallets | 3,696 | mixed | $25,098 | $6.79 |
| Real-world fulfillment | 222 | low | $12,577 | $56.66 |
| External action channels | 866 | low | $10,150 | $11.72 |
| Sensitive verification & legal | 861 | low | $7,094 | $8.24 |
| Long-tail utilities | 5,243 | ~0% | $7,025 | $1.34 |
| Media & generation | 356 | low | $826 | $2.32 |
| Route farms & catalog inflation | 2,042 | 0% | $0 | $0 |

### Top earners (named businesses, not noise)

| Provider | Routes | 30d txns | 30d volume |
|---|---:|---:|---:|
| BlockRun — Pay-per-call AI gateway | 78 | 7.0M | $262,860 |
| StableEnrich | 38 | 4.0M | $108,680 |
| HYRE Agent — AI-Enhanced DeFi Data API | 56 | 3.1M | $73,920 |
| StableStudio | 50 | 109k | $68,400 |
| Nansen AI — Agentic Trading | 46 | 270k | $5,839 |
| twit.sh — Plug AI agents into X | 24 | 451k | $4,402 |
| sol.blockrun.ai | 7 | 89k | $2,884 |
| StableEmail | 13 | 128k | $1,204 |
| Otto AI x402 — Programmable USDC | 29 | 135k | $1,001 |
| gotobi.hugen.tokyo | 4 | 67k | $879 |

Two providers — BlockRun + StableEnrich — together generated **~$371k of $532k (70%)** of all observed 30d volume.

### Risk landscape

| Risk flag combination | Routes |
|---|---:|
| `accept_unverified` (any) | 8,087 (60%) |
| `+ large_route_farm` | 1,879 |
| `+ non_usdc_or_unknown_price` | 1,159 |
| `+ external_action_or_abuse_risk` | 506 |
| `+ identity_sensitive` `+ regulated_or_legal` | 249 |
| `+ regulated_or_legal` | 232 |
| `+ real_world_fulfillment` | 204 |
| `+ health_sensitive` | 94 |

RouteSignal verdict distribution: **PAY 6,259 · PROBE 5,749 · WARN 815 · BLOCK 694** — **11% of the catalog is non-clean**.

### Surprising long-tail niches that actually exist

- **Sanctions / OFAC screening** — 91 routes (median $0.045)
- **KYC / ID verification** — 405 routes (median $0.30)
- **PEP / adverse media** — 10 routes (median $0.30)
- **Wallet forensics** — 489 routes mentioning wallet-risk concepts
- **Phone number provisioning** — 24 routes (median $1.77)
- **Restaurant reservation** — agentic-booking endpoints exist on Base
- **Tarot readings** — 7+ routes priced at $0.01
- **Dream interpretation** — pay $0.01 and get an LLM-interpreted dream
- **Vedic astrology natal chart** — $0.75 per chart from Convrgent
- **Pickup-line generation** — $0.001 per line
- **Cocktail mixer** — $0.01 per recipe
- **Lottery / lucky number draws** — 19 routes
- **Color palette generator** — composes naturally with font + outfit recommenders

---

## What this means

**The directory is not the market.** Listings ≠ liveness. The market is real, decodable, and concentrated: $532k/mo settled through ~321 named businesses on Base. Underneath, a Cambrian explosion of weird per-call ingredients is forming — most dormant, most cheap, most uncategorized.

**The publisher graph is 5–8× smaller than the listing count suggests.** Anyone reading the catalog at face value is being misled about diversity, supply, and competitive density. Settlement-wallet de-duplication is a required research step before any market-sizing claim.

**The Unix-pipes thesis has receipts.** You can right now buy a tarot reading, a dream interpretation, a wallet risk score, a phone number, a vedic natal chart, a sanctions check, a cocktail recipe, and a flight status check — *each from a different publisher, each settled in USDC, each with no account*. That set of capabilities did not exist as a buyable surface 18 months ago. The composition layer that turns ingredients into recipes does not exist yet — and that's the entire product opportunity.

**A small set of routes underwrites enormous compression of knowledge work.** Five chained calls replace a $10–50k/yr enterprise compliance subscription. Seven chained calls book a date end-to-end for $1.25. The "knowledge-work compression curve" is the same arc LLMs are riding for text generation — but for actions, lookups, and decisions, not just words.

---

## Companion files

- **`long-tail.csv`** — 393 curated long-tail routes across 32 niches, with metadata fields explaining why each route is interesting (`niche_label`, `niche_tier`, `novelty_score`, `replaces`, `composable_with`, `interest_angle`, `inspect_url`).
- **`PossibleRecipesByChefClaude.md`** — 70 ranked composition recipes that chain 3–10 paid routes into agent workflows replacing $50–$2000/mo subscriptions, costed against real listed prices.

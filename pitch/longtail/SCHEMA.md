# long-tail.csv — schema & how to use it

A curated subset of `routesdb.csv` containing **393 routes across 32 niches**, each tagged with metadata explaining *why it is interesting* for the long-tail × composition thesis.

## How it was built

1. **Source:** `site/public/data/routesdb.csv` (13,517 rows).
2. **Taxonomy:** 41 long-tail niches grouped into 6 tiers (see below).
3. **Matching:** strict regex against `route_name` + `capability` fields (notes ignored to avoid false positives).
4. **Most-specific wins:** taxonomy is ordered most-specific → most-general so each route lands on the most interesting niche.
5. **Filter:** pure `route farm` providers excluded unless the niche is tier 6 (weird Shakespeare) — we *want* the weird tail even from farms.
6. **De-noise cap:** max **3 rows per (niche × provider)** to keep diversity.
7. **Sort:** novelty desc → tier asc → live-first → quality desc.

## Tier system

| Tier | Name | What it means |
|---|---|---|
| **1** | `enterprise_saas_replacement` | Things normally locked behind $10k+/yr enterprise contracts (sanctions, KYC, wallet forensics, contact enrichment). Now buyable by the call. |
| **2** | `real_world_action` | Endpoints that *do something in the world* — buy a phone number, send SMS, order food, book a reservation. Impossible without per-call payment. |
| **3** | `agent_runtime_ingredient` | The substrate primitives: LLM inference, web search, code sandbox. The building blocks every agent needs. |
| **4** | `media_generation` | Per-call image / voice / music / translation. Replaces $20–30/mo creator subs. |
| **5** | `vertical_data_unlock` | Verticals that used to require enterprise feeds (sports, weather, flights). |
| **6** | `weird_shakespeare_niche` | Tarot, dream interpretation, pickup lines, lucky numbers, palm reads. **These prove the Unix-pipes thesis** — *anything* can be a paid ingredient. |

## Columns

### Inherited from routesdb.csv (canonical identification + economics)

| Column | What it is |
|---|---|
| `route_id` | Stable RouteSignal ID |
| `route_name` | The endpoint's name (e.g. `interpret_dream`) |
| `route` | Full URL of the endpoint |
| `provider`, `provider_url` | The publisher and their site |
| `cost`, `price_usd` | Listed price (string + parsed USD) |
| `network`, `asset`, `pay_to` | Settlement chain, token, receiving wallet |
| `capability` | Free-text description of what the route does |
| `category_label`, `cluster_label` | RouteSignal's existing taxonomy |
| `provider_shape_type` | active anchor / focused / long tail / broad catalog / route farm |
| `verdict` | PAY / PROBE / WARN / BLOCK |
| `risk_flags` | semicolon-delimited risk tags |
| `observed_txns_30d`, `observed_volume_usd_30d` | 30-day demand signal |
| `quality_score` | RouteSignal listing-quality score (0–100) |
| `evidence_stage` | metadata_complete / listed / probe_candidate / activity_observed |

### NEW metadata fields (this is the long-tail-specific part)

| Column | What it is | Example |
|---|---|---|
| `niche_label` | The fine-grained niche this route belongs to | `Tarot reading` |
| `niche_tier` | 1–6 (see tier system above) | `6` |
| `niche_tier_name` | Human-readable tier | `weird_shakespeare_niche` |
| `novelty_score` | 1–10 — how surprising it is that this exists as a paid API | `10` |
| `replaces` | What SaaS / subscription / contract this route displaces | `Chainalysis / TRM / Elliptic ($25k+/yr)` |
| `composable_with` | Other niches in this dataset it naturally chains to (`;`-separated) | `Astrology / horoscope; Numerology; LLM inference` |
| `interest_angle` | One-sentence pitch-grade reason this route matters | "Pay-per-address risk scoring — replaces five-figure-minimum forensic SaaS contracts" |
| `is_live_30d` | yes / no — did it have observed txns in 30d | `no` |
| `x402scan_source_url`, `inspect_url` | Click-through to verify on x402scan | `https://www.x402scan.com/server/...` |

## Quick stats

- **393 routes** across **32 distinct niches**
- **24 routes live** in last 30d (6.1%) — *higher than 2.57% baseline because we cherry-picked the interesting niches*
- **Verdict mix:** 205 PAY · 142 PROBE · 33 WARN · 13 BLOCK
- **Most-populated niches:** Weather/climate (78), Web search (46), LLM gateway (37), TTS/STT (31), Sanctions (26)
- **Smallest-most-novel niches:** Dream interpretation (1), Cocktail recipe (1), Pickup line (1), Outfit try-on (1)

## How to use this

- **Browse by tier** to pitch different audiences:
  - tier 1 to compliance/fintech judges
  - tier 2 to real-world-action / consumer-agent judges
  - tier 6 to anyone who needs to *see* the Unix-pipes thesis viscerally
- **Filter `is_live_30d=yes`** to get only routes with observed demand
- **Use `composable_with` to build recipes** — chain 3–5 niches into a workflow story
- **`inspect_url` lets you click into x402scan** to read the actual route metadata

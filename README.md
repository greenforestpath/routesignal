# RouteSignal

**Activity and metadata intelligence for x402 paid API routes.**

> x402scan shows what is listed. RouteSignal shows what has signal.

RouteSignal compresses 13,517 public x402 route records into a three-page artifact for understanding what paid API routes exist, which providers show observable activity, how complete the route metadata is, where prices cluster, and what long-tail workflows might become possible when agents can buy API calls one at a time.

[Live demo](https://routesignal.pages.dev) · [Data dictionary](docs/data-dictionary.md) · [Methodology](docs/methodology.md) · [Limitations](docs/limitations.md)

## Why This Exists

Paid agent APIs are starting to look like a market, but a raw endpoint directory is not enough. Builders need to know:

| Question | RouteSignal surface |
| --- | --- |
| What routes are listed? | RoutesDB canonical route records. |
| Which routes have observable demand signal? | Activity buckets, transaction counts, buyer counts, and volume where visible. |
| Which listings are machine-readable enough for agents? | Metadata completeness scoring. |
| Where do prices cluster? | Analyzer price ladder and route density. |
| Which providers distort market size? | Provider shape and route-farm compression. |
| What could agents actually buy next? | Wizard spend-plan hypotheses grounded in route ingredients. |

## Product

RouteSignal has exactly three pages.

### 1. RoutesDB

The canonical evidence browser. It exposes route-level records with stable IDs, provider, cost, category, activity signal, metadata completeness, price band, risk flags, and source links.

Primary indicators are observable:

- activity signal
- metadata completeness
- price clarity
- freshness
- evidence link

### 2. Analyzer

The market-compression cockpit. It shows capability clusters, provider concentration, route-count distortion, cost distribution, network distribution, surprising route collections, and trust notes.

### 3. Wizard

The demo layer. It turns route ingredients into long-tail spend-plan hypotheses with task, budget, first-dollar call, route chain, stop rule, receipt trail, and failure modes.

## Data Files

Canonical public data lives in `site/public/data/`.

| File | Purpose |
| --- | --- |
| `routesdb.json` | Enriched canonical route database. |
| `routesdb.jsonl` | Agent-friendly line-delimited route records. |
| `routesdb.csv` | Spreadsheet-ready route database. |
| `route-insights.json` | Analyzer clusters, provider shapes, warnings, and bundles. |
| `cross-pollination-recipes.json` | Wizard hypotheses and spend plans. |
| `api-routes.json` | Raw normalized route records from x402scan. |
| `api-routes.csv` | CSV version of raw normalized route records. |

## Quick Start

```bash
git clone https://github.com/greenforestpath/routesignal.git
cd routesignal
npm install
npm run dev
```

For a plain local static preview:

```bash
npm run preview
```

Then open `http://127.0.0.1:8795`.

## Regenerate Data

Refresh the public x402scan route capture and rebuild derived RouteSignal data:

```bash
npm run refresh
```

Re-run only the local analysis step:

```bash
npm run analyze
```

## Deploy

```bash
npm run deploy
```

The Cloudflare Pages project name is `routesignal`.

## Architecture

```text
x402scan public route records
        |
        v
scripts/extract-api-routes.mjs
        |
        v
site/public/data/api-routes.{json,csv}
        |
        v
scripts/analyze-api-routes.mjs
        |
        +--> site/public/data/routesdb.{json,jsonl,csv}
        +--> site/public/data/route-insights.json
        |
        v
static RouteSignal site
```

## What It Does Not Claim

RouteSignal is honest about the evidence boundary:

- listed payable route is not endpoint-quality proof
- provider-level activity is not always endpoint-level demand
- no route is guaranteed safe, legal, useful, or currently callable
- activity and metadata are signals, not truth

See [Limitations](docs/limitations.md).

## Repository Layout

```text
site/public/             static website
site/public/data/        public derived data
scripts/                 extraction and analysis scripts
sources/x402scan/        selected source captures used for activity joins
docs/                    methodology, data dictionary, limitations
research/                selected research notes
```

## About Contributions

Please don't take this the wrong way, but I do not accept outside contributions for any of my projects. I simply don't have the mental bandwidth to review anything, and it's my name on the thing, so I'm responsible for any problems it causes; thus, the risk-reward is highly asymmetric from my perspective. I'd also have to worry about other "stakeholders," which seems unwise for tools I mostly make for myself for free. Feel free to submit issues, and even PRs if you want to illustrate a proposed fix, but know I won't merge them directly. Instead, I'll have Claude or Codex review submissions via `gh` and independently decide whether and how to address them. Bug reports in particular are welcome. Sorry if this offends, but I want to avoid wasted time and hurt feelings. I understand this isn't in sync with the prevailing open-source ethos that seeks community contributions, but it's the only way I can move at this velocity and keep my sanity.

## License

MIT


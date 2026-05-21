# Product Cleanup Notes

RouteSignal is the cleaned public artifact extracted from a larger hackathon research folder.

## Decisions

- Product name is RouteSignal.
- The public repo contains the static site, derived data, scripts, docs, and selected research notes only.
- The public repo does not contain heavyweight raw scrape files, local forks, council logs, or deployment screenshots.
- RoutesDB leads with observable signals, not subjective agent judgment.
- Analyzer compresses the market instead of rendering another raw table.
- Wizard presents route-grounded hypotheses, not claims that live paid execution was performed.

## Current Quality Bar

- README explains the product, data, methodology, limitations, and local workflow.
- `docs/data-dictionary.md` documents the canonical fields.
- `docs/methodology.md` documents the pipeline.
- `docs/limitations.md` makes the evidence boundary explicit.
- `AGENTS.md` tells future agents how to keep the repo focused.

## Remaining Improvements

- Add a screenshot or short GIF after the first stable deployment.
- Add an automated smoke test for the three static pages.
- Add route-level activity verification when endpoint-specific transaction data is available.
- Add schema validation for `routesdb.json` and `cross-pollination-recipes.json`.


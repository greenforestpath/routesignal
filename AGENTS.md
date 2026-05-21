# RouteSignal Agent Notes

This repo is the publishable hackathon artifact. Keep it clean.

## Product Shape

RouteSignal has exactly three public pages:

- `site/public/index.html`: RoutesDB, the signal-first route database.
- `site/public/analyzer.html`: market compression, clustering, and trust notes.
- `site/public/wizard.html`: route-grounded long-tail spend-plan hypotheses.

Do not add marketing sections or unrelated research dashboards unless the product shape changes deliberately.

## Data Contract

Canonical derived data lives in `site/public/data/`:

- `routesdb.json`
- `routesdb.jsonl`
- `routesdb.csv`
- `route-insights.json`
- `cross-pollination-recipes.json`
- `api-routes.json`
- `api-routes.csv`

Raw heavyweight scrape files should not be committed. Regenerate derived data with:

```bash
npm run refresh
```

## Editing Rules

- Prefer observable signals over subjective route judgment.
- RoutesDB should lead with activity, metadata completeness, price clarity, freshness, and evidence.
- Keep PAY/PROBE/WARN/BLOCK language secondary and mostly wizard-specific.
- Preserve the caveat: listed payable route is not proof of endpoint quality.
- Test desktop and mobile before publishing.

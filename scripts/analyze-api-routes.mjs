import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "site/public/data/api-routes.json");
const outputPath = path.join(root, "site/public/data/route-insights.json");
const routesDbJsonPath = path.join(root, "site/public/data/routesdb.json");
const routesDbCsvPath = path.join(root, "site/public/data/routesdb.csv");
const routesDbJsonlPath = path.join(root, "site/public/data/routesdb.jsonl");
const sourceHomeMarkdownPath = path.join(root, "sources/x402scan/home.md");
const sourceTransactionsMarkdownPath = path.join(root, "sources/x402scan/transactions.md");
const homeMarkdownPath = fs.existsSync(sourceHomeMarkdownPath)
  ? sourceHomeMarkdownPath
  : path.join(root, "scrapers/x402scan/parsed/markdown/home.md");
const homeFirecrawlPath = path.join(root, ".firecrawl/x402scan-home.json");
const transactionsMarkdownPath = fs.existsSync(sourceTransactionsMarkdownPath)
  ? sourceTransactionsMarkdownPath
  : path.join(root, "scrapers/x402scan/parsed/markdown/transactions.md");

const database = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const rows = database.apis || [];
const activityByOrigin = loadActivityByOrigin();

const lenses = [
  {
    id: "agent_runtime",
    label: "Agent runtime primitives",
    color: "#2454a6",
    terms: ["mcp", "agent", "tool", "workflow", "automation", "memory", "llm", "model", "prompt", "reasoning"],
  },
  {
    id: "search_scrape",
    label: "Search, crawl, scrape",
    color: "#147784",
    terms: ["search", "crawl", "scrape", "browser", "web", "query", "extract", "page", "site"],
  },
  {
    id: "onchain_finance",
    label: "Onchain and finance",
    color: "#167a5a",
    terms: ["blockchain", "wallet", "token", "transaction", "defi", "price", "portfolio", "yield", "trading", "crypto", "address"],
  },
  {
    id: "trust_risk",
    label: "Trust, risk, verification",
    color: "#b66a15",
    terms: ["verify", "verification", "identity", "risk", "fraud", "trust", "quality", "compliance", "audit", "safety", "moderation"],
  },
  {
    id: "media_generation",
    label: "Media generation",
    color: "#5b4aa0",
    terms: ["image", "video", "audio", "music", "voice", "caption", "thumbnail", "generate", "generation", "transcript"],
  },
  {
    id: "communication_action",
    label: "Communication and action",
    color: "#b63b42",
    terms: ["email", "sms", "phone", "call", "message", "notification", "booking", "schedule", "send"],
  },
  {
    id: "data_enrichment",
    label: "Data enrichment",
    color: "#475569",
    terms: ["data", "enrich", "analytics", "intelligence", "lookup", "score", "profile", "report", "insight"],
  },
  {
    id: "long_tail_tools",
    label: "Long-tail utility tools",
    color: "#64748b",
    terms: ["calculator", "planner", "generator", "advisor", "coach", "guide", "tracker", "detector", "converter", "optimizer"],
  },
];

const weirdTerms = [
  "anxiety",
  "dream",
  "tarot",
  "astrology",
  "relationship",
  "carbon",
  "accent",
  "alternate",
  "baby",
  "wine",
  "pet",
  "recipe",
  "fitness",
  "car_repair",
  "allergy",
  "meme",
  "music",
  "voice",
  "phone",
  "weather",
  "flight",
  "legal",
  "medical",
];

const curatedBoosts = new Map([
  ["https://ai.verifik.co/api/usa/ssn", 240],
  ["https://ai.verifik.co/api/fbi", 235],
  ["https://ai.verifik.co/api/interpol", 230],
  ["https://ai.verifik.co/api/dea", 225],
  ["https://ai.verifik.co/api/face-recognition/liveness", 220],
  ["https://ai.verifik.co/api/co/cedula/rethus", 210],
  ["https://ai.verifik.co/api/br/background-check", 205],
  ["https://ai.verifik.co/api/co/inpec", 200],
  ["https://ai.verifik.co/api/co/rama/procesos", 198],
  ["https://x402.aurelianflo.com/api/workflows/compliance/edd-report", 196],
  ["https://x402.aurelianflo.com/api/ofac-wallet-screen/:address", 194],
  ["https://databr.api.br/v1/empresas/00000000000191/duediligence", 192],
  ["https://databr.api.br/v1/rede/00000000000191/influencia", 190],
  ["https://databr.api.br/v1/ambiental/embargos", 188],
  ["https://war-tracker.com/api/v1/vessels/9217981/position", 186],
  ["https://war-tracker.com/event-type/drone-strike", 184],
  ["https://coinrailz.com/api/satellite/fire-alerts", 182],
  ["https://stabletravel.dev/api/flightaware/flights/id/track", 180],
  ["https://api.shippingrates.org/api/dd/calculate", 178],
  ["https://xactions.app/api/ai/action/unfollow-everyone", 176],
  ["https://xactions.app/api/ai/messages/send", 174],
  ["https://api.402.bot/v1/recipes/polymarket-activity-digest/probe", 172],
  ["https://api.carbon-cashmere.de/v1/proven-track-record", 170],
]);

function textFor(row) {
  return [row.route, row.provider, row.capability, row.notes].join(" ").toLowerCase();
}

function routeName(row) {
  try {
    const url = new URL(row.route);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.at(-1) || url.hostname;
  } catch {
    return row.route.split("/").filter(Boolean).at(-1) || row.route;
  }
}

function classify(row) {
  const text = textFor(row);
  const matches = lenses
    .map((lens) => ({
      ...lens,
      hits: lens.terms.filter((term) => text.includes(term)).length,
    }))
    .filter((lens) => lens.hits > 0)
    .sort((a, b) => b.hits - a.hits);
  return matches[0] || lenses.at(-1);
}

function numericCost(row) {
  const match = String(row.cost || "").match(/^([0-9.]+)\s+USDC$/);
  return match ? Number(match[1]) : null;
}

function parseCompactNumber(value) {
  const text = String(value || "").replace(/[$,\s]/g, "");
  const match = text.match(/^<?([0-9.]+)([KMB])?$/i);
  if (!match) return null;
  const number = Number(match[1]);
  const suffix = (match[2] || "").toUpperCase();
  const multiplier = suffix === "B" ? 1_000_000_000 : suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
  return number * multiplier;
}

function priceBand(row) {
  const cost = numericCost(row);
  if (cost == null) return "non_usdc_or_unknown";
  if (cost <= 0.005) return "micro_probe";
  if (cost <= 0.05) return "cheap_probe";
  if (cost <= 0.5) return "paid_check";
  if (cost <= 5) return "premium_call";
  return "high_value_or_dynamic";
}

function routeScore(row, categoryCounts, providerCounts) {
  const text = textFor(row);
  const category = classify(row);
  const cost = numericCost(row);
  const providerCount = providerCounts.get(row.provider) || 1;
  const categoryCount = categoryCounts.get(category.id) || 1;
  let score = 0;
  score += (row.observed_txns_30d || 0) > 0 ? Math.log10(row.observed_txns_30d + 1) * 240 : 0;
  score += (row.latest_tx_count_in_scrape || 0) * 18;
  score += (row.metadata_score || 0) * 2;
  score += Math.max(0, 1300 / categoryCount);
  score += Math.max(0, 220 / providerCount);
  score += weirdTerms.filter((term) => text.includes(term)).length * 8;
  score += /mcp|agent|wallet|voice|phone|legal|medical|identity|fraud|compliance|flight|booking|x\/twitter/.test(text) ? 16 : 0;
  score += cost != null && cost >= 1 ? 9 : 0;
  score += cost != null && cost <= 0.01 ? 3 : 0;
  score += (curatedBoosts.get(row.route) || 0) * 10;
  score -= row.provider === "https://gg402.vercel.app" ? 9 : 0;
  score -= /accent_detector|accessibility_audit|ad_copy/.test(row.route) ? 6 : 0;
  return score;
}

function countBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

function topEntries(map, limit = 12) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("|") : value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function writeCsv(records, filePath) {
  const columns = [
    "route_id",
    "route_name",
    "route",
    "provider",
    "cost",
    "amount_usd",
    "price_band",
    "category_id",
    "category_label",
    "verdict",
    "recommended_next_action",
    "risk_flags",
    "tags",
    "interest_score",
    "quality_score",
    "signal_score",
    "default_sort_rank",
    "metadata_score",
    "metadata_complete_count",
    "metadata_total_count",
    "activity_signal",
    "observed_txns_30d",
    "observed_volume_usd_30d",
    "observed_buyers_30d",
    "latest_activity",
    "latest_tx_count_in_scrape",
    "latest_tx_seen",
    "network",
    "asset",
    "pay_to",
    "scheme",
    "x402_version",
    "capability",
    "notes",
    "source",
    "evidence_grade",
    "origin_id",
    "resource_id",
    "provider_url",
  ];
  const lines = [columns.join(",")];
  for (const row of records) {
    lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function loadActivityByOrigin() {
  const byOrigin = new Map();
  const homeMarkdown = fs.existsSync(homeMarkdownPath)
    ? fs.readFileSync(homeMarkdownPath, "utf8")
    : fs.existsSync(homeFirecrawlPath)
      ? JSON.parse(fs.readFileSync(homeFirecrawlPath, "utf8")).markdown || ""
      : "";
  for (const line of homeMarkdown.split("\n")) {
    if (!line.includes("/server/") || !line.trim().startsWith("|")) continue;
    const cells = line.split("|").map((cell) => cell.trim());
    const serverCell = cells[1] || "";
    const id = serverCell.match(/\/server\/([0-9a-f-]{36})/)?.[1];
    if (!id) continue;
    const volume = parseCompactNumber(cells[3]);
    const txns = parseCompactNumber(cells[4]);
    const buyers = parseCompactNumber(cells[5]);
    const latest = cells[6] || "";
    byOrigin.set(id, {
      observed_txns_30d: txns || 0,
      observed_volume_usd_30d: volume || 0,
      observed_buyers_30d: buyers || 0,
      latest_activity: latest,
      activity_source: "x402scan_featured_services_30d",
    });
  }

  const txMarkdown = fs.existsSync(transactionsMarkdownPath) ? fs.readFileSync(transactionsMarkdownPath, "utf8") : "";
  for (const line of txMarkdown.split("\n")) {
    if (!line.includes("/server/") || !line.trim().startsWith("|")) continue;
    const cells = line.split("|").map((cell) => cell.trim());
    const id = (cells[1] || "").match(/\/server\/([0-9a-f-]{36})/)?.[1];
    if (!id) continue;
    const current = byOrigin.get(id) || {};
    current.latest_tx_count_in_scrape = (current.latest_tx_count_in_scrape || 0) + 1;
    current.latest_tx_seen = current.latest_tx_seen || cells[5] || "";
    current.activity_source = current.activity_source ? `${current.activity_source}+transactions_page` : "x402scan_transactions_page";
    byOrigin.set(id, current);
  }
  return byOrigin;
}

function routeId(row) {
  const stable = [row.origin_id, row.resource_id, row.network, row.route].filter(Boolean).join("|");
  return `r_${crypto.createHash("sha1").update(stable).digest("hex").slice(0, 12)}`;
}

function tagsFor(row, category) {
  const text = textFor(row);
  const tags = new Set([category.id, priceBand(row)]);
  for (const term of ["ofac", "kyc", "ssn", "wallet", "vessel", "flight", "social", "identity", "fraud", "mcp", "preflight", "background", "satellite", "carbon", "sms", "email"]) {
    if (text.includes(term)) tags.add(term);
  }
  if (row.notes?.includes("accept_verified=false")) tags.add("accept_unverified");
  if (row.network) tags.add(row.network.replace(/[^a-zA-Z0-9]+/g, "_"));
  return [...tags].slice(0, 12);
}

function riskFlagsFor(row) {
  const text = textFor(row);
  const flags = [];
  if (row.notes?.includes("accept_verified=false")) flags.push("accept_unverified");
  if (/ssn|passport|driver-license|face-recognition|liveness|identity|biometric/.test(text)) flags.push("identity_sensitive");
  if (/fbi|interpol|dea|criminal|background|sanction|ofac|wanted|inpec|judicial/.test(text)) flags.push("regulated_or_legal");
  if (/health|medical|allergy|symptom|therapy|anxiety/.test(text)) flags.push("health_sensitive");
  if (/message|dm|auto-follow|unfollow|auto-comment|bulk-execute|twitter|x\/twitter|xactions/.test(text)) flags.push("external_action_or_abuse_risk");
  if (/gift card|top-up|esim|flight|shipping|label|phone refill/.test(text)) flags.push("real_world_fulfillment");
  if (row.provider === "https://gg402.vercel.app" || row.provider === "https://services.eruditepay.com") flags.push("large_route_farm");
  if (!numericCost(row)) flags.push("non_usdc_or_unknown_price");
  return flags;
}

function verdictFor(row, flags) {
  if (flags.includes("external_action_or_abuse_risk")) return "BLOCK";
  if (flags.includes("identity_sensitive") || flags.includes("regulated_or_legal") || flags.includes("external_action_or_abuse_risk")) return "WARN";
  if (flags.includes("large_route_farm") || flags.includes("non_usdc_or_unknown_price")) return "PROBE";
  if (numericCost(row) != null && numericCost(row) <= 0.05) return "PAY";
  return "PROBE";
}

function nextActionFor(row, flags) {
  if (flags.includes("identity_sensitive") || flags.includes("regulated_or_legal")) return "Verify source, legality, and consent before any paid call.";
  if (flags.includes("external_action_or_abuse_risk")) return "Require human confirmation and platform-policy review.";
  if (flags.includes("large_route_farm")) return "Sample one route and verify output quality before treating as market signal.";
  if (flags.includes("non_usdc_or_unknown_price")) return "Normalize token/amount terms before comparing cost.";
  if (numericCost(row) != null && numericCost(row) <= 0.05) return "Good candidate for a first-dollar probe with receipt capture.";
  return "Run a small paid probe only after checking endpoint docs and expected output.";
}

function qualityScoreFor(row, flags) {
  let score = 70;
  if (row.capability && row.capability.length > 100) score += 10;
  if (row.source && row.origin_id && row.resource_id) score += 8;
  if (numericCost(row) != null) score += 5;
  if (flags.includes("accept_unverified")) score -= 12;
  if (flags.includes("large_route_farm")) score -= 15;
  if (flags.includes("non_usdc_or_unknown_price")) score -= 8;
  return Math.max(0, Math.min(100, score));
}

function metadataCompleteness(row, flags) {
  const checks = [
    Boolean(row.route),
    Boolean(row.provider),
    Boolean(row.cost && row.cost !== "unknown"),
    numericCost(row) != null,
    Boolean(row.capability && row.capability.length >= 40),
    Boolean(row.network),
    Boolean(row.asset),
    Boolean(row.pay_to),
    Boolean(row.scheme),
    Boolean(row.x402_version),
    Boolean(row.source),
    Boolean(row.origin_id),
    Boolean(row.resource_id),
    Boolean(row.provider_url),
    !flags.includes("large_route_farm"),
    !flags.includes("accept_unverified"),
  ];
  const complete = checks.filter(Boolean).length;
  return {
    metadata_complete_count: complete,
    metadata_total_count: checks.length,
    metadata_score: Math.round((complete / checks.length) * 100),
  };
}

function activitySignal(activity) {
  const txns = activity.observed_txns_30d || 0;
  const latestCount = activity.latest_tx_count_in_scrape || 0;
  if (txns >= 1000) return "observed_high_activity";
  if (txns > 0) return "observed_activity";
  if (latestCount > 0) return "latest_tx_seen";
  return "no_observed_activity_in_local_scrape";
}

function routeSignalScore(row) {
  let score = 0;
  score += (row.observed_txns_30d || 0) > 0 ? Math.log10(row.observed_txns_30d + 1) * 420 : 0;
  score += (row.latest_tx_count_in_scrape || 0) * 80;
  score += row.metadata_score || 0;
  score += numericCost(row) != null ? 35 : 0;
  score += row.latest_activity ? 25 : 0;
  score -= (row.risk_flags || []).includes("large_route_farm") ? 70 : 0;
  return Math.round(score);
}

const enriched = rows.map((row) => {
  const category = classify(row);
  const riskFlags = riskFlagsFor(row);
  const activity = activityByOrigin.get(row.origin_id) || {};
  const completeness = metadataCompleteness(row, riskFlags);
  const score = routeScore({ ...row, category_id: category.id }, new Map(), new Map());
  return {
    ...row,
    route_id: routeId(row),
    route_name: routeName(row),
    category_id: category.id,
    category_label: category.label,
    amount_usd: numericCost(row),
    price_band: priceBand(row),
    tags: tagsFor(row, category),
    risk_flags: riskFlags,
    verdict: verdictFor(row, riskFlags),
    recommended_next_action: nextActionFor(row, riskFlags),
    ...completeness,
    activity_signal: activitySignal(activity),
    observed_txns_30d: activity.observed_txns_30d || 0,
    observed_volume_usd_30d: activity.observed_volume_usd_30d || 0,
    observed_buyers_30d: activity.observed_buyers_30d || 0,
    latest_activity: activity.latest_activity || "",
    latest_tx_count_in_scrape: activity.latest_tx_count_in_scrape || 0,
    latest_tx_seen: activity.latest_tx_seen || "",
    activity_source: activity.activity_source || "",
    interest_score: Math.round(score),
    signal_score: 0,
    quality_score: qualityScoreFor(row, riskFlags),
  };
});

const providerCounts = countBy(enriched, (row) => row.provider);
const categoryCounts = countBy(enriched, (row) => row.category_id);
const networkCounts = countBy(enriched, (row) => row.network || "unknown");
const costCounts = countBy(enriched, (row) => row.cost || "unknown");

for (const row of enriched) {
  row.interest_score = Math.round(routeScore(row, categoryCounts, providerCounts));
  row.signal_score = routeSignalScore(row);
}

const categories = lenses.map((lens) => {
  const categoryRows = enriched.filter((row) => row.category_id === lens.id);
  const topProviders = topEntries(countBy(categoryRows, (row) => row.provider), 5);
  const sampleRoutes = categoryRows
    .slice()
    .sort((a, b) => routeScore(b, categoryCounts, providerCounts) - routeScore(a, categoryCounts, providerCounts))
    .slice(0, 7)
    .map((row) => ({
      route: row.route,
      provider: row.provider,
      cost: row.cost,
      capability: row.capability,
      source: row.source,
    }));
  return {
    id: lens.id,
    label: lens.label,
    color: lens.color,
    count: categoryRows.length,
    provider_count: new Set(categoryRows.map((row) => row.provider)).size,
    share: categoryRows.length / Math.max(1, enriched.length),
    top_providers: topProviders,
    sample_routes: sampleRoutes,
  };
});

const interesting_routes = enriched
  .slice()
  .sort((a, b) => routeScore(b, categoryCounts, providerCounts) - routeScore(a, categoryCounts, providerCounts))
  .slice(0, 36)
  .map((row) => ({
    route: row.route,
    route_name: row.route_name,
    provider: row.provider,
    cost: row.cost,
    category: row.category_label,
    capability: row.capability,
    why_interesting: whyInteresting(row),
    caveat: caveatFor(row),
    source: row.source,
  }));

function whyInteresting(row) {
  const text = textFor(row);
  if (/mcp|agent|workflow|tool/.test(text)) return "Directly touches agent runtime/tooling rather than generic SaaS metadata.";
  if (/voice|phone|sms|email|message/.test(text)) return "Turns a paid API call into an external-world action channel.";
  if (/wallet|transaction|blockchain|defi|token/.test(text)) return "Connects payment-enabled APIs with onchain state or finance context.";
  if (/identity|fraud|risk|verify|compliance|audit/.test(text)) return "Useful as a gate before an agent spends more money.";
  if (/image|video|music|caption|transcript/.test(text)) return "Media route that could compose with search, storage, or delivery routes.";
  if (weirdTerms.some((term) => text.includes(term))) return "Shows how far into the long tail per-call APIs can go.";
  return "Representative of a route cluster that agents could buy as a small task ingredient.";
}

function caveatFor(row) {
  const caveats = [];
  if (row.notes?.includes("accept_verified=false")) caveats.push("accept not verified");
  if (row.provider === "https://gg402.vercel.app") caveats.push("large synthetic-looking provider cluster");
  if (!row.capability || row.capability.length < 30) caveats.push("thin description");
  return caveats.length ? caveats.join("; ") : "listed route metadata only";
}

const provider_shapes = topEntries(providerCounts, 16).map((entry) => {
  const providerRows = enriched.filter((row) => row.provider === entry.name);
  return {
    provider: entry.name,
    count: entry.count,
    distinct_routes: new Set(providerRows.map((row) => row.route)).size,
    top_categories: topEntries(countBy(providerRows, (row) => row.category_label), 4),
    common_costs: topEntries(countBy(providerRows, (row) => row.cost), 4),
    sample_routes: providerRows.slice(0, 5).map((row) => ({
      route: row.route,
      cost: row.cost,
      capability: row.capability,
      source: row.source,
    })),
  };
});

const warnings = [
  {
    title: "One provider can dominate the apparent market",
    detail: "The top providers contribute hundreds to thousands of rows. Count rows, providers, and distinct route patterns separately.",
  },
  {
    title: "Listed payable route is not quality proof",
    detail: "The database proves public payment metadata. It does not prove successful delivery, refund behavior, latency, or output quality.",
  },
  {
    title: "accept_verified=false is common",
    detail: "Treat many records as marketplace intelligence until a paid-call harness verifies payment and response behavior.",
  },
  {
    title: "Long-tail routes can be synthetic",
    detail: "Large route farms are still useful as market signal, but should not be mistaken for organic demand.",
  },
  {
    title: "Capability text is uneven",
    detail: "Route descriptions vary from specific service catalogs to generic generated text, so clusters should be reviewed with examples.",
  },
];

const bundles = [
  bundle("Diligence agent", ["search_scrape", "trust_risk", "data_enrichment"], "Buy search, then verification, then only enrich the candidates that pass."),
  bundle("Wallet-triggered analyst", ["onchain_finance", "search_scrape", "trust_risk"], "Watch an onchain event, buy outside context, stop if risk is high."),
  bundle("Outbound action agent", ["search_scrape", "trust_risk", "communication_action"], "Find a lead, verify it, then pay for one bounded outreach action."),
  bundle("Evidence-to-media agent", ["search_scrape", "data_enrichment", "media_generation"], "Buy fresh facts, enrich them, then generate a grounded media asset."),
  bundle("Tool-routing agent", ["agent_runtime", "data_enrichment", "trust_risk"], "Choose tools by metadata, quality notes, and spend policy before calling."),
];

function bundle(title, categoryIds, thesis) {
  const routeSamples = categoryIds.flatMap((id) =>
    enriched
      .filter((row) => row.category_id === id)
      .sort((a, b) => routeScore(b, categoryCounts, providerCounts) - routeScore(a, categoryCounts, providerCounts))
      .slice(0, 3)
      .map((row) => ({
        route: row.route,
        provider: row.provider,
        cost: row.cost,
        category: row.category_label,
        capability: row.capability,
        source: row.source,
      }))
  );
  return { title, thesis, category_ids: categoryIds, route_samples: routeSamples };
}

function diversifyByProvider(records) {
  const remaining = [...records].sort((a, b) => b.signal_score - a.signal_score || b.interest_score - a.interest_score);
  const result = [];
  while (remaining.length) {
    const seen = new Set();
    for (let index = 0; index < remaining.length; ) {
      const row = remaining[index];
      if (seen.has(row.provider)) {
        index += 1;
        continue;
      }
      result.push(row);
      seen.add(row.provider);
      remaining.splice(index, 1);
    }
  }
  return result.map((row, index) => ({ ...row, default_sort_rank: index + 1 }));
}

const insights = {
  generated_at: new Date().toISOString(),
  summary: {
    route_rows: enriched.length,
    distinct_routes: new Set(enriched.map((row) => row.route)).size,
    providers: providerCounts.size,
    networks: networkCounts.size,
    top_networks: topEntries(networkCounts, 8),
    top_costs: topEntries(costCounts, 8),
  },
  categories,
  provider_shapes,
  interesting_routes,
  bundles,
  warnings,
};

const routesDb = {
  generated_at: insights.generated_at,
  source: "x402scan public route records plus local RouteSignal derived fields",
  summary: {
    ...insights.summary,
    verdicts: topEntries(countBy(enriched, (row) => row.verdict), 8),
    activity_signals: topEntries(countBy(enriched, (row) => row.activity_signal), 8),
    price_bands: topEntries(countBy(enriched, (row) => row.price_band), 8),
    risk_flags: topEntries(
      enriched.reduce((map, row) => {
        for (const flag of row.risk_flags || []) map.set(flag, (map.get(flag) || 0) + 1);
        return map;
      }, new Map()),
      12
    ),
  },
  schema: {
    route_id: "Stable local id derived from x402scan origin/resource/network/route.",
    verdict: "PAY, PROBE, or WARN recommendation for analyst triage, not financial/legal advice.",
    recommended_next_action: "Suggested next step before spending or composing the route.",
    risk_flags: "Heuristic flags for sensitivity, abuse risk, route farms, unverified accepts, and pricing issues.",
    interest_score: "Heuristic ranking score for outlier surfacing.",
    quality_score: "Heuristic metadata quality score, not endpoint quality proof.",
    activity_signal: "Observable activity bucket from local x402scan activity scrapes.",
    metadata_score: "Completeness score over observable route/payment/source fields.",
    signal_score: "Default sort score based on activity, metadata completeness, price clarity, and freshness.",
    default_sort_rank: "Provider-diversified display rank used by the RoutesDB UI.",
  },
  apis: diversifyByProvider(enriched),
};

fs.writeFileSync(routesDbJsonPath, JSON.stringify(routesDb));
writeCsv(routesDb.apis, routesDbCsvPath);
fs.writeFileSync(routesDbJsonlPath, `${routesDb.apis.map((row) => JSON.stringify(row)).join("\n")}\n`);
fs.writeFileSync(outputPath, JSON.stringify(insights));
console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(`Wrote ${path.relative(root, routesDbJsonPath)}`);
console.log(`${interesting_routes.length} interesting routes, ${categories.length} categories, ${provider_shapes.length} provider shapes`);

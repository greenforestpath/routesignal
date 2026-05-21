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

const evidenceStages = {
  listed: {
    rank: 1,
    label: "Listed",
    detail: "Public payable route metadata exists, but price, completeness, and activity are not enough for a probe.",
  },
  priced: {
    rank: 2,
    label: "Priced",
    detail: "The listed cost can be normalized to USDC, so routes can be compared economically.",
  },
  metadata_complete: {
    rank: 3,
    label: "Metadata complete",
    detail: "The route has enough payment, provider, and source fields to be machine-readable.",
  },
  activity_observed: {
    rank: 4,
    label: "Activity observed",
    detail: "Local x402scan activity captures show provider-level or latest-transaction activity.",
  },
  probe_candidate: {
    rank: 5,
    label: "Probe candidate",
    detail: "Activity, price clarity, and metadata are strong enough for a cautious first-dollar probe.",
  },
};

const clusterDefinitions = [
  {
    id: "active_procurement",
    label: "Active procurement surfaces",
    color: "#167a5a",
    thesis: "Routes where activity plus metadata suggest agents may already be buying useful API ingredients.",
  },
  {
    id: "route_farm_catalog",
    label: "Route farms and catalog inflation",
    color: "#64748b",
    thesis: "Large catalogs that can reveal market imagination but distort apparent market size.",
  },
  {
    id: "sensitive_verification",
    label: "Sensitive verification and legal risk",
    color: "#b66a15",
    thesis: "Identity, sanctions, legal, medical, or compliance routes that require consent and policy review.",
  },
  {
    id: "external_action",
    label: "External action channels",
    color: "#b63b42",
    thesis: "Routes that send messages, automate social platforms, or touch the outside world.",
  },
  {
    id: "onchain_finance",
    label: "Onchain market data and wallets",
    color: "#2454a6",
    thesis: "Wallet, token, DeFi, portfolio, and transaction routes where payment-native agents have natural demand.",
  },
  {
    id: "real_world_fulfillment",
    label: "Real-world fulfillment",
    color: "#147784",
    thesis: "Shipping, flights, phone numbers, refills, and other routes where an API call may trigger real-world effects.",
  },
  {
    id: "media_and_generation",
    label: "Media and generation",
    color: "#5b4aa0",
    thesis: "Per-call creation routes for images, video, audio, captions, transcripts, and creative assets.",
  },
  {
    id: "long_tail_utilities",
    label: "Long-tail utilities",
    color: "#475569",
    thesis: "Useful, weird, or niche tools that show the breadth of the per-call API market.",
  },
];

const clusterById = new Map(clusterDefinitions.map((cluster) => [cluster.id, cluster]));

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
  const raw = Array.isArray(value)
    ? value.map((item) => String(item).trim()).join("|")
    : value == null
      ? ""
      : String(value).trim();
  const text = raw.replace(/[ \t]+(\r?\n)/g, "$1");
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
    "evidence_stage",
    "evidence_stage_rank",
    "market_signal",
    "cluster_id",
    "cluster_label",
    "provider_shape_type",
    "provider_route_count",
    "provider_distinct_routes",
    "provider_share_pct",
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

function hasHardRisk(flags) {
  return flags.some((flag) =>
    ["identity_sensitive", "regulated_or_legal", "external_action_or_abuse_risk", "health_sensitive"].includes(flag)
  );
}

function evidenceStageFor(row, flags, completeness, signal) {
  const priced = numericCost(row) != null;
  const complete = (completeness.metadata_score || 0) >= 80;
  const active = signal !== "no_observed_activity_in_local_scrape";
  if (active && priced && complete && !hasHardRisk(flags)) return "probe_candidate";
  if (active) return "activity_observed";
  if (priced && complete) return "metadata_complete";
  if (priced) return "priced";
  return "listed";
}

function marketSignalFor(row) {
  const flags = row.risk_flags || [];
  if (row.evidence_stage === "probe_candidate") return "probe-worthy active route";
  if (row.activity_signal !== "no_observed_activity_in_local_scrape") return "activity observed";
  if (flags.includes("large_route_farm")) return "catalog inflation";
  if (hasHardRisk(flags)) return "policy-sensitive listing";
  if (row.evidence_stage === "metadata_complete") return "machine-readable listing";
  if (row.amount_usd == null) return "price unclear";
  return "listed route";
}

function buildProviderStats(records) {
  const map = new Map();
  for (const row of records) {
    const key = row.provider || "unknown";
    const stat = map.get(key) || {
      provider: key,
      count: 0,
      routes: new Set(),
      origins: new Set(),
      active_rows: 0,
      latest_rows: 0,
      max_txns_30d: 0,
      max_volume_usd_30d: 0,
      categories: new Map(),
      prices: new Map(),
    };
    stat.count += 1;
    if (row.route) stat.routes.add(row.route);
    if (row.origin_id) stat.origins.add(row.origin_id);
    if (row.activity_signal !== "no_observed_activity_in_local_scrape") stat.active_rows += 1;
    if ((row.latest_tx_count_in_scrape || 0) > 0) stat.latest_rows += 1;
    stat.max_txns_30d = Math.max(stat.max_txns_30d, row.observed_txns_30d || 0);
    stat.max_volume_usd_30d = Math.max(stat.max_volume_usd_30d, row.observed_volume_usd_30d || 0);
    stat.categories.set(row.category_label, (stat.categories.get(row.category_label) || 0) + 1);
    stat.prices.set(row.cost || "unknown", (stat.prices.get(row.cost || "unknown") || 0) + 1);
    map.set(key, stat);
  }
  return map;
}

function providerShapeType(stat, totalRows) {
  const share = stat.count / Math.max(1, totalRows);
  if (stat.max_txns_30d > 0 && stat.count >= 20) return "active anchor";
  if (stat.count >= 120 || share >= 0.01) return "route farm";
  if (stat.count >= 20) return "broad catalog";
  if (stat.count >= 4) return "focused provider";
  return "long tail";
}

function clusterFor(row) {
  const flags = row.risk_flags || [];
  if (flags.includes("large_route_farm")) return clusterById.get("route_farm_catalog");
  if (flags.includes("identity_sensitive") || flags.includes("regulated_or_legal") || flags.includes("health_sensitive")) {
    return clusterById.get("sensitive_verification");
  }
  if (flags.includes("external_action_or_abuse_risk")) return clusterById.get("external_action");
  if (flags.includes("real_world_fulfillment")) return clusterById.get("real_world_fulfillment");
  if (row.evidence_stage === "probe_candidate") return clusterById.get("active_procurement");
  if (row.category_id === "onchain_finance") return clusterById.get("onchain_finance");
  if (row.category_id === "communication_action") return clusterById.get("external_action");
  if (row.category_id === "media_generation") return clusterById.get("media_and_generation");
  return clusterById.get("long_tail_utilities");
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
  const signal = activitySignal(activity);
  const evidenceStage = evidenceStageFor(row, riskFlags, completeness, signal);
  const evidence = evidenceStages[evidenceStage];
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
    activity_signal: signal,
    observed_txns_30d: activity.observed_txns_30d || 0,
    observed_volume_usd_30d: activity.observed_volume_usd_30d || 0,
    observed_buyers_30d: activity.observed_buyers_30d || 0,
    latest_activity: activity.latest_activity || "",
    latest_tx_count_in_scrape: activity.latest_tx_count_in_scrape || 0,
    latest_tx_seen: activity.latest_tx_seen || "",
    activity_source: activity.activity_source || "",
    evidence_stage: evidenceStage,
    evidence_stage_rank: evidence.rank,
    evidence_stage_label: evidence.label,
    evidence_stage_detail: evidence.detail,
    interest_score: Math.round(score),
    signal_score: 0,
    quality_score: qualityScoreFor(row, riskFlags),
  };
});

const providerCounts = countBy(enriched, (row) => row.provider);
const providerStats = buildProviderStats(enriched);
const categoryCounts = countBy(enriched, (row) => row.category_id);
const networkCounts = countBy(enriched, (row) => row.network || "unknown");
const costCounts = countBy(enriched, (row) => row.cost || "unknown");

for (const row of enriched) {
  const stat = providerStats.get(row.provider || "unknown");
  const shape = providerShapeType(stat, enriched.length);
  row.provider_shape_type = shape;
  row.provider_route_count = stat.count;
  row.provider_distinct_routes = stat.routes.size;
  row.provider_origin_count = stat.origins.size;
  row.provider_share_pct = Number(((stat.count / Math.max(1, enriched.length)) * 100).toFixed(2));
  row.interest_score = Math.round(routeScore(row, categoryCounts, providerCounts));
  row.signal_score = routeSignalScore(row);
  row.market_signal = marketSignalFor(row);
  const cluster = clusterFor(row);
  row.cluster_id = cluster.id;
  row.cluster_label = cluster.label;
  row.cluster_color = cluster.color;
  row.cluster_thesis = cluster.thesis;
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
    cluster: row.cluster_label,
    evidence_stage: row.evidence_stage_label,
    market_signal: row.market_signal,
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
  const stat = providerStats.get(entry.name);
  return {
    provider: entry.name,
    count: entry.count,
    distinct_routes: new Set(providerRows.map((row) => row.route)).size,
    origin_count: stat.origins.size,
    share_pct: Number(((entry.count / Math.max(1, enriched.length)) * 100).toFixed(2)),
    shape_type: providerShapeType(stat, enriched.length),
    active_rows: stat.active_rows,
    max_txns_30d: stat.max_txns_30d,
    max_volume_usd_30d: stat.max_volume_usd_30d,
    top_categories: topEntries(countBy(providerRows, (row) => row.category_label), 4),
    common_costs: topEntries(countBy(providerRows, (row) => row.cost), 4),
    sample_routes: providerRows.slice(0, 5).map((row) => ({
      route: row.route,
      cost: row.cost,
      capability: row.capability,
      evidence_stage: row.evidence_stage_label,
      source: row.source,
    })),
  };
});

function pct(part, total, digits = 1) {
  return Number(((part / Math.max(1, total)) * 100).toFixed(digits));
}

const providerStatRows = [...providerStats.values()].map((stat) => ({
  provider: stat.provider,
  count: stat.count,
  distinct_routes: stat.routes.size,
  origin_count: stat.origins.size,
  active_rows: stat.active_rows,
  max_txns_30d: stat.max_txns_30d,
  shape_type: providerShapeType(stat, enriched.length),
}));

const top10ProviderRows = providerStatRows
  .slice()
  .sort((a, b) => b.count - a.count)
  .slice(0, 10)
  .reduce((sum, stat) => sum + stat.count, 0);
const activeProviderCount = providerStatRows.filter((stat) => stat.active_rows > 0 || stat.max_txns_30d > 0).length;
const routeFarmProviders = providerStatRows.filter((stat) => stat.shape_type === "route farm").length;
const longTailProviders = providerStatRows.filter((stat) => stat.count <= 2).length;
const activeRows = enriched.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape").length;
const probeCandidateRows = enriched.filter((row) => row.evidence_stage === "probe_candidate").length;
const routeFarmRows = enriched.filter((row) => (row.risk_flags || []).includes("large_route_farm")).length;

const compression = {
  cards: [
    {
      label: "Listed rows",
      value: enriched.length,
      note: `${providerCounts.size} providers, ${new Set(enriched.map((row) => row.route)).size} distinct route URLs`,
    },
    {
      label: "Observed activity rows",
      value: activeRows,
      note: `${activeProviderCount} providers have local activity evidence`,
    },
    {
      label: "Probe candidates",
      value: probeCandidateRows,
      note: "Activity, price clarity, and metadata without hard-risk flags",
    },
    {
      label: "Top-10 provider share",
      value: `${pct(top10ProviderRows, enriched.length)}%`,
      note: `${routeFarmProviders} providers look like route farms or broad catalogs`,
    },
    {
      label: "Long-tail providers",
      value: longTailProviders,
      note: "Providers with one or two listed route rows",
    },
  ],
  truths: [
    "Route count is not market size: a small number of catalogs can create thousands of rows.",
    "Activity is sparse but meaningful: observed transactions point to where the market is actually moving.",
    "Metadata completeness is strong enough for routing, but endpoint quality still needs paid-call verification.",
    "The safest demo story is evidence-gated probing, not blind autonomous spending.",
  ],
};

const evidence_ladder = Object.entries(evidenceStages)
  .sort((a, b) => a[1].rank - b[1].rank)
  .map(([id, stage]) => ({
    id,
    rank: stage.rank,
    label: stage.label,
    detail: stage.detail,
    count: enriched.filter((row) => row.evidence_stage === id).length,
    share: pct(enriched.filter((row) => row.evidence_stage === id).length, enriched.length),
    sample_routes: enriched
      .filter((row) => row.evidence_stage === id)
      .slice()
      .sort((a, b) => b.signal_score - a.signal_score || b.interest_score - a.interest_score)
      .slice(0, 3)
      .map((row) => ({
        route: row.route,
        route_name: row.route_name,
        provider: row.provider,
        cost: row.cost,
        source: row.source,
      })),
  }));

const clusters = clusterDefinitions
  .map((definition) => {
    const clusterRows = enriched.filter((row) => row.cluster_id === definition.id);
    const active = clusterRows.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape").length;
    const probe = clusterRows.filter((row) => row.evidence_stage === "probe_candidate").length;
    return {
      ...definition,
      count: clusterRows.length,
      share: pct(clusterRows.length, enriched.length),
      provider_count: new Set(clusterRows.map((row) => row.provider)).size,
      active_rows: active,
      probe_candidate_rows: probe,
      route_farm_rows: clusterRows.filter((row) => (row.risk_flags || []).includes("large_route_farm")).length,
      top_providers: topEntries(countBy(clusterRows, (row) => row.provider), 4),
      top_price_bands: topEntries(countBy(clusterRows, (row) => row.price_band), 4),
      sample_routes: clusterRows
        .slice()
        .sort((a, b) => b.signal_score - a.signal_score || b.interest_score - a.interest_score)
        .slice(0, 5)
        .map((row) => ({
          route: row.route,
          route_name: row.route_name,
          provider: row.provider,
          cost: row.cost,
          evidence_stage: row.evidence_stage_label,
          market_signal: row.market_signal,
          source: row.source,
        })),
    };
  })
  .filter((cluster) => cluster.count > 0);

const maxActivityLog = Math.max(1, ...enriched.map((row) => Math.log10((row.observed_txns_30d || 0) + 1)));
const signalPointCandidates = [
  ...enriched
    .filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape")
    .sort((a, b) => b.signal_score - a.signal_score)
    .slice(0, 90),
  ...enriched.slice().sort((a, b) => b.interest_score - a.interest_score).slice(0, 90),
  ...clusters.flatMap((cluster) =>
    enriched
      .filter((row) => row.cluster_id === cluster.id)
      .sort((a, b) => b.signal_score - a.signal_score || b.interest_score - a.interest_score)
      .slice(0, 12)
  ),
];
const signalSeen = new Set();
const signal_map = {
  x_axis: "metadata_score",
  y_axis: "log_observed_activity",
  caveat: "Map points are representative high-signal records, not every listed route.",
  points: signalPointCandidates
    .filter((row) => {
      if (signalSeen.has(row.route_id)) return false;
      signalSeen.add(row.route_id);
      return true;
    })
    .slice(0, 180)
    .map((row) => {
      const activityIndex = row.observed_txns_30d
        ? Math.round((Math.log10(row.observed_txns_30d + 1) / maxActivityLog) * 100)
        : row.latest_tx_count_in_scrape
          ? 12
          : 2;
      return {
        route_id: row.route_id,
        route: row.route,
        route_name: row.route_name,
        provider: row.provider,
        cost: row.cost,
        metadata_score: row.metadata_score,
        activity_index: activityIndex,
        observed_txns_30d: row.observed_txns_30d,
        provider_route_count: row.provider_route_count,
        evidence_stage: row.evidence_stage_label,
        cluster_id: row.cluster_id,
        cluster_label: row.cluster_label,
        cluster_color: row.cluster_color,
        market_signal: row.market_signal,
        source: row.source,
      };
    }),
};

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
  clusters,
  evidence_ladder,
  compression,
  signal_map,
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
    evidence_stages: topEntries(countBy(enriched, (row) => row.evidence_stage), 8),
    clusters: topEntries(countBy(enriched, (row) => row.cluster_label), 10),
    provider_shape_types: topEntries(countBy(enriched, (row) => row.provider_shape_type), 8),
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
    evidence_stage: "Listed, priced, metadata-complete, activity-observed, or probe-candidate evidence ladder stage.",
    market_signal: "Short analyst label describing the strongest visible route signal.",
    cluster_id: "Higher-level market cluster used by the Analyzer view.",
    provider_shape_type: "Provider-level shape such as active anchor, route farm, broad catalog, focused provider, or long tail.",
    provider_share_pct: "Provider row share of the local route capture.",
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

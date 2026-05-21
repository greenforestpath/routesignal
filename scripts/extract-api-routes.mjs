import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "site/public/data");
const rawDir = path.join(root, "data");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(rawDir, { recursive: true });

const ENDPOINT =
  "https://www.x402scan.com/api/trpc/public.origins.list.withResources?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%7D%7D%7D";

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function normalizeNetwork(network) {
  if (!network) return "";
  if (network === "base") return "eip155:8453";
  if (network === "solana") return "solana:mainnet";
  return network;
}

function tokenName(accept) {
  return accept?.extra?.name || (String(accept?.asset || "").toLowerCase().includes("833589") ? "USDC" : "token");
}

function isUsdcLike(name) {
  return ["USDC", "USD Coin"].includes(name);
}

function costDisplay(accept) {
  const raw = accept?.amount ?? accept?.maxAmountRequired;
  if (raw == null || raw === "") return "unknown";
  const name = tokenName(accept);
  if (isUsdcLike(name) && /^\d+$/.test(String(raw))) {
    const decimal = Number(BigInt(raw)) / 1_000_000;
    return `${decimal.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")} USDC`;
  }
  return `${raw} atomic units ${name}`;
}

function capabilityFrom(resource, origin) {
  const parsed = resource?.data || resource?.response?.response || {};
  const resourceDescription = parsed?.resource?.description || "";
  const acceptDescription = (resource?.accepts || []).map((a) => a.description).filter(Boolean).join(" / ");
  const metadata = resource?.metadata;
  const metadataText = metadata
    ? [metadata.title, metadata.description].filter(Boolean).join(" / ")
    : "";
  return (
    resourceDescription ||
    acceptDescription ||
    metadataText ||
    origin.description ||
    origin.title ||
    "Payable API resource"
  );
}

function notesFor(resource, origin, accept, parsedAccept) {
  const tags = (resource.tags || []).map((entry) => entry.tag?.name).filter(Boolean);
  const response = resource?.data || resource?.response?.response || {};
  const parts = [
    response?.error,
    response?.resource?.mimeType ? `mime=${response.resource.mimeType}` : "",
    resource.x402Version ? `x402Version=${resource.x402Version}` : "",
    accept?.scheme ? `scheme=${accept.scheme}` : parsedAccept?.scheme ? `scheme=${parsedAccept.scheme}` : "",
    accept?.verified ? "accept_verified=true" : "accept_verified=false",
    tags.length ? `tags=${tags.join("|")}` : "",
    origin.description ? `origin=${origin.description}` : "",
  ].filter(Boolean);
  return parts.join("; ");
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "x-trpc-source": "routesignal-route-extractor",
      "user-agent": "RouteSignalRouteExtractor/0.1",
    },
  });
  if (!response.ok) {
    throw new Error(`x402scan route query failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function buildRows(payload) {
  const origins = payload?.[0]?.result?.data?.json || [];
  const rows = [];
  for (const origin of origins) {
    for (const resource of origin.resources || []) {
      const parsed = resource?.data || resource?.response?.response || {};
      const responseAccepts = parsed.accepts || [];
      const dbAccepts = resource.accepts || [];
      const accepts = dbAccepts.length ? dbAccepts : responseAccepts;
      if (!accepts.length) {
        rows.push({
          route: resource.resource || parsed?.resource?.url || "",
          provider: origin.title || origin.origin || "",
          cost: "unknown",
          capability: capabilityFrom(resource, origin),
          notes: notesFor(resource, origin, {}, {}),
          source: `https://www.x402scan.com/server/${origin.id}`,
          origin_id: origin.id,
          resource_id: resource.id,
          provider_url: origin.origin,
          network: "",
          asset: "",
          pay_to: "",
          scheme: "",
          x402_version: resource.x402Version || parsed.x402Version || "",
          evidence_grade: "x402scan_route_record",
          last_updated: resource.lastUpdated || origin.updatedAt || "",
        });
        continue;
      }

      for (const accept of accepts) {
        const parsedAccept =
          responseAccepts.find((candidate) => normalizeNetwork(candidate.network) === normalizeNetwork(accept.network)) ||
          responseAccepts[0] ||
          {};
        rows.push({
          route: resource.resource || parsed?.resource?.url || accept.resource || parsedAccept.resource || "",
          provider: origin.title || origin.origin || "",
          cost: costDisplay(parsedAccept.amount ? parsedAccept : accept),
          capability: capabilityFrom(resource, origin),
          notes: notesFor(resource, origin, accept, parsedAccept),
          source: `https://www.x402scan.com/server/${origin.id}`,
          origin_id: origin.id,
          resource_id: resource.id,
          provider_url: origin.origin,
          network: normalizeNetwork(parsedAccept.network || accept.network),
          asset: parsedAccept.asset || accept.asset || "",
          pay_to: parsedAccept.payTo || accept.payTo || "",
          scheme: parsedAccept.scheme || accept.scheme || "",
          x402_version: resource.x402Version || parsed.x402Version || "",
          evidence_grade: "x402scan_route_record",
          last_updated: resource.lastUpdated || origin.updatedAt || "",
        });
      }
    }
  }

  const seen = new Set();
  return rows.filter((row) => {
    const key = [row.route, row.provider, row.network, row.asset, row.pay_to, row.cost].join("\u0000");
    if (seen.has(key)) return false;
    seen.add(key);
    return row.route;
  });
}

function summarize(rows) {
  const byProvider = new Map();
  const byNetwork = new Map();
  const byCost = new Map();
  for (const row of rows) {
    byProvider.set(row.provider, (byProvider.get(row.provider) || 0) + 1);
    byNetwork.set(row.network || "unknown", (byNetwork.get(row.network || "unknown") || 0) + 1);
    byCost.set(row.cost || "unknown", (byCost.get(row.cost || "unknown") || 0) + 1);
  }
  const top = (map, limit = 12) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));

  return {
    generated_at: new Date().toISOString(),
    source_endpoint: ENDPOINT,
    route_count: rows.length,
    provider_count: byProvider.size,
    network_count: byNetwork.size,
    top_providers: top(byProvider),
    networks: top(byNetwork, 20),
    common_costs: top(byCost, 20),
    schema: ["route", "provider", "cost", "capability", "notes", "source"],
    caveat:
      "Rows are route-level public x402scan records with payment requirement metadata. They are evidence for listed payable routes, not proof of endpoint quality or successful paid calls.",
  };
}

function writeCsv(rows, filePath) {
  const columns = [
    "route",
    "provider",
    "cost",
    "capability",
    "notes",
    "source",
    "network",
    "asset",
    "pay_to",
    "scheme",
    "x402_version",
    "evidence_grade",
    "last_updated",
    "origin_id",
    "resource_id",
    "provider_url",
  ];
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function writeSqlite(rows, dbPath) {
  const tmpSql = path.join(rawDir, "api-routes.tmp.sql");
  const esc = (value) => String(value ?? "").replaceAll("'", "''");
  const statements = [
    "DROP TABLE IF EXISTS apis;",
    `CREATE TABLE apis (
      route TEXT,
      provider TEXT,
      cost TEXT,
      capability TEXT,
      notes TEXT,
      source TEXT,
      network TEXT,
      asset TEXT,
      pay_to TEXT,
      scheme TEXT,
      x402_version TEXT,
      evidence_grade TEXT,
      last_updated TEXT,
      origin_id TEXT,
      resource_id TEXT,
      provider_url TEXT
    );`,
  ];
  for (const row of rows) {
    statements.push(
      `INSERT INTO apis VALUES ('${esc(row.route)}','${esc(row.provider)}','${esc(row.cost)}','${esc(row.capability)}','${esc(row.notes)}','${esc(row.source)}','${esc(row.network)}','${esc(row.asset)}','${esc(row.pay_to)}','${esc(row.scheme)}','${esc(row.x402_version)}','${esc(row.evidence_grade)}','${esc(row.last_updated)}','${esc(row.origin_id)}','${esc(row.resource_id)}','${esc(row.provider_url)}');`
    );
  }
  fs.writeFileSync(tmpSql, statements.join("\n"));
  fs.rmSync(dbPath, { force: true });
  execFileSync("sqlite3", [dbPath, `.read ${tmpSql}`], { stdio: "pipe" });
  fs.rmSync(tmpSql, { force: true });
}

const payload = await fetchJson(ENDPOINT);
fs.writeFileSync(path.join(rawDir, "x402scan-routes-raw.json"), JSON.stringify(payload, null, 2));
const rows = buildRows(payload);
const summary = summarize(rows);
const json = { summary, apis: rows };

fs.writeFileSync(path.join(outDir, "api-routes.json"), JSON.stringify(json, null, 2));
writeCsv(rows, path.join(outDir, "api-routes.csv"));
writeCsv(rows, path.join(rawDir, "api-routes.csv"));
fs.writeFileSync(path.join(rawDir, "api-routes.json"), JSON.stringify(json, null, 2));
writeSqlite(rows, path.join(rawDir, "api-routes.sqlite"));

console.log(`Wrote ${rows.length} API route rows from ${summary.provider_count} providers`);
console.log(`JSON: ${path.relative(root, path.join(outDir, "api-routes.json"))}`);
console.log(`CSV: ${path.relative(root, path.join(outDir, "api-routes.csv"))}`);
console.log(`SQLite: ${path.relative(root, path.join(rawDir, "api-routes.sqlite"))}`);

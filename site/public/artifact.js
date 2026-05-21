function esc(value) {
  return String(value ?? "")
    .replaceAll("â", "—")
    .replaceAll("â€”", "—")
    .replaceAll("â€“", "–")
    .replaceAll("â€˜", "'")
    .replaceAll("â€™", "'")
    .replaceAll("â€œ", '"')
    .replaceAll("â€", '"')
    .replaceAll("â€", '"')
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function compact(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function truncate(value, length = 150) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
}

async function loadArtifactData() {
  const [routes, routesDb, insights, recipes] = await Promise.all([
    loadJson("./data/api-routes.json"),
    loadJson("./data/routesdb.json"),
    loadJson("./data/route-insights.json"),
    loadJson("./data/cross-pollination-recipes.json").catch(() => ({ recipes: [] })),
  ]);
  return { routes, routesDb, insights, recipes };
}

function renderMetrics(root, metrics) {
  root.innerHTML = metrics.map((metric) => `
    <div class="artifact-metric">
      <strong>${esc(metric.value)}</strong>
      <span>${esc(metric.label)}</span>
    </div>
  `).join("");
}

function iconFor(categoryId = "") {
  const icons = {
    search_scrape: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"></circle><path d="M15 15l5 5"></path></svg>`,
    trust_risk: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-2.7 8.1-7 10-4.3-1.9-7-5.5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-5"></path></svg>`,
    onchain_finance: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v10H4z"></path><path d="M7 8V6h10v2"></path><circle cx="12" cy="13" r="2.5"></circle></svg>`,
    communication_action: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 4V5z"></path><path d="M8 9h8M8 13h5"></path></svg>`,
    media_generation: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5z"></path><path d="M8 16l3-4 3 3 2-2 3 3"></path><circle cx="9" cy="9" r="1.5"></circle></svg>`,
    data_enrichment: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V5"></path><path d="M5 19h15"></path><path d="M8 16v-4M12 16V8M16 16v-6"></path></svg>`,
    agent_runtime: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h8v8H8z"></path><path d="M12 3v5M12 16v5M3 12h5M16 12h5"></path><circle cx="12" cy="12" r="2"></circle></svg>`,
    long_tail_tools: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4l6 6-10 10H4v-6L14 4z"></path><path d="M12 6l6 6"></path></svg>`,
  };
  return `<span class="route-icon">${icons[categoryId] || icons.long_tail_tools}</span>`;
}

function renderSignalWall(root, rows) {
  const active = diverseRows(
    rows.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape"),
    7
  );
  root.innerHTML = active.map((row, index) => `
    <a class="signal-wall-row" href="${esc(row.source)}" target="_blank" rel="noreferrer">
      <span class="wall-rank">${index + 1}</span>
      ${iconFor(row.category_id)}
      <span class="wall-main">
        <strong>${esc(truncate(row.route_name || row.provider, 34))}</strong>
        <small>${esc(truncate(row.provider, 52))}</small>
      </span>
      <span class="wall-proof">
        <strong>${compact(row.observed_txns_30d || row.latest_tx_count_in_scrape || 0)}</strong>
        <small>${esc(row.cost || "unknown")}</small>
      </span>
    </a>
  `).join("");
}

function renderSignalProof(root, rows) {
  const activity = rows.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape").length;
  const routeFarm = rows.filter((row) => (row.risk_flags || []).includes("large_route_farm")).length;
  const nonUsdc = rows.filter((row) => (row.risk_flags || []).includes("non_usdc_or_unknown_price")).length;
  const highMeta = rows.filter((row) => (row.metadata_score || 0) >= 90).length;
  const proofs = [
    ["Observed activity", compact(activity), "provider-level transaction signal"],
    ["High metadata", compact(highMeta), "90+ completeness score"],
    ["Route farms flagged", compact(routeFarm), "count distortion visible"],
    ["Price ambiguity", compact(nonUsdc), "non-USDC or unknown price"],
  ];
  root.innerHTML = proofs.map(([label, value, note]) => `
    <article>
      <span>${esc(label)}</span>
      <strong>${esc(value)}</strong>
      <small>${esc(note)}</small>
    </article>
  `).join("");
}

function renderSchemaGrid(root) {
  if (!root) return;
  const fields = [
    ["route_id", "Stable local ID for joins, citations, and copy/paste agent plans."],
    ["activity_signal", "Observed activity bucket from local x402scan captures."],
    ["evidence_stage", "Conservative ladder from listed metadata to cautious probe candidate."],
    ["market_signal", "Short analyst label for the strongest visible route signal."],
    ["cluster_id", "Analyzer market cluster for compression and visualization."],
    ["provider_shape_type", "Provider shape: active anchor, route farm, broad catalog, focused provider, or long tail."],
    ["provider_share_pct", "Provider row share in the current public route capture."],
    ["metadata_score", "Completeness score over observable route, payment, provider, and source fields."],
    ["signal_score", "Default sort score from activity, metadata completeness, price clarity, and freshness."],
    ["price_band", "micro_probe, cheap_probe, paid_check, premium_call, high_value, unknown."],
    ["risk_flags", "Observable sensitivity, abuse, route-farm, price, and verification flags."],
    ["route", "Canonical payable URL or route path."],
    ["provider", "Origin title or provider URL from x402scan."],
    ["cost", "Normalized human-readable price when possible."],
    ["capability", "Route/resource description used for clustering and recipes."],
    ["source", "x402scan server page for inspection."],
  ];
  root.innerHTML = fields.map(([name, detail]) => `
    <article class="schema-card">
      <strong>${esc(name)}</strong>
      <span>${esc(detail)}</span>
    </article>
  `).join("");
}

function routeRow(row) {
  return `
    <tr>
      <td><code>${esc(row.route_id || "")}</code></td>
      <td><a href="${esc(row.route)}" target="_blank" rel="noreferrer">${esc(truncate(row.route, 92))}</a></td>
      <td>${esc(truncate(row.provider, 70))}</td>
      <td><strong>${esc(row.cost || "unknown")}</strong><small>${esc(row.network || "unknown")}</small></td>
      <td>${signalBadge(row.activity_signal)}<small>${esc(activityText(row))}</small></td>
      <td><strong>${esc(row.evidence_stage_label || row.evidence_stage || "listed")}</strong><small>${esc(row.market_signal || "listed route")}</small></td>
      <td><strong>${esc(row.metadata_score ?? 0)}/100</strong><small>${esc(row.metadata_complete_count ?? 0)}/${esc(row.metadata_total_count ?? 0)} fields</small></td>
      <td><a href="${esc(row.source)}" target="_blank" rel="noreferrer">x402scan</a><small>${esc(row.evidence_grade || "listed metadata")}</small></td>
    </tr>
  `;
}

function verdictBadge(verdict) {
  const value = verdict || "PROBE";
  return `<span class="verdict verdict-${esc(value.toLowerCase())}">${esc(value)}</span>`;
}

function initRoutesPage({ routes, routesDb }) {
  const rows = routesDb.apis || [];
  const observedRows = rows.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape");
  const pricedRows = rows.filter((row) => typeof row.amount_usd === "number");
  const probeRows = rows.filter((row) => row.evidence_stage === "probe_candidate");
  renderMetrics(document.querySelector("#pageMetrics"), [
    { value: compact(routes.summary?.route_count || rows.length), label: "route records" },
    { value: compact(observedRows.length), label: "with observed activity" },
    { value: compact(probeRows.length), label: "probe candidates" },
    { value: compact(pricedRows.length), label: "USDC-normalized prices" },
    { value: compact(new Set(rows.map((row) => row.route)).size), label: "distinct routes" },
  ]);
  renderSchemaGrid(document.querySelector("#schemaGrid"));
  renderSignalWall(document.querySelector("#signalWall"), rows);
  renderSignalProof(document.querySelector("#signalProof"), rows);

  const activity = document.querySelector("#routeActivityFilter");
  const metadata = document.querySelector("#routeMetadataFilter");
  const evidence = document.querySelector("#routeEvidenceFilter");
  const price = document.querySelector("#routePriceFilter");
  const category = document.querySelector("#routeCategoryFilter");
  const risk = document.querySelector("#routeRiskFilter");
  const network = document.querySelector("#routeNetworkFilter");
  const provider = document.querySelector("#routeProviderSearch");
  const search = document.querySelector("#routeSearch");
  const tbody = document.querySelector("#routeTable");
  const cards = document.querySelector("#routeCards");
  const readout = document.querySelector("#routeReadout");
  fillSelect(activity, ["all", ...new Set(rows.map((row) => row.activity_signal).filter(Boolean).sort())], "All activity");
  fillSelect(metadata, ["all", "complete_80", "partial_60", "thin_under_60"], "All metadata");
  fillSelect(evidence, ["all", ...new Set(rows.map((row) => row.evidence_stage).filter(Boolean).sort())], "All evidence");
  fillSelect(price, ["all", ...new Set(rows.map((row) => row.price_band).filter(Boolean).sort())], "All price bands");
  fillSelect(category, ["all", ...new Set(rows.map((row) => row.category_label).filter(Boolean).sort())], "All categories");
  fillSelect(risk, ["all", ...new Set(rows.flatMap((row) => row.risk_flags || []).filter(Boolean).sort())], "All risk flags");
  fillSelect(network, ["all", ...new Set(rows.map((row) => row.network || "unknown").sort())], "All networks");

  function update() {
    const a = activity.value;
    const m = metadata.value;
    const e = evidence.value;
    const band = price.value;
    const cat = category.value;
    const flag = risk.value;
    const n = network.value;
    const p = provider.value.trim().toLowerCase();
    const q = search.value.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const text = [
        row.route_id,
        row.route_name,
        row.route,
        row.provider,
        row.cost,
        row.capability,
        row.notes,
        row.activity_signal,
        row.evidence_stage,
        row.market_signal,
        row.price_band,
        row.category_label,
        row.cluster_label,
        row.provider_shape_type,
        ...(row.tags || []),
        ...(row.risk_flags || []),
      ].join(" ").toLowerCase();
      return (a === "all" || row.activity_signal === a)
        && metadataMatches(m, row.metadata_score)
        && (e === "all" || row.evidence_stage === e)
        && (band === "all" || row.price_band === band)
        && (cat === "all" || row.category_label === cat)
        && (flag === "all" || (row.risk_flags || []).includes(flag))
        && (n === "all" || (row.network || "unknown") === n)
        && (!p || String(row.provider || "").toLowerCase().includes(p))
        && (!q || text.includes(q));
    });
    const cardRows = diverseRows(filtered, 36);
    readout.textContent = `${compact(filtered.length)} routes matched. Showing ${cardRows.length} provider-diversified route records; raw table renders first 220.`;
    cards.innerHTML = cardRows.map(routeCard).join("");
    tbody.innerHTML = filtered.slice(0, 220).map(routeRow).join("");
    if (!filtered.length) {
      cards.innerHTML = `<p>No route records match this filter.</p>`;
      tbody.innerHTML = `<tr><td colspan="7">No routes match this filter.</td></tr>`;
    }
  }

  [activity, metadata, evidence, price, category, risk, network, provider, search].forEach((node) => node.addEventListener(node.tagName === "SELECT" ? "change" : "input", update));
  update();
}

function metadataMatches(filter, score = 0) {
  if (filter === "all") return true;
  if (filter === "complete_80") return score >= 80;
  if (filter === "partial_60") return score >= 60 && score < 80;
  if (filter === "thin_under_60") return score < 60;
  return true;
}

function diverseRows(rows, limit) {
  const selected = [];
  const seenProviders = new Set();
  for (const row of rows) {
    if (selected.length >= limit) break;
    if (seenProviders.has(row.provider)) continue;
    selected.push(row);
    seenProviders.add(row.provider);
  }
  for (const row of rows) {
    if (selected.length >= limit) break;
    if (!selected.includes(row)) selected.push(row);
  }
  return selected;
}

function fillSelect(node, values, allLabel) {
  node.innerHTML = values.map((item) => `<option value="${esc(item)}">${item === "all" ? allLabel : esc(item)}</option>`).join("");
}

function signalBadge(signal) {
  const value = signal || "no_observed_activity_in_local_scrape";
  const label = value
    .replace("observed_high_activity", "high activity")
    .replace("observed_activity", "observed")
    .replace("latest_tx_seen", "latest tx")
    .replace("no_observed_activity_in_local_scrape", "no local tx");
  return `<span class="signal-badge signal-${esc(value)}">${esc(label)}</span>`;
}

function activityText(row) {
  if ((row.observed_txns_30d || 0) > 0) {
    const volume = row.observed_volume_usd_30d ? ` / $${compact(Math.round(row.observed_volume_usd_30d))}` : "";
    const buyers = row.observed_buyers_30d ? ` / ${compact(row.observed_buyers_30d)} buyers` : "";
    return `${compact(row.observed_txns_30d)} tx 30d${volume}${buyers}`;
  }
  if ((row.latest_tx_count_in_scrape || 0) > 0) return `${compact(row.latest_tx_count_in_scrape)} latest tx in local scrape`;
  return "no activity found in local scrape";
}

function evidenceNote(row) {
  const bits = [];
  bits.push(row.evidence_grade || "listed route metadata");
  if (row.activity_source) bits.push(row.activity_source.replaceAll("_", " "));
  if (row.latest_activity) bits.push(`latest ${row.latest_activity}`);
  return bits.join(" / ");
}

function routeCard(row) {
  return `
    <article class="route-record">
      <div class="record-topline">
        ${signalBadge(row.activity_signal)}
        ${iconFor(row.category_id)}
        <code>${esc(row.route_id)}</code>
      </div>
      <h3>${esc(row.route_name || "route")}</h3>
      <p class="record-provider">${esc(truncate(row.provider, 78))}</p>
      <p class="record-capability">${esc(truncate(row.capability, 230))}</p>
      <div class="record-meta">
        <span><strong>${esc(row.cost || "unknown")}</strong><small>${esc(row.price_band || "unknown price band")}</small></span>
        <span><strong>${esc(row.evidence_stage_label || row.evidence_stage || "Listed")}</strong><small>${esc(row.market_signal || "listed route")}</small></span>
        <span><strong>${esc(row.cluster_label || row.category_label || "uncategorized")}</strong><small>${esc(row.provider_shape_type || "provider")} / ${esc(row.provider_share_pct ?? 0)}% share</small></span>
      </div>
      <p class="activity-line">${esc(activityText(row))}</p>
      <div class="flag-list">
        ${(row.risk_flags || []).slice(0, 5).map((flag) => `<span class="flag">${esc(flag)}</span>`).join("")}
      </div>
      <div class="next-action"><strong>Evidence</strong><span>${esc(evidenceNote(row))}</span></div>
      <div class="record-links">
        <a href="${esc(row.source)}" target="_blank" rel="noreferrer">Evidence</a>
        <a href="${esc(row.route)}" target="_blank" rel="noreferrer">Route</a>
      </div>
    </article>
  `;
}

function categoryBars(categories) {
  const max = Math.max(1, ...categories.map((category) => category.count));
  return categories.map((category) => `
    <article class="category-bar static-bar" style="--bar-color:${esc(category.color)}; --bar-width:${Math.max(4, category.count / max * 100)}%">
      <span><strong>${esc(category.label)}</strong><small>${compact(category.count)} rows / ${compact(category.provider_count)} providers</small></span>
      <i aria-hidden="true"></i>
    </article>
  `).join("");
}

function displayMetric(value) {
  return typeof value === "number" ? compact(value) : value;
}

function renderCompressionCards(compression) {
  return (compression.cards || []).map((card) => `
    <article class="compression-card">
      <span>${esc(card.label)}</span>
      <strong>${esc(displayMetric(card.value))}</strong>
      <small>${esc(card.note)}</small>
    </article>
  `).join("") + `
    <article class="compression-card truth-card">
      <span>Read this first</span>
      <ul>
        ${(compression.truths || []).slice(0, 4).map((truth) => `<li>${esc(truth)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderSignalMap(signalMap) {
  const points = signalMap.points || [];
  const legend = [...new Map(points.map((point) => [point.cluster_id, point])).values()].slice(0, 8);
  return `
    <div class="signal-map-canvas">
      <span class="axis-label axis-x">Metadata completeness</span>
      <span class="axis-label axis-y">Observed activity</span>
      ${points.map((point, index) => {
        const size = Math.max(9, Math.min(25, 8 + Math.log10((point.provider_route_count || 1) + 1) * 6));
        const xJitter = (((index * 37) % 17) - 8) * 0.65;
        const yJitter = (((index * 53) % 19) - 9) * 0.58;
        const x = Math.max(3, Math.min(97, (point.metadata_score || 0) + xJitter));
        const y = Math.max(4, Math.min(96, (point.activity_index || 0) + yJitter));
        return `
          <a
            class="signal-point"
            href="${esc(point.source)}"
            target="_blank"
            rel="noreferrer"
            style="--x:${x}%; --y:${y}%; --point-color:${esc(point.cluster_color || "#2454a6")}; --point-size:${size}px"
            title="${esc(point.route_name)} / ${esc(point.provider)} / ${esc(point.market_signal)}"
            aria-label="${esc(point.route_name)} ${esc(point.market_signal)}"
          ></a>
        `;
      }).join("")}
    </div>
    <div class="signal-map-legend">
      ${legend.map((point) => `<span><i style="--point-color:${esc(point.cluster_color || "#2454a6")}"></i>${esc(point.cluster_label)}</span>`).join("")}
    </div>
    <p class="map-caveat">${esc(signalMap.caveat || "Representative points only.")}</p>
  `;
}

function renderEvidenceLadder(stages) {
  const max = Math.max(1, ...stages.map((stage) => stage.count));
  return stages.map((stage) => `
    <article class="ladder-row">
      <div class="ladder-rank">${esc(stage.rank)}</div>
      <div>
        <div class="ladder-topline">
          <strong>${esc(stage.label)}</strong>
          <span>${compact(stage.count)} rows / ${esc(stage.share)}%</span>
        </div>
        <p>${esc(stage.detail)}</p>
        <i style="--bar-width:${Math.max(4, stage.count / max * 100)}%" aria-hidden="true"></i>
      </div>
    </article>
  `).join("");
}

function renderClusterGrid(clusters) {
  return clusters.map((cluster) => `
    <article class="cluster-card" style="--cluster-color:${esc(cluster.color)}">
      <div class="cluster-head">
        <p class="capability">${esc(cluster.label)}</p>
        <strong>${compact(cluster.count)} rows</strong>
      </div>
      <p>${esc(cluster.thesis)}</p>
      <div class="cluster-metrics">
        <span><b>${compact(cluster.provider_count)}</b><small>providers</small></span>
        <span><b>${compact(cluster.active_rows)}</b><small>activity rows</small></span>
        <span><b>${compact(cluster.probe_candidate_rows)}</b><small>probe candidates</small></span>
      </div>
      <ol>
        ${(cluster.sample_routes || []).slice(0, 4).map((route) => `
          <li>
            <a href="${esc(route.source)}" target="_blank" rel="noreferrer">${esc(truncate(route.route_name || route.provider, 42))}</a>
            <span>${esc(route.evidence_stage)} / ${esc(route.cost || "unknown")}</span>
          </li>
        `).join("")}
      </ol>
    </article>
  `).join("");
}

function percent(part, total) {
  if (!total) return "0.0";
  return (part / total * 100).toFixed(1);
}

function routeText(row) {
  return [row.route, row.provider, row.cost, row.capability, row.notes, row.category_label, ...(row.tags || []), ...(row.risk_flags || [])].join(" ");
}

function keywordCount(rows, pattern) {
  return rows.filter((row) => pattern.test(routeText(row))).length;
}

function sampleForPattern(rows, pattern, limit = 3) {
  return rows
    .filter((row) => pattern.test(routeText(row)))
    .slice()
    .sort((a, b) => (b.interest_score || 0) + (b.signal_score || 0) - ((a.interest_score || 0) + (a.signal_score || 0)))
    .slice(0, limit);
}

function renderFactBoard(rows) {
  const total = rows.length;
  const providers = new Set(rows.map((row) => row.provider)).size;
  const distinctRoutes = new Set(rows.map((row) => row.route)).size;
  const activeRows = rows.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape");
  const activeProviders = new Set(activeRows.map((row) => row.provider)).size;
  const topProviders = Object.values(rows.reduce((map, row) => {
    map[row.provider] ||= { provider: row.provider, count: 0 };
    map[row.provider].count += 1;
    return map;
  }, {})).sort((a, b) => b.count - a.count);
  const topTenRoutes = topProviders.slice(0, 10).reduce((sum, provider) => sum + provider.count, 0);
  const acceptUnverified = rows.filter((row) => (row.risk_flags || []).includes("accept_unverified")).length;
  const routeFarmRows = rows.filter((row) => (row.risk_flags || []).includes("large_route_farm")).length;
  const pricedRows = rows.filter((row) => typeof row.amount_usd === "number");
  const underDollar = rows.filter((row) => typeof row.amount_usd === "number" && row.amount_usd > 0 && row.amount_usd < 1).length;
  const fivePlus = rows.filter((row) => typeof row.amount_usd === "number" && row.amount_usd >= 5).length;
  const baseRows = rows.filter((row) => row.network === "eip155:8453").length;
  const facts = [
    {
      kicker: "Hot take",
      value: `${compact(activeRows.length)} / ${compact(total)}`,
      title: "The active market is much smaller than the catalog.",
      detail: `${percent(activeRows.length, total)}% of route rows have observed local activity, across only ${compact(activeProviders)} providers. RouteSignal should foreground activity before breadth.`,
      caveat: "Activity is local x402scan scrape evidence, not proof of endpoint quality.",
    },
    {
      kicker: "Market shape",
      value: `${percent(topTenRoutes, total)}%`,
      title: "The top 10 providers create nearly a third of all rows.",
      detail: `${compact(topTenRoutes)} rows come from 10 providers, while the full corpus lists ${compact(providers)} providers. Count alone overstates diversity.`,
      caveat: "Provider labels can be noisy and may merge or split real businesses imperfectly.",
    },
    {
      kicker: "Trust",
      value: `${percent(acceptUnverified, total)}%`,
      title: "Most routes accept unverified payment metadata.",
      detail: `${compact(acceptUnverified)} rows carry the accept_unverified flag. This is the clearest argument for preflight, provenance, and capped probes.`,
      caveat: "The flag is metadata-derived; verify behavior before making hard trust claims.",
    },
    {
      kicker: "Pricing",
      value: `${compact(underDollar)}`,
      title: "Sub-dollar calls dominate the priced surface.",
      detail: `${compact(underDollar)} rows are priced above zero and below $1, while ${compact(fivePlus)} rows are $5 or more. This makes route bundles more interesting than single calls.`,
      caveat: `${compact(pricedRows.length)} rows have normalized numeric prices; non-USDC/token prices need separate handling.`,
    },
    {
      kicker: "Distortion",
      value: `${compact(routeFarmRows)}`,
      title: "Route farms are a real measurement problem.",
      detail: `${compact(routeFarmRows)} rows are flagged as large-route-farm records. They are useful as inventory, but bad as raw market-size evidence.`,
      caveat: "A route farm can still contain useful endpoints; the warning is about interpretation.",
    },
    {
      kicker: "Chain gravity",
      value: `${percent(baseRows, total)}%`,
      title: "Base is the gravity well.",
      detail: `${compact(baseRows)} rows list eip155:8453. The catalog is multichain, but the visible center of mass is Base.`,
      caveat: "Network labels reflect listed metadata, not settled transaction success.",
    },
  ];
  return facts.map((fact) => `
    <article class="fact-card">
      <p class="capability">${esc(fact.kicker)}</p>
      <strong>${esc(fact.value)}</strong>
      <h3>${esc(fact.title)}</h3>
      <p>${esc(fact.detail)}</p>
      <small>${esc(fact.caveat)}</small>
    </article>
  `).join("");
}

function renderHotTakes(rows) {
  const activeRows = rows.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape");
  const socialActions = keywordCount(rows, /twitter|x\/|tweet|follow|unfollow|message|dm|post|like|social/i);
  const sanctions = keywordCount(rows, /ofac|sanction|watchlist|background|criminal|interpol|fbi|dea/i);
  const identity = keywordCount(rows, /ssn|passport|identity|document|kyc|cedula|dni|cpf|liveness|face|biometric/i);
  const takes = [
    ["The product is not a directory.", "The sharper product is a route evidence layer: what is active, cheap enough to probe, sensitive enough to gate, and composable enough to chain."],
    ["The weirdest routes are not the most active routes.", `${compact(identity)} identity-like matches and ${compact(sanctions)} compliance/criminal-screening matches are fascinating, but many lack observed local activity. They should be displayed as claims needing verification.`],
    ["Agent payments make dangerous actions feel ordinary.", `${compact(socialActions)} rows match social/action language. That is a spend-control and human-confirmation story, not just an API-discovery story.`],
    ["Catalog breadth is less persuasive than receipt readiness.", `${compact(activeRows.length)} active rows are more demo-useful than thousands of thin listings. Show the active spine, then let users drill into long-tail routes.`],
  ];
  return takes.map(([title, detail]) => `
    <article class="take-card">
      <strong>${esc(title)}</strong>
      <p>${esc(detail)}</p>
    </article>
  `).join("");
}

function renderDisplayModel() {
  const steps = [
    ["1", "Fact board", "Six quantified claims: activity concentration, provider distortion, sensitive clusters, price bands, route farms, chain gravity."],
    ["2", "Evidence cards", "Each claim gets source-linked route examples and a caveat so listed metadata is never mistaken for quality."],
    ["3", "Cluster lenses", "Compress rows into identity, compliance, company diligence, OSINT, social actions, lead enrichment, agent runtime, and market data."],
    ["4", "Raw table last", "Use the table as audit trail, not as the first experience."],
  ];
  return steps.map(([rank, title, detail]) => `
    <article class="display-step">
      <span>${esc(rank)}</span>
      <div><strong>${esc(title)}</strong><p>${esc(detail)}</p></div>
    </article>
  `).join("");
}

function renderRouteFamilies(rows) {
  const families = [
    {
      label: "Identity vending machine",
      pattern: /ssn|passport|identity|document|kyc|cedula|dni|cpf|liveness|face|biometric/i,
      thesis: "Identity, KYC, document, and liveness-like routes make the catalog feel less like crypto plumbing and more like payable onboarding infrastructure.",
    },
    {
      label: "Compliance and background checks",
      pattern: /ofac|sanction|watchlist|background|criminal|interpol|fbi|dea|due.?diligence/i,
      thesis: "Sanctions and screening routes are the clearest fit for tiny pre-spend checks, but also the highest caveat zone.",
    },
    {
      label: "Brazil and public-record diligence",
      pattern: /cnpj|cpf|empresa|societ|licit|ambiental|processos|brazil|brasil|receita/i,
      thesis: "Latin America public-record routes show how local data exhaust can become agent-buyable diligence ingredients.",
    },
    {
      label: "OSINT, travel, and real-world telemetry",
      pattern: /satellite|fire|vessel|ais|flight|weather|ship|port|conflict|war|earthquake|carbon|emission/i,
      thesis: "Vessels, flights, fire alerts, and conflict/event routes are surprisingly natural agent ingredients because the output can trigger follow-on actions.",
    },
    {
      label: "Social action APIs",
      pattern: /twitter|x\/|tweet|follow|unfollow|message|dm|post|like|social/i,
      thesis: "Autonomous paid posting, messaging, and follow actions are memorable because they demonstrate why policy gates must sit before payment.",
    },
    {
      label: "Lead and contact enrichment",
      pattern: /lead|email|phone|contact|apollo|clado|whitepages|linkedin|maps|enrich/i,
      thesis: "This is one of the most practically active surfaces: small paid calls that turn unknown people or companies into actionable records.",
    },
    {
      label: "Agent runtime primitives",
      pattern: /agent|mcp|wallet|budget|runtime|model|claude|openclaw|receipt|preflight/i,
      thesis: "These routes sell the machinery around agent commerce itself: models, tools, wallets, runtimes, receipts, and capability discovery.",
    },
    {
      label: "Prediction, finance, and wallet research",
      pattern: /polymarket|wallet|token|defi|stock|trading|portfolio|market|price/i,
      thesis: "Finance routes dominate counts, but the best story is not token prices; it is wallet-aware research with explicit spend caps and receipts.",
    },
  ];
  return families.map((family) => {
    const matches = rows.filter((row) => family.pattern.test(routeText(row)));
    const samples = sampleForPattern(rows, family.pattern, 3);
    const active = matches.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape").length;
    return `
      <article class="family-card">
        <div class="family-head">
          <p class="capability">${esc(family.label)}</p>
          <strong>${compact(matches.length)}</strong>
        </div>
        <p>${esc(family.thesis)}</p>
        <div class="family-metrics">
          <span><b>${compact(active)}</b><small>activity rows</small></span>
          <span><b>${compact(new Set(matches.map((row) => row.provider)).size)}</b><small>providers</small></span>
        </div>
        <ol>
          ${samples.map((route) => `
            <li>
              <a href="${esc(route.source)}" target="_blank" rel="noreferrer">${esc(truncate(route.route_name || route.provider, 44))}</a>
              <span>${esc(truncate(route.provider, 52))} / ${esc(route.cost || "unknown")}</span>
            </li>
          `).join("")}
        </ol>
      </article>
    `;
  }).join("");
}

function firstRoute(rows, predicate) {
  return rows.find(predicate);
}

function evidenceRouteRows(rows) {
  const picks = [
    {
      angle: "Activity-backed lead enrichment",
      why: "This is the clearest active commercial surface: contact enrichment sold per call with provider-level 30-day activity.",
      route: firstRoute(rows, (row) => row.route === "https://stableenrich.dev/api/clado/contacts-enrich"),
    },
    {
      angle: "Agent can buy a phone number",
      why: "A wallet-bound phone number lease is not just data lookup. It is real-world communications inventory sold to agents.",
      route: firstRoute(rows, (row) => row.route === "https://blockrun.ai/api/v1/phone/numbers/buy"),
    },
    {
      angle: "Agent can initiate a voice call",
      why: "Outbound calling is where pay-per-call APIs stop being passive data and become externally visible action.",
      route: firstRoute(rows, (row) => row.route === "https://blockrun.ai/api/v1/voice/call"),
    },
    {
      angle: "Wallet identity as a paid primitive",
      why: "Address-to-identity is exactly the kind of tiny preflight an agent would buy before routing money or outreach.",
      route: firstRoute(rows, (row) => row.route === "https://public.zapper.xyz/x402/account-identity"),
    },
    {
      angle: "SSN validation listed as a payable route",
      why: "This is the most jarring metadata row: U.S. SSN validation packaged behind x402 payment metadata.",
      route: firstRoute(rows, (row) => row.route === "https://ai.verifik.co/api/usa/ssn"),
    },
    {
      angle: "FBI background check claim",
      why: "The route claim is extraordinary enough that the UI should treat it as a verification target, not a trusted product.",
      route: firstRoute(rows, (row) => row.route === "https://ai.verifik.co/api/fbi"),
    },
    {
      angle: "OFAC wallet screening",
      why: "This is a clean micro-compliance primitive: screen a wallet before a higher-value paid action.",
      route: firstRoute(rows, (row) => row.route === "https://x402.aurelianflo.com/api/ofac-wallet-screen/:address"),
    },
    {
      angle: "Enhanced due diligence report",
      why: "This looks closer to a packaged workflow than a raw endpoint: a paid memo with case metadata and review labels.",
      route: firstRoute(rows, (row) => row.route === "https://x402.aurelianflo.com/api/workflows/compliance/edd-report"),
    },
    {
      angle: "Brazil company diligence",
      why: "DataBR is a strong long-tail example: CNPJ, sanctions/procurement/lawsuits/environmental data in one paid route.",
      route: firstRoute(rows, (row) => row.route === "https://databr.api.br/v1/empresas/00000000000191/duediligence"),
    },
    {
      angle: "Influence graph for companies",
      why: "Corporate relationship graphs are the hidden-risk version of agent-buyable data, not another generic search API.",
      route: firstRoute(rows, (row) => row.route === "https://databr.api.br/v1/rede/00000000000191/influencia"),
    },
    {
      angle: "Vessel position as OSINT ingredient",
      why: "AIS vessel position becomes a tiny paid ingredient for logistics, sanctions, insurance, and conflict monitoring workflows.",
      route: firstRoute(rows, (row) => row.route === "https://war-tracker.com/api/v1/vessels/9217981/position"),
    },
    {
      angle: "Flight tracking as route ingredient",
      why: "Flight tracks are not a crypto-native category, which is exactly why they are interesting as agent-buyable context.",
      route: firstRoute(rows, (row) => row.route === "https://stabletravel.dev/api/flightaware/flights/id/track"),
    },
    {
      angle: "Dangerous social action",
      why: "A paid route named unfollow-everyone is the fastest way to explain why agents need action gates before payment.",
      route: firstRoute(rows, (row) => row.route === "https://xactions.app/api/ai/action/unfollow-everyone"),
    },
    {
      angle: "Paid social DM sending",
      why: "Agent-paid messaging is commercially obvious and abuse-prone at the same time.",
      route: firstRoute(rows, (row) => row.route === "https://xactions.app/api/ai/messages/send"),
    },
    {
      angle: "Polymarket wallet digest",
      why: "Prepared market-intelligence recipes show the higher-level product shape: not data, but paid interpretation.",
      route: firstRoute(rows, (row) => row.route === "https://api.402.bot/v1/recipes/polymarket-activity-digest/probe"),
    },
    {
      angle: "Trading track-record claim",
      why: "A claimed prop-firm trading record is specific and falsifiable, which makes it a good evidence-design example.",
      route: firstRoute(rows, (row) => row.route === "https://api.carbon-cashmere.de/v1/proven-track-record"),
    },
  ];
  return picks.filter((pick) => pick.route);
}

function renderEvidenceDeck(rows) {
  return evidenceRouteRows(rows).map((pick) => {
    const row = pick.route;
    const activity = activityText(row);
    const flags = (row.risk_flags || []).slice(0, 4);
    return `
      <article class="evidence-route">
        <div class="evidence-route-head">
          <p class="capability">${esc(pick.angle)}</p>
          ${signalBadge(row.activity_signal)}
        </div>
        <h3>${esc(row.route_name || row.provider)}</h3>
        <p class="evidence-provider">${esc(row.provider)}</p>
        <p>${esc(pick.why)}</p>
        <div class="evidence-route-meta">
          <span><strong>${esc(row.cost || "unknown")}</strong><small>listed price</small></span>
          <span><strong>${esc(row.category_label || "uncategorized")}</strong><small>${esc(row.price_band || "unknown price")}</small></span>
          <span><strong>${esc(row.metadata_score ?? 0)}/100</strong><small>metadata</small></span>
        </div>
        <p class="activity-line">${esc(activity)}</p>
        <code>${esc(row.route)}</code>
        <div class="flag-list">${flags.map((flag) => `<span class="flag">${esc(flag)}</span>`).join("")}</div>
        <div class="record-links">
          <a href="${esc(row.source)}" target="_blank" rel="noreferrer">x402scan source</a>
          <a href="${esc(row.route)}" target="_blank" rel="noreferrer">route URL</a>
        </div>
      </article>
    `;
  }).join("");
}

function countBy(rows, keyFn) {
  return Object.values(rows.reduce((map, row) => {
    const key = keyFn(row) || "unknown";
    map[key] ||= { name: key, rows: 0, distinct: new Set(), active: 0, maxTx: 0, examples: [] };
    map[key].rows += 1;
    map[key].distinct.add(row.route);
    if (row.activity_signal !== "no_observed_activity_in_local_scrape") map[key].active += 1;
    map[key].maxTx = Math.max(map[key].maxTx, row.observed_txns_30d || 0);
    if (map[key].examples.length < 3) map[key].examples.push(row.route_name || row.route);
    return map;
  }, {})).map((item) => ({ ...item, distinct: item.distinct.size }));
}

function renderProviderDistortion(rows) {
  const providers = countBy(rows, (row) => row.provider)
    .sort((a, b) => b.rows - a.rows)
    .slice(0, 14);
  return providers.map((provider, index) => `
    <article class="provider-row">
      <span class="wall-rank">${index + 1}</span>
      <div>
        <strong>${esc(provider.name)}</strong>
        <small>${compact(provider.rows)} rows / ${compact(provider.distinct)} distinct URLs / ${compact(provider.active)} active rows / max ${compact(provider.maxTx)} observed 30d tx</small>
      </div>
    </article>
  `).join("");
}

function renderClusterCounts(rows) {
  const families = [
    ["Agent runtime", /agent|mcp|wallet|budget|runtime|model|claude|openclaw|receipt|preflight/i],
    ["Finance and market data", /polymarket|wallet|token|defi|stock|trading|portfolio|market|price/i],
    ["OSINT / travel / telemetry", /satellite|fire|vessel|ais|flight|weather|ship|port|conflict|war|earthquake|carbon|emission/i],
    ["Social and external actions", /twitter|x\/|tweet|follow|unfollow|message|dm|post|like|social/i],
    ["Lead/contact enrichment", /lead|email|phone|contact|apollo|clado|whitepages|linkedin|maps|enrich/i],
    ["Identity / KYC / biometrics", /ssn|passport|identity|document|kyc|cedula|dni|cpf|liveness|face|biometric/i],
    ["Compliance / sanctions", /ofac|sanction|watchlist|background|criminal|interpol|fbi|dea|due.?diligence/i],
    ["Brazil/public records", /cnpj|cpf|empresa|societ|licit|ambiental|processos|brazil|brasil|receita/i],
  ].map(([name, pattern]) => {
    const matches = rows.filter((row) => pattern.test(routeText(row)));
    return {
      name,
      rows: matches.length,
      active: matches.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape").length,
      providers: new Set(matches.map((row) => row.provider)).size,
      sample: sampleForPattern(rows, pattern, 1)[0],
    };
  });
  const max = Math.max(1, ...families.map((family) => family.rows));
  return families.map((family) => `
    <article class="cluster-count">
      <div>
        <strong>${esc(family.name)}</strong>
        <small>${compact(family.rows)} matching rows / ${compact(family.active)} active / ${compact(family.providers)} providers</small>
      </div>
      <i style="--bar-width:${Math.max(5, family.rows / max * 100)}%"></i>
      ${family.sample ? `<a href="${esc(family.sample.source)}" target="_blank" rel="noreferrer">${esc(family.sample.route_name || family.sample.provider)}</a>` : ""}
    </article>
  `).join("");
}

function initAnalysisPage({ routes, routesDb, insights }) {
  const rows = routesDb.apis || [];
  const compression = insights.compression || { cards: [], truths: [] };
  renderMetrics(document.querySelector("#pageMetrics"), [
    { value: compact(routes.summary?.route_count), label: "routes compressed" },
    { value: compact((insights.clusters || []).length), label: "market clusters" },
    { value: compact((insights.evidence_ladder || []).find((stage) => stage.id === "probe_candidate")?.count || 0), label: "probe candidates" },
    { value: compact((insights.compression?.cards || []).find((card) => card.label === "Observed activity rows")?.value || 0), label: "activity rows" },
  ]);

  const categories = (insights.categories || []).slice().sort((a, b) => b.count - a.count);
  const factBoardRoot = document.querySelector("#factBoard");
  if (factBoardRoot) factBoardRoot.innerHTML = renderFactBoard(rows);
  const hotTakesRoot = document.querySelector("#hotTakes");
  if (hotTakesRoot) hotTakesRoot.innerHTML = renderHotTakes(rows);
  const displayModelRoot = document.querySelector("#displayModel");
  if (displayModelRoot) displayModelRoot.innerHTML = renderDisplayModel();
  const routeFamiliesRoot = document.querySelector("#routeFamilies");
  if (routeFamiliesRoot) routeFamiliesRoot.innerHTML = renderRouteFamilies(rows);
  const compressionRoot = document.querySelector("#compressionCards");
  if (compressionRoot) compressionRoot.innerHTML = renderCompressionCards(compression);
  const signalMapRoot = document.querySelector("#signalMap");
  if (signalMapRoot) signalMapRoot.innerHTML = renderSignalMap(insights.signal_map || { points: [] });
  const evidenceRoot = document.querySelector("#evidenceLadder");
  if (evidenceRoot) evidenceRoot.innerHTML = renderEvidenceLadder(insights.evidence_ladder || []);
  const clusterRoot = document.querySelector("#clusterGrid");
  if (clusterRoot) clusterRoot.innerHTML = renderClusterGrid(insights.clusters || []);
  const categoryBarsRoot = document.querySelector("#categoryBars");
  if (categoryBarsRoot) categoryBarsRoot.innerHTML = categoryBars(categories);
  const mentalMapRoot = document.querySelector("#mentalMap");
  if (mentalMapRoot) mentalMapRoot.innerHTML = renderMentalMap(categories.slice(0, 8), insights.bundles || []);
  document.querySelector("#costBars").innerHTML = densityBars(insights.summary?.top_costs || []);
  document.querySelector("#networkBars").innerHTML = densityBars(insights.summary?.top_networks || []);
  document.querySelector("#providerShapes").innerHTML = (insights.provider_shapes || []).slice(0, 10).map((provider) => `
    <article class="provider-shape">
      <div class="provider-shape-head">
        <strong>${esc(provider.provider)}</strong>
        <span>${esc(provider.shape_type || "provider")}</span>
      </div>
      <div class="provider-shape-metrics">
        <span><b>${compact(provider.count)}</b><small>rows</small></span>
        <span><b>${compact(provider.distinct_routes)}</b><small>distinct</small></span>
        <span><b>${esc(provider.share_pct ?? 0)}%</b><small>row share</small></span>
        <span><b>${compact(provider.max_txns_30d || 0)}</b><small>max tx 30d</small></span>
      </div>
      <small>${(provider.top_categories || []).map((item) => `${esc(item.name)} ${compact(item.count)}`).join(" / ")}</small>
    </article>
  `).join("");
  document.querySelector("#surprisingRoutes").innerHTML = (insights.interesting_routes || []).slice(0, 24).map((route) => `
    <article class="interesting-card">
      <p class="capability">${esc(route.cluster || route.category)} / ${esc(route.evidence_stage || "listed")} / ${esc(route.cost)}</p>
      <h4>${esc(route.route_name || route.provider)}</h4>
      <p>${esc(truncate(route.capability, 190))}</p>
      <p class="market-signal">${esc(route.market_signal || "listed route")}</p>
      <small>${esc(route.why_interesting)} Caveat: ${esc(route.caveat)}.</small>
      <a href="${esc(route.source)}" target="_blank" rel="noreferrer">Open source</a>
    </article>
  `).join("");
  document.querySelector("#warnings").innerHTML = (insights.warnings || []).map((warning) => `
    <li><strong>${esc(warning.title)}</strong><span>${esc(warning.detail)}</span></li>
  `).join("");
}

function initBetaInsightsPage({ routes, routesDb }) {
  const rows = routesDb.apis || [];
  const activeRows = rows.filter((row) => row.activity_signal !== "no_observed_activity_in_local_scrape");
  const routeFarmRows = rows.filter((row) => (row.risk_flags || []).includes("large_route_farm"));
  const pricedRows = rows.filter((row) => typeof row.amount_usd === "number");
  renderMetrics(document.querySelector("#pageMetrics"), [
    { value: compact(rows.length), label: "route rows analyzed" },
    { value: compact(activeRows.length), label: "activity-backed rows" },
    { value: compact(new Set(activeRows.map((row) => row.provider)).size), label: "active providers" },
    { value: compact(routeFarmRows.length), label: "route-farm rows" },
    { value: compact(pricedRows.length), label: "normalized prices" },
  ]);
  document.querySelector("#factBoard").innerHTML = renderFactBoard(rows);
  document.querySelector("#evidenceDeck").innerHTML = renderEvidenceDeck(rows);
  document.querySelector("#providerDistortion").innerHTML = renderProviderDistortion(rows);
  document.querySelector("#clusterCounts").innerHTML = renderClusterCounts(rows);
  document.querySelector("#hotTakes").innerHTML = renderHotTakes(rows);
  document.querySelector("#displayModel").innerHTML = renderDisplayModel();
  document.querySelector("#routeFamilies").innerHTML = renderRouteFamilies(rows);
}

function densityBars(entries) {
  const max = Math.max(1, ...entries.map((entry) => entry.count));
  return entries.map((entry) => `
    <article class="density-row">
      <span><strong>${esc(entry.name)}</strong><small>${compact(entry.count)} rows</small></span>
      <i style="--bar-width:${Math.max(4, entry.count / max * 100)}%" aria-hidden="true"></i>
    </article>
  `).join("");
}

function renderMentalMap(categories, bundles) {
  const nodes = categories.map((category, index) => {
    const angle = (index / categories.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...category,
      x: 50 + Math.cos(angle) * 34,
      y: 50 + Math.sin(angle) * 31,
    };
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const lines = bundles.flatMap((bundle) => {
    const ids = bundle.category_ids || [];
    return ids.slice(1).map((id, index) => [byId.get(ids[index]), byId.get(id), bundle.title]).filter(([a, b]) => a && b);
  });
  return `
    <svg viewBox="0 0 100 100" role="img" aria-label="Route category mental map">
      ${lines.map(([a, b]) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`).join("")}
      ${nodes.map((node) => `
        <g>
          <circle cx="${node.x}" cy="${node.y}" r="${Math.max(4.5, Math.min(10, node.count / 560))}" fill="${esc(node.color)}" />
          <text x="${node.x}" y="${node.y + 13}" text-anchor="middle">${esc(node.label.split(",")[0].slice(0, 18))}</text>
        </g>
      `).join("")}
    </svg>
  `;
}

function initRecipesPage({ insights, recipes }) {
  const bundles = insights.bundles || [];
  const recipeRows = recipes.recipes || [];
  renderMetrics(document.querySelector("#pageMetrics"), [
    { value: compact(bundles.length), label: "route-derived bundles" },
    { value: compact(recipeRows.length), label: "generated recipes" },
    { value: compact(insights.interesting_routes?.length), label: "outlier ingredients" },
    { value: compact(insights.categories?.length), label: "route lenses" },
  ]);
  document.querySelector("#bundleGrid").innerHTML = bundles.map((bundle) => `
    <article class="bundle-card">
      <p class="capability">Route-derived recipe</p>
      <h3>${esc(bundle.title)}</h3>
      <p>${esc(bundle.thesis)}</p>
      <ol>
        ${(bundle.route_samples || []).slice(0, 6).map((route) => `
          <li><strong>${esc(route.category)}</strong><span>${esc(truncate(route.provider, 62))} · ${esc(route.cost)}</span></li>
        `).join("")}
      </ol>
    </article>
  `).join("");
  setupWizardControls(recipeRows);
}

function setupWizardControls(recipeRows) {
  const task = document.querySelector("#wizardTask");
  const budget = document.querySelector("#wizardBudget");
  const risk = document.querySelector("#wizardRisk");
  const style = document.querySelector("#wizardStyle");
  const search = document.querySelector("#wizardSearch");
  const readout = document.querySelector("#wizardReadout");
  const workbench = document.querySelector("#wizardWorkbench");
  const recipeGrid = document.querySelector("#recipeGridLite");
  let selectedId = recipeRows[0]?.id || "";
  fillSelect(task, ["all", ...new Set(recipeRows.map((recipe) => recipe.task).filter(Boolean).sort())], "All tasks");
  fillSelect(budget, ["all", "micro", "under_1", "under_5", "any"], "Any budget");
  fillSelect(risk, ["all", "low", "medium", "high"], "Any risk");
  fillSelect(style, ["all", "diligence", "safety", "receipt", "provider_bakeoff", "weird"], "Any angle");

  function update() {
    const query = search.value.trim().toLowerCase();
    const filtered = recipeRows.filter((recipe) => {
      const target = budgetValue(recipe);
      const text = recipeText(recipe);
      const riskOk = risk.value === "all"
        || (risk.value === "low" && !/warn|block|social|identity|regulated|danger|abuse/.test(text))
        || (risk.value === "medium" && !/block|abuse/.test(text))
        || risk.value === "high";
      const styleOk = style.value === "all"
        || (style.value === "diligence" && /diligence|vendor|company|founder|counterparty|preflight|asset/.test(text))
        || (style.value === "safety" && /risk|safety|security|sanctions|regulated|policy|refused|stop/.test(text))
        || (style.value === "receipt" && /receipt|evidence|storage|hash|trail|source/.test(text))
        || (style.value === "provider_bakeoff" && /provider|bakeoff|compare|latency|freshness|cost/.test(text))
        || (style.value === "weird" && /weird|strange|long-tail|meme|social|microstore|conference|bangkok/.test(text));
      return (task.value === "all" || recipe.task === task.value)
        && budgetMatches(budget.value, target)
        && riskOk
        && styleOk
        && (!query || text.includes(query));
    });
    if (!filtered.some((recipe) => recipe.id === selectedId)) selectedId = filtered[0]?.id || recipeRows[0]?.id || "";
    const selected = filtered.find((recipe) => recipe.id === selectedId) || recipeRows.find((recipe) => recipe.id === selectedId) || filtered[0] || recipeRows[0];
    readout.textContent = `${compact(filtered.length)} recipes matched. Each recipe should resolve to a first-dollar call, route chain, spend cap, stop rule, and evidence trail.`;
    workbench.innerHTML = selected ? renderWizardWorkbench(selected) : "<p>No recipes match this wizard state.</p>";
    recipeGrid.innerHTML = filtered.slice(0, 12).map((recipe) => recipeCard(recipe, recipe.id === selectedId)).join("") || "<p>No recipes match this wizard state.</p>";
    recipeGrid.querySelectorAll("[data-recipe-id]").forEach((node) => {
      node.addEventListener("click", () => {
        selectedId = node.dataset.recipeId;
        update();
      });
    });
  }

  [task, budget, risk, style].forEach((node) => node.addEventListener("change", update));
  search.addEventListener("input", update);
  update();
}

function recipeText(recipe) {
  return [
    recipe.title,
    recipe.task,
    recipe.human_hook,
    recipe.why_impossible_before,
    recipe.why_agent_payments_matter,
    recipe.stop_rule,
    recipe.first_dollar_call,
    ...(recipe.call_chain || []),
    ...(recipe.receipt_trail || []),
    ...(recipe.failure_modes || []),
    ...(recipe.evidence_refs || []),
    ...(recipe.ingredients || []).flatMap((ingredient) => [ingredient.name, ingredient.role, ingredient.evidence_status]),
  ].join(" ").toLowerCase();
}

function renderWizardWorkbench(recipe) {
  const budget = recipe.budget_usd || {};
  const target = typeof budget === "object" && budget.target ? `$${budget.target.toFixed(2)}` : budgetText(recipe);
  const cap = typeof budget === "object" && budget.hard_cap ? `$${budget.hard_cap.toFixed(2)}` : "cap TBD";
  const ingredients = recipe.ingredients || [];
  const failureModes = recipe.failure_modes || [];
  const receipts = recipe.receipt_trail || [];
  return `
    <div class="wizard-workbench-main">
      <div class="wizard-plan-head">
        <span class="recipe-budget">${esc(budgetText(recipe))}</span>
        <span>${esc(recipe.feasibility?.level || "feasibility TBD")}</span>
      </div>
      <h3>${esc(recipe.title)}</h3>
      <p class="hook">${esc(recipe.human_hook || recipe.task || "")}</p>
      <div class="spend-rail">
        <article><strong>First-dollar call</strong><span>${esc(recipe.first_dollar_call || "Start with the cheapest qualifying route.")}</span></article>
        <article><strong>Spend shape</strong><span>${esc(target)} target / ${esc(cap)} hard stop</span></article>
        <article><strong>Stop rule</strong><span>${esc(recipe.stop_rule || "Stop when confidence is high enough or spend cap is reached.")}</span></article>
      </div>
      <div class="workbench-chain">
        ${(recipe.call_chain || []).slice(0, 9).map((step, index) => `<span><b>${index + 1}</b>${esc(step)}</span>`).join("")}
      </div>
    </div>
    <div class="wizard-workbench-side">
      <section>
        <h4>Route ingredients</h4>
        ${ingredients.slice(0, 5).map((ingredient) => `
          <p><strong>${esc(ingredient.name)}</strong><span>${esc(ingredient.role)}</span><small>${esc(ingredient.evidence_status)}</small></p>
        `).join("")}
      </section>
      <section>
        <h4>Receipt trail</h4>
        <ol>${receipts.slice(0, 5).map((item) => `<li>${esc(item)}</li>`).join("")}</ol>
      </section>
      <section>
        <h4>Failure modes</h4>
        <ul>${failureModes.slice(0, 4).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      </section>
      <p class="evidence-boundary">Caveat: listed payable route is not proof of endpoint quality. This wizard is for shadow-mode or fake-money evaluation until a live call is verified.</p>
    </div>
  `;
}

function recipeCard(recipe, selected = false) {
  return `
    <button class="recipe-card compact-recipe ${selected ? "is-selected" : ""}" type="button" data-recipe-id="${esc(recipe.id)}">
      <div class="recipe-topline"><span class="recipe-budget">${esc(budgetText(recipe))}</span><span>${esc(recipe.task || "workflow")}</span></div>
      <h3>${esc(recipe.title)}</h3>
      <p class="hook">${esc(recipe.human_hook || recipe.why_agent_payments_matter || "")}</p>
      <div class="first-dollar"><strong>First-dollar call</strong><span>${esc(recipe.first_dollar_call || "Pick the cheapest qualifying route and capture the receipt.")}</span></div>
      <div class="recipe-chain">
        ${(recipe.call_chain || []).slice(0, 5).map((step, index) => `<span><b>${index + 1}</b>${esc(step)}</span>`).join("")}
      </div>
      <div class="missing-product">${esc(recipe.stop_rule || "Stop when confidence is high enough or spend cap is reached.")}</div>
    </button>
  `;
}

function budgetMatches(filter, value) {
  if (filter === "all" || filter === "any") return true;
  if (filter === "micro") return value > 0 && value <= 0.5;
  if (filter === "under_1") return value > 0 && value <= 1;
  if (filter === "under_5") return value > 0 && value <= 5;
  return true;
}

function budgetText(recipe) {
  const budget = recipe.budget_usd;
  if (typeof budget === "number") return `$${budget.toFixed(2)}`;
  if (budget?.target && budget?.hard_cap) return `$${budget.target.toFixed(2)} target / $${budget.hard_cap.toFixed(2)} cap`;
  if (budget?.target) return `$${budget.target.toFixed(2)} target`;
  return "Budget TBD";
}

function budgetValue(recipe) {
  const budget = recipe.budget_usd;
  if (typeof budget === "number") return budget;
  if (budget?.target) return budget.target;
  if (budget?.hard_cap) return budget.hard_cap;
  return 0;
}

loadArtifactData().then((data) => {
  const page = document.body.dataset.page;
  if (page === "routes") initRoutesPage(data);
  if (page === "analyzer") initAnalysisPage(data);
  if (page === "beta-insights") initBetaInsightsPage(data);
  if (page === "wizard") initRecipesPage(data);
}).catch((error) => {
  document.body.append(Object.assign(document.createElement("pre"), { textContent: `Failed to load artifact data: ${error.message}` }));
});

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

function renderSchemaGrid(root) {
  const fields = [
    ["route_id", "Stable local ID for joins, citations, and copy/paste agent plans."],
    ["activity_signal", "Observed activity bucket from local x402scan activity and transaction captures."],
    ["observed_txns_30d", "Thirty-day transaction count when x402scan exposes it for the provider."],
    ["observed_volume_usd_30d", "Thirty-day listed payment volume when available."],
    ["observed_buyers_30d", "Thirty-day buyer count when available."],
    ["metadata_score", "Completeness score over observable route, payment, provider, and source fields."],
    ["signal_score", "Default sort score from activity, metadata completeness, price clarity, and freshness."],
    ["price_band", "micro_probe, cheap_probe, paid_check, premium_call, high_value, unknown."],
    ["risk_flags", "Observable sensitivity, abuse, route-farm, price, and verification flags."],
    ["latest_activity", "Most recent activity label captured from the x402scan activity surface."],
    ["tags", "Searchable route tags for downstream agents."],
    ["route", "Canonical payable URL or route path."],
    ["provider", "Origin title or provider URL from x402scan."],
    ["cost", "Normalized human-readable price when possible."],
    ["capability", "Route/resource description used for clustering and recipes."],
    ["network", "Payment network or chain identifier."],
    ["asset", "Token contract or asset identifier from payment terms."],
    ["pay_to", "Payment recipient address."],
    ["scheme", "x402 payment scheme, usually exact."],
    ["x402_version", "Version exposed by the listed route metadata."],
    ["evidence_grade", "Conservative provenance label."],
    ["origin_id/resource_id", "Stable x402scan identifiers for joins."],
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
  const avgMetadata = rows.length ? Math.round(rows.reduce((sum, row) => sum + (row.metadata_score || 0), 0) / rows.length) : 0;
  const pricedRows = rows.filter((row) => typeof row.amount_usd === "number");
  renderSchemaGrid(document.querySelector("#schemaGrid"));
  renderMetrics(document.querySelector("#pageMetrics"), [
    { value: compact(routes.summary?.route_count || rows.length), label: "route records" },
    { value: compact(observedRows.length), label: "with observed activity" },
    { value: `${avgMetadata}/100`, label: "avg metadata score" },
    { value: compact(pricedRows.length), label: "USDC-normalized prices" },
    { value: compact(new Set(rows.map((row) => row.route)).size), label: "distinct routes" },
  ]);

  const activity = document.querySelector("#routeActivityFilter");
  const metadata = document.querySelector("#routeMetadataFilter");
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
  fillSelect(price, ["all", ...new Set(rows.map((row) => row.price_band).filter(Boolean).sort())], "All price bands");
  fillSelect(category, ["all", ...new Set(rows.map((row) => row.category_label).filter(Boolean).sort())], "All categories");
  fillSelect(risk, ["all", ...new Set(rows.flatMap((row) => row.risk_flags || []).filter(Boolean).sort())], "All risk flags");
  fillSelect(network, ["all", ...new Set(rows.map((row) => row.network || "unknown").sort())], "All networks");

  function update() {
    const a = activity.value;
    const m = metadata.value;
    const band = price.value;
    const cat = category.value;
    const flag = risk.value;
    const n = network.value;
    const p = provider.value.trim().toLowerCase();
    const q = search.value.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const text = [row.route_id, row.route_name, row.route, row.provider, row.cost, row.capability, row.notes, row.activity_signal, row.price_band, row.category_label, ...(row.tags || []), ...(row.risk_flags || [])].join(" ").toLowerCase();
      return (a === "all" || row.activity_signal === a)
        && metadataMatches(m, row.metadata_score)
        && (band === "all" || row.price_band === band)
        && (cat === "all" || row.category_label === cat)
        && (flag === "all" || (row.risk_flags || []).includes(flag))
        && (n === "all" || (row.network || "unknown") === n)
        && (!p || String(row.provider || "").toLowerCase().includes(p))
        && (!q || text.includes(q));
    });
    const cardRows = diverseRows(filtered, 36);
    readout.textContent = `${compact(filtered.length)} records matched. Showing ${cardRows.length} diversified signal records; developer table renders first 220.`;
    cards.innerHTML = cardRows.map(routeCard).join("");
    tbody.innerHTML = filtered.slice(0, 220).map(routeRow).join("");
    if (!filtered.length) {
      cards.innerHTML = `<p>No route records match this filter.</p>`;
      tbody.innerHTML = `<tr><td colspan="7">No routes match this filter.</td></tr>`;
    }
  }

  [activity, metadata, price, category, risk, network, provider, search].forEach((node) => node.addEventListener(node.tagName === "SELECT" ? "change" : "input", update));
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
  return bits.join(" · ");
}

function routeCard(row) {
  return `
    <article class="route-record">
      <div class="record-topline">
        ${signalBadge(row.activity_signal)}
        <code>${esc(row.route_id)}</code>
      </div>
      <h3>${esc(row.route_name || "route")}</h3>
      <p class="record-provider">${esc(truncate(row.provider, 78))}</p>
      <p class="record-capability">${esc(truncate(row.capability, 230))}</p>
      <div class="record-meta">
        <span><strong>${esc(row.cost || "unknown")}</strong><small>${esc(row.price_band || "unknown price band")}</small></span>
        <span><strong>${esc(row.metadata_score ?? 0)}/100 metadata</strong><small>${esc(row.metadata_complete_count ?? 0)}/${esc(row.metadata_total_count ?? 0)} fields complete</small></span>
        <span><strong>${esc(row.category_label || "uncategorized")}</strong><small>signal ${esc(row.signal_score ?? 0)}</small></span>
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

function initAnalysisPage({ routes, insights }) {
  renderMetrics(document.querySelector("#pageMetrics"), [
    { value: compact(routes.summary?.route_count), label: "routes compressed" },
    { value: compact(insights.categories?.length), label: "analysis lenses" },
    { value: compact(insights.interesting_routes?.length), label: "curated outliers" },
    { value: compact(insights.provider_shapes?.length), label: "provider shapes" },
  ]);

  const categories = (insights.categories || []).slice().sort((a, b) => b.count - a.count);
  document.querySelector("#categoryBars").innerHTML = categoryBars(categories);
  document.querySelector("#mentalMap").innerHTML = renderMentalMap(categories.slice(0, 8), insights.bundles || []);
  document.querySelector("#costBars").innerHTML = densityBars(insights.summary?.top_costs || []);
  document.querySelector("#networkBars").innerHTML = densityBars(insights.summary?.top_networks || []);
  document.querySelector("#providerShapes").innerHTML = (insights.provider_shapes || []).slice(0, 10).map((provider) => `
    <article class="provider-shape">
      <strong>${esc(provider.provider)}</strong>
      <span>${compact(provider.count)} rows · ${compact(provider.distinct_routes)} distinct routes · common price ${esc(provider.common_costs?.[0]?.name || "mixed")}</span>
      <small>${(provider.top_categories || []).map((item) => `${esc(item.name)} ${compact(item.count)}`).join(" / ")}</small>
    </article>
  `).join("");
  document.querySelector("#surprisingRoutes").innerHTML = (insights.interesting_routes || []).slice(0, 24).map((route) => `
    <article class="interesting-card">
      <p class="capability">${esc(route.category)} · ${esc(route.cost)}</p>
      <h4>${esc(route.route_name || route.provider)}</h4>
      <p>${esc(truncate(route.capability, 190))}</p>
      <small>${esc(route.why_interesting)} Caveat: ${esc(route.caveat)}.</small>
      <a href="${esc(route.source)}" target="_blank" rel="noreferrer">Open source</a>
    </article>
  `).join("");
  document.querySelector("#warnings").innerHTML = (insights.warnings || []).map((warning) => `
    <li><strong>${esc(warning.title)}</strong><span>${esc(warning.detail)}</span></li>
  `).join("");
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
  const readout = document.querySelector("#wizardReadout");
  fillSelect(task, ["all", ...new Set(recipeRows.map((recipe) => recipe.task).filter(Boolean).sort())], "All tasks");
  fillSelect(budget, ["all", "micro", "under_1", "under_5", "any"], "Any budget");
  fillSelect(risk, ["all", "low", "medium", "high"], "Any risk");
  fillSelect(style, ["all", "practical", "weird", "high_confidence"], "Any style");

  function update() {
    const filtered = recipeRows.filter((recipe) => {
      const target = budgetValue(recipe);
      const text = [recipe.title, recipe.task, recipe.human_hook, recipe.why_impossible_before, recipe.why_agent_payments_matter, recipe.stop_rule, recipe.first_dollar_call].join(" ").toLowerCase();
      const riskOk = risk.value === "all"
        || (risk.value === "low" && !/warn|block|social|identity|regulated|danger|abuse/.test(text))
        || (risk.value === "medium" && !/block|abuse/.test(text))
        || risk.value === "high";
      const styleOk = style.value === "all"
        || (style.value === "practical" && /diligence|wallet|lead|vendor|risk|compliance|brief/.test(text))
        || (style.value === "weird" && /weird|strange|long-tail|meme|social|cross/.test(text))
        || (style.value === "high_confidence" && /stop|receipt|evidence|verify|probe/.test(text));
      return (task.value === "all" || recipe.task === task.value)
        && budgetMatches(budget.value, target)
        && riskOk
        && styleOk;
    });
    readout.textContent = `${compact(filtered.length)} recipes matched. Each recipe should resolve to a first-dollar call, route chain, spend cap, stop rule, and evidence trail.`;
    document.querySelector("#recipeGridLite").innerHTML = filtered.slice(0, 12).map(recipeCard).join("") || "<p>No recipes match this wizard state.</p>";
  }

  [task, budget, risk, style].forEach((node) => node.addEventListener("change", update));
  update();
}

function recipeCard(recipe) {
  return `
    <article class="recipe-card compact-recipe">
      <div class="recipe-topline"><span class="recipe-budget">${esc(budgetText(recipe))}</span><span>${esc(recipe.task || "workflow")}</span></div>
      <h3>${esc(recipe.title)}</h3>
      <p class="hook">${esc(recipe.human_hook || recipe.why_agent_payments_matter || "")}</p>
      <div class="first-dollar"><strong>First-dollar call</strong><span>${esc(recipe.first_dollar_call || "Pick the cheapest qualifying route and capture the receipt.")}</span></div>
      <div class="recipe-chain">
        ${(recipe.call_chain || []).slice(0, 5).map((step, index) => `<span><b>${index + 1}</b>${esc(step)}</span>`).join("")}
      </div>
      <div class="missing-product">${esc(recipe.stop_rule || "Stop when confidence is high enough or spend cap is reached.")}</div>
    </article>
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
  if (page === "wizard") initRecipesPage(data);
}).catch((error) => {
  document.body.append(Object.assign(document.createElement("pre"), { textContent: `Failed to load artifact data: ${error.message}` }));
});

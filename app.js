let currentPage = "dashboard";
let activeSchoolId = "GVPS";
const $ = (s) => document.querySelector(s);
const content = $("#content");

function selectedSchool() {
  return schools.find((s) => s.id === activeSchoolId) || schools[0];
}
function im(s, type) {
  return imagesFor(s)[type];
}
function statusBadge(x) {
  let c =
    x === "On Track" || x === "OK"
      ? "ok"
      : x === "Watch" || x === "Medium"
        ? "watch"
        : "alert";
  return `<span class="badge ${c}">${x}</span>`;
}
function kpi(label, value, trend = "") {
  return `<div class="kpi"><div class="label">${label}</div><div class="value">${value}</div><div class="trend">${trend}</div></div>`;
}
function card(title, body, cls = "") {
  return `<div class="card ${cls}"><h3>${title}</h3>${body}</div>`;
}

function lineChart(a, b, c) {
  const w = 760,
    h = 245,
    p = 40,
    max = Math.max(...a, ...b, ...c) + 180;
  const pts = (arr) =>
    arr
      .map(
        (v, i) =>
          `${p + (i * (w - 2 * p)) / (arr.length - 1)},${h - p - (v / max) * (h - 2 * p)}`,
      )
      .join(" ");
  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((t) => {
      let y = h - p - t * (h - 2 * p);
      return `<line class="gridline" x1="${p}" x2="${w - p}" y1="${y}" y2="${y}"/>`;
    })
    .join("");
  return `<div class="chart"><svg viewBox="0 0 ${w} ${h}">${grid}
 <line class="axis" x1="${p}" x2="${w - p}" y1="${h - p}" y2="${h - p}"/>
 <polyline class="line1" points="${pts(a)}"/><polyline class="line2" points="${pts(b)}"/><polyline class="line3" points="${pts(c)}"/>
 <text x="${p}" y="14" font-size="10" fill="#65748b">daily count</text>
 <text x="${w - 115}" y="${h - 5}" font-size="9" fill="#65748b">Apr 1 → Apr 28</text></svg></div>
 <div class="legend"><span><i class="dot blue"></i>Enrolled</span><span><i class="dot green"></i>Present</span><span><i class="dot orange"></i>Meals served</span></div>`;
}
function horizontalBars(values, labels, target = null) {
  const w = 760,
    h = Math.max(250, values.length * 25 + 55),
    left = 155,
    right = 50,
    top = 20,
    bottom = 30;
  const max = Math.max(...values, target || 0) * 1.12,
    usable = w - left - right;
  let html = `<div class="chart" style="height:${h}px"><svg viewBox="0 0 ${w} ${h}">`;
  values.forEach((v, i) => {
    const y = top + i * 25,
      bw = (v / max) * usable;
    html += `<text x="${left - 8}" y="${y + 13}" text-anchor="end" font-size="9" fill="#52657d">${labels[i]}</text>`;
    html += `<rect class="${target && v < target ? "orangeBar" : "barcol"}" x="${left}" y="${y + 2}" width="${bw}" height="15" rx="3"/>`;
    html += `<text x="${left + bw + 6}" y="${y + 14}" font-size="9" fill="#263d5e">${v}</text>`;
  });
  if (target) {
    const x = left + (target / max) * usable;
    html += `<line x1="${x}" x2="${x}" y1="${top - 8}" y2="${h - bottom}" stroke="#17385f" stroke-dasharray="4 3"/><text x="${x + 4}" y="${top - 9}" font-size="9" fill="#17385f">Target ${target}</text>`;
  }
  html += `</svg></div>`;
  return html;
}
function verticalBars(values, labels, target = null) {
  const w = 760,
    h = 260,
    p = 48,
    max = Math.max(...values, target || 0) * 1.15,
    bw = ((w - 2 * p) / values.length) * 0.65;
  let html = `<div class="chart"><svg viewBox="0 0 ${w} ${h}">`;
  values.forEach((v, i) => {
    const x =
      p +
      (i * (w - 2 * p)) / values.length +
      ((w - 2 * p) / values.length) * 0.175;
    const y = h - p - (v / max) * (h - 2 * p),
      bh = h - p - y;
    html += `<rect class="${target && v < target ? "orangeBar" : "barcol"}" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="2"/>
  <text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle" font-size="9">${v}</text>
  <text x="${x + bw / 2}" y="${h - p + 14}" text-anchor="middle" font-size="8" fill="#65748b">${labels[i]}</text>`;
  });
  if (target) {
    const y = h - p - (target / max) * (h - 2 * p);
    html += `<line x1="${p}" x2="${w - p}" y1="${y}" y2="${y}" stroke="#17385f" stroke-dasharray="4 3"/>`;
  }
  html += `</svg></div>`;
  return html;
}
function donut(value = 87) {
  return `<div class="donutWrap"><div class="donutRing" style="--pct:${value * 3.6}deg"><span>${value}%</span></div>
 <div class="donutLegend"><div><i class="dot green"></i>As per menu <b>87%</b></div><div><i class="dot orange"></i>Partial deviation <b>8%</b></div><div><i class="dot red"></i>Not as per menu <b>5%</b></div></div></div>`;
}
function schoolTable() {
  return `<table class="table"><thead><tr><th>#</th><th>School Name</th><th>Enrolled</th><th>Avg Present</th><th>Avg Meals</th><th>Menu Compliance</th><th>Plate Photos</th><th>Status</th></tr></thead><tbody>
 ${schools.map((s, i) => `<tr class="school-row" onclick="openSchool('${s.id}')"><td>${i + 1}</td><td class="click">${s.short}</td><td>${s.enrolled}</td><td>${s.present}</td><td>${s.meals}</td><td>${s.menu}%</td><td>${s.photos}%</td><td>${statusBadge(s.status)}</td></tr>`).join("")}
 </tbody></table>`;
}
function top(title, sub, back = false) {
  return `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div>${back ? `<button class="filter primaryBtn" onclick="go('dashboard')">← District Monitor</button>` : ""}</div>`;
}

const enrolled = [
  1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862,
  1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862, 1862,
  1862, 1862,
];
const present = [
  1682, 1701, 1715, 1694, 1724, 1738, 1728, 1749, 1735, 1741, 1728, 1752, 1760,
  1748, 1736, 1755, 1770, 1764, 1757, 1776, 1762, 1782, 1771, 1766, 1780, 1774,
  1788, 1783,
];
const served = [
  1640, 1662, 1676, 1652, 1689, 1704, 1693, 1717, 1703, 1710, 1697, 1724, 1730,
  1719, 1705, 1725, 1741, 1733, 1727, 1746, 1732, 1752, 1742, 1737, 1751, 1746,
  1760, 1754,
];

function dashboard() {
  return `
 ${top("Phase 1 – Meal Integrity Monitoring", "Weeks 1–4 • Attendance, Meal Service, Stock, and Photo Verification")}
 <div class="kpis">
 ${kpi("Schools", "10", "District pilot")}
 ${kpi("Children Enrolled", "1,862", "Across all schools")}
 ${kpi("Children Present", "1,742", "Average / day")}
 ${kpi("Meals Served", "1,698", "Average / day")}
 ${kpi("Plate Photo Completion", "92%", "Target 90%")}
 </div>
 <div class="grid gMain">
  ${card("Attendance vs Meals Served (All Schools)", lineChart(enrolled, present, served))}
  ${card("Menu Compliance", donut(87))}
 </div>
 <div class="grid gMain" style="margin-top:10px">
  ${card(
    "Ingredient Stock vs Expected Consumption (Total for 10 Schools)",
    `
   <table class="table"><thead><tr><th>Item</th><th>Expected (kg)</th><th>Actual Used (kg)</th><th>Variance</th><th>Status</th></tr></thead>
   <tbody>
   <tr><td>Rice / Wheat</td><td>1,240</td><td>1,210</td><td>-2%</td><td>${statusBadge("OK")}</td></tr>
   <tr><td>Pulses / Dal</td><td>248</td><td>230</td><td>-7%</td><td>${statusBadge("OK")}</td></tr>
   <tr><td>Vegetables</td><td>620</td><td>590</td><td>-5%</td><td>${statusBadge("OK")}</td></tr>
   <tr><td>Oil</td><td>62</td><td>55</td><td>-11%</td><td>${statusBadge("Watch")}</td></tr>
   <tr><td>Salt / Spices</td><td>38</td><td>36</td><td>-5%</td><td>${statusBadge("OK")}</td></tr>
   </tbody></table>`,
  )}
  ${card(
    "Alerts (Last 4 Weeks)",
    `
   <div class="alertCount high"><b>2</b><span>High priority<br><small>Meal mismatch vs attendance</small></span></div>
   <div class="alertCount med"><b>3</b><span>Medium priority<br><small>Menu / low stock usage</small></span></div>
   <div class="alertCount info"><b>5</b><span>Info<br><small>Photo missing or delayed</small></span></div>`,
  )}
 </div>
 <div style="margin-top:10px">${card("School-wise Overview", schoolTable())}</div>
 <div style="margin-top:10px">${card(
   "School Verification – Sample: Green Valley PS, Apr 16, 2025",
   `
   <div class="thumbs">${[
     ["stock", "Store Room"],
     ["cooking", "Cooking Vessel"],
     ["serving", "Serving"],
     ["before", "Sample Plate (Before)"],
     ["after", "Sample Plate (After)"],
   ]
     .map(
       (x) =>
         `<div class="thumb"><img src="${im(schools[0], x[0])}"><b>${x[1]}</b><span>Apr 16 · demo evidence</span></div>`,
     )
     .join("")}</div>`,
 )}
 </div>`;
}

function schoolPage() {
  const s = selectedSchool(),
    imgs = imagesFor(s);
  const calorieTarget = 450;
  return `
 ${top("Phase 2 – Portion & Nutrition Estimation", `AI-based estimation of food quantity, portion size and nutrition value • ${s.name}`, true)}
 <div class="schoolHero">
  <div><span class="schoolId">School ID: ${s.id}</span><h2>${s.name}</h2><p>Mock school-level monitoring record linked from the district meal-integrity dashboard.</p></div>
  ${statusBadge(s.status)}
 </div>
 <div class="kpis">
 ${kpi("Enrolled", s.enrolled, "Students")}
 ${kpi("Present", s.present, Math.round((s.present / s.enrolled) * 100) + "% of enrolled")}
 ${kpi("Meals Served", s.meals, Math.round((s.meals / s.present) * 100) + "% of present")}
 ${kpi("AI Estimation Confidence", s.nutrition + "%", "Mock average")}
 ${kpi("Nutrition Adequacy", s.nutrition + "%", "Meet primary targets")}
 </div>
 <div class="grid gMain">
  ${card(
    `AI Estimated Portion and Nutrition – ${s.short}`,
    `
   <div class="grid g2">
    <img class="hero-photo thaliHero" src="${imgs.before}" alt="Indian thali">
    <table class="table"><thead><tr><th>Food Item</th><th>Estimated Quantity</th><th>Key Measurements</th><th>Calories</th><th>Protein</th><th>Iron</th><th>Confidence</th></tr></thead><tbody>
    ${mealItems.map((m) => `<tr><td><b>${m.item}</b></td><td>${m.qty}</td><td>${m.measure}</td><td>${m.kcal}</td><td>${m.protein}</td><td>${m.iron}</td><td><div class="bar green"><i style="width:${m.conf}%"></i></div>${m.conf}%</td></tr>`).join("")}
    <tr><td><b>Total (per plate)</b></td><td colspan="2"></td><td><b>549</b></td><td><b>17.3</b></td><td><b>4.3</b></td><td>—</td></tr>
    </tbody></table>
   </div>`,
  )}
  ${card(
    `School Monitoring Snapshot`,
    `
   <div class="schoolSnapshot"><img src="${imgs.stock}" alt="school meal stock">
   <div>${[
     ["Enrolled Students", s.enrolled],
     [
       "Present",
       s.present + " (" + Math.round((s.present / s.enrolled) * 100) + "%)",
     ],
     [
       "Meals Served",
       s.meals + " (" + Math.round((s.meals / s.present) * 100) + "%)",
     ],
     ["Menu Compliance", s.menu + "%"],
     ["Plate Photo Completion", s.photos + "%"],
     ["Nutrition Adequacy", s.nutrition + "%"],
   ]
     .map(
       (x) =>
         `<div class="snapshotRow"><span>${x[0]}</span><b>${x[1]}</b></div>`,
     )
     .join("")}</div></div>`,
  )}
 </div>
 <div class="grid g3" style="margin-top:10px">
  ${card("Roti Size Distribution", verticalBars([8, 15, 29, 52, 89, 121, 165, 190, 174, 151, 128, 72, 38, 19, 8], ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"], 16))}
  ${card(
    "Dal Consistency Analysis",
    `
   <div class="threePhotos">${[
     ["cooking", "Thick", "12%"],
     ["before", "Normal", "72%"],
     ["after", "Watery (diluted)", "16%"],
   ]
     .map(
       (x) =>
         `<div><img src="${imgs[x[0]]}"><b>${x[1]}</b><strong>${x[2]}</strong></div>`,
     )
     .join("")}</div>`,
  )}
  ${card(
    "AI Detection Example – Dal",
    `
   <div class="twoPhotos"><div><img class="normalBorder" src="${imgs.cooking}"><b>Normal</b><small>Confidence 90%</small></div><div><img class="alertBorder" src="${imgs.after}"><b>Diluted</b><small>Confidence 87%</small></div></div>`,
  )}
 </div>
 <div class="grid g3" style="margin-top:10px">
  ${card(
    "Nutrient Adequacy (Per Child Per Meal)",
    `
   <div class="nutrientGrid">
    <div><b>549</b><span>450 target</span><label>Energy (kcal)</label><div class="miniBar"><i style="width:100%"></i></div></div>
    <div><b>17.3</b><span>12 target</span><label>Protein (g)</label><div class="miniBar"><i style="width:100%"></i></div></div>
    <div><b>4.3</b><span>3 target</span><label>Iron (mg)</label><div class="miniBar"><i style="width:100%"></i></div></div>
    <div><b>210</b><span>150 target</span><label>Vitamin A (µg)</label><div class="miniBar"><i style="width:100%"></i></div></div>
   </div>`,
  )}
  ${card(
    "Before vs After Plate – Food Wastage",
    `
   <div class="beforeAfter"><div><img src="${imgs.before}"><b>Before meal</b></div><div class="arrow">→</div><div><img src="${imgs.after}"><b>After meal</b></div></div>
   <div class="wasteBox"><div><b>92%</b><span>Estimated consumption</span></div><div><b>8%</b><span>Estimated waste</span></div></div>`,
  )}
  ${card("Nutrition Adequacy – All Schools", donut(92))}
 </div>
 <div class="grid g2" style="margin-top:10px">
  ${card(
    "School Comparison – Avg. Calories per Plate",
    horizontalBars(
      schools.map((x) => x.calories),
      schools.map((x) => x.short),
      calorieTarget,
    ),
  )}
  ${card(
    "Key Insights (Weeks 5–8)",
    `
   <div class="insight"><span class="ico">✓</span>92% of analyzed plates meet or exceed nutrition targets.</div>
   <div class="insight"><span class="ico warn">!</span>16% of dal samples appear diluted.</div>
   <div class="insight"><span class="ico">✓</span>Average roti diameter 16.2 cm; thickness 2.0 mm.</div>
   <div class="insight"><span class="ico warn">!</span>Lotus PS and Nehru PS are below the 450 kcal primary target.</div>
   <div class="insight"><span class="ico">i</span>Food waste estimate varies from 3–15% by school.</div>
   <div class="insight"><span class="ico">✓</span>Average AI estimation confidence: 89%.</div>`,
  )}
 </div>
 <div style="margin-top:10px">${card(
   `Meal Evidence Gallery – ${s.short}`,
   `
  <div class="photo-grid">${[
    ["stock", "Store Room"],
    ["cooking", "Cooking Vessel"],
    ["serving", "Serving"],
    ["before", "Plate Before"],
    ["after", "Plate After"],
  ]
    .map(
      (x) =>
        `<div class="photo"><img src="${imgs[x[0]]}"><div class="cap"><b>${x[1]}</b><small>Apr 16, 2025 · mock evidence</small></div></div>`,
    )
    .join("")}</div>
  <div class="generatedNote">Prototype note: the meal imagery is generated/synthetic for demonstration and is not real school evidence.</div>
 `,
 )}</div>`;
}

function schoolsPage() {
  return `${top("Schools", "Select any school to open the school-level portion, nutrition and image evidence page.")}${card("School Directory", schoolTable())}`;
}
function mealsPage() {
  return `${top("Meals & Attendance", "Daily attendance, meals served and coverage across the district.")}<div class="grid g2">${card("Attendance vs Meals Served", lineChart(enrolled, present, served))}${card(
    "Coverage Indicators",
    `
 <div class="school-metrics"><div class="metric"><b>97.5%</b><span>Meal coverage</span></div><div class="metric"><b>92%</b><span>Plate photo completion</span></div><div class="metric"><b>44</b><span>Avg daily gap</span></div></div>
 <div class="notice">Mock monitoring rule: flag schools when meals served are materially below children present.</div>`,
  )}</div><div style="margin-top:10px">${card("School-level coverage", schoolTable())}</div>`;
}
function aiPage() {
  return `${top("AI Analysis", "Mock outputs from the food detection and portion-estimation application.")}<div class="kpis">${kpi("Meals analyzed", "1,745", "AI processed")}${kpi("Food items / plate", "4", "Roti, dal, rice, sabzi")}${kpi("Avg confidence", "89%", "Mock estimate")}${kpi("Diluted dal", "16%", "Review examples")}${kpi("Waste estimate", "8%", "District average")}</div>
 <div class="grid g2">${card("Sample Indian Thali – AI Input", `<img class="hero-photo thaliHero" src="images/generated_indian_thali_set.png"><p class="sub">Generated prototype meal imagery. The four-panel image contains sample thali, close-up, post-meal, and serving-pot scenes.</p>`)}${card("Detected Food & Portion Output", `<table class="table"><tr><th>Food</th><th>Quantity</th><th>Confidence</th></tr>${mealItems.map((m) => `<tr><td>${m.item}</td><td>${m.qty}</td><td>${m.conf}%</td></tr>`).join("")}</table>`)}</div>`;
}
function nutritionPage() {
  return `${top("Nutrition Reports", "School-level and district-level nutrition adequacy from mock AI estimates.")}<div class="grid g2">${card(
    "Calories per Plate",
    horizontalBars(
      schools.map((s) => s.calories),
      schools.map((s) => s.short),
      450,
    ),
  )}${card(
    "Nutrition Adequacy by School",
    horizontalBars(
      schools.map((s) => s.nutrition),
      schools.map((s) => s.short),
      90,
    ),
  )}</div><div style="margin-top:10px">${card("Nutrition Dataset", schoolTable())}</div>`;
}
function galleryPage() {
  return `${top("Photo Gallery", "Meal evidence organized by school and capture stage.")}<div class="photo-grid">${schools
    .flatMap((s) => {
      let x = imagesFor(s);
      return [
        ["stock", "Store Room"],
        ["cooking", "Cooking"],
        ["serving", "Serving"],
        ["before", "Plate Before"],
        ["after", "Plate After"],
      ].map(
        (a) =>
          `<div class="photo"><img src="${x[a[0]]}"><div class="cap"><b>${s.short} · ${a[1]}</b><small>Mock evidence · Apr 16, 2025</small></div></div>`,
      );
    })
    .join("")}</div>`;
}
function stockPage() {
  return `${top("Stock & Supplies", "Ingredient usage against expected consumption for the pilot.")}${card("Ingredient Stock vs Expected Consumption", `<table class="table"><thead><tr><th>Ingredient</th><th>Expected</th><th>Used</th><th>Variance</th><th>Status</th></tr></thead><tbody><tr><td>Rice / Wheat</td><td>1,240 kg</td><td>1,210 kg</td><td>-2%</td><td>${statusBadge("OK")}</td></tr><tr><td>Pulses / Dal</td><td>248 kg</td><td>230 kg</td><td>-7%</td><td>${statusBadge("OK")}</td></tr><tr><td>Vegetables</td><td>620 kg</td><td>590 kg</td><td>-5%</td><td>${statusBadge("OK")}</td></tr><tr><td>Oil</td><td>62 kg</td><td>55 kg</td><td>-11%</td><td>${statusBadge("Watch")}</td></tr></tbody></table>`)}`;
}
function comparisonsPage() {
  return `${top("Comparisons", "Compare meal calories and nutrition adequacy across schools.")}<div class="grid g2">${card(
    "Avg. Calories per Plate",
    horizontalBars(
      schools.map((s) => s.calories),
      schools.map((s) => s.short),
      450,
    ),
  )}${card(
    "Nutrition Adequacy",
    horizontalBars(
      schools.map((s) => s.nutrition),
      schools.map((s) => s.short),
      90,
    ),
  )}</div><div style="margin-top:10px">${card("School Comparison Table", schoolTable())}</div>`;
}
function alertsPage() {
  return `${top("Alerts", "Exceptions generated from the mock meal-integrity data.")}${card(
    "Alerts – Last 4 Weeks",
    `<table class="table"><thead><tr><th>Priority</th><th>School</th><th>Issue</th><th>Detail</th><th>Time</th></tr></thead><tbody>
 <tr><td>${statusBadge("Alert")}</td><td>Nehru PS</td><td><b>Meals below attendance</b></td><td>150 meals for 162 children present</td><td>Today 11:48</td></tr>
 <tr><td>${statusBadge("Alert")}</td><td>Lotus PS</td><td><b>Menu deviation</b></td><td>Vegetable item missing in sample record</td><td>Today 12:02</td></tr>
 <tr><td>${statusBadge("Watch")}</td><td>Udaan PS</td><td><b>Photo completion</b></td><td>Below 95% target</td><td>Yesterday</td></tr>
 <tr><td>${statusBadge("Watch")}</td><td>Sunrise PS</td><td><b>Stock variance</b></td><td>Vegetable usage below expected</td><td>Yesterday</td></tr>
 </tbody></table>`,
  )}`;
}
function insightsPage() {
  return `${top("Insights", "Plain-language monitoring observations for the demonstration.")}<div class="grid g2">${card("District Insights", `<div class="insight"><span class="ico">✓</span>92% of analyzed plates meet or exceed nutrition targets.</div><div class="insight"><span class="ico warn">!</span>16% of dal samples are classified as watery/diluted in the mock dataset.</div><div class="insight"><span class="ico">✓</span>Average roti diameter is 16.2 cm.</div><div class="insight"><span class="ico warn">!</span>Two schools are below the primary calorie target.</div><div class="insight"><span class="ico">i</span>Plate-waste estimates vary across schools.</div>`)}${card("Demo Story", `<ol style="line-height:2;font-size:12px"><li>Show district-wide meal integrity first.</li><li>Open a school from the overview.</li><li>Show its Indian thali image and AI portion table.</li><li>Use the graphs to explain adequacy and consistency.</li><li>Finish with photo evidence, alerts and insights.</li></ol>`)}</div>`;
}

function go(page, id = null) {
  currentPage = page;
  if (id) activeSchoolId = id;
  render();
}
function openSchool(id) {
  activeSchoolId = id;
  currentPage = "school";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  document
    .querySelectorAll(".nav button")
    .forEach((b) =>
      b.classList.toggle(
        "active",
        b.dataset.page === currentPage ||
          (currentPage === "school" && b.dataset.page === "schools"),
      ),
    );
  const names = {
    dashboard: "District Meal Integrity Monitor",
    schools: "Schools",
    meals: "Meals & Attendance",
    ai: "AI Analysis",
    nutrition: "Nutrition Reports",
    gallery: "Photo Gallery",
    stock: "Stock & Supplies",
    comparisons: "Comparisons",
    alerts: "Alerts",
    insights: "Insights",
    school: "School Portion & Nutrition",
  };
  $("#topTitle").textContent = names[currentPage] || "Swasth-Thali";
  const pages = {
    dashboard,
    schools: schoolsPage,
    meals: mealsPage,
    ai: aiPage,
    nutrition: nutritionPage,
    gallery: galleryPage,
    stock: stockPage,
    comparisons: comparisonsPage,
    alerts: alertsPage,
    insights: insightsPage,
    school: schoolPage,
  };
  content.innerHTML = pages[currentPage]();
}

document
  .querySelectorAll(".nav button")
  .forEach((b) => b.addEventListener("click", () => go(b.dataset.page)));
$("#schoolFilter").innerHTML =
  '<option value="ALL">Select school…</option>' +
  schools.map((s) => `<option value="${s.id}">${s.short}</option>`).join("");
$("#schoolFilter").addEventListener("change", (e) => {
  if (e.target.value !== "ALL") openSchool(e.target.value);
});
render();

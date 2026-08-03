const STAGES = [
  { key: "ideation", label: "Ideation", color: "var(--stage-ideation)" },
  { key: "wip", label: "Work in progress", color: "var(--stage-wip)" },
  { key: "shipment", label: "Shipment", color: "var(--stage-shipment)" },
  { key: "revenue", label: "Revenue", color: "var(--stage-revenue)" },
];

const REVENUE_LABELS = {
  none: "Nessuna revenue ancora",
  early: "Prime entrate",
  growing: "Revenue in crescita",
};

function stageIndex(key) {
  const i = STAGES.findIndex((s) => s.key === key);
  return i === -1 ? 0 : i;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function renderStepper(currentStage) {
  const currentIdx = stageIndex(currentStage);
  const steps = STAGES.map((stage, i) => {
    let cls = "step";
    if (i < currentIdx) cls += " is-done";
    else if (i === currentIdx) cls += " is-current";
    return `<div class="${cls}" style="--step-color:${stage.color}"></div>`;
  }).join("");

  const labels = STAGES.map((stage, i) => {
    const cls = i === currentIdx ? "is-active" : "";
    return `<span class="${cls}">${stage.label}</span>`;
  }).join("");

  return `
    <div class="stepper">${steps}</div>
    <div class="stage-labels">${labels}</div>
  `;
}

function renderProjectCard(project) {
  const stage = STAGES[stageIndex(project.stage)];
  const links = (project.links || [])
    .map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`)
    .join("");

  const revenue = project.revenue || {};
  const revenueLine =
    project.stage === "revenue"
      ? `<p class="revenue-detail">${escapeHtml(REVENUE_LABELS[revenue.status] || "")}${
          revenue.amount ? ` — ${escapeHtml(revenue.amount)}` : ""
        }${revenue.notes ? ` · ${escapeHtml(revenue.notes)}` : ""}</p>`
      : "";

  return `
    <article class="card" data-stage="${project.stage}">
      <h3 class="card-title">${escapeHtml(project.name)}</h3>
      <p class="card-desc">${escapeHtml(project.description)}</p>
      ${renderStepper(project.stage)}
      ${revenueLine}
      ${project.notes ? `<p class="card-notes">${escapeHtml(project.notes)}</p>` : ""}
      <div class="card-footer">
        <span class="badge" style="--dot-color:${stage.color}">${stage.label}</span>
        <span class="card-updated">${project.updated ? "Aggiornato " + escapeHtml(project.updated) : ""}</span>
      </div>
      ${links ? `<div class="card-links">${links}</div>` : ""}
    </article>
  `;
}

function renderIdeaCard(idea) {
  return `
    <div class="idea-card">
      <h3>${escapeHtml(idea.title)}</h3>
      <p>${escapeHtml(idea.note)}</p>
      <time>${idea.added ? "Aggiunta " + escapeHtml(idea.added) : ""}</time>
    </div>
  `;
}

async function init() {
  const res = await fetch("data.json", { cache: "no-store" });
  const data = await res.json();

  const projectsEl = document.getElementById("projects");
  const ideasEl = document.getElementById("ideas");
  const lastUpdatedEl = document.getElementById("last-updated");

  function renderProjects(filter) {
    const list = data.projects.filter((p) => filter === "all" || p.stage === filter);
    projectsEl.innerHTML = list.length
      ? list.map(renderProjectCard).join("")
      : `<p class="empty-state">Nessun progetto in questo stage.</p>`;
  }

  renderProjects("all");

  ideasEl.innerHTML = (data.ideas || []).length
    ? data.ideas.map(renderIdeaCard).join("")
    : `<p class="empty-state">Il bacino delle idee è vuoto.</p>`;

  if (data.updated) {
    lastUpdatedEl.textContent = `Ultimo aggiornamento dati: ${data.updated}`;
  }

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderProjects(btn.dataset.filter);
    });
  });
}

init();

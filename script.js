const STAGES = [
  { key: "ideation", label: "Ideation", color: "var(--chart-1)" },
  { key: "wip", label: "Work in progress", color: "var(--chart-2)" },
  { key: "shipment", label: "Shipment", color: "var(--chart-3)" },
  { key: "revenue", label: "Revenue", color: "var(--chart-4)" },
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

function renderLinks(links) {
  return (links || [])
    .map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`)
    .join("");
}

function renderRevenueLine(project) {
  if (project.stage !== "revenue") return "";
  const revenue = project.revenue || {};
  return `<p class="revenue-detail">${escapeHtml(REVENUE_LABELS[revenue.status] || "")}${
    revenue.amount ? ` — ${escapeHtml(revenue.amount)}` : ""
  }${revenue.notes ? ` · ${escapeHtml(revenue.notes)}` : ""}</p>`;
}

function renderDeliverables(list) {
  if (!list || !list.length) return "";
  const done = list.filter((d) => d.done).length;
  const items = list
    .map(
      (d) => `
      <li class="deliverable${d.done ? " is-done" : ""}">
        <span class="deliverable-check" aria-hidden="true">${d.done ? "&#10003;" : ""}</span>
        <span>${escapeHtml(d.text)}</span>
      </li>`
    )
    .join("");

  return `
    <div class="dialog-section">
      <h4 class="dialog-label">Deliverable <span class="deliverable-count">${done}/${list.length}</span></h4>
      <ul class="deliverables">${items}</ul>
    </div>
  `;
}

function renderProjectCard(project) {
  const stage = STAGES[stageIndex(project.stage)];

  return `
    <article class="card" data-id="${escapeHtml(project.id)}" tabindex="0" role="button" aria-haspopup="dialog">
      <h3 class="card-title">${escapeHtml(project.name)}</h3>
      <p class="card-desc">${escapeHtml(project.description)}</p>
      ${renderStepper(project.stage)}
      ${renderRevenueLine(project)}
      ${project.notes ? `<p class="card-notes">${escapeHtml(project.notes)}</p>` : ""}
      <div class="card-footer">
        <span class="badge" style="--dot-color:${stage.color}">${stage.label}</span>
        <span class="card-updated">${project.updated ? "Aggiornato " + escapeHtml(project.updated) : ""}</span>
      </div>
      ${project.links && project.links.length ? `<div class="card-links">${renderLinks(project.links)}</div>` : ""}
    </article>
  `;
}

function renderProjectDialog(project) {
  const stage = STAGES[stageIndex(project.stage)];
  const links = renderLinks(project.links);

  return `
    <span class="badge" style="--dot-color:${stage.color}">${stage.label}</span>
    <h2 id="dialog-title" class="dialog-title">${escapeHtml(project.name)}</h2>
    <p class="card-desc">${escapeHtml(project.description)}</p>

    ${renderStepper(project.stage)}

    <div class="dialog-section">
      <h4 class="dialog-label">Stato del progetto</h4>
      <p class="dialog-text">${escapeHtml(project.status || "Nessun dettaglio ancora.")}</p>
    </div>

    <div class="dialog-section">
      <h4 class="dialog-label">Ultimo aggiornamento</h4>
      <p class="dialog-text">
        ${project.updated ? `<strong>${escapeHtml(project.updated)}</strong> — ` : ""}${escapeHtml(project.notes || "—")}
      </p>
    </div>

    ${renderDeliverables(project.deliverables)}
    ${renderRevenueLine(project)}
    ${links ? `<div class="card-links">${links}</div>` : ""}
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
  const dialogOverlay = document.getElementById("project-dialog-overlay");
  const dialogContent = document.getElementById("dialog-content");
  const dialogClose = document.getElementById("dialog-close");

  function renderProjects(filter) {
    const list = data.projects.filter((p) => filter === "all" || p.stage === filter);
    projectsEl.innerHTML = list.length
      ? list.map(renderProjectCard).join("")
      : `<p class="empty-state">Nessun progetto in questo stage.</p>`;
  }

  function openDialog(project) {
    dialogContent.innerHTML = renderProjectDialog(project);
    dialogOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogOverlay.classList.add("is-open"));
    dialogClose.focus();
  }

  function closeDialog() {
    dialogOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => {
      dialogOverlay.hidden = true;
    }, 150);
  }

  function openProjectById(id) {
    const project = data.projects.find((p) => p.id === id);
    if (project) openDialog(project);
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

  projectsEl.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const card = e.target.closest(".card");
    if (card) openProjectById(card.dataset.id);
  });

  projectsEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    openProjectById(card.dataset.id);
  });

  dialogClose.addEventListener("click", closeDialog);
  dialogOverlay.addEventListener("click", (e) => {
    if (e.target === dialogOverlay) closeDialog();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dialogOverlay.hidden) closeDialog();
  });
}

init();

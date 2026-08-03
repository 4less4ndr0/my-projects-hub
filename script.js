const STAGES = [
  { key: "ideation", label: "Ideation", color: "var(--chart-1)" },
  { key: "wip", label: "Work in progress", color: "var(--chart-2)" },
  { key: "shipment", label: "Shipment", color: "var(--chart-3)" },
  { key: "revenue", label: "Revenue", color: "var(--chart-4)" },
];

const INTAKE_QUESTIONS = [
  {
    stage: "ideation",
    questions: [
      {
        q: "Chi è il tuo segmento di mercato iniziale (beachhead) e perché proprio quello?",
        ref: "Market Segmentation, Primary Market Research, Select Beachhead Market, Build End User Profile, TAM for Beachhead Market, Persona Profile for Beachhead Market",
      },
      {
        q: "Qual è il valore critico che risolvi per questo cliente, e in quale momento del suo ciclo di vita lo usa?",
        ref: "Life Cycle Use Case, Quantify Value Proposition, Define the Core",
      },
      {
        q: "Chi è il tuo competitor più vicino e perché il cliente sceglierebbe te?",
        ref: "Your Competitive Position (Competitive Analysis)",
      },
      {
        q: "Quali sono le assunzioni chiave su cui si regge l'idea, e le hai già testate?",
        ref: "Identify Key Assumptions, Test Key Assumptions",
      },
    ],
  },
  {
    stage: "wip",
    questions: [
      {
        q: "Cos'è il tuo MVP, cosa include e a che punto sei nel costruirlo?",
        ref: "Define the MVP, Develop a Product Plan, Product Specification",
      },
      {
        q: "Come il cliente scopre, decide e acquista la tua soluzione?",
        ref: "Determine Customer Decision-Making Unit, Map the Process to Acquire a Paying Customer, Windows of Opportunity and Triggers, Identify Next 10 Customers",
      },
      {
        q: "Come pensi di guadagnare (modello di business, prezzo, LTV vs costo di acquisizione)?",
        ref: "Design Business Model, Set Pricing Framework, Calculate LTV of Acquired Customer, Calculate of CoCA, Design a Scalable Revenue Engine",
      },
    ],
  },
  {
    stage: "shipment",
    questions: [
      {
        q: "Hai una prova concreta che il prodotto funziona — utenti reali che lo usano/pagano?",
        ref: 'Show that "The Dogs Will Eat the Dog Food"',
      },
    ],
  },
  {
    stage: "revenue",
    questions: [
      {
        q: "Qual è il potenziale sui mercati successivi e come pensi di scalare il business?",
        ref: "Calculate TAM for Follow-on Markets, Design a Scalable Revenue Engine",
      },
    ],
  },
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

function overridesKey(projectId) {
  return `projects-hub:deliverables:${projectId}`;
}

function loadOverrides(projectId) {
  try {
    return JSON.parse(localStorage.getItem(overridesKey(projectId))) || {};
  } catch {
    return {};
  }
}

function saveOverride(projectId, text, done) {
  const overrides = loadOverrides(projectId);
  overrides[text] = done;
  localStorage.setItem(overridesKey(projectId), JSON.stringify(overrides));
}

function renderDeliverables(list, projectId) {
  if (!list || !list.length) return "";
  const overrides = loadOverrides(projectId);
  const effectiveDone = list.map((d) => (d.text in overrides ? overrides[d.text] : d.done));
  const done = effectiveDone.filter(Boolean).length;

  const items = list
    .map((d, i) => {
      const isDone = effectiveDone[i];
      return `
      <li class="deliverable${isDone ? " is-done" : ""}" role="checkbox" aria-checked="${isDone}" tabindex="0" data-text="${escapeHtml(d.text)}">
        <span class="deliverable-check" aria-hidden="true">${isDone ? "&#10003;" : ""}</span>
        <span>${escapeHtml(d.text)}</span>
      </li>`;
    })
    .join("");

  return `
    <div class="dialog-section">
      <h4 class="dialog-label">Deliverable <span class="deliverable-count">${done}/${list.length}</span></h4>
      <ul class="deliverables" data-project="${escapeHtml(projectId)}">${items}</ul>
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

    ${renderDeliverables(project.deliverables, project.id)}
    ${renderRevenueLine(project)}
    ${links ? `<div class="card-links">${links}</div>` : ""}
  `;
}

function renderNewProjectDialog() {
  const groups = INTAKE_QUESTIONS.map((group) => {
    const stage = STAGES[stageIndex(group.stage)];
    let counter = 0;
    const items = group.questions
      .map((item) => {
        counter += 1;
        return `
        <li>
          <p class="intake-q">${escapeHtml(item.q)}</p>
          <p class="intake-ref">${escapeHtml(item.ref)}</p>
        </li>`;
      })
      .join("");

    return `
      <div class="dialog-section">
        <h4 class="stage-heading" style="--dot-color:${stage.color}">${stage.label}</h4>
        <ol class="intake-list">${items}</ol>
      </div>
    `;
  }).join("");

  return `
    <h2 id="dialog-title" class="dialog-title">Domande per un nuovo progetto</h2>
    <p class="card-desc">
      Rispondi a queste domande — anche solo a mente o su un foglio — poi passami le risposte in chat:
      le uso per creare la card e per capire in quale stage inserirla.
    </p>
    ${groups}
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
  const addProjectBtn = document.getElementById("add-project-btn");

  function renderProjects(filter) {
    const list = data.projects.filter((p) => filter === "all" || p.stage === filter);
    projectsEl.innerHTML = list.length
      ? list.map(renderProjectCard).join("")
      : `<p class="empty-state">Nessun progetto in questo stage.</p>`;
  }

  function showDialog(html) {
    dialogContent.innerHTML = html;
    dialogOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogOverlay.classList.add("is-open"));
    dialogClose.focus();
  }

  function openDialog(project) {
    showDialog(renderProjectDialog(project));
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

  function toggleDeliverable(li) {
    const list = li.closest(".deliverables");
    const projectId = list.dataset.project;
    const nowDone = !li.classList.contains("is-done");

    saveOverride(projectId, li.dataset.text, nowDone);
    li.classList.toggle("is-done", nowDone);
    li.setAttribute("aria-checked", String(nowDone));
    li.querySelector(".deliverable-check").innerHTML = nowDone ? "&#10003;" : "";

    const total = list.querySelectorAll(".deliverable").length;
    const done = list.querySelectorAll(".deliverable.is-done").length;
    const countEl = list.closest(".dialog-section").querySelector(".deliverable-count");
    if (countEl) countEl.textContent = `${done}/${total}`;
  }

  dialogContent.addEventListener("click", (e) => {
    const li = e.target.closest(".deliverable");
    if (li) toggleDeliverable(li);
  });

  dialogContent.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const li = e.target.closest(".deliverable");
    if (!li) return;
    e.preventDefault();
    toggleDeliverable(li);
  });

  addProjectBtn.addEventListener("click", () => showDialog(renderNewProjectDialog()));

  dialogClose.addEventListener("click", closeDialog);
  dialogOverlay.addEventListener("click", (e) => {
    if (e.target === dialogOverlay) closeDialog();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dialogOverlay.hidden) closeDialog();
  });
}

init();

const STAGES = [
  { key: "ideation", label: "Imbarco", color: "var(--chart-1)" },
  { key: "wip", label: "Decollo", color: "var(--chart-2)" },
  { key: "shipment", label: "Quota di crociera", color: "var(--chart-3)" },
  { key: "revenue", label: "Atterraggio", color: "var(--chart-4)" },
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

const CHEVRON_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const LOCK_SVG =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const EXTERNAL_LINK_SVG =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function stageIndex(key) {
  const i = STAGES.findIndex((s) => s.key === key);
  return i === -1 ? 0 : i;
}

function questionsFor(stageKey) {
  return (INTAKE_QUESTIONS.find((g) => g.stage === stageKey) || {}).questions || [];
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function stripMarkdownToPlainText(text) {
  return (text || "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderInlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  return html;
}

function renderMarkdown(markdown) {
  const lines = (markdown || "").split(/\r?\n/);
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];

  function flushParagraph() {
    if (paragraphLines.length) {
      blocks.push({ type: "p", text: paragraphLines.join(" ") });
      paragraphLines = [];
    }
  }
  function flushList() {
    if (listItems.length) {
      blocks.push({ type: "ul", items: listItems.slice() });
      listItems = [];
    }
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (line === "") {
      flushParagraph();
      flushList();
      return;
    }
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h" + (headingMatch[1].length + 2), text: headingMatch[2] });
      return;
    }
    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1]);
      return;
    }
    flushList();
    paragraphLines.push(line);
  });
  flushParagraph();
  flushList();

  return blocks
    .map((block) => {
      if (block.type === "ul") {
        return `<ul class="idea-note-list">${block.items
          .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
          .join("")}</ul>`;
      }
      if (block.type[0] === "h") {
        return `<${block.type} class="idea-note-heading">${renderInlineMarkdown(block.text)}</${block.type}>`;
      }
      return `<p class="idea-note-p">${renderInlineMarkdown(block.text)}</p>`;
    })
    .join("");
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
    .map(
      (l) =>
        `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}${EXTERNAL_LINK_SVG}</a>`
    )
    .join("");
}

function renderRevenueLine(project) {
  if (project.stage !== "revenue") return "";
  const revenue = project.revenue || {};
  return `<p class="revenue-detail">${escapeHtml(REVENUE_LABELS[revenue.status] || "")}${
    revenue.amount ? ` — ${escapeHtml(revenue.amount)}` : ""
  }${revenue.notes ? ` · ${escapeHtml(revenue.notes)}` : ""}</p>`;
}

function overridesKey(projectId, stageKey) {
  return `projects-hub:deliverables:${projectId}:${stageKey}`;
}

function loadOverrides(projectId, stageKey) {
  try {
    return JSON.parse(localStorage.getItem(overridesKey(projectId, stageKey))) || {};
  } catch {
    return {};
  }
}

function saveOverride(projectId, stageKey, text, done) {
  const overrides = loadOverrides(projectId, stageKey);
  overrides[text] = done;
  localStorage.setItem(overridesKey(projectId, stageKey), JSON.stringify(overrides));
}

function renderDeliverables(list, projectId, stageKey) {
  if (!list || !list.length) return "";
  const overrides = loadOverrides(projectId, stageKey);
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
    <div class="stage-deliverables">
      <h5 class="dialog-label">Checklist <span class="deliverable-count">${done}/${list.length}</span></h5>
      <ul class="deliverables" data-project="${escapeHtml(projectId)}" data-stage="${escapeHtml(stageKey)}">${items}</ul>
    </div>
  `;
}

function renderStageAnswers(stageKey, answers) {
  const questions = questionsFor(stageKey);
  if (!questions.length) return "";

  const items = questions
    .map((item, i) => {
      const answer = answers && answers[i];
      return `
      <div class="qa-item">
        <p class="intake-q">${escapeHtml(item.q)}</p>
        ${
          answer
            ? `<p class="qa-answer">${escapeHtml(answer)}</p>`
            : `<p class="qa-answer qa-empty">Nessuna risposta ancora.</p>`
        }
        <p class="intake-ref">${escapeHtml(item.ref)}</p>
      </div>`;
    })
    .join("");

  return `<div class="qa-list">${items}</div>`;
}

function renderStageQuestionsOnly(stageKey) {
  const questions = questionsFor(stageKey);
  if (!questions.length) return "";

  const items = questions
    .map(
      (item) => `
      <li>
        <p class="intake-q">${escapeHtml(item.q)}</p>
        <p class="intake-ref">${escapeHtml(item.ref)}</p>
      </li>`
    )
    .join("");

  return `<ol class="intake-list intake-list-preview">${items}</ol>`;
}

function renderAccordionSection(project, stageDef) {
  const reached = stageIndex(stageDef.key) <= stageIndex(project.stage);
  const isCurrent = stageDef.key === project.stage;
  const stageData = (project.stages && project.stages[stageDef.key]) || null;

  const lockBadge = !reached ? `<span class="lock-badge">${LOCK_SVG}Prossima tappa</span>` : "";

  const updatedLine =
    reached && stageData && stageData.updated
      ? `<p class="accordion-updated">Check-in ${escapeHtml(stageData.updated)}</p>`
      : "";

  const body = reached
    ? `${updatedLine}${renderStageAnswers(stageDef.key, stageData && stageData.answers)}${
        stageData && stageData.deliverables ? renderDeliverables(stageData.deliverables, project.id, stageDef.key) : ""
      }${stageDef.key === "revenue" ? renderRevenueLine(project) : ""}`
    : renderStageQuestionsOnly(stageDef.key);

  return `
    <div class="accordion-section${isCurrent ? " is-open" : ""}" data-stage="${stageDef.key}">
      <button class="accordion-header" type="button" aria-expanded="${isCurrent ? "true" : "false"}">
        <span class="accordion-header-left">
          <span class="stage-dot" style="--dot-color:${stageDef.color}"></span>
          <span class="accordion-label">${stageDef.label}</span>
          ${lockBadge}
        </span>
        <span class="chevron" aria-hidden="true">${CHEVRON_SVG}</span>
      </button>
      <div class="accordion-body-wrap">
        <div class="accordion-body">
          <div class="accordion-body-inner">${body}</div>
        </div>
      </div>
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
      ${project.summary ? `<p class="card-notes">${escapeHtml(project.summary)}</p>` : ""}
      <div class="card-footer">
        <span class="badge" style="--dot-color:${stage.color}">${stage.label}</span>
        <span class="card-updated">${project.updated ? "Check-in " + escapeHtml(project.updated) : ""}</span>
      </div>
      ${project.links && project.links.length ? `<div class="card-links">${renderLinks(project.links)}</div>` : ""}
    </article>
  `;
}

function renderProjectDialog(project) {
  const stage = STAGES[stageIndex(project.stage)];
  const links = renderLinks(project.links);
  const accordion = STAGES.map((s) => renderAccordionSection(project, s)).join("");

  return `
    <span class="badge" style="--dot-color:${stage.color}">${stage.label}</span>
    <div class="dialog-title-row">
      <h2 id="dialog-title" class="dialog-title">${escapeHtml(project.name)}</h2>
      ${links ? `<div class="card-links">${links}</div>` : ""}
    </div>
    <p class="card-desc">${escapeHtml(project.description)}</p>

    ${renderStepper(project.stage)}

    <div class="accordion">${accordion}</div>
  `;
}

function renderNewProjectDialog() {
  const groups = INTAKE_QUESTIONS.map((group) => {
    const stage = STAGES[stageIndex(group.stage)];
    const items = group.questions
      .map(
        (item) => `
        <li>
          <p class="intake-q">${escapeHtml(item.q)}</p>
          <p class="intake-ref">${escapeHtml(item.ref)}</p>
        </li>`
      )
      .join("");

    return `
      <div class="dialog-section">
        <h4 class="stage-heading" style="--dot-color:${stage.color}">${stage.label}</h4>
        <ol class="intake-list">${items}</ol>
      </div>
    `;
  }).join("");

  return `
    <h2 id="dialog-title" class="dialog-title">Piano di volo</h2>
    <p class="card-desc">
      Rispondi a queste domande — anche solo a mente o su un foglio — poi passami le risposte in chat:
      le uso per creare la card e per capire in quale fase inserirla.
    </p>
    ${groups}
  `;
}

function renderIdeaCard(idea) {
  return `
    <div class="idea-card" data-id="${escapeHtml(idea.id)}" tabindex="0" role="button" aria-haspopup="dialog">
      <h3>${escapeHtml(idea.title)}</h3>
      <p>${escapeHtml(stripMarkdownToPlainText(idea.note))}</p>
      <time>${idea.added ? "Aggiunta " + escapeHtml(idea.added) : ""}</time>
    </div>
  `;
}

function renderIdeaDialog(idea) {
  return `
    <h2 id="dialog-title" class="dialog-title">${escapeHtml(idea.title)}</h2>
    <div class="idea-note">${renderMarkdown(idea.note)}</div>
    <time class="card-updated">${idea.added ? "Aggiunta " + escapeHtml(idea.added) : ""}</time>
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
      : `<p class="empty-state">Nessun volo in questa fase.</p>`;
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

  function openIdeaById(id) {
    const idea = (data.ideas || []).find((i) => i.id === id);
    if (idea) showDialog(renderIdeaDialog(idea));
  }

  renderProjects("all");

  ideasEl.innerHTML = (data.ideas || []).length
    ? data.ideas.map(renderIdeaCard).join("")
    : `<p class="empty-state">L'hangar è vuoto.</p>`;

  if (data.updated) {
    lastUpdatedEl.textContent = `Ultimo controllo torre: ${data.updated}`;
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

  ideasEl.addEventListener("click", (e) => {
    const card = e.target.closest(".idea-card");
    if (card) openIdeaById(card.dataset.id);
  });

  ideasEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".idea-card");
    if (!card) return;
    e.preventDefault();
    openIdeaById(card.dataset.id);
  });

  function toggleDeliverable(li) {
    const list = li.closest(".deliverables");
    const projectId = list.dataset.project;
    const stageKey = list.dataset.stage;
    const nowDone = !li.classList.contains("is-done");

    saveOverride(projectId, stageKey, li.dataset.text, nowDone);
    li.classList.toggle("is-done", nowDone);
    li.setAttribute("aria-checked", String(nowDone));
    li.querySelector(".deliverable-check").innerHTML = nowDone ? "&#10003;" : "";

    const total = list.querySelectorAll(".deliverable").length;
    const done = list.querySelectorAll(".deliverable.is-done").length;
    const countEl = list.closest(".stage-deliverables").querySelector(".deliverable-count");
    if (countEl) countEl.textContent = `${done}/${total}`;
  }

  function toggleAccordion(header) {
    const section = header.closest(".accordion-section");
    const nowOpen = !section.classList.contains("is-open");
    section.classList.toggle("is-open", nowOpen);
    header.setAttribute("aria-expanded", String(nowOpen));
  }

  dialogContent.addEventListener("click", (e) => {
    const li = e.target.closest(".deliverable");
    if (li) {
      toggleDeliverable(li);
      return;
    }
    const header = e.target.closest(".accordion-header");
    if (header) toggleAccordion(header);
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

const alanAssistantEndpoint =
  "https://alan-knowles-website-assistant.alan-knowles-ai.workers.dev/api/chat";

const libraryItems = [
  { id: "meeting-minutes", name: "Meeting Minutes Assistant", type: "Sample workflow · Transformation", featured: true, description: "Turns rough notes into consistent minutes with decisions, action items, owners, and unresolved questions.", input: "Rough meeting notes or a transcript", support: "Organize minutes and extract decisions", review: "Confirm accuracy, owners, and deadlines", owner: "Operations", version: "2.3", placeholder: "Example: Budget approved at $12,000. Priya will contact the venue by Friday. The team still needs a decision on catering...", response: "Draft minutes created. I organized the discussion into Decisions, Action Items, and Open Questions. Human check: confirm that Priya owns the venue task, verify Friday's date, and decide whether the catering question should be assigned before distribution." },
  { id: "sop-guide", name: "SOP Guide", type: "Sample workflow · Source-grounded agent", featured: true, description: "Answers employee questions using approved internal procedures and points users to the governing source.", input: "An employee question", support: "Retrieve and explain approved procedure", review: "Check the cited SOP before acting", owner: "People Operations", version: "1.8", placeholder: "Example: What steps do I follow to request approval for travel over $1,500?", response: "Based on the sample Travel Approval SOP, requests over $1,500 require a cost estimate, supervisor approval, and Finance review before booking. Human check: open section 4.2 of the current SOP and confirm that no department-specific rule applies." },
  { id: "quality-checker", name: "Document Quality Checker", type: "Sample workflow · Review", featured: true, description: "Checks an internal document for clarity, completeness, accessibility, terminology, and template requirements.", input: "A draft internal document", support: "Run the approved quality checklist", review: "Accept or reject each suggested change", owner: "Communications", version: "2.1", placeholder: "Example: Paste a short memo, report introduction, or procedural step for review...", response: "Quality review complete. I found one undefined acronym, two passive constructions that obscure responsibility, and a missing next-step date. No unsupported factual claims were detected in this sample. Human check: decide whether the acronym is familiar to the intended internal audience." },
  { id: "email-drafter", name: "Audience-Aware Email Drafter", type: "Workflow preview · Drafting", featured: false, description: "Creates distinct internal and external email versions from one employee-authored outline.", input: "Outline, audiences, and required facts", support: "Draft two audience-specific versions", review: "Verify tone, facts, and commitments", owner: "Communications", version: "1.6" },
  { id: "subject-agent", name: "Subject-Matter Agent", type: "Workflow preview · Knowledge", featured: false, description: "Provides source-grounded guidance on a specialized topic using approved organizational materials.", input: "Question and relevant context", support: "Retrieve, synthesize, and cite sources", review: "Verify sources and apply expert judgment", owner: "Knowledge Team", version: "1.4" },
  { id: "action-items", name: "Action Item Extractor", type: "Workflow preview · Summarization", featured: false, description: "Converts notes or updates into assigned tasks, deadlines, dependencies, and follow-up questions.", input: "Notes, transcript, or project update", support: "Identify tasks and missing ownership", review: "Confirm commitments with participants", owner: "Project Office", version: "2.0" },
  { id: "onboarding-guide", name: "Employee Onboarding Guide", type: "Workflow preview · Knowledge", featured: false, description: "Answers source-grounded questions about procedures, systems, responsibilities, and organizational terminology.", input: "New employee question", support: "Explain and link approved guidance", review: "Escalate exceptions to the right person", owner: "People Operations", version: "1.9" },
  { id: "knowledge-capture", name: "Knowledge Capture Assistant", type: "Workflow preview · Documentation", featured: false, description: "Turns an experienced employee’s notes into draft SOPs, FAQs, and reusable institutional knowledge.", input: "Expert notes or process explanation", support: "Structure a draft knowledge asset", review: "Subject-matter expert validates every step", owner: "Knowledge Team", version: "1.3" },
];

const state = {
  selectedItem: null,
  conversations: {},
  libraryRole: "employee",
};

document.addEventListener("DOMContentLoaded", () => {
  setFooterYear();
  initNavigation();
  initTheme();
  initContactForm();
  initTeachingExperience();
  initLibrary();
  initFloatingChat();
});

function setFooterYear() {
  const year = document.querySelector("#year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#primary-menu");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      menu.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function initTheme() {
  const toggle = document.querySelector(".theme-toggle");
  const storedTheme = readStorage("alan-theme");

  if (storedTheme) {
    document.documentElement.dataset.theme = storedTheme;
  }

  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    writeStorage("alan-theme", nextTheme);
  });
}

function initContactForm() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");

  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const purpose = String(formData.get("purpose") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const recipient = "knowles.alanm@gmail.com";
    const subject = encodeURIComponent(
      `${purpose || "Website inquiry"} from ${name || "Alan Knowles site visitor"}`
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPurpose: ${purpose}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    status.textContent = `Opening your email app to send this message to ${recipient}.`;
    form.reset();
  });
}

function initTeachingExperience() {
  const buttons = document.querySelectorAll(".teaching-button");
  const bubble = document.querySelector("#teaching-description");
  const title = document.querySelector("#teaching-description-title");
  const text = document.querySelector("#teaching-description-text");

  if (!buttons.length || !bubble || !title || !text) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const isActive = button.classList.contains("is-active");

      buttons.forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-expanded", "false");
      });

      if (isActive && !bubble.hidden) {
        bubble.hidden = true;
        return;
      }

      button.classList.add("is-active");
      button.setAttribute("aria-expanded", "true");
      title.textContent = button.dataset.title || button.textContent.trim();
      text.textContent = button.dataset.description || "";
      bubble.hidden = false;
    });
  });
}

function initLibrary() {
  const featuredList = document.querySelector("#featured-list");
  const previewList = document.querySelector("#preview-list");

  if (!featuredList || !previewList) {
    return;
  }

  renderLibraryList(featuredList, libraryItems.filter((item) => item.featured));
  renderLibraryList(previewList, libraryItems.filter((item) => !item.featured));
  selectLibraryItem(libraryItems[0].id);

  document.querySelectorAll("[data-library-role]").forEach((button) => {
    button.addEventListener("click", () => setLibraryRole(button.dataset.libraryRole));
  });
}

function renderLibraryList(container, items) {
  container.innerHTML = "";

  items.forEach((item) => {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.className = "library-item";
    button.type = "button";
    button.textContent = item.name;
    button.dataset.itemId = item.id;
    button.setAttribute("aria-label", `Select ${item.name}`);
    button.addEventListener("click", () => selectLibraryItem(item.id));
    listItem.append(button);
    container.append(listItem);
  });
}

function selectLibraryItem(itemId) {
  const item = findLibraryItem(itemId);

  if (!item) {
    return;
  }

  state.selectedItem = item;

  document.querySelector("#selected-type").textContent = item.type;
  document.querySelector("#selected-title").textContent = item.name;
  document.querySelector("#selected-description").textContent = item.description;
  document.querySelector("#tool-input").textContent = item.input;
  document.querySelector("#tool-support").textContent = item.support;
  document.querySelector("#tool-review").textContent = item.review;
  const sampleInput = document.querySelector("#sample-input");
  const sampleOutput = document.querySelector("#sample-output");
  const sampleDemo = document.querySelector("#sample-demonstration");
  const note = document.querySelector("#tool-note");
  sampleDemo.classList.toggle("is-preview", !item.featured);
  sampleInput.textContent = item.featured
    ? item.placeholder.replace(/^Example:\s*/, "")
    : `A typical employee would provide: ${item.input.toLowerCase()}.`;
  sampleOutput.textContent = item.featured
    ? item.response
    : `This concept would use approved organizational instructions and sources to ${item.support.toLowerCase()}, followed by this required human checkpoint: ${item.review.toLowerCase()}.`;
  note.textContent = item.featured
    ? "Illustrative only—this website does not send information to an AI model. Employees would review and approve generated work in an implemented library."
    : "Concept preview only. A custom implementation would be configured around the organization’s own process, content, and safeguards.";

  document.querySelectorAll(".library-item").forEach((button) => {
    const isActive = button.dataset.itemId === item.id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

}

function findLibraryItem(itemId) {
  return libraryItems.find((item) => item.id === itemId);
}

function setLibraryRole(role) {
  state.libraryRole = role;
  const isManager = role === "manager";
  document.querySelector("#manager-overview").hidden = !isManager;
  document.querySelectorAll("[data-library-role]").forEach((button) => {
    const active = button.dataset.libraryRole === role;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function handleChatSubmit(event) {
  event.preventDefault();

  const input = document.querySelector("#user-input");
  const value = input.value.trim();

  if (!value || !state.selectedItem) {
    return;
  }

  const conversation = state.conversations[state.selectedItem.id];
  conversation.push({ role: "user", text: value });
  input.value = "";
  renderChat();
  showTypingIndicator();

  window.setTimeout(() => {
    removeTypingIndicator();
    conversation.push({
      role: "ai",
      text: createSimulatedResponse(state.selectedItem, value),
    });
    saveConversations();
    renderChat();
  }, 650);
}

function createSimulatedResponse(item, userInput) {
  const excerpt = userInput.replace(/\s+/g, " ").slice(0, 120);
  return `${item.response} Input received: “${excerpt}${userInput.length > 120 ? "…" : ""}”`;
}

function renderChat() {
  const chatWindow = document.querySelector("#chat-window");

  if (!chatWindow || !state.selectedItem) {
    return;
  }

  const conversation = state.conversations[state.selectedItem.id] || [];
  chatWindow.innerHTML = "";

  conversation.forEach((message) => {
    chatWindow.append(createMessageElement(message));
  });

  chatWindow.scrollTop = chatWindow.scrollHeight;
  saveConversations();
}

function createMessageElement(message) {
  const wrapper = document.createElement("article");
  const label = message.role === "user" ? "You" : "AI";

  wrapper.className = `message message-${message.role}`;
  wrapper.setAttribute("aria-label", `${label} message`);
  wrapper.innerHTML = `<small>${label}</small><p></p>`;
  wrapper.querySelector("p").textContent = message.text;

  return wrapper;
}

function showTypingIndicator() {
  const chatWindow = document.querySelector("#chat-window");

  if (!chatWindow) {
    return;
  }

  const typing = document.createElement("article");
  typing.className = "message message-ai";
  typing.id = "typing-indicator";
  typing.setAttribute("aria-label", "AI is typing");
  typing.innerHTML =
    '<small>AI</small><div class="typing" aria-hidden="true"><span></span><span></span><span></span></div>';
  chatWindow.append(typing);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
  document.querySelector("#typing-indicator")?.remove();
}

function loadConversations() {
  const stored = readStorage("alan-library-conversations");

  if (!stored) {
    return;
  }

  try {
    state.conversations = JSON.parse(stored);
  } catch {
    state.conversations = {};
  }
}

function saveConversations() {
  writeStorage(
    "alan-library-conversations",
    JSON.stringify(state.conversations)
  );
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The site still works without persistence when storage is unavailable.
  }
}

function initFloatingChat() {
  const widget = document.createElement("aside");
  widget.className = "floating-chat";
  widget.setAttribute("aria-label", "Ask about Alan Knowles");
  widget.innerHTML = `
    <button
      class="floating-chat-toggle"
      type="button"
      aria-label="Open Alan Knowles chat assistant"
      aria-expanded="false"
      aria-controls="floating-chat-panel"
    >
      <svg
        class="floating-chat-icon"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
        <path d="M8 9h8"></path>
        <path d="M8 13h5"></path>
      </svg>
      <span class="floating-chat-toggle-text">Ask me About Alan!</span>
    </button>
    <section
      class="floating-chat-panel"
      id="floating-chat-panel"
      aria-labelledby="floating-chat-title"
      hidden
    >
      <header class="floating-chat-header">
        <div>
          <p class="eyebrow">Alan's AI Assistant</p>
          <h2 id="floating-chat-title">Ask About Alan</h2>
        </div>
        <button class="floating-chat-close" type="button" aria-label="Close chat">
          ×
        </button>
      </header>
      <p class="floating-chat-intro">
        I’m an AI assistant for Alan Knowles. Ask about his professional work,
        publications, current projects, and areas of expertise.
      </p>
      <div
        class="floating-chat-log"
        id="floating-chat-log"
        role="log"
        tabindex="0"
        aria-live="polite"
        aria-label="Alan assistant conversation"
      ></div>
      <form class="floating-chat-form" id="floating-chat-form">
        <label for="floating-chat-input">Question</label>
        <div class="floating-chat-row">
          <textarea
            id="floating-chat-input"
            name="floating-chat-input"
            rows="2"
            placeholder="Ask about Alan’s work..."
            maxlength="1200"
            required
          ></textarea>
          <button class="button button-primary" type="submit">Send</button>
        </div>
      </form>
      <p class="floating-chat-privacy">
        Conversations are not saved. Do not submit confidential or personal information.
      </p>
    </section>
  `;

  document.body.append(widget);

  const toggle = widget.querySelector(".floating-chat-toggle");
  const panel = widget.querySelector(".floating-chat-panel");
  const close = widget.querySelector(".floating-chat-close");
  const form = widget.querySelector(".floating-chat-form");
  const input = widget.querySelector("#floating-chat-input");
  const log = widget.querySelector("#floating-chat-log");
  const messages = [];
  let panelTouchY = null;

  if (!messages.length) {
    messages.push({
      role: "ai",
      text: "Hello. What would you like to know about Alan’s work?",
    });
  }

  renderFloatingMessages(log, messages);

  panel.addEventListener(
    "wheel",
    (event) => {
      if (log.scrollHeight <= log.clientHeight) return;
      event.preventDefault();
      log.scrollTop += event.deltaY;
    },
    { passive: false }
  );

  panel.addEventListener(
    "touchstart",
    (event) => {
      panelTouchY = event.touches[0]?.clientY ?? null;
    },
    { passive: true }
  );

  panel.addEventListener(
    "touchmove",
    (event) => {
      if (
        panelTouchY === null ||
        log.scrollHeight <= log.clientHeight ||
        event.target.closest?.("textarea, input, button")
      ) {
        return;
      }
      const nextY = event.touches[0]?.clientY;
      if (typeof nextY !== "number") return;
      event.preventDefault();
      log.scrollTop += panelTouchY - nextY;
      panelTouchY = nextY;
    },
    { passive: false }
  );

  panel.addEventListener("touchend", () => {
    panelTouchY = null;
  });

  toggle.addEventListener("click", () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    toggle.setAttribute("aria-expanded", String(willOpen));

    if (willOpen) {
      input.focus();
      log.scrollTop = log.scrollHeight;
    }
  });

  close.addEventListener("click", () => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = input.value.trim();

    if (!value) {
      return;
    }

    messages.push({ role: "user", text: value });
    input.value = "";
    input.disabled = true;
    form.querySelector("button").disabled = true;
    renderFloatingMessages(log, messages);
    showFloatingTyping(log);

    try {
      const response = await fetch(alanAssistantEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: messages.slice(-8).map((message) => ({
            role: message.role === "ai" ? "assistant" : message.role,
            content: message.text,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      removeFloatingTyping(log);
      messages.push({ role: "ai", text: data.message });
      renderFloatingMessages(log, messages);
    } catch {
      removeFloatingTyping(log);
      messages.push({
        role: "ai",
        text: "The assistant is temporarily unavailable. Please try again later.",
      });
      renderFloatingMessages(log, messages);
    } finally {
      input.disabled = false;
      form.querySelector("button").disabled = false;
      input.focus();
    }
  });
}

function renderFloatingMessages(log, messages) {
  log.innerHTML = "";

  messages.forEach((message) => {
    const item = document.createElement("article");
    const label = message.role === "user" ? "You" : "Alan AI";
    item.className = `floating-message floating-message-${message.role}`;
    item.setAttribute("aria-label", `${label} message`);
    item.innerHTML = `<small>${label}</small><p></p>`;
    item.querySelector("p").textContent = message.text;
    log.append(item);
  });

  log.scrollTop = log.scrollHeight;
}

function showFloatingTyping(log) {
  const typing = document.createElement("article");
  typing.className = "floating-message floating-message-ai";
  typing.dataset.typing = "true";
  typing.setAttribute("aria-label", "Alan AI is typing");
  typing.innerHTML =
    '<small>Alan AI</small><div class="typing" aria-hidden="true"><span></span><span></span><span></span></div>';
  log.append(typing);
  log.scrollTop = log.scrollHeight;
}

function removeFloatingTyping(log) {
  log.querySelector("[data-typing='true']")?.remove();
}

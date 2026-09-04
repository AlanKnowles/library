const alanChatKitConfig = {
  apiKey: "PASTE_YOUR_OPENAI_API_KEY_HERE",
  agentWorkflowId: "PASTE_YOUR_AGENT_WORKFLOW_ID_HERE",
  chatKitSessionEndpoint: "",
  // Production note: do not expose an OpenAI API key in browser code.
  // Use a backend endpoint to create ChatKit sessions and return a client secret.
};

const libraryItems = {
  prompts: [
    {
      id: "executive-brief-builder",
      name: "Executive Brief Builder",
      type: "Few-Shot Prompt",
      description:
        "Turns detailed project updates into concise, decision-ready briefs for executives and stakeholders.",
      systemPrompt:
        "You convert operational updates into accurate executive briefs. Preserve key facts, surface decisions and risks, and never invent missing details.",
      examples: [
        "Turn these weekly project notes into a one-page leadership brief.",
        "Summarize the decision, business impact, risks, and next steps.",
      ],
    },
    {
      id: "policy-to-procedure",
      name: "Policy-to-Procedure Converter",
      type: "Few-Shot Prompt",
      description:
        "Converts dense company policies into clear, role-specific procedures and employee checklists.",
      systemPrompt:
        "You translate approved organizational policies into plain-language procedures without changing requirements. Flag ambiguity for human review.",
      examples: [
        "Create a checklist for managers onboarding a new employee.",
        "Turn this travel policy into steps for submitting an expense report.",
      ],
    },
    {
      id: "brand-voice-editor",
      name: "Brand Voice Editor",
      type: "Few-Shot Prompt",
      description:
        "Revises customer-facing copy against an organization’s approved voice, terminology, and style examples.",
      systemPrompt:
        "You edit business copy to match the supplied brand guide. Explain important changes and preserve claims that require legal or subject-matter review.",
      examples: [
        "Revise this product announcement to match our brand voice.",
        "Flag wording that conflicts with our terminology guide.",
      ],
    },
  ],
  agents: [
    {
      id: "customer-support-agent",
      name: "Customer Support Knowledge Agent",
      type: "AI Agent",
      description:
        "Drafts consistent support responses grounded in approved product documentation and escalation policies.",
      systemPrompt:
        "You assist support staff using approved internal knowledge. Cite the relevant guidance, ask for missing context, and escalate rather than speculate.",
    },
    {
      id: "proposal-agent",
      name: "Proposal Development Agent",
      type: "AI Agent",
      description:
        "Helps teams assemble tailored proposals from approved capabilities, case studies, and requirements.",
      systemPrompt:
        "You develop proposal drafts from supplied source material. Map content to requirements, identify evidence gaps, and never invent credentials or outcomes.",
    },
    {
      id: "operations-analyst",
      name: "Operations Insight Agent",
      type: "AI Agent",
      description:
        "Reviews internal reports and meeting notes to identify recurring issues, owners, and follow-up actions.",
      systemPrompt:
        "You analyze authorized operational documents, distinguish evidence from inference, and present patterns, owners, risks, and next actions for human review.",
    },
  ],
};

const state = {
  selectedItem: null,
  conversations: {},
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
  const promptList = document.querySelector("#prompt-list");
  const agentList = document.querySelector("#agent-list");
  const chatForm = document.querySelector("#chat-form");

  if (!promptList || !agentList || !chatForm) {
    return;
  }

  loadConversations();
  renderLibraryList(promptList, libraryItems.prompts);
  renderLibraryList(agentList, libraryItems.agents);
  selectLibraryItem(libraryItems.prompts[0].id);

  chatForm.addEventListener("submit", handleChatSubmit);
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
  state.conversations[item.id] ||= [
    {
      role: "ai",
      text: `You selected ${item.name}. Share a draft, question, or goal, and I will respond using this tool's workflow.`,
    },
  ];

  document.querySelector("#selected-type").textContent = item.type;
  document.querySelector("#selected-title").textContent = item.name;
  document.querySelector("#selected-description").textContent = item.description;

  document.querySelectorAll(".library-item").forEach((button) => {
    const isActive = button.dataset.itemId === item.id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderChat();
}

function findLibraryItem(itemId) {
  return [...libraryItems.prompts, ...libraryItems.agents].find(
    (item) => item.id === itemId
  );
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
  const trimmedInput = userInput.replace(/\s+/g, " ");
  const promptLead = item.systemPrompt.split(".")[0];

  if (item.type === "Few-Shot Prompt") {
    return `${promptLead}. Based on your message, I would first clarify the audience, then revise this core idea: “${trimmedInput}”. Next step: choose one paragraph or claim to test against the ${item.name} workflow.`;
  }

  return `${promptLead}. I hear this working goal: “${trimmedInput}”. I recommend documenting the human decision point, the AI assistance requested, and the revision standard you will use before moving forward.`;
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
          <p class="eyebrow">Alan AI Assistant</p>
          <h2 id="floating-chat-title">Ask About Alan</h2>
        </div>
        <button class="floating-chat-close" type="button" aria-label="Close chat">
          ×
        </button>
      </header>
      <p class="floating-chat-intro">
        Ask questions about Alan’s CV, publications, current projects, and
        professional activities before contacting him about consulting or
        collaboration opportunities.
      </p>
      <div
        class="floating-chat-log"
        id="floating-chat-log"
        role="log"
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
            required
          ></textarea>
          <button class="button button-primary" type="submit">Send</button>
        </div>
      </form>
    </section>
  `;

  document.body.append(widget);

  const toggle = widget.querySelector(".floating-chat-toggle");
  const panel = widget.querySelector(".floating-chat-panel");
  const close = widget.querySelector(".floating-chat-close");
  const form = widget.querySelector(".floating-chat-form");
  const input = widget.querySelector("#floating-chat-input");
  const log = widget.querySelector("#floating-chat-log");
  const messages = loadFloatingChatMessages();

  if (!messages.length) {
    messages.push({
      role: "ai",
      text: "Hello. I can help visitors learn about Alan’s teaching, publications, AI writing work, and collaboration interests. This preview uses a simulated response until the ChatKit workflow is connected.",
    });
  }

  renderFloatingMessages(log, messages);

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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();

    if (!value) {
      return;
    }

    messages.push({ role: "user", text: value });
    input.value = "";
    renderFloatingMessages(log, messages);
    showFloatingTyping(log);

    window.setTimeout(() => {
      removeFloatingTyping(log);
      messages.push({ role: "ai", text: createAlanAssistantResponse(value) });
      saveFloatingChatMessages(messages);
      renderFloatingMessages(log, messages);
    }, 650);
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
  saveFloatingChatMessages(messages);
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

function createAlanAssistantResponse(userInput) {
  const cleanInput = userInput.replace(/\s+/g, " ");
  const chatKitReady =
    alanChatKitConfig.agentWorkflowId !== "PASTE_YOUR_AGENT_WORKFLOW_ID_HERE";

  if (chatKitReady && alanChatKitConfig.chatKitSessionEndpoint) {
    return "The ChatKit workflow placeholders are configured. Replace this simulated response with a call to your backend session endpoint when you are ready to connect the live assistant.";
  }

  return `Preview response: you asked about “${cleanInput}.” Alan’s assistant will eventually answer using his CV, publications, current projects, and professional activity documents. For now, this demo can suggest whether your question sounds like a consulting, speaking, teaching, or scholarly collaboration inquiry.`;
}

function loadFloatingChatMessages() {
  const stored = readStorage("alan-floating-chat-history");

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveFloatingChatMessages(messages) {
  writeStorage("alan-floating-chat-history", JSON.stringify(messages));
}

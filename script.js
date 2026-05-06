const libraryItems = {
  prompts: [
    {
      id: "revision-lens",
      name: "Revision Lens",
      type: "Few-Shot Prompt",
      description:
        "Reviews a draft for clarity, audience fit, structure, and accountable AI-assisted revision choices.",
      systemPrompt:
        "You are a technical writing revision coach. Provide concise, prioritized feedback with examples and explain the rhetorical purpose of each suggestion.",
      examples: [
        "Identify the top three clarity issues in this draft.",
        "Rewrite one paragraph for a first-year engineering audience.",
      ],
    },
    {
      id: "methods-translator",
      name: "Methods Translator",
      type: "Few-Shot Prompt",
      description:
        "Turns dense research methods into clear procedural language for reports, proposals, and documentation.",
      systemPrompt:
        "You translate research methods into precise, plain-language procedures while preserving technical accuracy and limitations.",
      examples: [
        "Convert this methods section into numbered steps.",
        "Explain the limitations in accessible language.",
      ],
    },
    {
      id: "rubric-mapper",
      name: "Rubric Mapper",
      type: "Few-Shot Prompt",
      description:
        "Maps assignment criteria to concrete revision actions students can complete before submission.",
      systemPrompt:
        "You connect rubric language to actionable writing tasks, preserving the instructor's criteria and avoiding generic advice.",
      examples: [
        "Turn this rubric into a revision checklist.",
        "Show where my draft meets or misses each criterion.",
      ],
    },
  ],
  agents: [
    {
      id: "ai-writing-coach",
      name: "AI Writing Coach",
      type: "AI Agent",
      description:
        "Guides writers through planning, drafting, revising, and reflecting on AI-supported writing decisions.",
      systemPrompt:
        "You are a patient academic writing coach. Ask one useful question when needed, then give specific next steps and rationale.",
    },
    {
      id: "source-integrity-agent",
      name: "Source Integrity Agent",
      type: "AI Agent",
      description:
        "Helps evaluate citation use, source attribution, quotation handling, and responsible evidence integration.",
      systemPrompt:
        "You are a source integrity assistant. Focus on attribution, evidence quality, citation clarity, and places where claims need support.",
    },
    {
      id: "workflow-designer",
      name: "Workflow Designer",
      type: "AI Agent",
      description:
        "Builds transparent human-in-the-loop writing workflows for classrooms, research teams, and documentation projects.",
      systemPrompt:
        "You design practical AI writing workflows with clear human checkpoints, revision stages, and documentation practices.",
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
  initLibrary();
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

    status.textContent = `Thank you, ${name || "there"}. Your message has been prepared for Alan.`;
    form.reset();
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
}      description:
        "Organizes notes, themes, and source patterns into clearer research insights.",
      welcome:
        "Share your notes or source summaries, and I will help identify themes, tensions, and opportunities for synthesis."
    },
    {
      id: "revision-partner",
      category: "AI Agent",
      name: "Revision Partner",
      description:
        "Supports iterative drafting with targeted feedback focused on clarity, structure, and next steps.",
      welcome:
        "Start by sharing what stage your draft is in, and I will help you prioritize revisions without overwhelming the process."
    }
  ]
};

const promptList = document.querySelector("#prompt-list");
const agentList = document.querySelector("#agent-list");
const selectionName = document.querySelector("#selection-name");
const selectionDescription = document.querySelector("#selection-description");
const chatMessages = document.querySelector("#chat-messages");
const chatForm = document.querySelector("#chat-form");
const userInput = document.querySelector("#user-input");

let currentItem = libraryItems.prompts[0];
let conversation = [];

function createLibraryButton(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "library-button";
  button.textContent = item.name;
  button.dataset.itemId = item.id;
  button.addEventListener("click", () => selectItem(item));
  return button;
}

function renderLibraryLists() {
  libraryItems.prompts.forEach((item) => {
    promptList.appendChild(createLibraryButton(item));
  });

  libraryItems.agents.forEach((item) => {
    agentList.appendChild(createLibraryButton(item));
  });
}

function updateActiveState() {
  document.querySelectorAll(".library-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.itemId === currentItem.id);
  });
}

function renderMessages() {
  chatMessages.innerHTML = "";

  conversation.forEach((entry) => {
    const bubble = document.createElement("article");
    bubble.className = `message ${entry.role}`;
    bubble.textContent = entry.content;
    chatMessages.appendChild(bubble);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function buildResponse(message) {
  const intros = {
    "Few Shot Prompt":
      "Here is a sample response shaped by the selected few shot prompt.",
    "AI Agent":
      "Here is a sample response from the selected AI agent."
  };

  return [
    intros[currentItem.category],
    `${currentItem.name} would focus on: ${currentItem.description}`,
    `Your message: "${message}"`,
    "Suggested next step: continue the exchange with a draft, question, or assignment context to develop a richer conversation."
  ].join("\n\n");
}

function resetConversation() {
  conversation = [
    {
      role: "assistant",
      content: `${currentItem.category}: ${currentItem.name}\n\n${currentItem.welcome}`
    }
  ];
  renderMessages();
}

function selectItem(item) {
  currentItem = item;
  selectionName.textContent = item.name;
  selectionDescription.textContent = item.description;
  updateActiveState();
  resetConversation();
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) {
    return;
  }

  conversation.push({
    role: "user",
    content: message
  });

  conversation.push({
    role: "assistant",
    content: buildResponse(message)
  });

  renderMessages();
  chatForm.reset();
  userInput.focus();
});

renderLibraryLists();
selectItem(currentItem);

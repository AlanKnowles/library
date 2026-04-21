const libraryItems = {
  prompts: [
    {
      id: "argument-refiner",
      category: "Few Shot Prompt",
      name: "Argument Refiner",
      description:
        "Helps students strengthen claims, evidence, and transitions in persuasive writing.",
      welcome:
        "Share a paragraph or argument, and I will help refine the logic, structure, and supporting evidence while preserving your voice."
    },
    {
      id: "tone-adapter",
      category: "Few Shot Prompt",
      name: "Tone Adapter",
      description:
        "Reframes technical writing for new audiences without losing accuracy or clarity.",
      welcome:
        "Paste a draft and tell me who the audience is. I can reshape the tone for students, executives, or public readers."
    },
    {
      id: "peer-review-coach",
      category: "Few Shot Prompt",
      name: "Peer Review Coach",
      description:
        "Models constructive feedback patterns that support revision and collaborative critique.",
      welcome:
        "Send me a draft or discussion post, and I will respond with thoughtful peer review comments and revision guidance."
    },
    {
      id: "citation-guide",
      category: "Few Shot Prompt",
      name: "Citation Guide",
      description:
        "Explains how to integrate sources, signal quotations, and document evidence responsibly.",
      welcome:
        "Ask about source use, attribution, or citation choices, and I will walk through a practical, classroom-ready response."
    }
  ],
  agents: [
    {
      id: "workflow-designer",
      category: "AI Agent",
      name: "Workflow Designer",
      description:
        "Builds step-by-step AI collaboration plans for research, drafting, and revision.",
      welcome:
        "Describe your assignment or project, and I will map out a repeatable AI-assisted writing workflow with checkpoints and safeguards."
    },
    {
      id: "lesson-lab",
      category: "AI Agent",
      name: "Lesson Lab",
      description:
        "Generates classroom activities that teach effective and ethical AI writing practices.",
      welcome:
        "Tell me the course level and learning goal, and I will propose an activity, outcomes, and discussion prompts."
    },
    {
      id: "research-synthesizer",
      category: "AI Agent",
      name: "Research Synthesizer",
      description:
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
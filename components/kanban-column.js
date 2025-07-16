import "./kanban-card.js";

class KanbanColumn extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.initialized = false;
  }

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    this.title = this.getAttribute("title");
    this.storageKey = `kanban-${this.title}`;
    this.cards = JSON.parse(localStorage.getItem(this.storageKey) || "[]");

    const style = document.createElement("style");
    style.textContent = `
      .column-wrapper {
        background: #fff;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        width: 300px;
        display: flex;
        flex-direction: column;
        max-height: 100%;
        transition: background 0.2s ease;
      }

      .column-wrapper.drag-over {
        outline: 2px dashed #339af0;
        background-color: #e3f2fd;
      }

      h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #333;
      }

      .cards {
        flex-grow: 1;
        overflow-y: auto;
        margin: 1rem 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .input-row {
        display: flex;
        gap: 0.5rem;
        margin-top: auto;
      }

      input[type="text"] {
        flex-grow: 1;
        padding: 0.4rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 0.95rem;
      }

      button {
        padding: 0.4rem 0.75rem;
        font-size: 0.95rem;
        border: none;
        border-radius: 4px;
        background-color: #339af0;
        color: white;
        cursor: pointer;
      }

      button:hover {
        background-color: #1c7ed6;
      }
    `;

    const wrapper = document.createElement("div");
    wrapper.className = "column-wrapper";
    wrapper.ondragover = (e) => e.preventDefault();
    wrapper.ondragenter = () => wrapper.classList.add("drag-over");
    wrapper.ondragleave = () => wrapper.classList.remove("drag-over");
    wrapper.ondrop = this.handleDrop.bind(this);

    const titleEl = document.createElement("h3");
    titleEl.textContent = this.title;

    this.list = document.createElement("div");
    this.list.className = "cards";

    const inputRow = document.createElement("div");
    inputRow.className = "input-row";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "New card";

    const button = document.createElement("button");
    button.textContent = "Add";
    button.onclick = () => {
      if (input.value.trim()) {
        this.addCard(input.value.trim());
        input.value = "";
      }
    };

    inputRow.append(input, button);
    wrapper.append(titleEl, this.list, inputRow);
    this.shadowRoot.append(style, wrapper);

    this.renderCards();
  }

  addCard(text) {
    if (!this.cards.includes(text)) {
      this.cards.push(text);
      this.save();
      this.renderCards();
    }
  }

  removeCard(text) {
    this.cards = this.cards.filter((t) => t !== text);
    this.save();
    this.renderCards();
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cards));
  }

  renderCards() {
    this.list.innerHTML = "";
    this.cards.forEach((text) => {
      const card = document.createElement("kanban-card");
      card.setAttribute("text", text);
      card.setAttribute("column", this.title);
      card.addEventListener("card-delete", (e) => {
        this.removeCard(e.detail.text);
      });
      this.list.appendChild(card);
    });
  }

  handleDrop(e) {
    const text = e.dataTransfer.getData("text/plain");
    const source = e.dataTransfer.getData("source-column");
    if (source !== this.title) {
      this.dispatchEvent(
        new CustomEvent("move-card", {
          bubbles: true,
          composed: true,
          detail: { text, from: source, to: this.title },
        }),
      );
    }
    this.shadowRoot
      .querySelector(".column-wrapper")
      .classList.remove("drag-over");
  }
}

customElements.define("kanban-column", KanbanColumn);

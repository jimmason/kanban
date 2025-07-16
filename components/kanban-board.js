import "./kanban-column.js";

class KanbanBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.initialized = false;
  }

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: flex;
        gap: 1.5rem;
        width: 100%;
      }
    `;

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.gap = "1.5rem";

    const columns = ["To Do", "In Progress", "Done"];
    columns.forEach((title) => {
      const column = document.createElement("kanban-column");
      column.setAttribute("title", title);
      container.appendChild(column);
    });

    container.addEventListener("move-card", (e) => {
      this.moveCard(e.detail.text, e.detail.from, e.detail.to);
    });

    this.shadowRoot.append(style, container);
  }

  moveCard(text, from, to) {
    const fromCol = this.shadowRoot.querySelector(
      `kanban-column[title="${from}"]`,
    );
    const toCol = this.shadowRoot.querySelector(`kanban-column[title="${to}"]`);
    if (fromCol && toCol) {
      fromCol.removeCard(text);
      toCol.addCard(text);
    }
  }
}

customElements.define("kanban-board", KanbanBoard);

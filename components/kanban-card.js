class KanbanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.initialized = false;
  }

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    const text = this.getAttribute("text");
    const column = this.getAttribute("column");

    const style = document.createElement("style");
    style.textContent = `
      .card {
        background-color: #fff;
        border: 1px solid #e1e4e8;
        border-radius: 6px;
        padding: 0.75rem;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.95rem;
        transition: box-shadow 0.2s ease;
        cursor: grab;
      }

      .card:active {
        cursor: grabbing;
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      }

      .card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .card button {
        background: none;
        border: none;
        color: #d6336c;
        font-size: 1.2rem;
        font-weight: bold;
        line-height: 1;
        padding: 0;
        margin-left: 0.75rem;
        cursor: pointer;
      }
    `;

    const wrapper = document.createElement("div");
    wrapper.className = "card";
    wrapper.draggable = true;
    wrapper.textContent = text;

    const button = document.createElement("button");
    button.textContent = "×";
    button.onclick = (e) => {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("card-delete", {
          bubbles: true,
          composed: true,
          detail: { text },
        }),
      );
    };

    wrapper.appendChild(button);

    wrapper.ondragstart = (e) => {
      e.dataTransfer.setData("text/plain", text);
      e.dataTransfer.setData("source-column", column);
    };

    this.shadowRoot.append(style, wrapper);
  }
}

customElements.define("kanban-card", KanbanCard);

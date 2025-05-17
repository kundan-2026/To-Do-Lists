(function () {
  const todoForm = document.getElementById("todoForm");
  const todoInput = document.getElementById("todoInput");
  const todoList = document.getElementById("todoList");
  const filterButtons = document.querySelectorAll(".filters button");

  let todos = JSON.parse(localStorage.getItem("todos")) || [];
  let currentFilter = "all";
  let dragSrcEl = null;

  function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  function renderTodos() {
    todoList.innerHTML = "";

    let filteredTodos;
    if (currentFilter === "all") filteredTodos = todos;
    else if (currentFilter === "active")
      filteredTodos = todos.filter((todo) => !todo.completed);
    else filteredTodos = todos.filter((todo) => todo.completed);

    filteredTodos.forEach((todo) => {
      const li = document.createElement("li");
      li.setAttribute("draggable", "true");
      li.setAttribute("data-id", todo.id);
      li.className = todo.completed ? "completed" : "";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.className = "todo-checkbox";
      checkbox.setAttribute("aria-label", "Mark task complete");
      checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;
        saveTodos();
        renderTodos();
      });

      const span = document.createElement("span");
      span.className = "todo-text";
      span.textContent = todo.text;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", `Delete task: ${todo.text}`);
      deleteBtn.addEventListener("click", () => {
        todos = todos.filter((t) => t.id !== todo.id);
        saveTodos();
        renderTodos();
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);

      // Drag and drop events
      li.addEventListener("dragstart", dragStart);
      li.addEventListener("dragover", dragOver);
      li.addEventListener("drop", drop);
      li.addEventListener("dragend", dragEnd);

      todoList.appendChild(li);
    });
  }

  function dragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = "move";
    // e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add("dragging");
  }

  function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (this === dragSrcEl) return;
    const bounding = this.getBoundingClientRect();
    const offset = e.clientY - bounding.top;
    const parent = this.parentNode;
    if (offset > bounding.height / 2) {
      parent.insertBefore(dragSrcEl, this.nextSibling);
    } else {
      parent.insertBefore(dragSrcEl, this);
    }
  }

  function drop(e) {
    e.stopPropagation();
    saveNewOrder();
    return false;
  }

  function dragEnd() {
    this.classList.remove("dragging");
  }

  function saveNewOrder() {
    const newOrder = [];
    todoList.querySelectorAll("li").forEach((li) => {
      const id = li.getAttribute("data-id");
      const todo = todos.find((t) => t.id === id || t.id === Number(id));
      if (todo) newOrder.push(todo);
    });
    todos = newOrder;
    saveTodos();
  }

  todoForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    todos.push({ id: Date.now(), text, completed: false });
    saveTodos();
    renderTodos();
    todoInput.value = "";
    todoInput.focus();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      currentFilter = button.getAttribute("data-filter");
      renderTodos();
    });
  });

  // Initial render
  renderTodos();
})();

import "./style.css";

const form = document.getElementById("task-Form");
const input = document.getElementById("task-Input");
const listEl = document.getElementById("todo-list");
const paginationEl = document.getElementById("pagination");
const noTodos = document.getElementById("noTodos");
const STORAGE_KEY = "todos";
const PAGE_SIZE = 10;
let currentPage = 1;

function getTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className =
    "flex items-center justify-between bg-white p-3 rounded shadow-xs drop-shadow-xs dark:bg-gray-800";
  li.dataset.id = todo.id;

  const textWrap = document.createElement("div");
  textWrap.className = "flex-1 mr-4";   

  const span = document.createElement("span");
  span.textContent = todo.text;
  span.className = "text-lg";

  textWrap.appendChild(span);

  const actions = document.createElement("div");
  actions.className = "flex gap-2";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className ="btn-edit text-white bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 shadow-lg shadow-lime-500/50 dark:shadow-lg dark:shadow-lime-800/80 font-medium rounded-base text-sm px-4 py-1.5 text-center leading-5"
  ;

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className =
    "btn-delete text-white rounded text-sm bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-base text-sm px-4 py-1.5 text-center leading-5 ";

  const dupBtn = document.createElement("button");
  dupBtn.textContent = "Duplicate";
  dupBtn.className =
    "btn-duplicate text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-base text-sm px-4 py--1.5 text-center leading-5";
  actions.appendChild(dupBtn);
  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(textWrap);
  li.appendChild(actions);

  editBtn.addEventListener("click", () => startEdit(todo.id, span));
  delBtn.addEventListener("click", () => deleteTodo(todo.id));
  dupBtn.addEventListener("click", () => duplicateTodo(todo.id));

  return li;
}

function renderTodos() {
  const todos = getTodos();
  listEl.innerHTML = "";
  paginationEl.innerHTML = "";
  if (!todos.length) {
    noTodos.style.display = "flex";
    paginationEl.style.display = "none";
    return;
  }
  noTodos.style.display = "none";
  paginationEl.style.display = "";

  const totalPages = Math.max(1, Math.ceil(todos.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = todos.slice(start, start + PAGE_SIZE);

  visible.forEach((t) => listEl.appendChild(createTodoElement(t)));

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  paginationEl.innerHTML = "";
  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.textContent = "Prev";
  prev.className = "px-3 py-1 bg-gray-200 rounded";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => changePage(currentPage - 1));
  paginationEl.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = String(i);
    btn.className =
      "px-3 py-1 rounded " +
      (i === currentPage ? "bg-brand text-white" : "bg-gray-100");
    btn.addEventListener("click", () => changePage(i));
    paginationEl.appendChild(btn);
  }

  const next = document.createElement("button");
  next.textContent = "Next";
  next.className = "px-3 py-1 bg-gray-200 rounded";
  next.disabled = currentPage === totalPages;
  next.addEventListener("click", () => changePage(currentPage + 1));
  paginationEl.appendChild(next);
}

function changePage(page) {
  currentPage = Math.max(1, page);
  renderTodos();
}

function addTodo(text) {
  const todos = getTodos();
  // add newest items to the front so they appear first
  todos.unshift({ id: Date.now(), text });
  // show newest items on page 1
  currentPage = 1;
  saveTodos(todos);
  renderTodos();
}

function deleteTodo(id) {
  const todos = getTodos().filter((t) => t.id !== id);
  saveTodos(todos);
  renderTodos();
}

function duplicateTodo(id) {
  const todos = getTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const original = todos[idx];
  const copy = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    text: original.text,
  };
  todos.splice(idx + 1, 0, copy);
  saveTodos(todos);
  renderTodos();
}

function startEdit(id, spanEl) {
  const todos = getTodos();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const inputEdit = document.createElement("input");
  inputEdit.type = "text";
  inputEdit.value = todo.text;
  inputEdit.className = "w-full px-2 py-1 border rounded";

  spanEl.replaceWith(inputEdit);
  inputEdit.focus();

  function finishEdit(save) {
    const currentTodos = getTodos();
    const idx = currentTodos.findIndex((t) => t.id === id);
    if (idx === -1) return;
    if (save) {
      const newText = inputEdit.value.trim();
      if (newText) currentTodos[idx].text = newText;
    }
    saveTodos(currentTodos);
    renderTodos();
  }

  inputEdit.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finishEdit(true);
    if (e.key === "Escape") finishEdit(false);
  });
  inputEdit.addEventListener("blur", () => finishEdit(true));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

// initial render
renderTodos();


const ADMIN_USERNAME = "shikhar";
const ADMIN_PASSWORD = "14450sS#@";
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}
function isAdminLoggedIn() {
  return sessionStorage.getItem("adminLoggedIn") === "true";
}

function clearAuthForms() {
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("adminUsername").value = "";
  document.getElementById("adminPassword").value = "";
  document.forms["myForm"].reset();
}
const VIEWS = [
  "authChoice",
  "registerBox",
  "loginBox",
  "adminLoginBox",
  "adminPanel",
  "website",
];

function showView(viewId) {
  VIEWS.forEach(function (id) {
    document.getElementById(id).style.display = id === viewId ? "block" : "none";
  });
}

function showHome() {
  if (isAdminLoggedIn()) {
    showAdminPanel();
  } else if (localStorage.getItem("currentUser")) {
    showView("website");
  } else {
    showView("authChoice");
  }
}

function showAuthChoice() {
  showHome();
}

function showRegister() {
  if (localStorage.getItem("currentUser")) {
    alert("You are already logged in.");
    showView("website");
    return;
  }
  showView("registerBox");
}

function showLogin() {
  if (localStorage.getItem("currentUser")) {
    showView("website");
    return;
  }
  showView("loginBox");
}

function showAdminLogin() {
  if (isAdminLoggedIn()) {
    showAdminPanel();
    return;
  }
  showView("adminLoginBox");
}


function validateForm() {
  let form = document.forms["myForm"];
  let name = form["name"].value.trim();
  let email = form["email"].value;
  let password = form["password"].value;
  let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name === "") {
    alert("Name must be filled out");
    return false;
  }
  if (email === "" || !emailPattern.test(email)) {
    alert("Please enter a valid email address");
    return false;
  }
  if (password.length < 6) {
    alert("Password must be at least 6 characters long");
    return false;
  }

  let users = getUsers();
  let alreadyExists = users.some(function (user) {
    return user.email === email;
  });
  if (alreadyExists) {
    alert("An account with this email already exists. Please login instead.");
    showLogin();
    return false;
  }

  users.push({
    name: name,
    email: email,
    password: password,
    registeredAt: new Date().toISOString(),
  });
  saveUsers(users);

  alert("Registration successful! Please login.");
  form.reset();
  showLogin();
  return false;
}

function loginUser() {
  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPassword").value;
  let users = getUsers();

  let matchedUser = users.find(function (user) {
    return user.email === email && user.password === password;
  });

  if (matchedUser) {
    alert("Login successful!");
    localStorage.setItem("currentUser", JSON.stringify(matchedUser));
    clearAuthForms();
    showView("website");
  } else {
    alert("Invalid email or password");
  }
  return false;
}

function logoutUser() {
  localStorage.removeItem("currentUser");
  clearAuthForms();
  showView("authChoice");
}


function adminLogin() {
  let username = document.getElementById("adminUsername").value.trim();
  let password = document.getElementById("adminPassword").value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem("adminLoggedIn", "true");
    clearAuthForms();
    showAdminPanel();
  } else {
    alert("Invalid admin username or password");
  }
  return false;
}

function logoutAdmin() {
  sessionStorage.removeItem("adminLoggedIn");
  clearAuthForms();
  showHome();
}


function showAdminPanel() {
  if (!isAdminLoggedIn()) {
    showView("adminLoginBox");
    return;
  }
  showView("adminPanel");
  renderAdminTable();
}


function escapeHTML(text) {
  let div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}

function formatDate(value) {
  if (!value) return "\u2014";
  let date = new Date(value);
  return isNaN(date) ? "\u2014" : date.toLocaleString();
}

function renderAdminTable() {
  let users = getUsers();

  // Stat cards
  document.getElementById("statTotal").textContent = users.length;
  document.getElementById("statLatest").textContent = users.length
    ? users[users.length - 1].name
    : "None";

  let rows = [];
  users.forEach(function (user, index) {
    let name = String(user.name || "");
    let email = String(user.email || "");
    rows.push(
      "<tr>" +
        "<td>" + (index + 1) + "</td>" +
        "<td>" + escapeHTML(name) + "</td>" +
        "<td>" + escapeHTML(email) + "</td>" +
        '<td><button class="admin-delete-btn" onclick="deleteUser(' + index + ')">' +
        '<i class="fa-solid fa-trash"></i> Delete</button></td>' +
        "</tr>"
    );
  });

  document.getElementById("adminTableBody").innerHTML = rows.join("");

  let empty = document.getElementById("adminEmpty");
  if (rows.length === 0) {
    empty.textContent = "No users registered yet.";
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
  }
}

function deleteUser(index) {
  let users = getUsers();
  let user = users[index];
  if (!user) return;

  if (!confirm("Delete user " + user.email + "?")) return;

  users.splice(index, 1);
  saveUsers(users);

  let current = getCurrentUser();
  if (current && current.email === user.email) {
    localStorage.removeItem("currentUser");
  }
  renderAdminTable();
}

window.addEventListener("DOMContentLoaded", function () {
  clearAuthForms();
  showHome();
});

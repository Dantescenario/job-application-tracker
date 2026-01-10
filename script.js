const form = document.getElementById("job-form");
const applicationsList = document.getElementById("applications-list");
const filterStatus = document.getElementById("filter-status");

const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const locationInput = document.getElementById("location");
const dateInput = document.getElementById("date");
const statusInput = document.getElementById("status");
const notesInput = document.getElementById("notes");

const filterSelect = document.getElementById("filter-status");


let applications = JSON.parse(localStorage.getItem("applications")) || [];
let editIndex = null;

/* SAVE TO LOCALSTORAGE */
function saveToStorage() {
  localStorage.setItem("applications", JSON.stringify(applications));
}

/* SUBMIT */
form.addEventListener("submit", e => {
  e.preventDefault();

  const app = {
    company: companyInput.value.trim(),
    role: roleInput.value.trim(),
    location: locationInput.value.trim(),
    date: dateInput.value,
    status: statusInput.value,
    notes: notesInput.value.trim()
  };

  if (!app.company || !app.role) return;

  if (editIndex !== null) {
    applications[editIndex] = app;
    editIndex = null;
  } else {
    applications.push(app);
  }

  saveToStorage();
  form.reset();
  renderApplications();
});

/* FILTER */
filterStatus.addEventListener("change", renderApplications);

/* RENDER */
function renderApplications() {
  applicationsList.innerHTML = "";

  const filter = filterSelect.value;
  const filteredApps =
    filter === "All"
      ? applications
      : applications.filter(app => app.status === filter);

  filteredApps.forEach((app, index) => {
    const div = document.createElement("div");
    div.className = "application-card";

    div.innerHTML = `
      <strong>${app.role}</strong> @ ${app.company}
      <p>Status: <b>${app.status}</b></p>
      ${app.location ? `<p>Location: ${app.location}</p>` : ""}
      ${app.date ? `<p>Applied on: ${app.date}</p>` : ""}
      ${app.notes ? `<p>${app.notes}</p>` : ""}
      <button onclick="editApplication(${index})">Edit</button>
      <button onclick="deleteApplication(${index})">Delete</button>
      <hr>
    `;

    applicationsList.appendChild(div);
  });

  updateStats();
}


/* EDIT */
function editApplication(index) {
  const app = applications[index];

  companyInput.value = app.company;
  roleInput.value = app.role;
  locationInput.value = app.location;
  dateInput.value = app.date;
  statusInput.value = app.status;
  notesInput.value = app.notes;

  editIndex = index;
}

/* DELETE */
function deleteApplication(index) {
  if (!confirm("Delete this application?")) return;
  applications.splice(index, 1);
  saveToStorage();
  renderApplications();
}

/* INITIAL LOAD */
renderApplications();

/* EXPORT TO CSV */
document.getElementById("export-btn").addEventListener("click", () => {
  if (!applications.length) {
    alert("No applications to export!");
    return;
  }

  const headers = ["Company", "Role", "Location", "Applied Date", "Status", "Notes"];
  const rows = applications.map(app => [
    app.company,
    app.role,
    app.location,
    app.date,
    app.status,
    app.notes
  ]);

  const csvContent = [headers, ...rows]
    .map(e => e.map(v => `"${v}"`).join(",")) // quote each field
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "job_applications.csv";
  link.click();
});

function updateStats() {
  document.getElementById("stat-total").textContent =
    "Total: " + applications.length;

  document.getElementById("stat-applied").textContent =
    "Applied: " + applications.filter(a => a.status === "Applied").length;

  document.getElementById("stat-interview").textContent =
    "Interview: " + applications.filter(a => a.status === "Interview").length;

  document.getElementById("stat-offer").textContent =
    "Offer: " + applications.filter(a => a.status === "Offer").length;

  document.getElementById("stat-rejected").textContent =
    "Rejected: " + applications.filter(a => a.status === "Rejected").length;
}
filterSelect.addEventListener("change", renderApplications);


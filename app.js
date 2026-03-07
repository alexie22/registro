const STORAGE_KEY = "gestion-escolar-data-v1";

const state = loadState();

const yearForm = document.querySelector("#year-form");
const subjectForm = document.querySelector("#subject-form");
const classForm = document.querySelector("#class-form");
const studentForm = document.querySelector("#student-form");

const yearsList = document.querySelector("#years-list");
const subjectsList = document.querySelector("#subjects-list");
const classesList = document.querySelector("#classes-list");

const classSubjectSelect = document.querySelector("#class-subject");
const classYearSelect = document.querySelector("#class-year");
const studentYearSelect = document.querySelector("#student-year");
const studentClassesSelect = document.querySelector("#student-classes");
const studentsTable = document.querySelector("#students-table");

yearForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = yearForm.elements["year-name"];
  const name = input.value.trim();
  if (!name) return;

  state.years.push({ id: createId(), name });
  persistAndRender();
  yearForm.reset();
});

subjectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = subjectForm.elements["subject-name"];
  const name = input.value.trim();
  if (!name) return;

  state.subjects.push({ id: createId(), name });
  persistAndRender();
  subjectForm.reset();
});

classForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = classForm.elements["class-name"].value.trim();
  const subjectId = classForm.elements["class-subject"].value;
  const yearId = classForm.elements["class-year"].value;

  if (!name || !subjectId || !yearId) return;

  state.classes.push({ id: createId(), name, subjectId, yearId });
  persistAndRender();
  classForm.reset();
});

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = studentForm.elements["student-name"].value.trim();
  const yearId = studentForm.elements["student-year"].value;
  const classIds = [...studentClassesSelect.selectedOptions].map((option) => option.value);

  if (!name || !yearId || classIds.length === 0) return;

  const validClassIds = state.classes
    .filter((schoolClass) => schoolClass.yearId === yearId)
    .map((schoolClass) => schoolClass.id);

  const filteredClassIds = classIds.filter((id) => validClassIds.includes(id));

  if (filteredClassIds.length === 0) return;

  state.students.push({ id: createId(), name, yearId, classIds: filteredClassIds });
  persistAndRender();
  studentForm.reset();
});

studentYearSelect.addEventListener("change", () => {
  renderStudentClassOptions(studentYearSelect.value);
});

function persistAndRender() {
  saveState();
  render();
}

function render() {
  renderBasicLists();
  renderSelects();
  renderStudentsTable();
}

function renderBasicLists() {
  yearsList.innerHTML = state.years.length
    ? state.years.map((year) => `<li>${escapeHtml(year.name)}</li>`).join("")
    : "<li>No hay años registrados.</li>";

  subjectsList.innerHTML = state.subjects.length
    ? state.subjects.map((subject) => `<li>${escapeHtml(subject.name)}</li>`).join("")
    : "<li>No hay materias registradas.</li>";

  classesList.innerHTML = state.classes.length
    ? state.classes
        .map((schoolClass) => {
          const subject = state.subjects.find((item) => item.id === schoolClass.subjectId);
          const year = state.years.find((item) => item.id === schoolClass.yearId);
          return `<li>${escapeHtml(schoolClass.name)} (${escapeHtml(subject?.name || "Materia eliminada")} - ${escapeHtml(
            year?.name || "Año eliminado"
          )})</li>`;
        })
        .join("")
    : "<li>No hay clases registradas.</li>";
}

function renderSelects() {
  renderYearSelect(classYearSelect, "Selecciona año escolar");
  renderSubjectSelect(classSubjectSelect, "Selecciona materia");
  renderYearSelect(studentYearSelect, "Selecciona año escolar");

  const selectedYear = studentYearSelect.value;
  renderStudentClassOptions(selectedYear);
}

function renderYearSelect(select, placeholder) {
  const options = state.years
    .map((year) => `<option value="${year.id}">${escapeHtml(year.name)}</option>`)
    .join("");

  select.innerHTML = `<option value="">${placeholder}</option>${options}`;
}

function renderSubjectSelect(select, placeholder) {
  const options = state.subjects
    .map((subject) => `<option value="${subject.id}">${escapeHtml(subject.name)}</option>`)
    .join("");

  select.innerHTML = `<option value="">${placeholder}</option>${options}`;
}

function renderStudentClassOptions(yearId) {
  const classOptions = state.classes
    .filter((schoolClass) => schoolClass.yearId === yearId)
    .map((schoolClass) => `<option value="${schoolClass.id}">${escapeHtml(schoolClass.name)}</option>`)
    .join("");

  studentClassesSelect.innerHTML = classOptions;
}

function renderStudentsTable() {
  if (state.students.length === 0) {
    studentsTable.innerHTML = '<tr><td colspan="3" class="empty">Aún no hay alumnos registrados.</td></tr>';
    return;
  }

  studentsTable.innerHTML = state.students
    .map((student) => {
      const year = state.years.find((item) => item.id === student.yearId);
      const classes = student.classIds
        .map((classId) => state.classes.find((item) => item.id === classId)?.name)
        .filter(Boolean);

      return `<tr>
        <td>${escapeHtml(student.name)}</td>
        <td>${escapeHtml(year?.name || "Año no disponible")}</td>
        <td>${escapeHtml(classes.join(", ") || "Sin clases")}</td>
      </tr>`;
    })
    .join("");
}

function loadState() {
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) {
    return { years: [], subjects: [], classes: [], students: [] };
  }

  try {
    const parsed = JSON.parse(rawData);
    return {
      years: Array.isArray(parsed.years) ? parsed.years : [],
      subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
      classes: Array.isArray(parsed.classes) ? parsed.classes : [],
      students: Array.isArray(parsed.students) ? parsed.students : []
    };
  } catch {
    return { years: [], subjects: [], classes: [], students: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId() {
  return crypto.randomUUID();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();

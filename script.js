const STORAGE_KEY = 'registro-escolar-data-v1';

const state = loadState();

const yearForm = document.querySelector('#year-form');
const subjectForm = document.querySelector('#subject-form');
const studentForm = document.querySelector('#student-form');

const yearNameInput = document.querySelector('#year-name');
const subjectNameInput = document.querySelector('#subject-name');
const subjectYearSelect = document.querySelector('#subject-year');
const studentNameInput = document.querySelector('#student-name');
const studentYearSelect = document.querySelector('#student-year');

const yearList = document.querySelector('#year-list');
const subjectList = document.querySelector('#subject-list');
const studentList = document.querySelector('#student-list');
const dashboard = document.querySelector('#dashboard');
const emptyStateTemplate = document.querySelector('#empty-state');

function loadState() {
  const fallback = { years: [], subjects: [], students: [] };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return {
      years: parsed.years ?? [],
      subjects: parsed.subjects ?? [],
      students: parsed.students ?? [],
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function renderYearOptions() {
  const options = state.years
    .map((year) => `<option value="${year.id}">${year.name}</option>`)
    .join('');

  const placeholder = '<option value="" disabled selected>Selecciona un año</option>';
  subjectYearSelect.innerHTML = placeholder + options;
  studentYearSelect.innerHTML = placeholder + options;
}

function renderYears() {
  if (state.years.length === 0) {
    yearList.innerHTML = '';
    yearList.appendChild(emptyStateTemplate.content.cloneNode(true));
    return;
  }

  yearList.innerHTML = state.years
    .map((year) => `<li>${year.name}</li>`)
    .join('');
}

function renderSubjects() {
  if (state.subjects.length === 0) {
    subjectList.innerHTML = '';
    subjectList.appendChild(emptyStateTemplate.content.cloneNode(true));
    return;
  }

  subjectList.innerHTML = state.subjects
    .map((subject) => {
      const year = state.years.find((item) => item.id === subject.yearId);
      return `<li>${subject.name} <strong>(${year ? year.name : 'Año eliminado'})</strong></li>`;
    })
    .join('');
}

function renderStudents() {
  if (state.students.length === 0) {
    studentList.innerHTML = '';
    studentList.appendChild(emptyStateTemplate.content.cloneNode(true));
    return;
  }

  studentList.innerHTML = state.students
    .map((student) => {
      const year = state.years.find((item) => item.id === student.yearId);
      return `<li>${student.name} <strong>(${year ? year.name : 'Año no encontrado'})</strong></li>`;
    })
    .join('');
}

function renderDashboard() {
  if (state.students.length === 0) {
    dashboard.innerHTML = '<p class="empty">No hay alumnos registrados.</p>';
    return;
  }

  dashboard.innerHTML = state.students
    .map((student) => {
      const year = state.years.find((item) => item.id === student.yearId);
      const subjects = state.subjects.filter((subject) => subject.yearId === student.yearId);
      const subjectNames = subjects.length > 0 ? subjects.map((s) => s.name).join(', ') : 'Sin materias asignadas';

      return `
        <article class="dashboard-student">
          <h3>${student.name}</h3>
          <p><strong>Año:</strong> ${year ? year.name : 'Año no encontrado'}</p>
          <p><strong>Materias:</strong> ${subjectNames}</p>
        </article>
      `;
    })
    .join('');
}

function renderAll() {
  renderYearOptions();
  renderYears();
  renderSubjects();
  renderStudents();
  renderDashboard();
}

yearForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = yearNameInput.value.trim();

  if (!name) return;

  state.years.push({ id: createId('year'), name });
  saveState();
  renderAll();
  yearForm.reset();
});

subjectForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = subjectNameInput.value.trim();
  const yearId = subjectYearSelect.value;

  if (!name || !yearId) return;

  state.subjects.push({ id: createId('subject'), name, yearId });
  saveState();
  renderAll();
  subjectForm.reset();
});

studentForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = studentNameInput.value.trim();
  const yearId = studentYearSelect.value;

  if (!name || !yearId) return;

  state.students.push({ id: createId('student'), name, yearId });
  saveState();
  renderAll();
  studentForm.reset();
});

renderAll();

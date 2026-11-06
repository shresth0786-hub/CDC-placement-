const STORAGE_KEY = 'placement-compass-applications-v1';
const STAGES = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];
const seedApplications = [
  { id: 'demo-1', company: 'Northstar Labs', role: 'Graduate Software Engineer', stage: 'Interview', location: 'London · Hybrid', dateApplied: '2026-10-28', nextStep: 'Prepare for technical interview' },
  { id: 'demo-2', company: 'Monarch Finance', role: 'Technology Analyst', stage: 'Assessment', location: 'Manchester · On-site', dateApplied: '2026-10-25', nextStep: 'Complete online assessment' },
  { id: 'demo-3', company: 'Orbit Health', role: 'Data Science Associate', stage: 'Applied', location: 'Remote · UK', dateApplied: '2026-10-22', nextStep: 'Follow up with recruiter' },
  { id: 'demo-4', company: 'Field & Form', role: 'Product Analyst', stage: 'Saved', location: 'Bristol · Hybrid', dateApplied: '', nextStep: 'Tailor CV before applying' },
  { id: 'demo-5', company: 'Brightside Energy', role: 'Graduate Data Analyst', stage: 'Offer', location: 'Leeds · Hybrid', dateApplied: '2026-10-10', nextStep: 'Review offer details' }
];

const $ = (selector) => document.querySelector(selector);
const rowsElement = $('#applicationRows');
const dialog = $('#applicationDialog');
let applications = loadApplications();

function loadApplications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? seedApplications.map((item) => ({ ...item })) : JSON.parse(stored);
  } catch (error) {
    console.warn('Could not load saved applications.', error);
    return seedApplications.map((item) => ({ ...item }));
  }
}

function saveApplications() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch (error) {
    announce('Could not save your changes. Check your browser storage settings.');
    console.error('Could not save applications.', error);
  }
}

function announce(message) {
  $('#liveRegion').textContent = message;
}

function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function stageClass(stage) {
  return `stage-${stage.toLowerCase()}`;
}

function renderStats() {
  $('#totalStat').textContent = applications.length;
  $('#activeStat').textContent = applications.filter((item) => !['Offer', 'Rejected'].includes(item.stage)).length;
  $('#interviewStat').textContent = applications.filter((item) => item.stage === 'Interview').length;
  $('#offerStat').textContent = applications.filter((item) => item.stage === 'Offer').length;
}

function renderPipeline() {
  const container = $('#pipelineBars');
  const trackedStages = STAGES.filter((stage) => stage !== 'Rejected');
  const counts = trackedStages.map((stage) => applications.filter((item) => item.stage === stage).length);
  const max = Math.max(1, ...counts);
  container.replaceChildren();
  trackedStages.forEach((stage, index) => {
    const row = document.createElement('div');
    row.className = 'pipeline-row';
    const label = document.createElement('span');
    label.textContent = stage;
    const track = document.createElement('div');
    track.className = 'pipeline-track';
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', `${counts[index]} ${stage.toLowerCase()} applications`);
    const fill = document.createElement('div');
    fill.className = 'pipeline-fill';
    fill.style.width = `${counts[index] ? Math.max(8, (counts[index] / max) * 100) : 0}%`;
    track.append(fill);
    const count = document.createElement('span');
    count.className = 'pipeline-count';
    count.textContent = counts[index];
    row.append(label, track, count);
    container.append(row);
  });
}

function renderNextSteps() {
  const container = $('#nextSteps');
  container.replaceChildren();
  const upcoming = applications
    .filter((item) => !['Rejected', 'Offer'].includes(item.stage) && item.nextStep.trim())
    .slice()
    .sort((a, b) => (a.dateApplied || '9999').localeCompare(b.dateApplied || '9999'))
    .slice(0, 3);
  if (!upcoming.length) {
    const empty = document.createElement('p');
    empty.className = 'no-steps';
    empty.textContent = 'No pending steps. Add a next step to an application to see it here.';
    container.append(empty);
    return;
  }
  upcoming.forEach((item) => {
    const entry = document.createElement('div');
    entry.className = 'next-item';
    const dot = document.createElement('span');
    dot.className = 'step-dot';
    dot.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div');
    copy.className = 'step-copy';
    const title = document.createElement('strong');
    title.textContent = item.nextStep;
    const detail = document.createElement('small');
    detail.textContent = `${item.company} · ${item.stage}`;
    copy.append(title, detail);
    entry.append(dot, copy);
    container.append(entry);
  });
}

function renderRows() {
  const query = $('#searchInput').value.trim().toLowerCase();
  const stage = $('#stageFilter').value;
  const filtered = applications.filter((item) => {
    const matchesText = `${item.company} ${item.role} ${item.location}`.toLowerCase().includes(query);
    return matchesText && (stage === 'all' || item.stage === stage);
  });
  rowsElement.replaceChildren();
  filtered.forEach((item) => {
    const row = document.createElement('tr');
    const companyCell = document.createElement('td');
    companyCell.className = 'company-cell';
    const company = document.createElement('strong');
    company.textContent = item.company;
    const role = document.createElement('small');
    role.textContent = item.role;
    companyCell.append(company, role);

    const stageCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `stage-badge ${stageClass(item.stage)}`;
    badge.textContent = item.stage;
    stageCell.append(badge);

    const locationCell = document.createElement('td');
    locationCell.textContent = item.location || '—';
    const dateCell = document.createElement('td');
    dateCell.textContent = dateLabel(item.dateApplied);
    const nextCell = document.createElement('td');
    nextCell.textContent = item.nextStep || '—';
    const actionCell = document.createElement('td');
    actionCell.className = 'action-cell';
    const removeButton = document.createElement('button');
    removeButton.className = 'delete-button';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', `Remove ${item.company} — ${item.role}`);
    removeButton.addEventListener('click', () => removeApplication(item.id));
    actionCell.append(removeButton);
    row.append(companyCell, stageCell, locationCell, dateCell, nextCell, actionCell);
    rowsElement.append(row);
  });
  $('#visibleCount').textContent = filtered.length;
  $('#emptyState').hidden = filtered.length > 0;
}

function render() {
  renderStats();
  renderPipeline();
  renderNextSteps();
  renderRows();
}

function removeApplication(id) {
  const item = applications.find((application) => application.id === id);
  if (!item || !window.confirm(`Remove ${item.company} — ${item.role} from your tracker?`)) return;
  applications = applications.filter((application) => application.id !== id);
  saveApplications();
  render();
  announce(`${item.company} application removed.`);
}

function csvEscape(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function exportCsv() {
  const columns = ['Company', 'Role', 'Stage', 'Location', 'Date applied', 'Next step'];
  const records = applications.map((item) => [item.company, item.role, item.stage, item.location, item.dateApplied, item.nextStep]);
  const csv = [columns, ...records].map((record) => record.map(csvEscape).join(',')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  link.download = 'placement-compass-applications.csv';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  announce('Your application tracker was exported as CSV.');
}

function openDialog() {
  const dateInput = $('#applicationForm [name="dateApplied"]');
  dateInput.value = new Date().toISOString().slice(0, 10);
  dialog.showModal();
  $('#applicationForm [name="company"]').focus();
}

$('#todayLabel').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
$('#openForm').addEventListener('click', openDialog);
$('#emptyAdd').addEventListener('click', openDialog);
$('#closeDialog').addEventListener('click', () => dialog.close());
$('#cancelDialog').addEventListener('click', () => dialog.close());
$('#exportCsv').addEventListener('click', exportCsv);
$('#searchInput').addEventListener('input', renderRows);
$('#stageFilter').addEventListener('change', renderRows);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
$('#applicationForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const application = Object.fromEntries(formData.entries());
  application.id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  application.company = application.company.trim();
  application.role = application.role.trim();
  application.location = application.location.trim();
  application.nextStep = application.nextStep.trim();
  applications.unshift(application);
  saveApplications();
  event.currentTarget.reset();
  dialog.close();
  render();
  announce(`${application.company} application added.`);
});

render();

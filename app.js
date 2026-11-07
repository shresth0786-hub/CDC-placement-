const STORAGE_KEY = 'placement-compass-applications-v1';
const STAGES = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];
const seedApplications = [
  { id: 'demo-1', company: 'Northstar Labs', role: 'Graduate Software Engineer', stage: 'Interview', location: 'London · Hybrid', dateApplied: '2026-10-28', followUpDate: '', nextStep: 'Prepare for technical interview', notes: '', history: [] },
  { id: 'demo-2', company: 'Monarch Finance', role: 'Technology Analyst', stage: 'Assessment', location: 'Manchester · On-site', dateApplied: '2026-10-25', followUpDate: '', nextStep: 'Complete online assessment', notes: '', history: [] },
  { id: 'demo-3', company: 'Orbit Health', role: 'Data Science Associate', stage: 'Applied', location: 'Remote · UK', dateApplied: '2026-10-22', followUpDate: '', nextStep: 'Follow up with recruiter', notes: '', history: [] },
  { id: 'demo-4', company: 'Field & Form', role: 'Product Analyst', stage: 'Saved', location: 'Bristol · Hybrid', dateApplied: '', followUpDate: '', nextStep: 'Tailor CV before applying', notes: '', history: [] },
  { id: 'demo-5', company: 'Brightside Energy', role: 'Graduate Data Analyst', stage: 'Offer', location: 'Leeds · Hybrid', dateApplied: '2026-10-10', followUpDate: '', nextStep: 'Review offer details', notes: '', history: [] }
];
const $ = (selector) => document.querySelector(selector);
const rowsElement = $('#applicationRows');
const dialog = $('#applicationDialog');
let applications = loadApplications();
let editingId = null;

function normalizeApplication(item) {
  if (!item || typeof item !== 'object' || typeof item.company !== 'string' || typeof item.role !== 'string' || !STAGES.includes(item.stage)) return null;
  return {
    id: typeof item.id === 'string' ? item.id : makeId(),
    company: item.company.slice(0, 80), role: item.role.slice(0, 100), stage: item.stage,
    location: typeof item.location === 'string' ? item.location.slice(0, 80) : '',
    dateApplied: typeof item.dateApplied === 'string' ? item.dateApplied : '',
    followUpDate: typeof item.followUpDate === 'string' ? item.followUpDate : '',
    nextStep: typeof item.nextStep === 'string' ? item.nextStep.slice(0, 120) : '',
    notes: typeof item.notes === 'string' ? item.notes.slice(0, 1000) : '',
    history: Array.isArray(item.history) ? item.history.filter((event) => event && typeof event.stage === 'string' && typeof event.date === 'string').slice(-20) : []
  };
}
function loadApplications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return seedApplications.map((item) => ({ ...item }));
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('Saved data is not a list.');
    return parsed.map(normalizeApplication).filter(Boolean);
  } catch (error) {
    console.warn('Could not load saved applications.', error);
    return seedApplications.map((item) => ({ ...item }));
  }
}
function saveApplications() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(applications)); return true; }
  catch (error) { announce('Could not save your changes. Check your browser storage settings.'); console.error('Could not save applications.', error); return false; }
}
function announce(message) { $('#liveRegion').textContent = message; }
function makeId() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function todayISO() { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
function stageClass(stage) { return `stage-${stage.toLowerCase()}`; }
function renderStats() {
  const today = todayISO();
  $('#totalStat').textContent = applications.length;
  $('#activeStat').textContent = applications.filter((item) => !['Offer', 'Rejected'].includes(item.stage)).length;
  $('#interviewStat').textContent = applications.filter((item) => item.stage === 'Interview').length;
  $('#offerStat').textContent = applications.filter((item) => item.stage === 'Offer').length;
  $('#overdueStat').textContent = applications.filter((item) => item.followUpDate && item.followUpDate < today && !['Offer', 'Rejected'].includes(item.stage)).length;
}
function renderPipeline() {
  const container = $('#pipelineBars');
  const trackedStages = STAGES.filter((stage) => stage !== 'Rejected');
  const counts = trackedStages.map((stage) => applications.filter((item) => item.stage === stage).length);
  const max = Math.max(1, ...counts);
  container.replaceChildren();
  trackedStages.forEach((stage, index) => {
    const row = document.createElement('div'); row.className = 'pipeline-row';
    const label = document.createElement('span'); label.textContent = stage;
    const track = document.createElement('div'); track.className = 'pipeline-track'; track.setAttribute('role', 'img'); track.setAttribute('aria-label', `${counts[index]} ${stage.toLowerCase()} applications`);
    const fill = document.createElement('div'); fill.className = 'pipeline-fill'; fill.style.width = `${counts[index] ? Math.max(8, (counts[index] / max) * 100) : 0}%`; track.append(fill);
    const count = document.createElement('span'); count.className = 'pipeline-count'; count.textContent = counts[index];
    row.append(label, track, count); container.append(row);
  });
}
function renderNextSteps() {
  const container = $('#nextSteps'); container.replaceChildren();
  const today = todayISO();
  const upcoming = applications.filter((item) => !['Rejected', 'Offer'].includes(item.stage) && (item.followUpDate || item.nextStep.trim()))
    .slice().sort((a, b) => (a.followUpDate || '9999-12-31').localeCompare(b.followUpDate || '9999-12-31')).slice(0, 4);
  if (!upcoming.length) { const empty = document.createElement('p'); empty.className = 'no-steps'; empty.textContent = 'Nothing scheduled yet. Add a follow-up date or next step to an application.'; container.append(empty); return; }
  upcoming.forEach((item) => {
    const entry = document.createElement('div'); entry.className = 'next-item';
    const dot = document.createElement('span'); dot.className = `step-dot${item.followUpDate && item.followUpDate < today ? ' overdue-dot' : ''}`; dot.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div'); copy.className = 'step-copy';
    const title = document.createElement('strong'); title.textContent = item.nextStep || 'Follow up';
    const detail = document.createElement('small');
    detail.textContent = `${item.company} · ${item.followUpDate ? `${item.followUpDate < today ? 'Overdue · ' : ''}${dateLabel(item.followUpDate)}` : item.stage}`;
    copy.append(title, detail); entry.append(dot, copy); container.append(entry);
  });
}
function renderActivity() {
  const container = $('#activityLog'); container.replaceChildren();
  const events = applications.flatMap((item) => (item.history || []).map((event) => ({ ...event, company: item.company, role: item.role })))
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  if (!events.length) { const empty = document.createElement('p'); empty.className = 'no-steps'; empty.textContent = 'Your stage changes will appear here as you update applications.'; container.append(empty); return; }
  events.forEach((event) => {
    const row = document.createElement('div'); row.className = 'activity-item';
    const mark = document.createElement('span'); mark.className = 'activity-mark'; mark.setAttribute('aria-hidden', 'true'); mark.textContent = '↗';
    const copy = document.createElement('p'); copy.textContent = `${event.company} — ${event.role} moved to ${event.stage}`;
    const date = document.createElement('time'); date.dateTime = event.date; date.textContent = dateLabel(event.date);
    row.append(mark, copy, date); container.append(row);
  });
}
function renderRows() {
  const query = $('#searchInput').value.trim().toLowerCase(); const stage = $('#stageFilter').value;
  const filtered = applications.filter((item) => `${item.company} ${item.role} ${item.location}`.toLowerCase().includes(query) && (stage === 'all' || item.stage === stage));
  rowsElement.replaceChildren();
  filtered.forEach((item) => {
    const row = document.createElement('tr');
    const companyCell = document.createElement('td'); companyCell.className = 'company-cell';
    const company = document.createElement('strong'); company.textContent = item.company;
    const role = document.createElement('small'); role.textContent = item.role; companyCell.append(company, role);
    const stageCell = document.createElement('td'); const badge = document.createElement('span'); badge.className = `stage-badge ${stageClass(item.stage)}`; badge.textContent = item.stage; stageCell.append(badge);
    const locationCell = document.createElement('td'); locationCell.textContent = item.location || '—';
    const dateCell = document.createElement('td'); dateCell.textContent = dateLabel(item.dateApplied);
    const followUpCell = document.createElement('td'); followUpCell.textContent = dateLabel(item.followUpDate);
    if (item.followUpDate && item.followUpDate < todayISO() && !['Offer', 'Rejected'].includes(item.stage)) { followUpCell.className = 'overdue-text'; followUpCell.textContent = `Overdue · ${dateLabel(item.followUpDate)}`; }
    const nextCell = document.createElement('td'); nextCell.textContent = item.nextStep || '—';
    const actionCell = document.createElement('td'); actionCell.className = 'action-cell';
    const editButton = document.createElement('button'); editButton.className = 'edit-button'; editButton.type = 'button'; editButton.textContent = 'Edit'; editButton.setAttribute('aria-label', `Edit ${item.company} — ${item.role}`); editButton.addEventListener('click', () => openDialog(item));
    const removeButton = document.createElement('button'); removeButton.className = 'delete-button'; removeButton.type = 'button'; removeButton.textContent = '×'; removeButton.setAttribute('aria-label', `Remove ${item.company} — ${item.role}`); removeButton.addEventListener('click', () => removeApplication(item.id));
    actionCell.append(editButton, removeButton); row.append(companyCell, stageCell, locationCell, dateCell, followUpCell, nextCell, actionCell); rowsElement.append(row);
  });
  $('#visibleCount').textContent = filtered.length; $('#emptyState').hidden = filtered.length > 0;
}
function render() { renderStats(); renderPipeline(); renderNextSteps(); renderActivity(); renderRows(); }
function removeApplication(id) {
  const item = applications.find((application) => application.id === id);
  if (!item || !window.confirm(`Remove ${item.company} — ${item.role} from your tracker?`)) return;
  applications = applications.filter((application) => application.id !== id); saveApplications(); render(); announce(`${item.company} application removed.`);
}
function openDialog(item = null) {
  editingId = item?.id || null;
  const form = $('#applicationForm'); form.reset();
  $('#dialogTitle').textContent = item ? 'Edit application' : 'Add an application';
  $('#saveApplication').textContent = item ? 'Save changes' : 'Save application';
  if (item) Object.entries(item).forEach(([key, value]) => { const field = form.elements.namedItem(key); if (field && typeof value === 'string') field.value = value; });
  else form.elements.namedItem('dateApplied').value = todayISO();
  dialog.showModal(); form.elements.namedItem('company').focus();
}
function csvEscape(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportCsv() {
  const columns = ['Company', 'Role', 'Stage', 'Location', 'Date applied', 'Follow-up date', 'Next step', 'Notes'];
  const records = applications.map((item) => [item.company, item.role, item.stage, item.location, item.dateApplied, item.followUpDate, item.nextStep, item.notes]);
  const csv = [columns, ...records].map((record) => record.map(csvEscape).join(',')).join('\r\n');
  downloadFile('placement-compass-applications.csv', `\uFEFF${csv}`, 'text/csv;charset=utf-8'); announce('Your application tracker was exported as CSV.');
}
function backupData() {
  const backup = { product: 'Placement Compass', version: 1, exportedAt: new Date().toISOString(), applications };
  downloadFile('placement-compass-backup.json', JSON.stringify(backup, null, 2), 'application/json'); announce('A JSON backup of your applications was downloaded.');
}
async function restoreData(file) {
  try {
    const parsed = JSON.parse(await file.text()); const source = Array.isArray(parsed) ? parsed : parsed.applications;
    if (!Array.isArray(source)) throw new Error('This file does not contain an applications list.');
    const restored = source.map(normalizeApplication);
    if (restored.length !== source.length) throw new Error('Some records are invalid. No data was changed.');
    if (!window.confirm(`Replace your ${applications.length} current applications with ${restored.length} imported applications? Download a backup first if you need to keep the current data.`)) return;
    const previous = applications; applications = restored;
    if (!saveApplications()) { applications = previous; return; }
    render(); announce(`${applications.length} applications restored.`);
  } catch (error) { window.alert(`Could not restore backup: ${error.message}`); }
  finally { $('#importFile').value = ''; }
}
$('#todayLabel').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
$('#openForm').addEventListener('click', () => openDialog()); $('#emptyAdd').addEventListener('click', () => openDialog());
$('#closeDialog').addEventListener('click', () => dialog.close()); $('#cancelDialog').addEventListener('click', () => dialog.close());
$('#exportCsv').addEventListener('click', exportCsv); $('#backupData').addEventListener('click', backupData);
$('#importData').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', (event) => { const [file] = event.target.files; if (file) restoreData(file); });
$('#searchInput').addEventListener('input', renderRows); $('#stageFilter').addEventListener('change', renderRows);
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
$('#applicationForm').addEventListener('submit', (event) => {
  event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const values = Object.fromEntries(formData.entries());
  const previous = editingId ? applications.find((item) => item.id === editingId) : null;
  const application = normalizeApplication({ ...values, id: editingId || makeId(), history: previous?.history || [] });
  if (!application) { announce('Please check the application details and try again.'); return; }
  if (previous && previous.stage !== application.stage) {
    application.history.push({ stage: application.stage, date: todayISO(), from: previous.stage });
    application.history = application.history.slice(-20);
  }
  if (previous) applications = applications.map((item) => item.id === editingId ? application : item);
  else applications.unshift(application);
  if (!saveApplications()) return;
  dialog.close(); render(); announce(`${application.company} application ${previous ? 'updated' : 'added'}.`); editingId = null;
});
render();

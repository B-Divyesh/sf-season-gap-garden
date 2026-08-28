import './styles.css';
import { addDays, daysBetween, findGaps, formatDate, monthTicks, percentAcross, plantingStart } from './date';
import { CHECKOUT_URL, cachedUnlock, captureLicense, clearLicense, storeLicense, storedLicense, verifyLicense } from './license';
import { downloadFile, loadData, saveData, toCsv, validateGardenData } from './storage';
import type { CropTemplate, Gap, GardenData, Planting } from './types';

let data: GardenData;
let unlocked = false;
let licenseNotice = '';
let lastTrigger: HTMLElement | null = null;

const app = document.querySelector<HTMLDivElement>('#app')!;

const icon = (name: 'plus' | 'bed' | 'gap' | 'seed' | 'data' | 'edit' | 'trash' | 'close' | 'lock') => {
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    bed: '<path d="M3 7h18v12H3zM7 7V4m10 3V4M3 13h18"/>',
    gap: '<path d="M4 6v12m16-12v12M8 12h8m-2-2 2 2-2 2M10 10l-2 2 2 2"/>',
    seed: '<path d="M12 21V9m0 5c-5 0-7-3-7-7 4 0 7 2 7 7Zm0-4c4 0 6-2 6-6-3 0-6 2-6 6Z"/>',
    data: '<path d="M12 3v12m-4-4 4 4 4-4M5 19h14"/>',
    edit: '<path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20Zm9-12 3.5 3.5"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
}

function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

function render(): void {
  const gaps = findGaps(data.beds, data.plantings, data.settings).filter((gap) => gap.days > 0);
  const plantedBeds = data.beds.filter((bed) => data.plantings.some((item) => item.bedId === bed.id && item.kind === 'crop'));
  const followedBeds = plantedBeds.filter((bed) => data.plantings.filter((item) => item.bedId === bed.id).length > 1);
  const coverage = plantedBeds.length ? Math.round((followedBeds.length / plantedBeds.length) * 100) : 0;

  app.innerHTML = `
    <header class="topbar">
      <a class="wordmark" href="#main"><span class="wordmark-mark" aria-hidden="true">SG</span><span>Season Gap Garden</span></a>
      <nav aria-label="Garden notebook">
        <a href="#beds">Beds</a><a href="#gaps">Gap view</a><a href="#templates">Crop notes</a><a href="#data">Data</a>
      </nav>
      <button class="unlock-button ${unlocked ? 'is-unlocked' : ''}" data-action="license">${icon(unlocked ? 'seed' : 'lock')} ${unlocked ? 'Garden unlocked' : 'Unlock unlimited'}</button>
    </header>
    <div class="connection-banner" id="connection-banner" role="status" hidden>You’re offline. Your notebook still works and saves on this device.</div>
    <main id="main">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow">Your season, between the rows</p>
          <h1 id="page-title">Find the space for<br><em>what comes next.</em></h1>
          <p class="hero-lede">Write down when each bed clears. See the open windows. Fill them with a crop from your own notes—or mark the bed as resting.</p>
          <div class="hero-actions">
            <button class="button primary" data-action="add-bed">${icon('plus')} Add a bed</button>
            <a class="button quiet" href="#gaps">Open the gap view</a>
          </div>
          <p class="local-note"><span aria-hidden="true">●</span> Saved only on this device · works offline</p>
        </div>
        <figure class="hero-study">
          <img src="/assets/garden-study.webp" width="900" height="600" alt="A field-notebook drawing showing a leafy raised bed, then cleared soil, then a new row of seedlings." fetchpriority="high" decoding="async">
          <figcaption>Crop → clear → follow on. You supply the dates.</figcaption>
        </figure>
      </section>

      <section class="season-strip" aria-labelledby="season-heading">
        <div>
          <p class="hand-note">season window</p>
          <h2 id="season-heading">${formatDate(data.settings.seasonStart, true)} — ${formatDate(data.settings.seasonEnd, true)}</h2>
        </div>
        <div class="season-measures">
          <div><strong>${data.beds.length}</strong><span>bed${data.beds.length === 1 ? '' : 's'}</span></div>
          <div><strong>${gaps.length}</strong><span>open window${gaps.length === 1 ? '' : 's'}</span></div>
          <div title="Beds with a crop and a recorded follow-on crop or rest"><strong>${coverage}%</strong><span>followed on</span></div>
        </div>
        <button class="button text-button" data-action="season">Edit season dates</button>
      </section>

      <section class="notebook-section" id="beds" aria-labelledby="beds-heading">
        <div class="section-heading">
          <div><p class="folio">01 / beds</p><h2 id="beds-heading">Bed notebook</h2><p>Real dates for the spaces you actually tend.</p></div>
          <button class="button secondary" data-action="add-bed">${icon('plus')} Add bed</button>
        </div>
        ${renderBeds()}
      </section>

      <section class="notebook-section" id="gaps" aria-labelledby="gaps-heading">
        <div class="section-heading">
          <div><p class="folio">02 / open windows</p><h2 id="gaps-heading">Season gap view</h2><p>Open time is calculated only from the dates you entered.</p></div>
          <div class="legend" aria-label="Timeline legend"><span class="legend-crop">Planted</span><span class="legend-gap">Open</span><span class="legend-rest">Rest</span></div>
        </div>
        ${data.beds.length ? renderTimeline(gaps) : renderEmpty('gap', 'No beds to measure yet', 'Add your first bed, then record a crop and its expected clear date.', 'Add a bed', 'add-bed')}
        ${gaps.length && data.beds.length ? `<div class="gap-ledger"><h3>Windows to decide</h3>${gaps.map(renderGapCard).join('')}</div>` : data.beds.length ? `<div class="settled-note"><span aria-hidden="true">✓</span><div><strong>No open windows in this season.</strong><p>Every day is covered by a crop or intentional rest period.</p></div></div>` : ''}
      </section>

      <section class="notebook-section" id="templates" aria-labelledby="templates-heading">
        <div class="section-heading">
          <div><p class="folio">03 / crop notes</p><h2 id="templates-heading">Your successor notes</h2><p>Durations here are yours—not regional or climate advice.</p></div>
          <button class="button secondary" data-action="add-template">${icon('plus')} Add crop note</button>
        </div>
        ${renderTemplates()}
      </section>

      <section class="notebook-section data-section" id="data" aria-labelledby="data-heading">
        <div class="section-heading">
          <div><p class="folio">04 / take it with you</p><h2 id="data-heading">Your garden, portable</h2><p>Export a season spreadsheet or a complete backup any time.</p></div>
        </div>
        <div class="data-actions">
          <button class="data-action" data-action="export-csv">${icon('data')}<span><strong>Export season CSV</strong><small>Bed, crop, sow, transplant, clear, and notes</small></span></button>
          <button class="data-action" data-action="export-json">${icon('data')}<span><strong>Download full backup</strong><small>Everything needed to restore this notebook</small></span></button>
          <label class="data-action import-action">${icon('data')}<span><strong>Restore from backup</strong><small>Validates before replacing local data</small></span><input id="import-file" type="file" accept="application/json,.json"></label>
        </div>
      </section>

      <aside class="paid-note" aria-label="Unlimited garden license">
        <div><p class="hand-note">for larger plots</p><h2>${unlocked ? 'Unlimited garden unlocked' : 'Keep a bigger notebook'}</h2><p>${unlocked ? 'This device can keep unlimited beds and crop notes.' : 'The free garden includes 3 beds and 5 crop notes. A one-time US$9 license removes both limits—no subscription.'}</p>${licenseNotice ? `<p class="license-notice">${escapeHtml(licenseNotice)}</p>` : ''}</div>
        ${unlocked ? `<button class="button quiet-on-dark" data-action="license">Manage license</button>` : `<button class="button marigold" data-action="license">See the one-time unlock</button>`}
      </aside>
    </main>
    <footer>
      <p><span class="footer-mark">SG</span> Season Gap Garden</p>
      <p>Private by default. No account, tracking, or garden claims.</p>
      <nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav>
      <p class="generated-disclosure">Header artwork was generated for this project with the factory image model.</p>
    </footer>
    <dialog id="editor-dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <div class="update-toast" id="update-toast" role="status" hidden><span>A fresh notebook version is ready.</span><button class="button small" data-action="reload">Update now</button></div>
  `;

  bindEvents();
  updateConnection();
}

function renderBeds(): string {
  if (!data.beds.length) return renderEmpty('bed', 'Start with one real growing space', 'Name a raised bed, trough, or container. You can add its current crop next.', 'Add my first bed', 'add-bed');
  return `<div class="bed-list">${data.beds.map((bed, index) => {
    const items = data.plantings.filter((item) => item.bedId === bed.id).sort((a, b) => plantingStart(a).localeCompare(plantingStart(b)));
    return `<article class="bed-entry">
      <div class="bed-index">${String(index + 1).padStart(2, '0')}</div>
      <div class="bed-body">
        <div class="bed-title"><div><h3>${escapeHtml(bed.name)}</h3>${bed.notes ? `<p>${escapeHtml(bed.notes)}</p>` : ''}</div><div class="row-actions"><button class="icon-button" data-action="edit-bed" data-id="${bed.id}" aria-label="Edit ${escapeHtml(bed.name)}">${icon('edit')}</button><button class="icon-button danger" data-action="delete-bed" data-id="${bed.id}" aria-label="Delete ${escapeHtml(bed.name)}">${icon('trash')}</button></div></div>
        ${items.length ? `<ol class="planting-list">${items.map((item) => `<li><span class="planting-dot ${item.kind}"></span><div><strong>${escapeHtml(item.name)}</strong><span>${item.kind === 'rest' ? 'Intentional rest' : `${item.sowDate ? `Sow ${formatDate(item.sowDate)} · ` : ''}${item.transplantDate ? `In bed ${formatDate(item.transplantDate)} · ` : ''}Clear ${formatDate(item.clearDate)}`}</span></div><button class="icon-button" data-action="edit-planting" data-id="${item.id}" aria-label="Edit ${escapeHtml(item.name)}">${icon('edit')}</button><button class="icon-button danger" data-action="delete-planting" data-id="${item.id}" aria-label="Delete ${escapeHtml(item.name)}">${icon('trash')}</button></li>`).join('')}</ol>` : `<p class="inline-empty">Nothing recorded yet. Add the crop in this bed now.</p>`}
        <button class="button text-button add-entry" data-action="add-planting" data-bed="${bed.id}">${icon('plus')} Add crop or rest</button>
      </div>
    </article>`;
  }).join('')}</div>`;
}

function renderTimeline(gaps: Gap[]): string {
  const ticks = monthTicks(data.settings);
  return `<div class="timeline-wrap" tabindex="0" aria-label="Scrollable season timeline">
    <div class="timeline" style="--months:${Math.max(1, ticks.length)}">
      <div class="timeline-months"><span class="row-label">Bed</span><div class="month-field">${ticks.map((tick) => `<span style="left:${tick.left}%">${tick.label}</span>`).join('')}</div></div>
      ${data.beds.map((bed) => {
        const entries = data.plantings.filter((item) => item.bedId === bed.id);
        const bedGaps = gaps.filter((gap) => gap.bedId === bed.id);
        return `<div class="timeline-row"><strong class="row-label">${escapeHtml(bed.name)}</strong><div class="track" aria-label="${escapeHtml(bed.name)} timeline">
          ${bedGaps.map((gap) => `<button class="timeline-span gap" style="left:${percentAcross(gap.start, data.settings)}%;width:${Math.max(1, percentAcross(gap.end, data.settings) - percentAcross(gap.start, data.settings))}%" data-action="fill-gap" data-bed="${bed.id}" data-start="${gap.start}" data-end="${gap.end}" aria-label="Open ${formatDate(gap.start)} to ${formatDate(gap.end)}, ${gap.days} days. Plan this gap"><span>${gap.days}d open</span></button>`).join('')}
          ${entries.map((item) => { const start = plantingStart(item); return `<button class="timeline-span ${item.kind}" style="left:${percentAcross(start, data.settings)}%;width:${Math.max(1, percentAcross(item.clearDate, data.settings) - percentAcross(start, data.settings))}%" data-action="edit-planting" data-id="${item.id}" title="${escapeHtml(item.name)}: ${formatDate(start)} to ${formatDate(item.clearDate)}"><span>${escapeHtml(item.name)}</span></button>`; }).join('')}
        </div></div>`;
      }).join('')}
    </div>
  </div>`;
}

function renderGapCard(gap: Gap): string {
  const bed = data.beds.find((item) => item.id === gap.bedId)!;
  return `<article class="gap-card"><div class="gap-bracket" aria-hidden="true"></div><div><p class="gap-date">${formatDate(gap.start)} → ${formatDate(gap.end)}</p><h4>${escapeHtml(bed.name)} has ${gap.days} open day${gap.days === 1 ? '' : 's'}</h4><p>${gap.afterPlantingId ? `After ${escapeHtml(data.plantings.find((item) => item.id === gap.afterPlantingId)?.name || 'the last entry')}` : 'Before the first recorded entry'}</p></div><div class="gap-actions"><button class="button small primary" data-action="fill-gap" data-bed="${gap.bedId}" data-start="${gap.start}" data-end="${gap.end}">Choose a crop</button><button class="button small quiet" data-action="rest-gap" data-bed="${gap.bedId}" data-start="${gap.start}" data-end="${gap.end}">Mark as rest</button></div></article>`;
}

function renderTemplates(): string {
  if (!data.templates.length) return renderEmpty('seed', 'No crop notes yet', 'Add a crop and the number of days you usually give it. That’s all suggestions use.', 'Add a crop note', 'add-template');
  return `<div class="template-list">${data.templates.map((template) => `<article><div class="template-days"><strong>${template.durationDays}</strong><span>days</span></div><div><h3>${escapeHtml(template.name)}</h3><p>${escapeHtml(template.notes || 'No note added')}</p></div><div class="row-actions"><button class="icon-button" data-action="edit-template" data-id="${template.id}" aria-label="Edit ${escapeHtml(template.name)}">${icon('edit')}</button><button class="icon-button danger" data-action="delete-template" data-id="${template.id}" aria-label="Delete ${escapeHtml(template.name)}">${icon('trash')}</button></div></article>`).join('')}</div>`;
}

function renderEmpty(type: 'bed' | 'gap' | 'seed', title: string, text: string, button: string, action: string): string {
  return `<div class="empty-state"><div class="empty-sketch">${icon(type === 'seed' ? 'seed' : type)}</div><div><h3>${title}</h3><p>${text}</p><button class="button primary" data-action="${action}">${icon('plus')} ${button}</button></div></div>`;
}

function bindEvents(): void {
  app.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', handleAction));
  app.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', importBackup);
  const dialog = getDialog();
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  window.addEventListener('online', updateConnection, { once: true });
  window.addEventListener('offline', updateConnection, { once: true });
}

async function handleAction(event: Event): Promise<void> {
  const target = event.currentTarget as HTMLElement;
  lastTrigger = target;
  const action = target.dataset.action;
  if (action === 'add-bed') openBedForm();
  if (action === 'edit-bed') openBedForm(target.dataset.id);
  if (action === 'delete-bed') await deleteBed(target.dataset.id!);
  if (action === 'add-planting') openPlantingForm(undefined, target.dataset.bed);
  if (action === 'edit-planting') openPlantingForm(target.dataset.id);
  if (action === 'delete-planting') await deletePlanting(target.dataset.id!);
  if (action === 'add-template') openTemplateForm();
  if (action === 'edit-template') openTemplateForm(target.dataset.id);
  if (action === 'delete-template') await deleteTemplate(target.dataset.id!);
  if (action === 'fill-gap') openGapForm(target.dataset.bed!, target.dataset.start!, target.dataset.end!);
  if (action === 'rest-gap') await restGap(target.dataset.bed!, target.dataset.start!, target.dataset.end!);
  if (action === 'season') openSeasonForm();
  if (action === 'export-csv') exportCsv();
  if (action === 'export-json') exportJson();
  if (action === 'license') openLicenseDialog();
  if (action === 'reload') location.reload();
}

function getDialog(): HTMLDialogElement {
  return document.querySelector<HTMLDialogElement>('#editor-dialog')!;
}

function openDialog(content: string, onSubmit?: (form: HTMLFormElement) => Promise<void> | void): void {
  const dialog = getDialog();
  dialog.querySelector<HTMLDivElement>('#dialog-content')!.innerHTML = content;
  dialog.querySelectorAll<HTMLElement>('[data-dialog-close]').forEach((button) => button.addEventListener('click', closeDialog));
  const form = dialog.querySelector<HTMLFormElement>('form');
  if (form && onSubmit) form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    try { await onSubmit(form); } catch (error) { showFormError(error instanceof Error ? error.message : 'Could not save this entry.'); }
  });
  dialog.showModal();
  // Put people straight into the first editable field, not the decorative
  // close control. The close event also covers Escape, which does not call
  // our explicit close handler.
  dialog.addEventListener('close', restoreDialogFocus, { once: true });
  window.setTimeout(() => {
    const initialControl = dialog.querySelector<HTMLElement>('input:not([type="radio"]), select, textarea')
      || dialog.querySelector<HTMLElement>('button');
    initialControl?.focus();
  }, 0);
}

function dialogShell(title: string, body: string, submit = 'Save'): string {
  return `<div class="dialog-header"><div><p class="hand-note">notebook entry</p><h2 id="dialog-title">${title}</h2></div><button class="icon-button" type="button" data-dialog-close aria-label="Close dialog">${icon('close')}</button></div><form><div class="form-error" role="alert" hidden></div>${body}<div class="dialog-actions"><button class="button quiet" type="button" data-dialog-close>Cancel</button><button class="button primary" type="submit">${submit}</button></div></form>`;
}

function closeDialog(): void {
  const dialog = getDialog();
  dialog.close();
}

function restoreDialogFocus(): void {
  if (lastTrigger?.isConnected) lastTrigger.focus();
}

function showFormError(message: string): void {
  const error = getDialog().querySelector<HTMLElement>('.form-error')!;
  error.textContent = message;
  error.hidden = false;
}

function openBedForm(id?: string): void {
  const bed = data.beds.find((item) => item.id === id);
  if (!bed && !unlocked && data.beds.length >= 3) { openLicenseDialog('The free notebook holds 3 beds. Unlock once to add as many as you need.'); return; }
  openDialog(dialogShell(bed ? 'Edit bed' : 'Add a bed', `
    <label>Bed name <input name="name" maxlength="60" required value="${escapeHtml(bed?.name || '')}" autocomplete="off"><small>For example, “Patio trough” or “North bed”.</small></label>
    <label>Bed note <textarea name="notes" maxlength="180" rows="3">${escapeHtml(bed?.notes || '')}</textarea><small>Optional: size, sun, or your own shorthand.</small></label>
  `, bed ? 'Save changes' : 'Add bed'), async (form) => {
    const values = new FormData(form);
    if (bed) { bed.name = String(values.get('name')).trim(); bed.notes = String(values.get('notes')).trim(); }
    else data.beds.push({ id: crypto.randomUUID(), name: String(values.get('name')).trim(), notes: String(values.get('notes')).trim(), createdAt: new Date().toISOString() });
    await persist('Bed saved.');
  });
}

function openPlantingForm(id?: string, bedId?: string): void {
  const item = data.plantings.find((candidate) => candidate.id === id);
  const selectedBed = item?.bedId || bedId || data.beds[0]?.id;
  openDialog(dialogShell(item ? 'Edit crop or rest' : 'Record a crop or rest', `
    <label>Bed <select name="bedId" required>${data.beds.map((bed) => `<option value="${bed.id}" ${bed.id === selectedBed ? 'selected' : ''}>${escapeHtml(bed.name)}</option>`).join('')}</select></label>
    <fieldset><legend>Entry type</legend><label class="choice"><input type="radio" name="kind" value="crop" ${item?.kind !== 'rest' ? 'checked' : ''}> Crop</label><label class="choice"><input type="radio" name="kind" value="rest" ${item?.kind === 'rest' ? 'checked' : ''}> Intentional rest</label></fieldset>
    <label>Name <input name="name" maxlength="60" required value="${escapeHtml(item?.name || '')}" placeholder="e.g. Spring peas"></label>
    <div class="field-pair"><label>Sow date <input type="date" name="sowDate" value="${item?.sowDate || ''}"><small>Optional</small></label><label>Transplant / in-bed date <input type="date" name="transplantDate" value="${item?.transplantDate || ''}"><small>Use for the timeline start</small></label></div>
    <label>Expected clear date <input type="date" name="clearDate" required value="${item?.clearDate || ''}"></label>
    <label>Note <textarea name="notes" maxlength="240" rows="3">${escapeHtml(item?.notes || '')}</textarea></label>
  `, item ? 'Save changes' : 'Record entry'), async (form) => {
    const values = new FormData(form);
    const sowDate = String(values.get('sowDate') || '');
    const transplantDate = String(values.get('transplantDate') || '');
    const clearDate = String(values.get('clearDate'));
    const start = transplantDate || sowDate;
    if (!start) throw new Error('Add a sow date or a transplant / in-bed date.');
    if (clearDate <= start) throw new Error('Expected clear date must be after the crop starts.');
    if (sowDate && transplantDate && transplantDate < sowDate) throw new Error('Transplant date cannot be before the sow date.');
    const now = new Date().toISOString();
    const next: Planting = { id: item?.id || crypto.randomUUID(), bedId: String(values.get('bedId')), kind: String(values.get('kind')) as 'crop' | 'rest', name: String(values.get('name')).trim(), sowDate: sowDate || undefined, transplantDate: transplantDate || undefined, clearDate, notes: String(values.get('notes')).trim(), createdAt: item?.createdAt || now, updatedAt: now };
    if (item) data.plantings[data.plantings.indexOf(item)] = next; else data.plantings.push(next);
    await persist('Garden entry saved.');
  });
}

function openTemplateForm(id?: string): void {
  const template = data.templates.find((item) => item.id === id);
  if (!template && !unlocked && data.templates.length >= 5) { openLicenseDialog('The free notebook holds 5 crop notes. Unlock once to keep an unlimited list.'); return; }
  openDialog(dialogShell(template ? 'Edit crop note' : 'Add a crop note', `
    <label>Crop name <input name="name" maxlength="60" required value="${escapeHtml(template?.name || '')}" placeholder="e.g. Bush beans"></label>
    <label>Your duration <span class="number-field"><input name="duration" type="number" min="1" max="366" inputmode="numeric" required value="${template?.durationDays || 45}"><span>days</span></span><small>Use the time you want to allow. This app does not estimate it.</small></label>
    <label>Your note <textarea name="notes" maxlength="180" rows="3">${escapeHtml(template?.notes || '')}</textarea></label>
  `, template ? 'Save changes' : 'Add crop note'), async (form) => {
    const values = new FormData(form);
    const next: CropTemplate = { id: template?.id || crypto.randomUUID(), name: String(values.get('name')).trim(), durationDays: Number(values.get('duration')), notes: String(values.get('notes')).trim(), createdAt: template?.createdAt || new Date().toISOString() };
    if (template) data.templates[data.templates.indexOf(template)] = next; else data.templates.push(next);
    await persist('Crop note saved.');
  });
}

function openGapForm(bedId: string, start: string, end: string): void {
  if (!data.templates.length) { openTemplateForm(); return; }
  const fits = data.templates.map((template) => ({ ...template, fits: template.durationDays <= daysBetween(start, end) }));
  openDialog(dialogShell('Choose what follows', `
    <div class="gap-summary"><span>${formatDate(start)} → ${formatDate(end)}</span><strong>${daysBetween(start, end)} open days</strong></div>
    <label>Crop note <select name="templateId" required>${fits.map((template) => `<option value="${template.id}">${escapeHtml(template.name)} — ${template.durationDays} days${template.fits ? ' · fits' : ' · runs past window'}</option>`).join('')}</select><small>“Fits” compares only your saved duration with this window.</small></label>
    <label>In-bed start <input type="date" name="start" required value="${start}"></label>
    <label>Personal note <textarea name="notes" maxlength="240" rows="3"></textarea></label>
    <p class="form-caution">This is date arithmetic, not a climate or planting recommendation.</p>
  `, 'Plan this crop'), async (form) => {
    const values = new FormData(form);
    const template = data.templates.find((item) => item.id === values.get('templateId'))!;
    const cropStart = String(values.get('start'));
    const clearDate = addDays(cropStart, template.durationDays);
    data.plantings.push({ id: crypto.randomUUID(), bedId, name: template.name, kind: 'crop', transplantDate: cropStart, clearDate, notes: String(values.get('notes')).trim() || template.notes, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await persist(clearDate <= end ? `${template.name} fits inside this window.` : `${template.name} saved; it extends beyond this open window.`);
  });
}

async function restGap(bedId: string, start: string, end: string): Promise<void> {
  const bed = data.beds.find((item) => item.id === bedId)!;
  if (!confirm(`Mark ${bed.name} as intentionally resting from ${formatDate(start)} to ${formatDate(end)}?`)) return;
  data.plantings.push({ id: crypto.randomUUID(), bedId, name: 'Bed rest', kind: 'rest', transplantDate: start, clearDate: end, notes: 'Intentional rest period', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  await persist('Rest period recorded.');
}

function openSeasonForm(): void {
  openDialog(dialogShell('Set the season window', `
    <div class="field-pair"><label>Season starts <input type="date" name="start" required value="${data.settings.seasonStart}"></label><label>Season ends <input type="date" name="end" required value="${data.settings.seasonEnd}"></label></div>
    <p class="form-caution">This controls the gap view only. Pick dates that matter for your own garden.</p>
  `, 'Update season'), async (form) => {
    const values = new FormData(form); const start = String(values.get('start')); const end = String(values.get('end'));
    if (end <= start) throw new Error('Season end must be after its start.');
    data.settings = { seasonStart: start, seasonEnd: end };
    await persist('Season window updated.');
  });
}

async function deleteBed(id: string): Promise<void> {
  const bed = data.beds.find((item) => item.id === id)!;
  const count = data.plantings.filter((item) => item.bedId === id).length;
  if (!confirm(`Delete ${bed.name} and its ${count} crop ${count === 1 ? 'entry' : 'entries'}? This cannot be undone.`)) return;
  data.beds = data.beds.filter((item) => item.id !== id); data.plantings = data.plantings.filter((item) => item.bedId !== id);
  await persist(`${bed.name} deleted.`);
}

async function deletePlanting(id: string): Promise<void> {
  const item = data.plantings.find((candidate) => candidate.id === id)!;
  if (!confirm(`Delete “${item.name}” from this bed?`)) return;
  data.plantings = data.plantings.filter((candidate) => candidate.id !== id);
  await persist('Garden entry deleted.');
}

async function deleteTemplate(id: string): Promise<void> {
  const item = data.templates.find((candidate) => candidate.id === id)!;
  if (!confirm(`Delete the crop note “${item.name}”? Existing bed entries will stay.`)) return;
  data.templates = data.templates.filter((candidate) => candidate.id !== id);
  await persist('Crop note deleted.');
}

async function persist(message: string): Promise<void> {
  await saveData(data); closeDialog(); render(); showToast(message);
}

function exportCsv(): void {
  downloadFile(`season-gap-garden-${data.settings.seasonStart.slice(0, 4)}.csv`, toCsv(data), 'text/csv;charset=utf-8');
  showToast('Season CSV downloaded.');
}

function exportJson(): void {
  downloadFile(`season-gap-garden-backup-${todayInput()}.json`, JSON.stringify(data, null, 2), 'application/json');
  showToast('Full backup downloaded.');
}

async function importBackup(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0]; if (!file) return;
  try {
    const imported = validateGardenData(JSON.parse(await file.text()));
    if (!confirm(`Replace this notebook with “${file.name}”? It contains ${imported.beds.length} beds and ${imported.plantings.length} entries. Download a backup first if needed.`)) return;
    data = imported; await saveData(data); render(); showToast('Backup restored.');
  } catch (error) { showToast(error instanceof Error ? error.message : 'This backup could not be read.', true); }
  finally { input.value = ''; }
}

function openLicenseDialog(message = ''): void {
  const token = storedLicense();
  openDialog(`<div class="dialog-header"><div><p class="hand-note">one-time unlock</p><h2 id="dialog-title">${unlocked ? 'Manage your garden license' : 'Unlimited beds, one purchase'}</h2></div><button class="icon-button" type="button" data-dialog-close aria-label="Close dialog">${icon('close')}</button></div>
    <div class="license-sheet">${message ? `<p class="limit-message">${escapeHtml(message)}</p>` : ''}<p>The free notebook is useful forever: 3 beds, 5 crop notes, unlimited entries, gap planning, offline use, and all exports.</p><ul><li>Unlimited beds</li><li>Unlimited successor crop notes</li><li>Use on another device by pasting your license</li></ul><p class="price"><strong>US$9</strong> once · no subscription</p><a class="button primary full" href="${CHECKOUT_URL}">${unlocked ? 'Open purchase page' : 'Buy the one-time unlock'}</a><p class="merchant-note">Checkout and refunds are handled by Sociobot / Dodo, the merchant of record.</p><hr><form id="license-form"><label>Have a license? Paste it here <input name="license" autocomplete="off" value="${escapeHtml(token)}" placeholder="License token"></label><div class="form-error" role="alert" hidden></div><div class="dialog-actions">${token ? '<button type="button" class="button quiet" id="remove-license">Remove from device</button>' : '<span></span>'}<button class="button secondary" type="submit">Verify and restore</button></div></form><p class="legal-line">By purchasing, you agree to the <a href="/terms/">terms</a>. See how verification works in <a href="/privacy/">privacy</a>.</p></div>`);
  const dialog = getDialog();
  dialog.querySelector<HTMLFormElement>('#license-form')!.addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const value = String(new FormData(form).get('license')).trim();
    if (!value) { showFormError('Paste your license token first.'); return; }
    storeLicense(value);
    try { const result = await verifyLicense(true); if (!result.valid) { unlocked = false; showFormError(`This license is not active (${result.reason.replace('_', ' ')}).`); return; } unlocked = true; licenseNotice = ''; closeDialog(); render(); showToast('Unlimited garden restored.'); }
    catch { unlocked = cachedUnlock(); showFormError('Could not reach license verification. Your saved free garden is still available.'); }
  });
  dialog.querySelector<HTMLButtonElement>('#remove-license')?.addEventListener('click', () => { clearLicense(); unlocked = false; closeDialog(); render(); showToast('License removed from this device.'); });
}

function showToast(message: string, isError = false): void {
  const toast = document.querySelector<HTMLElement>('#toast'); if (!toast) return;
  toast.textContent = message; toast.classList.toggle('error', isError); toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 3400);
}

function updateConnection(): void {
  const banner = document.querySelector<HTMLElement>('#connection-banner'); if (banner) banner.hidden = navigator.onLine;
}

async function reconcileLicense(): Promise<void> {
  if (!storedLicense()) return;
  try {
    const result = await verifyLicense();
    if (unlocked !== result.valid) { unlocked = result.valid; if (!result.valid) licenseNotice = 'Your saved license is no longer active. Free features and all your data remain available.'; render(); }
  } catch { /* Cached result remains; free experience is never blocked. */ }
}

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) document.querySelector<HTMLElement>('#update-toast')!.hidden = false;
      });
    });
  }).catch(() => { /* App remains fully usable without install support. */ });
}

async function init(): Promise<void> {
  captureLicense(); unlocked = cachedUnlock();
  try { data = await loadData(); render(); registerServiceWorker(); void reconcileLicense(); }
  catch {
    app.innerHTML = `<main id="main" class="fatal"><h1>Season Gap Garden</h1><h2>The notebook could not open</h2><p>Your browser blocked local storage. Allow site data for this page, then reload.</p><button class="button primary" onclick="location.reload()">Try again</button></main>`;
  }
}

void init();

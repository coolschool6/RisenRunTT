import { getPublishedEvents, formatFriendlyError } from './sheets.js';
import { escapeHtml } from './shared.js';

const state = {
  events: [],
  filtered: []
};

function buildEventCard(event) {
  const tags = [];

  if (event.isFeatured) {
    tags.push('<span class="badge badge-featured">Featured</span>');
  }

  if (event.isAd) {
    tags.push('<span class="badge badge-ad">Ad</span>');
  }

  if (event.isSoldOut) {
    tags.push('<span class="badge badge-sold">Sold Out</span>');
  }

  return `
    <article class="event-card reveal">
      <a class="event-media" href="event.html?id=${encodeURIComponent(event.eventId)}" aria-label="View event details">
        ${event.imageUrl ? `<img src="${escapeHtml(event.imageUrl)}" alt="${escapeHtml(event.title)}">` : ''}
      </a>
      <div class="event-body">
        <div class="event-top">
          ${tags.join('')}
          <span class="event-time">${escapeHtml(event.displayDate || 'Date not set')}</span>
        </div>
        <h3 class="event-title">${escapeHtml(event.title)}</h3>
        <p class="event-meta">${escapeHtml(event.location || '')}</p>
        <p class="event-meta">${escapeHtml(event.category || '')} ${event.displayPrice ? `- ${escapeHtml(event.displayPrice)}` : ''}</p>
        <div class="event-actions">
          <a class="btn btn-outline" href="event.html?id=${encodeURIComponent(event.eventId)}">View Details</a>
          ${event.registerUrl && !event.isSoldOut ? `<a class="btn btn-primary" href="${escapeHtml(event.registerUrl)}" target="_blank" rel="noreferrer">Register</a>` : ''}
        </div>
      </div>
    </article>
  `;
}

function renderEvents() {
  const node = document.querySelector('[data-events-list]');
  const totalNode = document.querySelector('[data-total-count]');

  if (!node) {
    return;
  }

  totalNode.textContent = `${state.filtered.length}`;

  if (!state.filtered.length) {
    node.innerHTML = '<div class="state-box">No events match the current filters.</div>';
    return;
  }

  node.innerHTML = state.filtered.map(buildEventCard).join('');
}

function parseDateSafe(event) {
  const time = event.dateInfo?.raw?.getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}

function applyFilters() {
  const text = document.querySelector('[data-filter-search]')?.value?.trim().toLowerCase() || '';
  const year = document.querySelector('[data-filter-year]')?.value || '';
  const category = document.querySelector('[data-filter-category]')?.value || '';

  const filtered = state.events
    .filter((event) => {
      if (!text) {
        return true;
      }

      return [event.title, event.location, event.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(text));
    })
    .filter((event) => (year ? String(event.displayYear || '').trim() === year : true))
    .filter((event) => (category ? String(event.category || '').trim() === category : true))
    .sort((a, b) => parseDateSafe(a) - parseDateSafe(b));

  state.filtered = filtered;
  renderEvents();
}

function hydrateFilterOptions() {
  const yearNode = document.querySelector('[data-filter-year]');
  const categoryNode = document.querySelector('[data-filter-category]');

  if (!yearNode || !categoryNode) {
    return;
  }

  const yearValues = [...new Set(state.events.map((event) => String(event.displayYear || '').trim()).filter(Boolean))].sort();
  const categoryValues = [...new Set(state.events.map((event) => String(event.category || '').trim()).filter(Boolean))].sort();

  yearNode.innerHTML = ['<option value="">All Years</option>', ...yearValues.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)].join('');
  categoryNode.innerHTML = ['<option value="">All Categories</option>', ...categoryValues.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)].join('');
}

function bindFilterEvents() {
  ['[data-filter-search]', '[data-filter-year]', '[data-filter-category]'].forEach((selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      return;
    }

    const eventName = selector === '[data-filter-search]' ? 'input' : 'change';
    element.addEventListener(eventName, applyFilters);
  });
}

async function init() {
  const stateNode = document.querySelector('[data-events-list]');

  try {
    state.events = await getPublishedEvents();
    hydrateFilterOptions();
    bindFilterEvents();
    applyFilters();
  } catch (error) {
    stateNode.innerHTML = `<div class="state-box">${escapeHtml(formatFriendlyError(error))}</div>`;
  }
}

init();

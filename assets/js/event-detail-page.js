import { getPublishedEvents, formatFriendlyError } from './sheets.js';
import { escapeHtml } from './shared.js';

function getEventIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderEvent(event) {
  const root = document.querySelector('[data-event-detail]');

  if (!root) {
    return;
  }

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

  root.innerHTML = `
    <section class="detail-layout reveal">
      <div class="detail-banner">
        ${event.imageUrl ? `<img src="${escapeHtml(event.imageUrl)}" alt="${escapeHtml(event.title)}">` : ''}
      </div>
      <aside class="panel">
        <div class="event-top">${tags.join('')}</div>
        <h1 class="section-title">${escapeHtml(event.title)}</h1>
        <ul class="list-clean">
          <li>Date & Time: ${escapeHtml(event.displayDate || '')}</li>
          <li>Location: ${escapeHtml(event.location || '')}</li>
          <li>Category: ${escapeHtml(event.category || '')}</li>
          <li>Price: ${escapeHtml(event.displayPrice || '')}</li>
          <li>Registration Deadline: ${escapeHtml(event.deadline || '')}</li>
        </ul>
        <div class="event-actions" style="margin-top:12px;">
          ${event.registerUrl && !event.isSoldOut ? `<a class="btn btn-primary" href="${escapeHtml(event.registerUrl)}" target="_blank" rel="noreferrer">Register</a>` : ''}
          <a class="btn btn-outline" href="index.html">Back to Events</a>
        </div>
      </aside>
    </section>
    ${event.shortDescription ? `<section class="panel reveal delay-1" style="margin-top: 18px;"><h2>About This Event</h2><p>${escapeHtml(event.shortDescription)}</p></section>` : ''}
  `;
}

function renderState(message) {
  const root = document.querySelector('[data-event-detail]');
  root.innerHTML = `<div class="state-box">${escapeHtml(message)}</div>`;
}

async function init() {
  const eventId = getEventIdFromQuery();

  if (!eventId) {
    renderState('Event ID is missing in URL.');
    return;
  }

  try {
    const events = await getPublishedEvents();
    const match = events.find((event) => event.eventId === eventId);

    if (!match) {
      renderState('Event not found or not published.');
      return;
    }

    renderEvent(match);
  } catch (error) {
    renderState(formatFriendlyError(error));
  }
}

init();

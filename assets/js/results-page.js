import { getPublishedEvents, getResultsRows, formatFriendlyError } from './sheets.js';
import { escapeHtml } from './shared.js';

function buildResultsTable(rows, eventsById) {
  return `
    <table class="data-table reveal">
      <thead>
        <tr>
          <th>Event</th>
          <th>Position</th>
          <th>Participant</th>
          <th>Bib</th>
          <th>Category</th>
          <th>Finish Time</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const event = eventsById.get(row.eventId);
            return `
              <tr>
                <td>${escapeHtml(event?.title || row.eventId)}</td>
                <td>${escapeHtml(row.position || '')}</td>
                <td>${escapeHtml(row.participantName || '')}</td>
                <td>${escapeHtml(row.bibNumber || '')}</td>
                <td>${escapeHtml(row.category || '')}</td>
                <td>${escapeHtml(row.finishTime || '')}</td>
                <td>${escapeHtml(row.notes || '')}</td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

async function init() {
  const node = document.querySelector('[data-results-root]');

  try {
    const [events, results] = await Promise.all([getPublishedEvents(), getResultsRows()]);

    if (!results.length) {
      node.innerHTML = '<div class="state-box">No results have been published yet.</div>';
      return;
    }

    const eventsById = new Map(events.map((event) => [event.eventId, event]));
    node.innerHTML = buildResultsTable(results, eventsById);
  } catch (error) {
    node.innerHTML = `<div class="state-box">${escapeHtml(formatFriendlyError(error))}</div>`;
  }
}

init();

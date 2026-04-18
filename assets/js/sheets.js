import { EVENT_STATUS, SITE_CONFIG } from './config.js';

function buildGvizUrl(sheetName) {
  const encodedName = encodeURIComponent(sheetName);
  return `https://docs.google.com/spreadsheets/d/${SITE_CONFIG.sheetId}/gviz/tq?sheet=${encodedName}&tqx=out:json`;
}

function parseGvizText(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('Unexpected Google Sheets response format.');
  }

  return JSON.parse(text.slice(start, end + 1));
}

function cellValue(cell) {
  if (!cell) {
    return '';
  }

  if (typeof cell.f === 'string' && cell.f.trim() !== '') {
    return cell.f.trim();
  }

  if (cell.v === null || cell.v === undefined) {
    return '';
  }

  return String(cell.v).trim();
}

function normalizeHeader(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function fetchSheetRows(sheetName) {
  if (!SITE_CONFIG.sheetId) {
    return [];
  }

  const response = await fetch(buildGvizUrl(sheetName));

  if (!response.ok) {
    throw new Error('Unable to fetch Google Sheet data.');
  }

  const rawText = await response.text();
  const payload = parseGvizText(rawText);
  const rows = payload.table?.rows ?? [];
  const cols = payload.table?.cols ?? [];
  const headers = cols.map((col) => normalizeHeader(col.label || ''));

  return rows.map((row) => {
    const result = {};
    row.c.forEach((cell, index) => {
      result[headers[index] || `col_${index}`] = cellValue(cell);
    });
    return result;
  });
}

function parseDate(dateIso, timeLocal, timezone) {
  if (!dateIso) {
    return null;
  }

  const dateOnly = `${dateIso}T${timeLocal || '00:00'}:00`;
  const dateObj = new Date(dateOnly);

  if (Number.isNaN(dateObj.getTime())) {
    return null;
  }

  const display = new Intl.DateTimeFormat('en-TT', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone
  }).format(dateObj);

  return {
    raw: dateObj,
    iso: dateIso,
    display
  };
}

function parseNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseBoolean(value) {
  if (!value) {
    return false;
  }

  const normalized = String(value).toLowerCase().trim();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function formatCurrency(amount, currency) {
  if (amount === null) {
    return '';
  }

  return new Intl.NumberFormat('en-TT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

function isDeadlineExpired(deadlineIso) {
  if (!deadlineIso) {
    return false;
  }

  const deadline = new Date(`${deadlineIso}T23:59:59`);
  if (Number.isNaN(deadline.getTime())) {
    return false;
  }

  return Date.now() > deadline.getTime();
}

export function normalizeEvent(row) {
  const dateInfo = parseDate(row.date_iso, row.time_local, SITE_CONFIG.timezone);
  const priceValue = parseNumber(row.price_ttd);
  const status = String(row.status || EVENT_STATUS.PUBLISHED).toLowerCase().trim();
  const soldOutManual = parseBoolean(row.is_sold_out_manual);
  const soldOutAutomatic = isDeadlineExpired(row.registration_deadline_iso);

  return {
    eventId: row.event_id,
    title: row.title,
    category: row.category,
    location: row.location,
    imageUrl: row.image_url,
    shortDescription: row.short_description,
    registerUrl: row.register_url,
    dateIso: row.date_iso,
    timeLocal: row.time_local,
    dateInfo,
    displayDate: dateInfo?.display || '',
    deadline: row.registration_deadline_iso,
    displayYear: row.display_year,
    priceValue,
    displayPrice: formatCurrency(priceValue, SITE_CONFIG.currency),
    isFeatured: parseBoolean(row.is_featured),
    isAd: parseBoolean(row.is_ad),
    soldOutManual,
    soldOutAutomatic,
    isSoldOut: soldOutManual || soldOutAutomatic,
    status,
    isPublished: status === EVENT_STATUS.PUBLISHED
  };
}

export function normalizeResult(row) {
  return {
    resultId: row.result_id,
    eventId: row.event_id,
    position: row.position,
    participantName: row.participant_name,
    bibNumber: row.bib_number,
    category: row.category,
    finishTime: row.finish_time,
    notes: row.notes
  };
}

export async function getPublishedEvents() {
  const rows = await fetchSheetRows(SITE_CONFIG.tabs.events);
  const events = rows
    .map(normalizeEvent)
    .filter((event) => event.isPublished && event.eventId && event.title)
    .sort((a, b) => {
      const aTime = a.dateInfo?.raw?.getTime() || Number.MAX_SAFE_INTEGER;
      const bTime = b.dateInfo?.raw?.getTime() || Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  return events;
}

export async function getResultsRows() {
  const rows = await fetchSheetRows(SITE_CONFIG.tabs.results);
  return rows.map(normalizeResult).filter((row) => row.eventId);
}

export function formatFriendlyError(error) {
  if (!SITE_CONFIG.sheetId) {
    return 'Google Sheet is not connected yet. Add your sheet ID in assets/js/config.js.';
  }

  return `Unable to load live data: ${error.message}`;
}

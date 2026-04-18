import { SITE_CONFIG } from './config.js';

export function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('[data-nav]');

  navItems.forEach((item) => {
    if (item.getAttribute('href') === current) {
      item.classList.add('active');
    }
  });
}

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fillContactLinks() {
  const contactNode = document.querySelector('[data-contact-links]');

  if (!contactNode) {
    return;
  }

  const links = [
    { label: 'Email', value: SITE_CONFIG.contact.email, href: SITE_CONFIG.contact.email ? `mailto:${SITE_CONFIG.contact.email}` : '' },
    { label: 'Phone', value: SITE_CONFIG.contact.phone, href: SITE_CONFIG.contact.phone ? `tel:${SITE_CONFIG.contact.phone}` : '' },
    { label: 'Instagram', value: SITE_CONFIG.contact.instagram, href: SITE_CONFIG.contact.instagram },
    { label: 'Facebook', value: SITE_CONFIG.contact.facebook, href: SITE_CONFIG.contact.facebook },
    { label: 'WhatsApp', value: SITE_CONFIG.contact.whatsapp, href: SITE_CONFIG.contact.whatsapp }
  ];

  const filled = links.filter((link) => link.value);

  if (!filled.length) {
    contactNode.innerHTML = '<div class="state-box">Contact channels will appear after you add values in assets/js/config.js.</div>';
    return;
  }

  const html = filled
    .map(
      (link) =>
        `<li><a href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}: ${escapeHtml(link.value)}</a></li>`
    )
    .join('');

  contactNode.innerHTML = `<ul class="list-clean">${html}</ul>`;
}

setActiveNav();

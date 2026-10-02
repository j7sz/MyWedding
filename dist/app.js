(() => {
  'use strict';
  const c = window.WEDDING_CONFIG;
  const event = new Date(c.date);
  const fmt = (options) => new Intl.DateTimeFormat('en-GB', { timeZone: c.timeZone, ...options }).format(event);
  document.title = `${c.partnerOne} & ${c.partnerTwo} · Our Wedding`;
  document.getElementById('preview-note').hidden = !c.preview;
  document.querySelectorAll('[data-bind]').forEach(el => { el.textContent = c[el.dataset.bind]; });
  const dateLabels = {
    short: fmt({ day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).toUpperCase(),
    long: fmt({ day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }),
    month: fmt({ month: 'short' }).toUpperCase(), day: fmt({ day: 'numeric' }), year: fmt({ year: 'numeric' }),
  };
  document.querySelectorAll('[data-date]').forEach(el => { el.textContent = dateLabels[el.dataset.date]; });
  document.getElementById('event-time').textContent = `${fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()} · ${c.timeZone.replaceAll('_', ' ')}`;
  const safeUrl = value => { try { const url = new URL(value, location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; } };
  document.querySelectorAll('[data-photo]').forEach(el => {
    const key = el.dataset.photo;
    const src = c.photos[key] && safeUrl(c.photos[key]);
    if (!src) return;
    const img = new Image();
    img.alt = `${c.partnerOne} and ${c.partnerTwo} — ${key === 'cover' ? 'wedding portrait' : 'a favourite moment'}`;
    img.decoding = 'async';
    img.addEventListener('load', () => { el.replaceChildren(img); }, { once: true });
    img.src = src;
  });
  if (c.mapUrl && safeUrl(c.mapUrl)) { const link = document.getElementById('map-link'); link.href = safeUrl(c.mapUrl); link.hidden = false; }
  function updateCountdown() {
    const diff = Math.max(0, Math.floor((event.getTime() - Date.now()) / 1000));
    const values = { days: Math.floor(diff / 86400), hours: Math.floor(diff / 3600) % 24, minutes: Math.floor(diff / 60) % 60, seconds: diff % 60 };
    Object.entries(values).forEach(([id, value]) => { document.getElementById(id).textContent = String(value).padStart(2, '0'); });
    if (!diff) document.getElementById('countdown-label').textContent = 'OUR FOREVER HAS BEGUN';
  }
  updateCountdown(); setInterval(updateCountdown, 1000);
  const year = Number(fmt({ year: 'numeric' }));
  const month = Number(fmt({ month: 'numeric' })) - 1;
  const day = Number(fmt({ day: 'numeric' }));
  document.getElementById('calendar-month').textContent = fmt({ month: 'long' });
  const start = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const body = document.getElementById('calendar-body');
  for (let i = 0; i < Math.ceil((start + total) / 7); i++) {
    const row = body.insertRow();
    for (let j = 0; j < 7; j++) {
      const cell = row.insertCell(); const n = i * 7 + j - start + 1;
      if (n < 1 || n > total) continue;
      const span = document.createElement('span'); span.textContent = n;
      if (n === day) { span.className = 'wedding-day'; span.setAttribute('aria-label', `${n}, our wedding day`); }
      cell.append(span);
    }
  }
  const escapeIcs = text => String(text).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const utc = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  function foldLine(line) {
    const lines = []; let chunk = ''; let bytes = 0;
    for (const char of line) { const size = new TextEncoder().encode(char).length; if (bytes + size > 75) { lines.push(chunk); chunk = ' '; bytes = 1; } chunk += char; bytes += size; }
    lines.push(chunk); return lines.join('\r\n');
  }
  document.getElementById('calendar-download').addEventListener('click', () => {
    const end = new Date(event.getTime() + (Number(c.durationHours) || 4) * 3600000);
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MyWedding//Invitation//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:wedding-${event.getTime()}@mywedding.local`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(event)}`, `DTEND:${utc(end)}`, `SUMMARY:${escapeIcs(`${c.partnerOne} & ${c.partnerTwo}'s wedding`)}`, `LOCATION:${escapeIcs(`${c.venue}, ${c.address}`)}`, 'DESCRIPTION:We look forward to celebrating with you!', 'END:VEVENT', 'END:VCALENDAR'];
    const url = URL.createObjectURL(new Blob([lines.map(foldLine).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'our-wedding.ics'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
  });
  const form = document.getElementById('rsvp-form');
  const status = document.getElementById('form-status');
  const key = `mywedding-rsvp:${c.partnerOne}:${c.partnerTwo}:${c.date}`;
  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.rsvpEmail || '');
  if (emailReady) { document.getElementById('form-note').textContent = 'Your email app will open with your reply. Please send the email to confirm your RSVP.'; document.getElementById('rsvp-submit').firstChild.textContent = 'Reply by email '; }
  function updateAttendance() { const declining = form.elements.attendance.value === 'no'; document.getElementById('guest-count-row').hidden = declining; form.elements.guests.disabled = declining; }
  form.querySelectorAll('[name=attendance]').forEach(el => el.addEventListener('change', updateAttendance));
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && typeof saved === 'object') { for (const field of ['name', 'attendance', 'guests', 'message']) if (typeof saved[field] === 'string') form.elements[field].value = saved[field]; status.textContent = 'Your draft has been restored. It has not been sent.'; }
  } catch { /* Storage can be unavailable in private browsers. Submission still works. */ }
  if (!['yes', 'no'].includes(form.elements.attendance.value)) form.elements.attendance.value = 'yes';
  updateAttendance();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    if (!name) { form.elements.name.setCustomValidity('Please enter your name.'); form.elements.name.reportValidity(); return; }
    const draft = { name, attendance: form.elements.attendance.value, guests: form.elements.attendance.value === 'yes' ? form.elements.guests.value : '0', message: form.elements.message.value.trim() };
    let saved = false;
    try { localStorage.setItem(key, JSON.stringify(draft)); saved = true; } catch { /* Report the failure instead of claiming success. */ }
    if (emailReady) {
      const text = `Name: ${draft.name}\nAttending: ${draft.attendance === 'yes' ? 'Yes' : 'No'}\nGuests: ${draft.guests}\n\n${draft.message}`;
      location.href = `mailto:${encodeURIComponent(c.rsvpEmail)}?subject=${encodeURIComponent(`Wedding RSVP — ${draft.name}`)}&body=${encodeURIComponent(text)}`;
      status.textContent = 'Please send your reply from your email app. Your RSVP is not confirmed until you send it.';
    } else { status.textContent = saved ? 'Draft saved on this device. No RSVP has been sent to the couple.' : 'This browser could not save the draft. No RSVP has been sent.'; }
  });
  form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
  if (c.music && safeUrl(c.music)) {
    const audio = document.getElementById('wedding-music'); const button = document.getElementById('music-toggle'); audio.src = safeUrl(c.music); button.hidden = false;
    button.addEventListener('click', async () => { try { if (audio.paused) await audio.play(); else audio.pause(); button.setAttribute('aria-pressed', String(!audio.paused)); button.setAttribute('aria-label', audio.paused ? 'Play background music' : 'Pause background music'); } catch { button.setAttribute('aria-label', 'Music unavailable'); button.disabled = true; } });
  }
})();

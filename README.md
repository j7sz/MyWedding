# MyWedding · 囍

A mobile-first bilingual wedding invitation inspired by the supplied Hunbei reference. Deep red, ivory paper, a large portrait cover, photo memories, a countdown, a wedding calendar, and an RSVP draft form. Built with plain HTML, CSS, and JavaScript; no dependencies or build step.

## Run locally

From this repository:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173. Alternatively, `npm run dev` runs the same command (Python 3 required).

## Personalise

Edit `dist/config.js`:

- Replace `partnerOne`, `partnerTwo`, `date`, `timeZone`, `venue`, and `address`. The date is a **sample**, not a confirmed wedding date. Include the UTC offset; calendar and countdown use the actual instant and the specified display time zone.
- Place your own photos in `dist/assets/`, then set `photos.cover`, `photos.together`, and `photos.moment`, e.g. `assets/cover.jpg`. Use a portrait crop for the cover. Empty or failed image sources retain the labelled placeholders.
- Set `mapUrl` to show the location link.
- Set `rsvpEmail` to enable an email reply. Guests still need to send the email themselves. No RSVP server or guest database is included.
- Optionally add your own audio file and set `music`, e.g. `assets/our-song.mp3`. Playback requires a click.
- Set `preview: false` after replacing the sample details and photos.

Copy and layout are in `dist/index.html`, and colours and typography are in `dist/styles.css`.

## RSVP behaviour

With no email address configured, the form explicitly saves a draft **only in the current browser**. It does not send anything to the couple. Names and notes stay in browser local storage; no analytics or third-party requests are included. Clearing site data removes drafts. To collect replies centrally, connect a real form endpoint or database in a later change. Existing local drafts are namespaced by the couple's names and wedding date.

## Hosting

The complete public website is in `dist/`. Upload its contents to any static host. For GitHub Pages, publish that directory with a Pages deployment workflow when ready. No deployment or automated publication is configured by this initial project.

## Checks

```sh
node --check dist/app.js
node --check dist/config.js
```

Before publishing, check the real date and venue, photo crops on mobile, calendar download, and the email RSVP on a device with an email app configured. The reference site's photographs, music, guest messages, and vendor branding are not bundled.

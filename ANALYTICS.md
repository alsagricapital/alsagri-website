# Private page analytics

Google Analytics account: **ALSAGRI**. Web stream: **ALSAGRI Website**.
Measurement ID: `G-4L8P90SQCC` (a public routing identifier, not an access credential).

The private dashboard is in the owner's Google Analytics account. No reporting
credentials, dashboard data, or public visitor counter are included in the site.

## Page coverage

Each HTML page includes one shared loader in `<head>`:

```html
<script defer src="analytics.js?v=20260919"></script>
```

Include this once in future HTML reports and pages. The loader runs only on the
HTTPS production domain (including `www`); local files, localhost and Netlify
deploy previews do not send measurements. `/` and `/index.html` share one page
identity, as do extensionless and `.html` URLs. Query strings and fragments are
excluded from measured page URLs; referrers are reduced to their origin.

## Consent and scope

The Google tag is loaded only after the visitor accepts analytics. The choice is
stored locally for 180 days. Declining or withdrawing consent stops subsequent
collection; the footer settings control reopens the choice. Advertising storage,
ad personalization and Google Signals are disabled. Enhanced measurement was
disabled on the web stream, leaving standard page views; keep history-based
automatic page views disabled to avoid counting report anchor navigation.

The visitor notice is `privacy.html`. Local UI preview is available with
`?analytics-preview=1` on localhost; this preview never loads Google's tag.

## Reports and verification

In Google Analytics, use **Reports → Engagement → Pages and screens** (or the
engagement collection under business objectives) for per-page views and users,
and **Realtime** to verify recent visits. User counts are browser-based estimates,
not an exact count of individual people. Declined or blocked analytics is not
counted. Collection starts after installation and consent; it does not backfill
earlier site visits.

Run the focused checks with `node --test scripts/analytics.test.cjs`.

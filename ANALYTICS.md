# Private server-side analytics

## Current dashboard
Netlify Web Analytics was enabled on September 21, 2026 for project
`alsagricapital`, owned by team `alsagria1`.
The activation screen stated that the team's plan includes Analytics for all
projects. The billing page confirmed the current Free plan.

Private dashboard:
https://app.netlify.com/projects/alsagricapital/analytics-and-metrics/analytics

Sign in using the owner's existing Netlify account, alsagria1@gmail.com.
Do not add this private dashboard as a public website link.

## Measurement
Netlify derives pageviews, sources, locations and estimated unique visitors from
CDN server logs. The site adds no Google tag, consent popup, analytics cookie or
visitor identifier. analytics.js sends no measurement requests.

Pageviews include successful HTML responses (200, 201 or 304), not every image or
script request. Unique visitors use IP addresses and are not verified people.
Shared networks, changing IPs and automated traffic can affect interpretation.
Data updates hourly. Available history depends on the hosting plan; at activation
the dashboard displayed the last 24 hours.

Provider reference:
https://docs.netlify.com/manage/monitoring/web-analytics/how-web-analytics-works/

## Legacy Google Analytics
The previous property and its historical data have not been deleted:
https://analytics.google.com/analytics/web/#/a408829542p555112120/realtime/pages

The site no longer sends new events to measurement ID `G-4L8P90SQCC`.
The analytics.js filename remains for compatibility with existing pages. It
disables the old Google tag and expires accessible legacy _ga cookies, then adds
a plain Privacy link. It never changes a previous refusal into permission,
reads a saved consent preference, or writes a new analytics identifier.

## Maintenance
Include exactly one shared script in each HTML page:
`<script defer src="analytics.js?v=20260921-server"></script>`

This cleanup/footer script runs only on the HTTPS production host and optional
localhost UI preview (`?analytics-preview=1`). This host check applies to the
script, not to Netlify's independent server-side collection.

Privacy notice: privacy.html.
Run checks with `node --test scripts/analytics.test.cjs`.

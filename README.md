# 🛺 GoGolfy — Scan to Ride · Dar Masr Al Andalous

A ready-to-use, single-file web app (Arabic + English) for the GoGolfy community
shuttle. A resident scans the QR at their checkpoint → **pickup is detected
automatically** → they choose a **destination**, a **ride type**, the **number of
residents**, see the **fare**, and tap **Confirm**, which **alerts the driver on
WhatsApp** that someone is waiting.

Everything is in one file: **`index.html`**. No server, no database, no build step.

---

## Languages
- **Arabic (default, RTL)** and **English** — toggle with the **عربي / EN** button
  in the top corner. Choice is remembered per device. Default language is also
  configurable in Admin → Settings.

## The 12 checkpoints (in display order)

| # | Name (EN) | Name (AR) |
|---|-----------|-----------|
| 1 | Gate 1 | بوابة 1 |
| 2 | Checkpoint 2 | نقطة 2 |
| 3 | Gate 2 | بوابة 2 |
| 4 | Checkpoint 4 | نقطة 4 |
| 5 | Gate 3 | بوابة 3 |
| 6 | Checkpoint 6 | نقطة 6 |
| 7 | Walk Gate | بوابة المشاة |
| 8 | Checkpoint 8 | نقطة 8 |
| 9 | Checkpoint 9 | نقطة 9 |
| 10 | Gate 4 | بوابة 4 |
| 11 | Checkpoint 11 | نقطة 11 |
| 12 | Checkpoint 12 | نقطة 12 |

## Ride types & fares (all per person, all editable in Admin)

| Type | How it's priced | Rates (per person) |
|------|-----------------|--------------------|
| **Private** | by **ride distance** | ≤600 m → **20** · 600–900 m → **25** · ≥900 m → **30** |
| **Mixed / Shared** | by group size | 1–2 people → **20 each** · 3+ → **15 each** |
| **Premium / Home** | by group size | 1 → **50** · 2 → **40 each** · 3+ → **30 each** |

- Every fare is **per person** (× number of residents). There is no flat fare.
- **Private** distance comes from your real 2,855 m outer-loop model; thresholds
  (600 m / 900 m) and all amounts are editable in Admin → Settings.
- **Home pickup** has its own QR; it opens the app in door-to-door **Premium** mode.

---

## Quick start

### 1. Put the app online (required for QR codes to work)
A QR that opens the booking app needs a public web address. Easiest free way:

**Netlify Drop (no account, ~3 min):**
1. Open https://app.netlify.com/drop on a computer.
2. Drag the whole **GoGolfy** folder onto the page.
3. You instantly get a URL like `https://your-name.netlify.app/`.
4. (Free sign-up makes the site permanent.)

**Or GitHub Pages (free, permanent):** create a repo, upload `index.html`,
Settings → Pages → deploy from `main` / root → URL becomes
`https://USERNAME.github.io/REPO/`.

*(The same steps are inside the app: ⚙️ → Hosting tab.)*

### 2. Configure (one time) — ⚙️ gear → Settings
- **Driver / Dispatcher WhatsApp number** (country code + number, digits only, e.g. `201112223334`).
- Default language, max residents, and **every fare number** above.

### 3. Generate & print QR codes — ⚙️ → QR Codes
Paste your hosted URL → **Generate** → **🖨️ Print**. You get:
- **12 checkpoint QR codes** (`?pickup=1…12`)
- a **🏠 Home-pickup QR** (`?ride=home`)
- a **🚗 Driver-dashboard QR** (`?driver=1`) — open on the driver's phone/tablet
- an **⚙️ Admin-dashboard QR** (`?admin=1`)

Each card also has a **Copy link** button so you can send any link over
WhatsApp/SMS instead of printing.

### 4. Done
Residents scan → book → the driver dashboard updates **live** and the driver also
gets a WhatsApp alert. Bookings appear in Admin → Bookings and export to CSV.

---

## Live driver dashboard

Open the **🚗 Driver Dashboard** link (`?driver=1`) on the driver's device. It shows
**ride requests in real time** — newest first — with a chime + highlight on each new
request. For every ride the driver taps **Accept → Arriving → Done**, and the
resident's screen updates live ("✅ Driver accepted — on the way!"). A 💳 badge shows
when a resident has opened payment.

- Real-time sync uses **ntfy.sh** (free, no signup). The driver dashboard and the
  booking app talk over a shared **live channel** — keep the default channel name and
  it works everywhere; or set a private one (same value on every device) in
  Admin → Settings.
- Privacy note: the channel is a public relay. Ride payloads contain no phone numbers,
  but use an unguessable channel name (the default already is). For full privacy you
  can self-host ntfy and change the channel.

## Online payment (InstaPay)

After confirming, the resident sees **💳 Pay now (InstaPay)** which opens your
InstaPay link (`https://ipn.eg/S/hatemsully/instapay/4T6VhV`, editable in
Admin → Settings → Payment). They enter the fare amount shown on the receipt in their
banking app. (InstaPay links can't be pre-filled with an amount, so the amount is
displayed clearly on the receipt and in the driver alert.)

---

## Notes
- **Save works even with storage blocked.** On iPhone Safari / private mode / when
  opened directly from disk, browsers block `localStorage`; the app now falls back
  to in-memory storage so the **Save button always works** (settings just won't
  persist after closing until the app is hosted — the Settings tab warns you if so).
- **QR images** use the free `api.qrserver.com` service, so generating/printing
  needs internet. Residents scanning them just load the website.
- Want SMS/Telegram instead of WhatsApp, online payment, or a live multi-driver
  dashboard? Those need a small backend and can be added on top.

## Files
- `index.html` — the entire app (booking + admin dashboard + QR generator + hosting guide).
- `README.md` — this file.
- `GoGolfy_Checkpoint_Distances_Fares.xlsx` — your source distance workbook (Standard fares mirror it).

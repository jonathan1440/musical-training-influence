# Music Preference Survey

A static survey for GitHub Pages that records anonymous responses to a Google Sheet.

## Quick Start

### 1. Set Up the Google Sheet Backend

1. Create a new **Google Sheet** (this is where responses will land).
2. Go to **Extensions → Apps Script**.
3. Delete any default code. Paste the entire contents of `google-apps-script.js`.
4. Click **Deploy → New deployment**.
5. Choose type: **Web app**.
6. Set "Execute as" to **Me**.
7. Set "Who has access" to **Anyone**.
8. Click **Deploy**, then **Authorize access** when prompted.
9. Copy the **Web app URL** (it looks like `https://script.google.com/macros/s/.../exec`).

### 2. Configure the Survey

Open `index.html` and find the `CONFIGURATION` section near the bottom. Update three things:

| Variable | What to put |
|----------|-------------|
| `SCRIPT_URL` | The Apps Script web app URL from step 1 |
| `DOC_LINK` | A Google Doc link listing all the pieces (shown on the thank-you page) |
| `EXCERPTS` array | Update the `file` paths if your mp3 filenames differ from the defaults |

The `id` field for each excerpt is what gets stored in the spreadsheet. You can name these whatever is meaningful for analysis (e.g., `baroque_01`, `romantic_03`, or just leave the defaults).

### 3. Add Audio Files

Put your 18 mp3 files in the `audio-samples/` directory at the root of the repo. The default config expects files named `excerpt01.mp3` through `excerpt18.mp3`.

```
your-repo/
├── index.html
├── audio-samples/
│   ├── excerpt01.mp3
│   ├── excerpt02.mp3
│   └── ... (18 total)
├── google-apps-script.js   (not deployed, just for reference)
└── README.md
```

### 4. Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Push all files (`index.html`, `audio-samples/` folder, etc.).
3. Go to **Settings → Pages**.
4. Set source to your branch (usually `main`), root `/`.
5. Your survey goes live at `https://yourusername.github.io/repo-name/`.

## How the Data Looks

Each submission is one row in your Google Sheet:

| Timestamp | Age | Gender | Musical Training | E1_ID | E1_Order | E1_Heard | E1_Rating | E2_ID | ... |
|-----------|-----|--------|-----------------|-------|----------|----------|-----------|-------|-----|
| 2026-02-25T... | 25-34 | Female | Yes | piece_14 | 1 | No | 7 | piece_03 | ... |

- **E1** through **E18** refer to the 1st through 18th excerpt *as presented to that participant* (presentation order).
- **E1_ID** tells you which actual piece it was (e.g., `piece_14`).
- **E1_Order** is the presentation position (always 1 for E1, 2 for E2, etc., but included for clarity).

Because excerpts are randomized per participant, the same column position will contain different pieces across rows. The `_ID` field is the key for grouping responses by piece during analysis.

## How Randomization Works

On page load, the excerpt list is shuffled using Fisher-Yates. Each participant sees all 18 excerpts in a unique random order. The order is recorded alongside each response.

## Design Notes

- **Paginated flow**: One excerpt per screen. No back button. The participant can't revisit previous answers.
- **Slider**: Snaps to integer values 1-10 with +/- buttons. The display shows a dash until the participant interacts, which forces an active choice (no silent default of 5).
- **Validation**: Every question must be answered before proceeding. Errors are highlighted inline.
- **Mobile-friendly**: Works on phones. Headphone recommendation is shown before the listening portion.
- **`no-cors` mode**: The fetch to Google Apps Script uses `no-cors` because Apps Script doesn't support CORS headers. This means we can't read the response, but submissions still go through. If something fails, a toast notification appears.

## Updating the Consent Paragraph

The consent text in `index.html` is a placeholder. Replace it with whatever your IRB or instructor requires. It's in the first `<div class="card">` inside the consent page section.

## Re-deploying After Changes

If you update the Apps Script code, you need to create a **new deployment** (Deploy → New deployment) and update the URL in `index.html`. Editing the script alone doesn't update the live web app, only new deployments do.

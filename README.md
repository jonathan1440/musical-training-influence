# susannaziesmer.com

Portfolio and research studies for Susanna Ziesmer. Next.js App Router, exported as a static site and deployed to GitHub Pages at [susannaziesmer.com](https://susannaziesmer.com).

The visual theme matches the previous single-page site: cream `#F7F4EF`, warm-white cards, ink text, terracotta `#B5705A`, a centered column about 620px wide, Libre Baskerville titles, and Source Sans 3 body text.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Portfolio. About and experience are taken from Susanna Ziesmer’s CV. |
| `/studies/musical-training/` | Existing study: The Influence of Musical Training on Preferences for Historical Musical Styles. Same survey as the old `index.html`, including the audio excerpts. |
| `/studies/ai-decision-making/` | Questionnaire: Effect of Repeated AI Usage on Decision Making Speed. |

## Try it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The AI questionnaire is at [http://localhost:3000/studies/ai-decision-making/](http://localhost:3000/studies/ai-decision-making/).

Production build:

```bash
npm run build
```

The static site is written to `out/`. `npm test` checks the questionnaire page order, the consent gate, the session mapping, and which pages record time.

### Walk the AI questionnaire

1. On page 1, choose **No** and type a name, then Next. The study stops. Nothing is saved.
2. Reload. Choose **Yes**, type a name, and continue.
3. Answer every demographics question. The session question is **Monday** or **Wednesday**. The questionnaire does not assign it. Participants never see the words Control or Experimental. Monday is stored as Control: Phase II has no AI instruction, Phase III has no “no AI” line, and completion is the thank-you only. Wednesday is stored as Experimental: Phase II requires the ChatGPT thread, Phase III says no AI assistance is permitted, and completion includes the ChatGPT handoff.
4. Phase I is a decision page, then a confidence page, repeated. Only the decision pages are timed.
5. Phase II instructions differ by session. Wednesday adds the required ChatGPT thread. Phase II is decisions only: no confidence question, and no time recorded.
6. Phase III instructions differ by session. Wednesday adds “No AI assistance is permitted for this phase.” Decision, then confidence, same count as Phase I. Only the decision pages are timed.
7. The completion page differs by session. Wednesday asks the participant to share the ChatGPT thread with susannaziesmer@southern.edu, subject `AI Study - [their name]`.

There is no post-activity survey page. The consent form mentions one because that sentence is part of the study procedure. The page list does not include it.

## Scenario counts and wording

Edit only [`lib/scenarios.ts`](lib/scenarios.ts).

- `PHASE_I_COUNT` defaults to 5.
- `PHASE_II_COUNT` defaults to 10.
- Phase III uses `PHASE_I_COUNT`.
- Instruction pages use those same numbers.
- Scenario text and both option labels are placeholders. Replace a draft in that file when the real wording is ready.

## AI study spreadsheet

Use a **new** Google Sheet. Do not reuse the musical-training sheet.

1. Create a new Google Sheet.
2. Extensions → Apps Script. Delete the sample code and paste [`google-apps-script-ai-study.js`](google-apps-script-ai-study.js).
3. Deploy → New deployment → Web app. Execute as **Me**. Who has access: **Anyone**.
4. Copy the web app URL (`https://script.google.com/macros/s/.../exec`).
5. Put it in `NEXT_PUBLIC_AI_STUDY_SCRIPT_URL`. For local builds, use `.env.local` (gitignored). For GitHub Pages, add a repository secret with that same name. The workflow passes the secret into `npm run build`.
6. Rebuild. The static export bakes the URL in at build time. Changing it later requires another build.

Do not commit the URL.

The script creates a tab named **AI Decision Study** and appends one row per completed session. Consent **No** never sends a request.

A row contains: timestamp, full name, age, gender, generative-AI frequency, primary use, use for decisions, group, each choice, each confidence rating, and seconds on each Phase I and Phase III decision page. Phase II columns are choices only. Confidence pages, instructions, Phase II, and completion are not timed.

The Group column stays where it is and stores the mapped condition: Monday → Control, Wednesday → Experimental. The live sheet already has a response row, so a Session column was not added. Inserting one would shift Group away from the existing header.

If you change the scenario counts after real responses exist, use a new tab or spreadsheet. The header row is written once, from the first submission.

Editing the Apps Script does not update a deployment that is already live. Deploy a new version and, if the URL changes, rebuild the site with the new URL.

The fetch uses `no-cors`, same as the music study, because Apps Script does not send CORS headers. The browser cannot read the response. A failed request shows a toast on the completion page.

## Musical-training spreadsheet

That survey still posts to the Apps Script URL already set in [`public/studies/musical-training/index.html`](public/studies/musical-training/index.html). The script for that sheet is [`google-apps-script.js`](google-apps-script.js). Leave that URL and that sheet alone when you set up the AI study.

Audio files live in `public/audio-samples/`.

## GitHub Pages

The custom domain is `susannaziesmer.com`, from [`public/CNAME`](public/CNAME). The static export copies that file into `out/`, which is what Pages publishes.

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds on pushes to `main` and deploys the `out/` directory.

**Before this replaces the live site,** set the repository’s Pages source to **GitHub Actions** (Settings → Pages → Build and deployment → Source). The previous site was published from the branch root. After this change, the branch root is the Next.js project, not the finished HTML. Publishing the branch root would take the domain down until Actions is the source.

`NEXT_PUBLIC_AI_STUDY_SCRIPT_URL` can be empty. The site still builds. Completed AI sessions are not saved until the secret is set and the site is rebuilt.

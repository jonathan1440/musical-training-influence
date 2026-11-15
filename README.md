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

1. On page 1, choose **No** without a name, then Next. The page stays. Type a full name, choose **No**, then Next. The study stops. The questionnaire sends only the timestamp and full name. After the Apps Script below is redeployed, that row is stored on a tab named **Declined consent**, not with the responses.
2. Reload. Choose **Yes**, type a name, and continue.
3. Answer every demographics question. The session question is **Monday** or **Tuesday**. The questionnaire does not assign it. Participants never see the words Control or Experimental. Monday is stored as Control: Phase II has no AI instruction, Phase III has no “no AI” line, and completion is the thank-you only. Tuesday is stored as Experimental: Phase II requires the ChatGPT thread, Phase III says no AI assistance is permitted, and completion includes the ChatGPT handoff.
4. Phase I instructions say life scenarios, and that after each scenario the participant explains the choice and reports confidence. Each scenario is a timed decision page, then an untimed page with a required explanation and the confidence scale.
5. Phase II instructions differ by session. Monday says more life scenarios and asks for a brief explanation, with no AI instruction. Tuesday says more scenarios, asks for a brief explanation, then requires one ChatGPT thread. Each scenario is an untimed decision page, then an untimed explanation page. Phase II has no confidence question and no time recording.
6. Phase III instructions differ by session. Monday says last life scenarios, then explanation and confidence. Tuesday says last scenarios, then explanation and confidence, and adds “No AI assistance is permitted for this phase.” The scenario count matches Phase I. Decision pages are timed. Explanation and confidence pages are not.
7. The completion page differs by session. Tuesday asks the participant to share the ChatGPT thread with susannaziesmer@southern.edu, subject `AI Study - [their name]`.

The consent form does not mention a post-activity survey. There is no separate survey page.

## Scenario counts and wording

Edit only [`lib/scenarios.ts`](lib/scenarios.ts).

- `PHASE_I_COUNT` defaults to 5.
- `PHASE_II_COUNT` defaults to 10.
- Phase III uses `PHASE_I_COUNT`.
- Instruction pages use those same numbers.
- Scenario text, the question line, and both option labels are the study wording. Edit them in that file.

## AI study spreadsheet

The live sheet already exists, with a tab named **AI Decision Study**. Do not create a second spreadsheet for this study, and do not reuse the musical-training sheet.

1. Open that sheet. Extensions → Apps Script.
2. Replace the project source with [`google-apps-script-ai-study.js`](google-apps-script-ai-study.js).
3. Deploy a new version of the **existing** web app (Deploy → Manage deployments → Edit → Version → New version). Execute as **Me**. Who has access: **Anyone**.
4. Keep the current web app URL if it does not change. If a new deployment issues a new URL, put it in `NEXT_PUBLIC_AI_STUDY_SCRIPT_URL` and rebuild. For local builds, use `.env.local` (gitignored). For GitHub Pages, use the repository secret with that same name. The workflow passes the secret into `npm run build`.

Do not commit the URL.

Redeploy before the next session. Until that deployment is live, a declined name is not stored on the Declined consent tab, and explanation answers are not labeled on the header row. The script currently deployed will treat a declined post as an ordinary row.

The script appends one completed session per row on **AI Decision Study**. A consent **No** posts `declined: true` and is written only to a tab named **Declined consent**, with Timestamp and Full Name. It is not added to the response rows.

A response row keeps the existing columns in place: timestamp, full name, age, gender, generative-AI frequency, primary use, use for decisions, group, each choice, each confidence rating, and seconds on each Phase I and Phase III decision page. Phase II columns in that block are choices only. Explanation answers are new columns at the end of the row, in order: every Phase I Scenario N Explanation, then Phase II, then Phase III. The script appends those header cells on row 1 when they are missing. It does not rewrite existing header cells. Older response rows leave the new cells blank.

The Group column stays where it is and stores the mapped condition: Monday → Control, Tuesday → Experimental. A Session column was not added. Inserting one would shift Group away from the existing header.

Only Phase I and Phase III decision pages record seconds. Explanation pages, Phase II, instruction pages, and completion are not timed.

If you change the scenario counts after real responses exist, use a new tab or spreadsheet. Existing header cells stay as they are.

Editing the Apps Script does not update a deployment that is already live. Deploy a new version and, if the URL changes, rebuild the site with the new URL.

The fetch uses `no-cors`, same as the music study, because Apps Script does not send CORS headers. The browser cannot read the response. A failed request shows a toast on the completion page, and on the page shown after a declined consent.

## Musical-training spreadsheet

That survey still posts to the Apps Script URL already set in [`public/studies/musical-training/index.html`](public/studies/musical-training/index.html). The script for that sheet is [`google-apps-script.js`](google-apps-script.js). Leave that URL and that sheet alone when you set up the AI study.

Audio files live in `public/audio-samples/`.

## GitHub Pages

The custom domain is `susannaziesmer.com`, from [`public/CNAME`](public/CNAME). The static export copies that file into `out/`, which is what Pages publishes.

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds on pushes to `main` and deploys the `out/` directory.

**Before this replaces the live site,** set the repository’s Pages source to **GitHub Actions** (Settings → Pages → Build and deployment → Source). The previous site was published from the branch root. After this change, the branch root is the Next.js project, not the finished HTML. Publishing the branch root would take the domain down until Actions is the source.

`NEXT_PUBLIC_AI_STUDY_SCRIPT_URL` can be empty. The site still builds. Completed AI sessions are not saved until the secret is set and the site is rebuilt.

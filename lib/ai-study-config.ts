/**
 * Web app URL for the AI decision study spreadsheet.
 * Leave this empty in the repo. Set NEXT_PUBLIC_AI_STUDY_SCRIPT_URL at build
 * time (local .env.local or a GitHub Actions secret). See README.md.
 * Do not paste a deployment URL into source control.
 */
export const AI_STUDY_SCRIPT_URL =
  process.env.NEXT_PUBLIC_AI_STUDY_SCRIPT_URL?.trim() ?? "";

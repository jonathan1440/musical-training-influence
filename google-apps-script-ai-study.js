/**
 * Google Apps Script for the AI decision study.
 * Paste this into a NEW Google Sheet, not the musical-training study sheet.
 *
 * Setup:
 * 1. Create a new Google Sheet.
 * 2. Extensions → Apps Script.
 * 3. Delete any existing code, paste this entire file.
 * 4. Deploy → New deployment → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Authorize when prompted.
 * 6. Copy the web app URL into NEXT_PUBLIC_AI_STUDY_SCRIPT_URL and rebuild.
 *    Do not commit that URL.
 *
 * Responses land on a tab named "AI Decision Study" (created if needed).
 * One completed session is one row. Consent "No" is never posted.
 * Columns follow the JSON headers, which include seconds only for
 * Phase I and Phase III decision pages.
 *
 * If you change the scenario counts, start a fresh tab or spreadsheet.
 * Existing headers stay as they were on the first submission.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "AI Decision Study";
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    var headers = data.headers || [];
    var values = data.values || [];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    sheet.appendRow(values);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "AI decision study backend is running." }))
    .setMimeType(ContentService.MimeType.JSON);
}

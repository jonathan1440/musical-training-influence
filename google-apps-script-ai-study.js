/**
 * Google Apps Script for the AI decision study.
 * The live spreadsheet already exists. Paste this into that sheet's
 * existing Apps Script project, then deploy a new version of the existing
 * web app (Deploy → Manage deployments → Edit → New version).
 * Do not create a second spreadsheet. Do not commit the web app URL.
 * If a new deployment changes the URL, rebuild the site with
 * NEXT_PUBLIC_AI_STUDY_SCRIPT_URL. Do not commit that URL.
 *
 * Completed sessions append to a tab named "AI Decision Study".
 * Explanation columns arrive at the end of the existing columns.
 * Phase II confidence columns arrive after those explanation columns.
 * appendMissingHeaders writes those new labels on row 1 only.
 * Do not rewrite existing header cells. Do not insert or shift columns.
 *
 * A declined consent is posted with declined: true. writeDeclinedConsent
 * stores it on a tab named "Declined consent" with only Timestamp and Full Name.
 * That row is not written to the response tab.
 *
 * If you change the scenario counts after real responses exist, start a
 * fresh tab or spreadsheet. Existing header cells are left as they are.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.declined) {
      writeDeclinedConsent(ss, data);
      return jsonResult({ status: "ok" });
    }

    var sheetName = "AI Decision Study";
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    var headers = data.headers || [];
    var values = data.values || [];
    appendMissingHeaders(sheet, headers);
    sheet.appendRow(values);

    return jsonResult({ status: "ok" });
  } catch (err) {
    return jsonResult({ status: "error", message: err.toString() });
  }
}

function writeDeclinedConsent(ss, data) {
  var sheetName = "Declined consent";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Full Name"]);
  }
  var values = data.values || [];
  sheet.appendRow([values[0] || "", values[1] || ""]);
}

function appendMissingHeaders(sheet, headers) {
  if (!headers || headers.length === 0) return;
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return;
  }

  var lastColumn = sheet.getLastColumn();
  var current = lastColumn > 0 ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0] : [];
  var filled = 0;
  for (var i = 0; i < current.length; i++) {
    if (current[i] !== "" && current[i] !== null) filled = i + 1;
  }
  if (headers.length <= filled) return;

  var extra = headers.slice(filled);
  sheet.getRange(1, filled + 1, 1, extra.length).setValues([extra]);
}

function jsonResult(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return jsonResult({ status: "ok", message: "AI decision study backend is running." });
}

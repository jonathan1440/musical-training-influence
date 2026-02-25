/**
 * Google Apps Script — paste this into your Sheet's Apps Script editor.
 *
 * Setup:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Delete any existing code, paste this entire file
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Authorize when prompted
 * 6. Copy the deployment URL into your index.html SCRIPT_URL
 *
 * Each survey submission becomes one row. Columns:
 *   Timestamp | Age | Gender | Musical Training |
 *   E1_ID | E1_Order | E1_Heard | E1_Rating |
 *   E2_ID | E2_Order | E2_Heard | E2_Rating |
 *   ... (repeated for all 18 excerpts)
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = ['Timestamp', 'Age', 'Gender', 'Musical Training'];
      for (var i = 1; i <= 18; i++) {
        headers.push(
          'E' + i + '_ID',
          'E' + i + '_Order',
          'E' + i + '_Heard',
          'E' + i + '_Rating'
        );
      }
      sheet.appendRow(headers);
    }

    // Build the row
    var row = [
      data.timestamp || new Date().toISOString(),
      data.age || '',
      data.gender || '',
      data.musicalTraining || ''
    ];

    // Append excerpt responses (sorted by presentation order)
    var sorted = (data.responses || []).sort(function(a, b) {
      return a.presentationOrder - b.presentationOrder;
    });

    for (var j = 0; j < sorted.length; j++) {
      row.push(
        sorted[j].excerptId || '',
        sorted[j].presentationOrder || '',
        sorted[j].heardBefore || '',
        sorted[j].rating || ''
      );
    }

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight (though no-cors mode usually avoids this)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Survey backend is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

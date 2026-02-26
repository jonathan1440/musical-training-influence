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
 *   Timestamp | Age | Gender | Musical Training | Training Q1 | Training Q2 | Training Q3 |
 *   Q1_ID | Q1_Order | Q1_Heard | Q1_Rating | Q1_TimeSec |
 *   Q2_ID | Q2_Order | Q2_Heard | Q2_Rating | Q2_TimeSec |
 *   ... (repeated for all 18 excerpts)
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = ['Timestamp', 'Age', 'Gender', 'Musical Training', 'Training Q1', 'Training Q2', 'Training Q3'];
      for (var i = 1; i <= 18; i++) {
        headers.push(
          'Q' + i + '_ID',
          'Q' + i + '_Order',
          'Q' + i + '_Heard',
          'Q' + i + '_Rating',
          'Q' + i + '_TimeSec'
        );
      }
      sheet.appendRow(headers);
    }

    // Build the row
    var row = [
      data.timestamp || new Date().toISOString(),
      data.age || '',
      data.gender || '',
      data.musicalTraining || '',
      data.trainingQ1 || '',
      data.trainingQ2 || '',
      data.trainingQ3 || ''
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
        sorted[j].rating || '',
        sorted[j].timeOnPageSeconds !== undefined ? sorted[j].timeOnPageSeconds : ''
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

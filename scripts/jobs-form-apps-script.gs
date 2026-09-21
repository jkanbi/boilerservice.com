/**
 * LEGACY — no longer used by the live /book/ form.
 * js/book.js now POSTs to the Supabase Edge Function `submit-booking`.
 *
 * BoilerService — Jobs form intake (Google Apps Script Web App)
 *
 * Spreadsheet: BoilerService — Jobs
 * ID: 1sAOQzDlgAa3DB4vDZ-4Op5h7Arre8xW1q5poMx98_Gc
 * URL: https://docs.google.com/spreadsheets/d/1sAOQzDlgAa3DB4vDZ-4Op5h7Arre8xW1q5poMx98_Gc/edit
 *
 * ---------------------------------------------------------------------------
 * Deploy (bound to the spreadsheet)
 * ---------------------------------------------------------------------------
 * 1. Open the spreadsheet above.
 * 2. Extensions → Apps Script.
 * 3. Delete any default code and paste this entire file.
 * 4. Confirm SPREADSHEET_ID below matches the sheet (already set).
 * 5. Deploy → New deployment → Type: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Authorise when prompted, then copy the Web App URL (…/exec).
 * 7. Paste that URL into js/book.js as SHEET_WEBHOOK_URL.
 *
 * CORS: Apps Script has no doOptions. The site POSTs JSON as text/plain so
 * the browser does not preflight. doPost still parses JSON and returns JSON.
 *
 * Test: open the Web App URL in a browser (GET) — you should see {"ok":true,...}.
 */

var SPREADSHEET_ID = "1sAOQzDlgAa3DB4vDZ-4Op5h7Arre8xW1q5poMx98_Gc";
var PREFERRED_SHEET_NAME = "Jobs";

/** Header order. boiler_model is inserted after boiler_brand if missing. */
var EXPECTED_HEADERS = [
  "job_id",
  "created_at",
  "status",
  "job_type",
  "customer_name",
  "mobile",
  "email",
  "postcode",
  "address",
  "boiler_brand",
  "boiler_model",
  "boiler_age",
  "repair_issue",
  "fault_code",
  "preferred_window",
  "access_notes",
  "matched_engineer",
  "engineer_price",
  "stripe_link",
  "notes"
];

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return jsonOutput_({
    ok: true,
    service: "BoilerService Jobs intake"
  });
}

function doPost(e) {
  try {
    var data = parseBody_(e);

    // Honeypot: treat as success without writing a row.
    if (stringValue_(data._honey) || stringValue_(data.company_website)) {
      return jsonOutput_({ ok: true });
    }

    var result = appendJob_(data);
    return jsonOutput_({ ok: true, job_id: result.job_id });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function parseBody_(e) {
  if (!e) {
    return {};
  }

  if (e.postData && e.postData.contents) {
    var raw = String(e.postData.contents || "").trim();
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch (err) {
        // Fall through to form parameters (application/x-www-form-urlencoded).
      }
    }
  }

  return e.parameter || {};
}

function stringValue_(value) {
  if (value == null) {
    return "";
  }
  return String(value).trim();
}

function makeJobId_() {
  var now = new Date();
  var y = now.getUTCFullYear();
  var m = ("0" + (now.getUTCMonth() + 1)).slice(-2);
  var d = ("0" + now.getUTCDate()).slice(-2);
  var rand = Utilities.getUuid().replace(/-/g, "").slice(0, 8).toUpperCase();
  return "JOB-" + y + m + d + "-" + rand;
}

function getJobsSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(PREFERRED_SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  if (!sheet) {
    throw new Error("No worksheet found in the Jobs spreadsheet.");
  }
  return sheet;
}

function headerKey_(value) {
  return String(value || "").trim().toLowerCase();
}

function ensureHeaders_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
    return String(h || "").trim();
  });

  var hasAny = existing.some(function (h) {
    return h;
  });

  if (!hasAny) {
    sheet.getRange(1, 1, 1, EXPECTED_HEADERS.length).setValues([EXPECTED_HEADERS]);
    return EXPECTED_HEADERS.slice();
  }

  var headers = existing.filter(function (h) {
    return h;
  });
  var lower = headers.map(headerKey_);
  var changed = false;

  function hasHeader(name) {
    return lower.indexOf(headerKey_(name)) !== -1;
  }

  function insertAfter(name, afterName) {
    if (hasHeader(name)) {
      return;
    }
    var afterIdx = lower.indexOf(headerKey_(afterName));
    if (afterIdx === -1) {
      headers.push(name);
      lower.push(headerKey_(name));
    } else {
      headers.splice(afterIdx + 1, 0, name);
      lower.splice(afterIdx + 1, 0, headerKey_(name));
    }
    changed = true;
  }

  insertAfter("boiler_model", "boiler_brand");

  EXPECTED_HEADERS.forEach(function (name) {
    if (!hasHeader(name)) {
      headers.push(name);
      lower.push(headerKey_(name));
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return headers;
}

function appendJob_(data) {
  data = data || {};
  var sheet = getJobsSheet_();
  var headers = ensureHeaders_(sheet);

  var jobId = makeJobId_();
  var createdAt = new Date().toISOString();
  var address = stringValue_(data.address);
  if (!address) {
    address = [stringValue_(data.street_address), stringValue_(data.town)].filter(Boolean).join(", ");
  }

  var preferred = stringValue_(data.preferred_window);
  if (!preferred) {
    preferred = [stringValue_(data.preferred_date), stringValue_(data.preferred_notes)].filter(Boolean).join(" — ");
  }

  var notes = stringValue_(data.notes);
  var consent = stringValue_(data.consent);
  if (consent && notes.toLowerCase().indexOf("consent") === -1) {
    notes = notes ? notes + " Consent: " + consent + "." : "Consent: " + consent + ".";
  }

  var rowMap = {
    job_id: jobId,
    created_at: createdAt,
    status: "new",
    job_type: stringValue_(data.job_type),
    customer_name: stringValue_(data.customer_name) || stringValue_(data.full_name),
    mobile: stringValue_(data.mobile),
    email: stringValue_(data.email),
    postcode: stringValue_(data.postcode).toUpperCase(),
    address: address,
    boiler_brand: stringValue_(data.boiler_brand),
    boiler_model: stringValue_(data.boiler_model),
    boiler_age: stringValue_(data.boiler_age),
    repair_issue: stringValue_(data.repair_issue),
    fault_code: stringValue_(data.fault_code),
    preferred_window: preferred,
    access_notes: stringValue_(data.access_notes),
    matched_engineer: "",
    engineer_price: "",
    stripe_link: "",
    notes: notes
  };

  var row = headers.map(function (header) {
    var key = headerKey_(header);
    return Object.prototype.hasOwnProperty.call(rowMap, key) ? rowMap[key] : "";
  });

  sheet.appendRow(row);
  return { job_id: jobId };
}

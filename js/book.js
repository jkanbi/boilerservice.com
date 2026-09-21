(function () {
  // Google Apps Script Web App URL (doPost) that appends a row to
  // “BoilerService — Jobs” (spreadsheet 1sAOQzDlgAa3DB4vDZ-4Op5h7Arre8xW1q5poMx98_Gc).
  //
  // After deploying scripts/jobs-form-apps-script.gs as a Web App
  // (Execute as: Me, Who has access: Anyone), paste the /exec URL here.
  var SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbw4CVLC8DGwJWOiS_vbo5CKzfqkDCh6eLhiAEgJUxn_KepmrgSMcuKM09CEsnL9Pk9E/exec";

  var UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
  var UK_MOBILE = /^(?:\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
  var WEBHOOK_MISSING_MESSAGE =
    "Booking submissions are not connected yet. Set SHEET_WEBHOOK_URL in js/book.js after deploying the Apps Script web app.";

  var form = document.getElementById("booking-form");
  if (!form) {
    return;
  }

  var repairFields = document.getElementById("repair-fields");
  var repairIssue = document.getElementById("repair-issue");
  var submitButton = document.getElementById("submit-button");
  var formError = document.getElementById("form-error");
  var formSuccess = document.getElementById("form-success");
  var formConfigWarning = document.getElementById("form-config-warning");
  var preferredDate = document.getElementById("preferred-date");

  function webhookUrl() {
    return String(SHEET_WEBHOOK_URL || "").trim();
  }

  function webhookConfigured() {
    return webhookUrl().indexOf("https://") === 0;
  }

  if (!webhookConfigured()) {
    console.warn("[BoilerService /book] " + WEBHOOK_MISSING_MESSAGE);
    if (formConfigWarning) {
      formConfigWarning.hidden = false;
      formConfigWarning.textContent = WEBHOOK_MISSING_MESSAGE;
    }
  }

  function todayISO() {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }

  if (preferredDate) {
    preferredDate.min = todayISO();
  }

  function selectedValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function setRepairVisibility() {
    var isRepair = selectedValue("job_type") === "Repair";
    repairFields.hidden = !isRepair;
    repairIssue.required = isRepair;
    repairIssue.setAttribute("aria-required", isRepair ? "true" : "false");
    if (!isRepair) {
      clearFieldError("repair-issue");
    }
  }

  form.querySelectorAll('input[name="job_type"]').forEach(function (input) {
    input.addEventListener("change", setRepairVisibility);
  });
  setRepairVisibility();

  function fieldWrap(id) {
    var el = document.getElementById(id);
    return el ? el.closest(".form-field") || el.closest(".form-fieldset") : null;
  }

  function showFieldError(id, message) {
    var error = document.getElementById(id + "-error");
    var input = document.getElementById(id);
    var wrap = fieldWrap(id);
    if (error) {
      error.hidden = false;
      error.textContent = message;
    }
    if (input) {
      input.setAttribute("aria-invalid", "true");
      if (id === "boiler-model") {
        input.setAttribute("aria-describedby", "boiler-model-hint " + id + "-error");
      } else if (id === "postcode") {
        input.setAttribute("aria-describedby", "postcode-hint " + id + "-error");
      } else {
        input.setAttribute("aria-describedby", id + "-error");
      }
    }
    if (wrap) {
      wrap.classList.add("is-invalid");
    }
  }

  function clearFieldError(id) {
    var error = document.getElementById(id + "-error");
    var input = document.getElementById(id);
    var wrap = fieldWrap(id);
    if (error) {
      error.hidden = true;
      error.textContent = "";
    }
    if (input) {
      input.removeAttribute("aria-invalid");
      if (id === "postcode") {
        input.setAttribute("aria-describedby", "postcode-hint");
      } else if (id === "boiler-model") {
        input.setAttribute("aria-describedby", "boiler-model-hint");
      } else {
        input.removeAttribute("aria-describedby");
      }
    }
    if (wrap) {
      wrap.classList.remove("is-invalid");
    }
  }

  function clearAllErrors() {
    formError.hidden = true;
    formError.textContent = "";
    ["full-name", "mobile", "email", "postcode", "street", "town", "job-type", "boiler-brand", "repair-issue", "preferred", "consent"].forEach(clearFieldError);
    var preferredWrap = document.getElementById("preferred-error");
    if (preferredWrap) {
      preferredWrap.closest(".form-fieldset").classList.remove("is-invalid");
    }
    var jobWrap = document.getElementById("job-type-error");
    if (jobWrap) {
      jobWrap.closest(".form-fieldset").classList.remove("is-invalid");
    }
  }

  function normaliseMobile(value) {
    return value.replace(/[()\s-]/g, "");
  }

  function isUkMobile(value) {
    var compact = normaliseMobile(value);
    if (/^07\d{9}$/.test(compact)) {
      return true;
    }
    if (/^\+447\d{9}$/.test(compact)) {
      return true;
    }
    return UK_MOBILE.test(value.trim());
  }

  function validate() {
    clearAllErrors();
    var ok = true;
    var firstInvalid = null;

    function fail(id, message, focusEl) {
      showFieldError(id, message);
      if (!firstInvalid) {
        firstInvalid = focusEl || document.getElementById(id);
      }
      ok = false;
    }

    var name = form.customer_name.value.trim();
    if (!name) {
      fail("full-name", "Enter your full name.");
    }

    var mobile = form.mobile.value.trim();
    if (!mobile) {
      fail("mobile", "Enter a UK mobile number.");
    } else if (!isUkMobile(mobile)) {
      fail("mobile", "Enter a valid UK mobile, such as 07xxx xxx xxx.");
    }

    var email = form.email.value.trim();
    if (!email) {
      fail("email", "Enter your email address.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fail("email", "Enter a valid email address.");
    }

    var postcode = form.postcode.value.trim();
    if (!postcode) {
      fail("postcode", "Enter a UK postcode.");
    } else if (!UK_POSTCODE.test(postcode)) {
      fail("postcode", "Enter a valid UK postcode, such as NW10 4AB.");
    }

    if (!form.street_address.value.trim()) {
      fail("street", "Enter the street address.");
    }

    if (!form.town.value.trim()) {
      fail("town", "Enter the town or area.");
    }

    if (!selectedValue("job_type")) {
      fail("job-type", "Choose annual service or repair.", form.querySelector('input[name="job_type"]'));
    }

    if (!form.boiler_brand.value) {
      fail("boiler-brand", "Select a boiler brand, or Other / not sure.");
    }

    if (selectedValue("job_type") === "Repair" && !form.repair_issue.value.trim()) {
      fail("repair-issue", "Briefly describe what’s wrong.");
    }

    var dateValue = form.preferred_date.value;
    var notesValue = form.preferred_notes.value.trim();
    var windowValue = selectedValue("preferred_window");
    if (!dateValue && !notesValue) {
      fail("preferred", "Choose a preferred date or describe what days work.", form.preferred_date);
    } else if (!windowValue) {
      fail("preferred", "Choose morning, afternoon, or evening.", form.querySelector('input[name="preferred_window"]'));
    }

    if (!form.consent.checked) {
      fail("consent", "Please confirm you agree to be contacted about this booking.");
    }

    if (!ok && firstInvalid) {
      firstInvalid.focus();
    }

    return ok;
  }

  function combinedAddress() {
    var street = form.street_address.value.trim();
    var town = form.town.value.trim();
    return [street, town].filter(Boolean).join(", ");
  }

  function combinedPreferredWindow() {
    var parts = [];
    if (form.preferred_date.value) {
      parts.push(form.preferred_date.value);
    }
    var windowValue = selectedValue("preferred_window");
    if (windowValue) {
      parts.push(windowValue);
    }
    var notesValue = form.preferred_notes.value.trim();
    if (notesValue) {
      parts.push(notesValue);
    }
    return parts.join(" — ");
  }

  function payloadFromForm() {
    return {
      customer_name: form.customer_name.value.trim(),
      mobile: form.mobile.value.trim(),
      email: form.email.value.trim(),
      postcode: form.postcode.value.trim().toUpperCase(),
      address: combinedAddress(),
      job_type: selectedValue("job_type"),
      boiler_brand: form.boiler_brand.value,
      boiler_model: form.boiler_model.value.trim(),
      boiler_age: form.boiler_age.value,
      repair_issue: form.repair_issue.value.trim(),
      fault_code: form.fault_code.value.trim(),
      preferred_window: combinedPreferredWindow(),
      access_notes: form.access_notes.value.trim(),
      notes: "Consent: yes. Launch area: NW London–M25.",
      consent: form.consent.checked ? "Yes" : "No"
    };
  }

  function showError(message) {
    formError.hidden = false;
    formError.textContent = message;
    formError.focus();
  }

  var bookingPanel = document.getElementById("booking-panel");

  function showSuccess() {
    if (bookingPanel) {
      bookingPanel.hidden = true;
    }
    form.hidden = true;
    formError.hidden = true;
    formSuccess.hidden = false;
    formSuccess.focus();
    formSuccess.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function parseJsonSafe(text) {
    try {
      return JSON.parse(text);
    } catch (err) {
      return null;
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    if (form._honey.value) {
      showSuccess();
      return;
    }

    if (!webhookConfigured()) {
      console.warn("[BoilerService /book] " + WEBHOOK_MISSING_MESSAGE);
      showError(WEBHOOK_MISSING_MESSAGE);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    formError.hidden = true;

    // text/plain avoids a CORS preflight; Apps Script cannot handle OPTIONS.
    // The Web App still parses JSON from the request body.
    fetch(webhookUrl(), {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payloadFromForm())
    })
      .then(function (response) {
        return response.text().then(function (text) {
          return { ok: response.ok, status: response.status, data: parseJsonSafe(text), text: text };
        });
      })
      .then(function (result) {
        var data = result.data || {};
        if (result.ok && data.ok === true) {
          showSuccess();
          return;
        }
        if (result.ok && data.ok === false) {
          throw new Error(data.error || "The booking sheet rejected this request.");
        }
        throw new Error("Unexpected response from the booking sheet.");
      })
      .catch(function () {
        showError("We couldn’t send this request just now. Please try again, or message us on WhatsApp via the homepage.");
        submitButton.disabled = false;
        submitButton.textContent = "Send booking request";
      });
  });

  form.addEventListener("input", function (event) {
    var target = event.target;
    if (!target) {
      return;
    }
    if (target.id && target.getAttribute("aria-invalid") === "true") {
      clearFieldError(target.id);
    }
  });

  form.addEventListener("change", function (event) {
    var target = event.target;
    if (!target || !target.name) {
      return;
    }
    if (target.name === "job_type") {
      clearFieldError("job-type");
    }
    if (target.name === "preferred_window" || target.name === "preferred_date" || target.name === "preferred_notes") {
      clearFieldError("preferred");
    }
    if (target.name === "consent") {
      clearFieldError("consent");
    }
  });
})();

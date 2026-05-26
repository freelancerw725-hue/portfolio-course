export const LIVE_PAYU_PAYMENT_URL = "https://secure.payu.in/_payment";

function resolveLivePayuAction(action) {
  if (typeof action !== "string" || !action.trim()) {
    throw new Error("PayU redirect failure: the payment URL is missing.");
  }

  let paymentUrl;

  try {
    paymentUrl = new URL(action);
  } catch (_error) {
    throw new Error("PayU redirect failure: received an invalid payment URL.");
  }

  if (!["http:", "https:"].includes(paymentUrl.protocol)) {
    throw new Error("PayU redirect failure: received an unsupported payment URL.");
  }

  if (paymentUrl.toString() !== LIVE_PAYU_PAYMENT_URL) {
    throw new Error(
      `PayU redirect failure: expected ${LIVE_PAYU_PAYMENT_URL} but received ${paymentUrl.toString()}.`
    );
  }

  return LIVE_PAYU_PAYMENT_URL;
}

export function submitPayuForm(action, fields) {
  if (typeof document === "undefined") {
    throw new Error(
      "PayU redirect failure: the browser context is unavailable."
    );
  }

  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    throw new Error("PayU redirect failure: missing payment form fields.");
  }

  const livePayuAction = resolveLivePayuAction(action);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = livePayuAction;
  form.style.display = "none";

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  if (form.childElementCount === 0) {
    throw new Error("PayU redirect failure: no payment fields were provided.");
  }

  document.body.appendChild(form);

  if (typeof form.submit !== "function") {
    document.body.removeChild(form);
    throw new Error(
      "PayU redirect failure: the browser could not submit the payment form."
    );
  }

  form.submit();
}

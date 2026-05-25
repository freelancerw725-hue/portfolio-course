const crypto = require("crypto");
const config = require("../config/env");

const PAYU_BASE_URLS = {
  test: "https://test.payu.in/_payment",
  production: "https://secure.payu.in/_payment",
};

const sha512 = (value) =>
  crypto.createHash("sha512").update(value).digest("hex");

const createTxnId = () =>
  `TXN${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const formatAmount = (value) => {
  const parsedAmount = Number(value);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error("PAYU_AMOUNT must be a valid positive number.");
  }

  return parsedAmount.toFixed(2);
};

const normalizeHashField = (value, fieldName) => {
  const normalizedValue =
    typeof value === "string" ? value.replace(/[\r\n]+/g, " ").trim() : "";

  if (!normalizedValue) {
    throw new Error(`Missing required PayU field: ${fieldName}`);
  }

  if (normalizedValue.includes("undefined")) {
    throw new Error(`Invalid PayU field value for ${fieldName}`);
  }

  return normalizedValue;
};

function buildRequestHashString({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  salt,
}) {
  const normalizedValues = {
    key: normalizeHashField(key, "key"),
    txnid: normalizeHashField(txnid, "txnid"),
    amount: normalizeHashField(amount, "amount"),
    productinfo: normalizeHashField(productinfo, "productinfo"),
    firstname: normalizeHashField(firstname, "firstname"),
    email: normalizeHashField(email, "email").toLowerCase(),
    salt: normalizeHashField(salt, "salt"),
  };

  return `${normalizedValues.key}|${normalizedValues.txnid}|${normalizedValues.amount}|${normalizedValues.productinfo}|${normalizedValues.firstname}|${normalizedValues.email}|||||||||||${normalizedValues.salt}`;
}

function generateRequestHash(payload) {
  const hashString = buildRequestHashString(payload);
  const hash = sha512(hashString);

  console.log("[PayU] Generated request hash string:", hashString);
  console.log("[PayU] Generated request hash:", hash);

  return {
    hashString,
    hash,
  };
}

function verifyResponseHash(responseBody = {}) {
  const {
    status = "",
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    email = "",
    firstname = "",
    productinfo = "",
    amount = "",
    txnid = "",
    additionalCharges = "",
    additional_charges = "",
    hash = "",
  } = responseBody;

  const normalizedAdditionalCharges =
    additional_charges || additionalCharges || "";

  const reverseHashSequence = [
    normalizeHashField(config.payuSalt, "salt"),
    normalizeHashField(status, "status"),
    "",
    "",
    "",
    "",
    "",
    typeof udf5 === "string" ? udf5 : "",
    typeof udf4 === "string" ? udf4 : "",
    typeof udf3 === "string" ? udf3 : "",
    typeof udf2 === "string" ? udf2 : "",
    typeof udf1 === "string" ? udf1 : "",
    typeof email === "string" ? email.trim().toLowerCase() : "",
    typeof firstname === "string" ? firstname.replace(/[\r\n]+/g, " ").trim() : "",
    typeof productinfo === "string" ? productinfo.replace(/[\r\n]+/g, " ").trim() : "",
    typeof amount === "string" ? amount.trim() : String(amount || "").trim(),
    typeof txnid === "string" ? txnid.trim() : "",
    normalizeHashField(config.payuKey, "key"),
  ];

  if (normalizedAdditionalCharges) {
    reverseHashSequence.unshift(String(normalizedAdditionalCharges).trim());
  }

  const reverseHashString = reverseHashSequence.join("|");
  const expectedHash = sha512(reverseHashString);

  return {
    isValid:
      Boolean(hash) && expectedHash.toLowerCase() === String(hash).toLowerCase(),
    expectedHash,
    reverseHashString,
  };
}

function buildPaymentPayload({ name, email, phone }) {
  const amount = formatAmount(config.payuAmount);
  const productinfo = normalizeHashField(
    config.payuProductInfo,
    "productinfo"
  ).slice(0, 100);
  const txnid = createTxnId();
  const firstname = normalizeHashField(name, "firstname");
  const normalizedEmail = normalizeHashField(email, "email").toLowerCase();
  const normalizedPhone = normalizeHashField(phone, "phone");

  const fields = {
    key: config.payuKey,
    txnid,
    amount,
    productinfo,
    firstname,
    email: normalizedEmail,
    phone: normalizedPhone,
    // PayU POSTS the gateway response to these backend URLs first.
    // The backend then verifies the response hash and redirects the browser
    // to the matching frontend success or failure page.
    surl: `${config.backendBaseUrl}/api/payu/success`,
    furl: `${config.backendBaseUrl}/api/payu/failure`,
  };

  const { hash } = generateRequestHash({
    key: fields.key,
    txnid: fields.txnid,
    amount: fields.amount,
    productinfo: fields.productinfo,
    firstname: fields.firstname,
    email: fields.email,
    salt: config.payuSalt,
  });

  const finalFields = {
    ...fields,
    hash,
  };

  console.log(
    "[PayU] Final payload returned for browser submission:",
    JSON.stringify({
      paymentUrl: PAYU_BASE_URLS[config.payuMode],
      fields: finalFields,
    })
  );

  return {
    // Replace PAYU_KEY and PAYU_SALT in backend/.env with live dashboard
    // credentials, then switch PAYU_MODE=production to move this to live.
    paymentUrl: PAYU_BASE_URLS[config.payuMode],
    fields: finalFields,
    meta: {
      mode: config.payuMode,
      courseName: productinfo,
      amount,
    },
  };
}

function buildFrontendRedirectUrl({ status, responseBody = {}, verified }) {
  const redirectUrl = new URL(`${config.frontendBaseUrl}/`);
  const params = new URLSearchParams({
    status,
    verified: verified ? "true" : "false",
    txnid: responseBody.txnid || "",
    mihpayid: responseBody.mihpayid || "",
    amount: responseBody.amount || formatAmount(config.payuAmount),
    email: responseBody.email || "",
    course: responseBody.productinfo || config.payuProductInfo,
    mode: responseBody.mode || "",
    message:
      responseBody.error_Message ||
      responseBody.error ||
      (status === "success"
        ? "Payment completed successfully."
        : "Payment was not completed."),
  });

  redirectUrl.hash = `/payment/${status}?${params.toString()}`;
  return redirectUrl.toString();
}

module.exports = {
  buildFrontendRedirectUrl,
  buildRequestHashString,
  buildPaymentPayload,
  generateRequestHash,
  verifyResponseHash,
};

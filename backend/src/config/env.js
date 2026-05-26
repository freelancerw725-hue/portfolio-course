const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");
const cleanEnvValue = (value) =>
  typeof value === "string"
    ? value.replace(/[\u200B-\u200D\uFEFF\r\n]+/g, "").trim()
    : "";
const EXPECTED_TEST_PAYU_KEY = "bkOP0F";
const DEFAULT_PAYU_BASE_URL = "https://secure.payu.in/_payment";

console.log("PAYU_KEY ACTIVE:", cleanEnvValue(process.env.PAYU_KEY));
console.log("PAYU_SALT ACTIVE:", cleanEnvValue(process.env.PAYU_SALT));

function validatePayuKey(rawValue, payuMode) {
  const payuKey = cleanEnvValue(rawValue);

  if (!payuKey) {
    throw new Error("Missing required environment variable: PAYU_KEY");
  }

  if (payuKey.length !== EXPECTED_TEST_PAYU_KEY.length) {
    throw new Error(
      `PAYU_KEY must be exactly ${EXPECTED_TEST_PAYU_KEY.length} characters long.`
    );
  }

  if (payuMode === "test" && payuKey !== EXPECTED_TEST_PAYU_KEY) {
    throw new Error(
      `PAYU_KEY mismatch for test mode. Expected ${EXPECTED_TEST_PAYU_KEY}.`
    );
  }

  return payuKey;
}

const port = Number(process.env.PORT || 5000);
const payuModeRaw = cleanEnvValue(process.env.PAYU_MODE).toLowerCase();
const payuMode =
  payuModeRaw === "production" || payuModeRaw === "live" ? "live" : "test";

function validatePayuBaseUrl(rawValue) {
  const payuBaseUrl = cleanEnvValue(rawValue) || DEFAULT_PAYU_BASE_URL;

  try {
    const parsed = new URL(payuBaseUrl);

    if (parsed.protocol !== "https:") {
      throw new Error("PAYU_BASE_URL must use https.");
    }

    if (!parsed.pathname.endsWith("/_payment")) {
      throw new Error('PAYU_BASE_URL must end with "/_payment".');
    }
  } catch (error) {
    throw new Error(
      `Invalid PAYU_BASE_URL value: ${error.message || String(error)}`
    );
  }

  return payuBaseUrl;
}

const config = {
  port,
  frontendBaseUrl: stripTrailingSlash(
    process.env.FRONTEND_BASE_URL || "https://portfolio-course.vercel.app"
  ),
  backendBaseUrl: stripTrailingSlash(
    process.env.BACKEND_BASE_URL || "https://portfolio-course.onrender.com"
  ),
  payuMode,
  payuKey: validatePayuKey(process.env.PAYU_KEY, payuMode),
  payuSalt: cleanEnvValue(process.env.PAYU_SALT),
  payuBaseUrl: validatePayuBaseUrl(process.env.PAYU_BASE_URL),
  payuAmount: cleanEnvValue(process.env.PAYU_AMOUNT) || "499",
  payuProductInfo:
    cleanEnvValue(process.env.PAYU_PRODUCT_INFO) ||
    "AI Tools Se Website Bana Kar Clients Se Paise Kamao",
};

console.log("PAYU BASE URL ACTIVE:", config.payuBaseUrl);

const missingEnvVars = ["PAYU_KEY", "PAYU_SALT"].filter(
  (key) => !cleanEnvValue(process.env[key])
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

module.exports = config;

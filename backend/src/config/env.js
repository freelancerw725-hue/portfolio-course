const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("PAYU_KEY ACTIVE:", process.env.PAYU_KEY);

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");
const cleanEnvValue = (value) =>
  typeof value === "string"
    ? value.replace(/[\u200B-\u200D\uFEFF\r\n]+/g, "").trim()
    : "";
const EXPECTED_TEST_PAYU_KEY = "bkOP0F";

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
const payuMode =
  process.env.PAYU_MODE &&
  process.env.PAYU_MODE.toLowerCase() === "production"
    ? "production"
    : "test";

const config = {
  port,
  frontendBaseUrl: stripTrailingSlash(
    process.env.FRONTEND_BASE_URL || "http://localhost:3000"
  ),
  backendBaseUrl: stripTrailingSlash(
    process.env.BACKEND_BASE_URL || `http://localhost:${port}`
  ),
  payuMode,
  payuKey: validatePayuKey(process.env.PAYU_KEY, payuMode),
  payuSalt: cleanEnvValue(process.env.PAYU_SALT),
  payuAmount: cleanEnvValue(process.env.PAYU_AMOUNT) || "499.00",
  payuProductInfo:
    cleanEnvValue(process.env.PAYU_PRODUCT_INFO) ||
    "AI Tools Se Website Bana Kar Clients Se Paise Kamao",
};

const missingEnvVars = ["PAYU_KEY", "PAYU_SALT"].filter(
  (key) => !cleanEnvValue(process.env[key])
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

module.exports = config;

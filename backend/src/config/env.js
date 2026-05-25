const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("PAYU_KEY:", process.env.PAYU_KEY);

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");
const cleanEnvValue = (value) =>
  typeof value === "string" ? value.replace(/[\r\n]+/g, "").trim() : "";

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
  payuKey: cleanEnvValue(process.env.PAYU_KEY),
  payuSalt: cleanEnvValue(process.env.PAYU_SALT),
  payuAmount: cleanEnvValue(process.env.PAYU_AMOUNT) || "499.00",
  payuProductInfo:
    cleanEnvValue(process.env.PAYU_PRODUCT_INFO) ||
    "AI Tools Se Website Bana Kar Clients Se Paise Kamao",
};

const missingEnvVars = ["PAYU_KEY", "PAYU_SALT"].filter(
  (key) => !process.env[key]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

module.exports = config;

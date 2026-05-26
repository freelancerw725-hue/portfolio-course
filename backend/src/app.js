const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const config = require("./config/env");
const payuRoutes = require("./routes/payu");

const app = express();

const allowedOrigins = new Set([
  config.frontendBaseUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://portfolio-course.vercel.app",
]);
const vercelPreviewOriginPattern =
  /^https:\/\/portfolio-course(?:-[a-z0-9-]+)?\.vercel\.app$/;

function isAllowedOrigin(origin) {
  return (
    allowedOrigins.has(origin) || vercelPreviewOriginPattern.test(origin)
  );
}

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "payu-backend",
    mode: config.payuMode,
  });
});

app.use("/api/payu", payuRoutes);

app.use((error, _req, res, _next) => {
  const statusCode = error.message === "Origin not allowed by CORS." ? 403 : 500;

  console.error(error);
  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 403
        ? "This origin is not allowed to call the API."
        : "Internal server error.",
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

module.exports = app;

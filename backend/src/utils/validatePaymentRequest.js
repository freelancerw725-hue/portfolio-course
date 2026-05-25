const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

const normalizeValue = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

function validatePaymentRequest(payload = {}) {
  const name = normalizeValue(payload.name);
  const email = normalizeValue(payload.email).toLowerCase();
  const phone = normalizeValue(payload.phone).replace(/\D/g, "");

  if (!name || !email || !phone) {
    return {
      isValid: false,
      message: "Name, email, and phone are required.",
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      message: "Enter a valid email address.",
    };
  }

  if (!PHONE_REGEX.test(phone)) {
    return {
      isValid: false,
      message: "Enter a valid 10-digit Indian mobile number.",
    };
  }

  if (name.length > 60) {
    return {
      isValid: false,
      message: "Name must be 60 characters or fewer for PayU.",
    };
  }

  return {
    isValid: true,
    data: {
      name,
      email,
      phone,
    },
  };
}

module.exports = {
  validatePaymentRequest,
};

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PaymentStatusPage from "./components/PaymentStatusPage";
import { submitPayuForm } from "./lib/payu";

const COURSE_NAME = "AI Tools Se Website Bana Kar Clients Se Paise Kamao";
const COURSE_PRICE = "499.00";
const COURSE_PRICE_LABEL = `₹${COURSE_PRICE.replace(".00", "")}`;
const assetPath = (fileName) => `${process.env.PUBLIC_URL}/assets/${fileName}`;
const DEFAULT_API_BASE_URL = "https://portfolio-course.onrender.com";
const API_BASE_URL = (
  process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");
const PAYU_CREATE_PAYMENT_PATH = "/api/payu/create-payment";
const PAYMENT_REQUEST_TIMEOUT_MS = 15000;

class PaymentRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "PaymentRequestError";
  }
}

function getCreatePaymentUrl() {
  return `${API_BASE_URL}${PAYU_CREATE_PAYMENT_PATH}`;
}

async function parsePaymentResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new PaymentRequestError(
      "The payment service returned an invalid response."
    );
  }

  try {
    return await response.json();
  } catch (_error) {
    throw new PaymentRequestError(
      "The payment service returned invalid JSON."
    );
  }
}

function validatePaymentSession(payment) {
  if (!payment || typeof payment !== "object") {
    throw new PaymentRequestError(
      "The payment service returned an invalid response."
    );
  }

  if (!payment.success) {
    throw new PaymentRequestError(
      payment.message || "Could not start the PayU checkout."
    );
  }

  if (typeof payment.paymentUrl !== "string" || !payment.paymentUrl.trim()) {
    throw new PaymentRequestError(
      "PayU redirect failure: the payment URL is missing."
    );
  }

  if (!payment.fields || typeof payment.fields !== "object") {
    throw new PaymentRequestError(
      "PayU redirect failure: the payment form fields are missing."
    );
  }

  return payment;
}

async function createPaymentSession(payload) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    PAYMENT_REQUEST_TIMEOUT_MS
  );
  const endpoint = getCreatePaymentUrl();

  console.log("[Checkout] API URL used:", API_BASE_URL);
  console.log("[Checkout] Payment request start:", endpoint);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const payment = await parsePaymentResponse(response);

    console.log("[Checkout] Backend response:", {
      success: payment.success,
      paymentUrl: payment.paymentUrl,
      course: payment.course,
      hasFields: Boolean(payment.fields),
    });

    if (!response.ok) {
      throw new PaymentRequestError(
        payment.message || "Could not start the PayU checkout."
      );
    }

    return validatePaymentSession(payment);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new PaymentRequestError(
        "The payment request timed out. Please try again."
      );
    }

    if (error instanceof PaymentRequestError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new PaymentRequestError(
        "The backend is offline or unreachable right now. Please try again."
      );
    }

    throw new PaymentRequestError(
      "Unable to start the PayU checkout right now. Please try again."
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

const visualAssets = {
  builder: {
    src: assetPath("ai-course-builder.jpg"),
    alt: "AI website builder, generated landing page, code editor, analytics, and mobile preview",
  },
  dashboard: {
    src: assetPath("freelancer-dashboard.jpg"),
    alt: "Freelancer dashboard with client pipeline, revenue analytics, project tasks, and messages",
  },
  mobile: {
    src: assetPath("mobile-course-previews.jpg"),
    alt: "Mobile previews for AI coding course landing page, startup website, and analytics dashboard",
  },
  workflow: {
    src: assetPath("ai-workflow-console.jpg"),
    alt: "AI coding workflow with prompt composer, assistant chat, code preview, deployment checklist, and live result",
  },
};

function getPaymentRouteFromHash(hashValue) {
  if (!hashValue || !hashValue.startsWith("#/payment/")) {
    return { page: null, params: {} };
  }

  const normalizedHash = hashValue.slice(1);
  const [path, queryString = ""] = normalizedHash.split("?");
  const page =
    path === "/payment/success"
      ? "success"
      : path === "/payment/failure"
        ? "failure"
        : null;

  return {
    page,
    params: Object.fromEntries(new URLSearchParams(queryString).entries()),
  };
}

const socialProofBadges = [
  "Beginner Friendly",
  "Hindi Live Classes",
  "No Coding Required",
  "Live Projects",
  "Freelancing Ready",
];

const heroPillars = ["Prompt Engine", "Live Build System", "Deploy Workflow"];

const floatingHeroBadges = [
  { label: "No Coding", position: "left-2 top-10 md:left-0 md:top-8" },
  { label: "Live Batch", position: "right-3 top-4 md:right-6 md:top-12" },
  { label: "Hindi", position: "left-6 bottom-20 md:left-10 md:bottom-24" },
  {
    label: "Beginner Friendly",
    position: "right-1 bottom-8 md:right-4 md:bottom-16",
  },
];

const heroStats = [
  { value: "7 Days Live", label: "Daily guided build sessions" },
  { value: COURSE_PRICE_LABEL, label: "Low-risk premium entry point" },
  { value: "4 Projects", label: "Portfolio-ready build outcomes" },
  { value: "Deploy Ready", label: "Build to live handoff flow" },
];

const featureCards = [
  {
    title: "AI Website Development",
    description:
      "High-converting landing pages, creator portfolios aur business websites ko AI prompts se structure, style aur ship karna.",
  },
  {
    title: "AI App Building",
    description:
      "Forms, dashboards aur mini web apps banana jahan AI code generate kare, aur aap product thinking guide karo.",
  },
  {
    title: "ChatGPT for Coding",
    description:
      "Prompting, debugging, refactoring aur feature planning ke liye ChatGPT ko coding partner ki tarah use karna.",
  },
  {
    title: "Client Projects",
    description:
      "Client brief ko sections, copy, design references, revisions aur final delivery checklist me convert karna.",
  },
  {
    title: "Deploy Websites",
    description:
      "Website ko live host karna, responsive checks complete karna, domain connect karna aur handoff ready banana.",
  },
  {
    title: "Earn Freelancing Income",
    description:
      "AI websites ko real service packages me position karna, pricing sochna aur Instagram/WhatsApp leads handle karna.",
  },
];

const realWebsiteCards = [
  {
    title: "Startup Landing Pages",
    description:
      "Bold hero, trust sections, CTA hierarchy aur product storytelling ke saath premium launch pages.",
    type: "startup",
  },
  {
    title: "SaaS Dashboards",
    description:
      "Sidebar navigation, stats, charts aur modern product workflows ke saath realistic dashboard layouts.",
    type: "saas",
  },
  {
    title: "Portfolio Websites",
    description:
      "Freelancer aur creator sites jahan positioning, case studies aur lead capture strong ho.",
    type: "portfolio",
  },
  {
    title: "Business Websites",
    description:
      "Service brands ke liye high-conversion pages with offers, reviews aur booking-oriented structure.",
    type: "business",
  },
  {
    title: "Mobile Responsive Previews",
    description:
      "Mobile-first mockups jo Instagram traffic aur quick scan behavior ke liye optimize kiye gaye ho.",
    type: "responsive",
  },
];

const liveBatchFeatures = [
  {
    title: "Live Interaction",
    description:
      "Recorded content ki jagah real batch environment jahan build process live samajh aata hai.",
  },
  {
    title: "Q&A Support",
    description:
      "Prompt confusion, tool issues aur project doubts ko practical sessions me clear karna.",
  },
  {
    title: "Limited Seats",
    description:
      "Smaller live batch structure jisse attention aur interaction quality better rahe.",
  },
  {
    title: "Practical Projects",
    description:
      "Sirf theory nahi, actual website outcomes ke saath guided project execution.",
  },
];

const liveCourseDays = [
  "Day 1 -> AI Basics & Tool Setup",
  "Day 2 -> Landing Page Structure",
  "Day 3 -> Premium UI Design",
  "Day 4 -> AI Coding Workflow",
  "Day 5 -> Deploy & Responsive QA",
  "Day 6 -> Client Project System",
  "Day 7 -> Freelance Offer Strategy",
];

const demoScenes = [
  {
    title: "AI website generation workflow",
    detail:
      "Prompt se structure, sections aur CTA-ready page output tak ka live visual workflow.",
  },
  {
    title: "Real prompting",
    detail:
      "Prompt ko tweak karke better layout, stronger copy aur cleaner interface generate karna.",
  },
  {
    title: "Website deployment",
    detail:
      "Build se live URL tak ka clean launch process jo client delivery me use hota hai.",
  },
  {
    title: "Mobile preview testing",
    detail:
      "Responsive behavior, CTA placement aur scroll experience ko mobile frames me validate karna.",
  },
  {
    title: "Freelancer workflow visuals",
    detail:
      "Brief, build, revise aur deliver ke practical flow ko polished ecosystem style me dekhna.",
  },
];

const resultCards = [
  {
    title: "AI Generated Websites",
    description:
      "High-converting pages with clean structure, modern CTA flow aur premium polish.",
    type: "website",
  },
  {
    title: "Dashboard Previews",
    description:
      "Admin panels, analytics-style widgets aur SaaS-like UI thinking ka practical output.",
    type: "dashboard",
  },
  {
    title: "Mobile Responsive Previews",
    description:
      "Instagram traffic ke liye mobile-first screens jo actually sharp feel karein.",
    type: "mobile",
  },
  {
    title: "Freelancer Workflow",
    description:
      "Brief se prompt, build, revision aur delivery tak ka repeatable system.",
    type: "workflow",
  },
  {
    title: "Website Transformation Visuals",
    description:
      "Ordinary layout ko premium startup interface me redesign karne ki process.",
    type: "transform",
  },
];

const outcomeCards = [
  {
    title: "Build Client Websites",
    description:
      "Businesses aur creators ke liye premium landing pages aur lead-gen websites banana.",
    icon: "01",
  },
  {
    title: "Start Freelancing",
    description:
      "AI coding ko service offer me convert karke project-based income opportunities create karna.",
    icon: "02",
  },
  {
    title: "Create Startup MVPs",
    description:
      "Quick concept validation ke liye simple product interfaces aur launch pages bana pana.",
    icon: "03",
  },
  {
    title: "Sell Landing Pages",
    description:
      "Niche-specific website packages bana kar faster delivery aur better margins par kaam karna.",
    icon: "04",
  },
  {
    title: "Build Portfolio Projects",
    description:
      "Aise showcase pieces banana jo trust, skill aur positioning teenon ko upgrade karein.",
    icon: "05",
  },
];

const audienceCards = [
  {
    title: "Students",
    description:
      "Career-ready digital skill build karna chahte ho bina heavy coding background ke.",
  },
  {
    title: "Freelancers",
    description:
      "Fast delivery, better margins aur higher-value website projects chahte ho.",
  },
  {
    title: "Beginners",
    description:
      "Zero se start karke AI tools ke saath practical coding confidence banana chahte ho.",
  },
  {
    title: "Business Owners",
    description:
      "Khud ke landing pages, lead funnels aur internal tools ko smarter banana chahte ho.",
  },
  {
    title: "Creators",
    description:
      "Audience, products aur paid offers ke liye polished digital assets launch karna chahte ho.",
  },
];

const paymentMethods = ["UPI", "Cards", "Net Banking"];

const pricingHighlights = [
  "7 Days Live",
  "Lifetime Recording",
  "Hindi Support",
  "Beginner Friendly",
];

const pricingTrust = ["SHA-512 Signed", "PayU Hosted", "Auto Redirects"];

const toolkitCards = [
  {
    title: "Prompt Library",
    description:
      "Hero sections, service pages, portfolio layouts, dashboard ideas aur bug-fix prompts ka reusable starter set.",
    metric: "35+ prompts",
  },
  {
    title: "Client Delivery Checklist",
    description:
      "Mobile test, speed check, copy review, form links, deployment aur handoff ke liye simple practical checklist.",
    metric: "12-step QA",
  },
  {
    title: "Portfolio Project Pack",
    description:
      "Course ke andar banne wale projects ko portfolio screenshots, case-study copy aur offer examples me convert karna.",
    metric: "4 builds",
  },
];

const testimonialCards = [
  {
    name: "Aarav Sharma",
    role: "BCA Student, Jaipur",
    initials: "AS",
    feedback:
      "Mujhe coding ka डर tha, but live workflow dekhkar landing page banana samajh aaya. Ab portfolio ke liye 2 projects ready hain.",
  },
  {
    name: "Neha Verma",
    role: "Freelance Designer, Indore",
    initials: "NV",
    feedback:
      "Design background tha, code nahi. AI prompts aur deployment steps ne client website delivery ka confidence diya.",
  },
  {
    name: "Rohit Singh",
    role: "Creator, Lucknow",
    initials: "RS",
    feedback:
      "Best part yeh laga ki sirf tools nahi, client brief ko website structure me kaise convert karna hai woh bhi practical tha.",
  },
  {
    name: "Priya Nair",
    role: "Marketing Intern, Pune",
    initials: "PN",
    feedback:
      "Mobile-first thinking aur CTA placement ke examples useful the. Instagram traffic ke liye page ka flow ab clear hai.",
  },
  {
    name: "Kabir Khan",
    role: "Beginner Freelancer, Bhopal",
    initials: "KK",
    feedback:
      "Maine first time AI coding workflow follow karke hosted page banaya. Recording aur Q&A support ne doubts clear kiye.",
  },
  {
    name: "Simran Kaur",
    role: "College Student, Delhi",
    initials: "SK",
    feedback:
      "Course ka roadmap simple hai. Har day ek output milta hai, isliye learning scattered nahi lagti.",
  },
];

const faqItems = [
  {
    question: "Is coding required?",
    answer:
      "Heavy coding background required nahi hai. Basic computer use, English/Hindi prompts samajhna aur step-by-step follow karna enough hai.",
  },
  {
    question: "Is this beginner friendly?",
    answer:
      "Yes. Course AI tools, prompting, website sections, styling aur deployment ko beginner pace par live examples ke saath cover karta hai.",
  },
  {
    question: "Will recordings be available?",
    answer:
      "Live class ke baad recordings available rahengi, taki aap missed session ya difficult part ko dobara dekh saken.",
  },
  {
    question: "How are classes conducted?",
    answer:
      "Classes live online hoti hain. Instructor screen share karke AI prompt se design, code, test aur deployment workflow dikhata hai.",
  },
  {
    question: "Can I freelance after this?",
    answer:
      "Course practical service direction deta hai. Freelancing results aapki practice, portfolio, communication aur consistency par depend karte hain.",
  },
  {
    question: "Will I build real projects?",
    answer:
      "Yes. Aap landing page, portfolio-style website, startup preview aur client workflow assets jaise practical outcomes build karenge.",
  },
];

const dashboardSlides = [
  { name: "Launch Website", detail: "Hero + trust + CTA" },
  { name: "Client Portfolio", detail: "Case studies + leads" },
  { name: "SaaS Dashboard", detail: "Analytics + settings" },
  { name: "Business Site", detail: "Services + booking flow" },
];

const codeParticles = [
  { text: "<section>", position: "left-[6%] top-[14%]" },
  { text: "deploy()", position: "right-[8%] top-[26%]" },
  { text: "grid-cols-3", position: "left-[12%] bottom-[18%]" },
  { text: "{prompt}", position: "right-[14%] bottom-[26%]" },
  { text: "</div>", position: "left-[40%] top-[6%]" },
  { text: "cta()", position: "left-[68%] top-[72%]" },
];

const particleDots = [
  { left: "8%", top: "16%", size: 6, delay: 0 },
  { left: "18%", top: "72%", size: 4, delay: 0.4 },
  { left: "32%", top: "12%", size: 5, delay: 0.8 },
  { left: "46%", top: "82%", size: 3, delay: 1.2 },
  { left: "58%", top: "18%", size: 5, delay: 0.6 },
  { left: "72%", top: "62%", size: 4, delay: 1.4 },
  { left: "86%", top: "24%", size: 6, delay: 1.8 },
  { left: "90%", top: "78%", size: 4, delay: 1.1 },
];

const buildSteps = [
  "Hero section generated",
  "Trust badges added",
  "Responsive layout optimized",
  "Deploy package ready",
];

const legalContent = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "Hum enrollment, support aur course updates ke liye aapka naam, email aur mobile collect karte hain.",
      "Payment processing external gateway ke through hoti hai. Card details hum directly store nahi karte.",
      "Aapke details ka use course access, reminders aur onboarding communication ke liye hota hai.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      "Course access personal learning ke liye hai. Content sharing, reselling ya redistribution allowed nahi hai.",
      "Income outcomes practice, consistency aur execution par depend karte hain. Course educational guidance provide karta hai.",
      "Live sessions, recordings aur materials batch structure ke hisaab se update ya refine kiye ja sakte hain.",
    ],
  },
};

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
  },
};

function createEmptyFieldErrors() {
  return { name: "", email: "", phone: "" };
}

function sanitizeCheckoutForm(formValues) {
  return {
    name: formValues.name.trim().replace(/\s+/g, " "),
    email: formValues.email.trim().toLowerCase(),
    phone: formValues.phone.replace(/\D/g, "").slice(0, 10).trim(),
  };
}

function getCheckoutFieldError(fieldName, sanitizedValues) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (fieldName === "name") {
    if (!sanitizedValues.name) {
      return "Please enter your full name.";
    }

    if (sanitizedValues.name.length > 60) {
      return "Name must be 60 characters or fewer.";
    }

    return "";
  }

  if (fieldName === "email") {
    if (!sanitizedValues.email) {
      return "Please enter your email address.";
    }

    if (!emailRegex.test(sanitizedValues.email)) {
      return "Please enter a valid email address.";
    }

    return "";
  }

  if (fieldName === "phone") {
    if (!sanitizedValues.phone) {
      return "Please enter your mobile number.";
    }

    if (sanitizedValues.phone.length !== 10) {
      return "Mobile number 10 digits ka hona chahiye.";
    }

    return "";
  }

  return "";
}

function validateCheckoutForm(formValues) {
  const sanitized = sanitizeCheckoutForm(formValues);

  return {
    sanitized,
    errors: {
      name: getCheckoutFieldError("name", sanitized),
      email: getCheckoutFieldError("email", sanitized),
      phone: getCheckoutFieldError("phone", sanitized),
    },
  };
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className="mx-auto max-w-3xl text-center"
    >
      <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200">
        {eyebrow}
      </span>
      <h2 className="mt-5 font-display text-3xl text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
        {description}
      </p>
    </motion.div>
  );
}

function MagneticButton({
  href,
  type = "button",
  onClick,
  target,
  rel,
  disabled = false,
  variant = "primary",
  className = "",
  children,
  ...rest
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (event) => {
    if (disabled) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    setOffset({ x, y });
  };

  const handleLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  const buttonClass = `${variant === "primary" ? "primary-button" : "secondary-button"} ${className}`.trim();

  const motionProps = {
    className: buttonClass,
    onClick,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    animate: { x: disabled ? 0 : offset.x, y: disabled ? 0 : offset.y },
    transition: { type: "spring", stiffness: 260, damping: 18, mass: 0.35 },
    whileTap: disabled ? undefined : { scale: 0.985 },
    ...rest,
  };

  if (href) {
    return (
      <motion.a href={href} target={target} rel={rel} {...motionProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} disabled={disabled} {...motionProps}>
      {children}
    </motion.button>
  );
}

function CheckoutField({
  id,
  name,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  inputMode,
  error,
}) {
  return (
    <label htmlFor={id} className="block w-full max-w-full">
      <span className="text-sm font-medium text-slate-200 sm:text-[15px]">{label}</span>
      <div
        className={`mt-2 w-full max-w-full rounded-[22px] border backdrop-blur-xl transition duration-300 ${
          error
            ? "border-rose-400/55 bg-rose-500/[0.07] shadow-[0_0_0_1px_rgba(251,113,133,0.14),0_18px_44px_rgba(15,23,42,0.36)]"
            : "border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_44px_rgba(15,23,42,0.28)]"
        } focus-within:-translate-y-0.5 focus-within:border-cyan-300/55 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_1px_rgba(34,211,238,0.24),0_0_36px_rgba(34,211,238,0.12),0_20px_54px_rgba(15,23,42,0.38)]`}
      >
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-14 w-full max-w-full rounded-[22px] bg-transparent px-4 text-[16px] leading-6 text-white outline-none placeholder:text-slate-500 sm:text-base"
        />
      </div>
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 text-sm text-rose-200"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </label>
  );
}

function BrowserFrame({ label, children, className = "" }) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-slate-950/78 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.55)] ${className}`.trim()}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
          {label}
        </div>
      </div>
      {children}
    </div>
  );
}

function MediaMockup({ asset, label, caption, className = "" }) {
  return (
    <BrowserFrame label={label} className={`media-mockup ${className}`.trim()}>
      <figure className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/70">
        <img
          src={asset.src}
          alt={asset.alt}
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full object-cover"
        />
      </figure>
      {caption && (
        <p className="mt-4 text-sm leading-6 text-slate-300">{caption}</p>
      )}
    </BrowserFrame>
  );
}

function StarRating() {
  return (
    <div className="flex items-center gap-1 text-amber-300" aria-label="5 star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>★</span>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, index }) {
  return (
    <motion.article
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      transition={{ delay: index * 0.05, duration: 0.64 }}
      whileHover={{ y: -7 }}
      className="glass-card glow-hover rounded-[28px] p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,_rgba(6,182,212,0.24),_rgba(16,185,129,0.18),_rgba(124,58,237,0.24))] font-display text-sm text-white">
            {testimonial.initials}
          </div>
          <div>
            <h3 className="font-display text-lg text-white">{testimonial.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
              {testimonial.role}
            </p>
          </div>
        </div>
        <StarRating />
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
        “{testimonial.feedback}”
      </p>
    </motion.article>
  );
}

function ShowcaseVisual({ type }) {
  const visualMap = {
    startup: {
      asset: visualAssets.builder,
      label: "Startup Landing Page",
      caption: "Hero, pricing, trust strip, code editor aur mobile preview ek hi polished AI build canvas me.",
    },
    saas: {
      asset: visualAssets.dashboard,
      label: "Freelancer Dashboard",
      caption: "Client projects, revenue, tasks aur analytics ko ek practical freelance command center me organize karna.",
    },
    portfolio: {
      asset: visualAssets.workflow,
      label: "AI Coding Workflow",
      caption: "Prompt composer, coding assistant, generated code aur deployment checklist ka complete build loop.",
    },
    business: {
      asset: visualAssets.builder,
      label: "Business Website",
      caption: "Service brand ke liye premium hero, CTA hierarchy, responsive sections aur conversion-first layout.",
    },
    responsive: {
      asset: visualAssets.mobile,
      label: "Mobile Responsive Preview",
      caption: "Instagram visitors ke liye mobile-first hero, offer block, analytics aur project proof preview.",
    },
  };

  if (visualMap[type]) {
    return <MediaMockup {...visualMap[type]} />;
  }

  if (type === "startup") {
    return (
      <BrowserFrame label="Startup Landing Page">
        <div className="space-y-4">
          <div className="rounded-[24px] border border-cyan-400/18 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.22),_transparent_38%),linear-gradient(135deg,_rgba(124,58,237,0.46),_rgba(15,23,42,0.95))] p-5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-200">
              <span>LaunchGrid</span>
              <span>Join Waitlist</span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="h-4 w-28 rounded-full bg-white/20" />
              <div className="h-8 w-4/5 rounded-full bg-white/15" />
              <div className="h-8 w-3/5 rounded-full bg-white/10" />
            </div>
            <div className="mt-5 flex gap-3">
              <div className="h-10 w-28 rounded-2xl bg-white/20" />
              <div className="h-10 w-24 rounded-2xl bg-cyan-400/18" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="h-3 w-10 rounded-full bg-white/10" />
              <div className="mt-3 h-10 rounded-2xl bg-white/10" />
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="h-3 w-12 rounded-full bg-white/10" />
              <div className="mt-3 h-10 rounded-2xl bg-white/10" />
            </div>
            <div className="rounded-2xl bg-cyan-400/10 p-3">
              <div className="h-3 w-14 rounded-full bg-white/15" />
              <div className="mt-3 h-10 rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </BrowserFrame>
    );
  }

  if (type === "saas") {
    return (
      <BrowserFrame label="SaaS Dashboard">
        <div className="grid grid-cols-[78px_1fr] gap-4">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-3">
            <div className="space-y-3">
              {["w-8", "w-10", "w-9", "w-10", "w-7"].map((width, index) => (
                <div key={`nav-${index}`} className={`h-9 rounded-full bg-white/8 ${width}`} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl bg-white/[0.05] p-3">
                  <div className="h-3 w-12 rounded-full bg-white/10" />
                  <div className="mt-3 h-8 w-14 rounded-full bg-cyan-400/18" />
                </div>
              ))}
            </div>
            <div className="rounded-[24px] bg-white/[0.04] p-4">
              <div className="mb-4 h-3 w-20 rounded-full bg-white/10" />
              <div className="flex h-24 items-end gap-3">
                <div className="h-14 w-full rounded-t-2xl bg-cyan-400/35" />
                <div className="h-20 w-full rounded-t-2xl bg-violet-500/38" />
                <div className="h-24 w-full rounded-t-2xl bg-fuchsia-400/25" />
                <div className="h-16 w-full rounded-t-2xl bg-white/10" />
              </div>
            </div>
            <div className="rounded-[24px] bg-white/[0.04] p-4">
              <div className="mb-3 h-3 w-16 rounded-full bg-white/10" />
              <div className="space-y-3">
                <div className="h-10 rounded-2xl bg-white/10" />
                <div className="h-10 rounded-2xl bg-white/6" />
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>
    );
  }

  if (type === "portfolio") {
    return (
      <BrowserFrame label="Portfolio Website">
        <div className="grid gap-4 md:grid-cols-[114px_1fr]">
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,_rgba(124,58,237,0.34),_rgba(6,182,212,0.18))] p-3">
            <div className="rounded-[20px] border border-white/10 bg-slate-950/65 p-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-white/10" />
              <div className="mx-auto mt-4 h-3 w-12 rounded-full bg-white/10" />
              <div className="mx-auto mt-2 h-3 w-16 rounded-full bg-cyan-400/15" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-24 rounded-full bg-white/10" />
            <div className="h-8 w-4/5 rounded-full bg-white/12" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.05] p-3">
                <div className="h-16 rounded-2xl bg-white/10" />
                <div className="mt-3 h-3 w-16 rounded-full bg-white/10" />
              </div>
              <div className="rounded-2xl bg-violet-500/12 p-3">
                <div className="h-16 rounded-2xl bg-white/10" />
                <div className="mt-3 h-3 w-20 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>
    );
  }

  if (type === "business") {
    return (
      <BrowserFrame label="Business Website">
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_110px] gap-4">
            <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(6,182,212,0.22),_rgba(124,58,237,0.34))] p-4">
              <div className="h-3 w-16 rounded-full bg-white/15" />
              <div className="mt-4 h-8 w-4/5 rounded-full bg-white/15" />
              <div className="mt-3 h-8 w-3/5 rounded-full bg-white/10" />
              <div className="mt-4 h-10 w-28 rounded-2xl bg-white/20" />
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
              <div className="h-full rounded-[20px] bg-white/8" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-2xl bg-white/[0.05] p-3">
                <div className="h-12 rounded-2xl bg-white/10" />
                <div className="mt-3 h-3 w-12 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
          <div className="rounded-[24px] bg-white/[0.04] p-4">
            <div className="h-3 w-20 rounded-full bg-white/10" />
            <div className="mt-3 h-10 rounded-2xl bg-white/8" />
          </div>
        </div>
      </BrowserFrame>
    );
  }

  return (
    <div className="mx-auto grid max-w-[290px] grid-cols-2 gap-4">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-3 shadow-[0_18px_50px_rgba(124,58,237,0.16)]">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/85 p-3">
          <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/10" />
          <div className="space-y-3">
            <div className="h-20 rounded-[18px] bg-[linear-gradient(135deg,_rgba(6,182,212,0.32),_rgba(124,58,237,0.42))]" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-2xl bg-white/5" />
              <div className="h-10 rounded-2xl bg-white/10" />
            </div>
            <div className="h-8 rounded-2xl bg-cyan-400/20" />
          </div>
        </div>
      </div>
      <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-3 shadow-[0_18px_50px_rgba(6,182,212,0.14)]">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/85 p-3">
          <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/10" />
          <div className="space-y-3">
            <div className="h-20 rounded-[18px] bg-[linear-gradient(135deg,_rgba(124,58,237,0.4),_rgba(6,182,212,0.28))]" />
            <div className="h-8 rounded-2xl bg-white/10" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-2xl bg-white/8" />
              <div className="h-10 rounded-2xl bg-cyan-400/18" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultVisual({ type }) {
  if (type === "website") {
    return (
      <MediaMockup
        asset={visualAssets.builder}
        label="AI Website Output"
        caption="Prompt se landing page, code editor, analytics aur responsive preview tak ka full-stack learning output."
      />
    );
  }

  if (type === "dashboard") {
    return (
      <MediaMockup
        asset={visualAssets.dashboard}
        label="Client Dashboard"
        caption="Freelancer ke liye project pipeline, revenue metrics, messages aur delivery board."
      />
    );
  }

  if (type === "mobile") {
    return (
      <MediaMockup
        asset={visualAssets.mobile}
        label="Mobile First"
        caption="Course, agency landing page aur analytics dashboard ka realistic mobile-ready preview."
      />
    );
  }

  if (type === "workflow") {
    return (
      <MediaMockup
        asset={visualAssets.workflow}
        label="Prompt To Deploy"
        caption="AI assistant, React code, live preview aur deployment checklist ko ek repeatable client workflow me dekhna."
      />
    );
  }

  return (
    <MediaMockup
      asset={visualAssets.builder}
      label="Website Transformation"
      caption="Ordinary section idea ko premium landing page, trust proof aur CTA-ready interface me transform karna."
    />
  );
}

// Kept as a fallback interactive preview component for future experiments.
// eslint-disable-next-line no-unused-vars
function HeroStudio({ typedPrompt }) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0 });

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (0.5 - y) * 7,
      rotateY: (x - 0.5) * 10,
      x: (x - 0.5) * 10,
      y: (y - 0.5) * 10,
    });
  };

  const resetTilt = () => {
    setTilt({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      animate={tilt}
      transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.7 }}
      className="relative w-full max-w-[660px] [transform-style:preserve-3d]"
    >
      <div className="hero-preview-shell glass-card relative overflow-hidden rounded-[34px] p-4 sm:p-5">
        <div className="animated-gradient absolute inset-0 opacity-60" />
        <div className="absolute inset-x-[16%] top-0 h-px bg-[linear-gradient(90deg,_transparent,_rgba(103,232,249,0.85),_transparent)]" />

        {particleDots.map((dot, index) => (
          <motion.span
            key={`dot-${index}`}
            animate={{ y: [0, -18, 0], opacity: [0.18, 0.65, 0.18] }}
            transition={{
              duration: 4.8 + index * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot.delay,
            }}
            className="absolute rounded-full bg-cyan-300/60 shadow-[0_0_18px_rgba(103,232,249,0.8)]"
            style={{
              left: dot.left,
              top: dot.top,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
            }}
          />
        ))}

        {codeParticles.map((particle, index) => (
          <motion.span
            key={particle.text}
            animate={{ y: [0, -10, 0], opacity: [0.22, 0.8, 0.28] }}
            transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
            className={`pointer-events-none absolute ${particle.position} rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-400 backdrop-blur-xl`}
          >
            {particle.text}
          </motion.span>
        ))}

        {floatingHeroBadges.map((badge, index) => (
          <motion.div
            key={badge.label}
            animate={{ y: [0, index % 2 === 0 ? -10 : 10, 0] }}
            transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute ${badge.position} hidden rounded-full border border-white/10 bg-[#0B1222]/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(124,58,237,0.24)] backdrop-blur-xl md:block`}
          >
            {badge.label}
          </motion.div>
        ))}

        <motion.div
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-8 top-32 hidden rounded-[24px] border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl xl:block"
        >
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">
            AI Suggestion
          </p>
          <p className="mt-2 text-sm text-white">Add trust strip and pricing stack</p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-8 top-[54%] hidden rounded-[24px] border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl xl:block"
        >
          <p className="text-[11px] uppercase tracking-[0.24em] text-violet-100">
            Deploy
          </p>
          <p className="mt-2 text-sm text-white">Static site ready for client handoff</p>
        </motion.div>

        <div className="relative rounded-[28px] border border-white/10 bg-slate-950/88 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-100">
              AI Website Builder
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Active Prompt
                </p>
                <div className="mt-3 flex items-center text-sm text-slate-200 sm:text-base">
                  <span className="mr-2 text-cyan-300">&gt;</span>
                  <span>{typedPrompt}</span>
                  <span className="cursor-glow ml-1" />
                </div>
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.98, 1.03, 0.98] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-100"
              >
                Building in real time
              </motion.div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_44px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                  Prompt
                </p>
                <div className="mt-4 space-y-3">
                  <div className="h-3 w-11/12 rounded-full bg-white/10" />
                  <div className="h-3 w-4/5 rounded-full bg-white/10" />
                  <div className="h-3 w-3/5 rounded-full bg-cyan-400/15" />
                </div>
              </div>

              <div className="hidden items-center justify-center xl:flex">
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300"
                >
                  To
                </motion.div>
              </div>

              <div className="rounded-3xl border border-cyan-400/18 bg-[linear-gradient(135deg,_rgba(6,182,212,0.12),_rgba(124,58,237,0.16))] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-100">
                    Website
                  </p>
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.85)]" />
                </div>
                <div className="mt-4 space-y-3">
                  <motion.div
                    className="h-14 rounded-2xl bg-[linear-gradient(135deg,_rgba(124,58,237,0.58),_rgba(6,182,212,0.42))]"
                    animate={{ opacity: [0.72, 1, 0.8] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-10 rounded-2xl bg-white/10" />
                    <div className="h-10 rounded-2xl bg-white/5" />
                    <div className="h-10 rounded-2xl bg-cyan-400/15" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Code Generation
                </p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                  Real time build
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {[96, 72, 84, 52, 88].map((width, index) => (
                  <motion.div
                    key={width}
                    className="h-3 origin-left rounded-full bg-[linear-gradient(90deg,_rgba(124,58,237,0.92),_rgba(6,182,212,0.95))]"
                    style={{ width: `${width}%` }}
                    animate={{ scaleX: [0.6, 1, 0.82], opacity: [0.55, 1, 0.7] }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      delay: index * 0.16,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {buildSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <motion.span
                        animate={{ opacity: [0.45, 1, 0.45] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.2 }}
                        className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]"
                      />
                      <span className="text-sm text-slate-200">{step}</span>
                    </div>
                    <span className="text-xs uppercase tracking-[0.22em] text-cyan-100">
                      Done
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    Website Ecosystem
                  </p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                    Carousel
                  </span>
                </div>
                <div className="mt-4 overflow-hidden">
                  <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    className="flex w-max gap-3"
                  >
                    {dashboardSlides.concat(dashboardSlides).map((slide, index) => (
                      <div
                        key={`${slide.name}-${index}`}
                        className="min-w-[160px] rounded-3xl border border-white/10 bg-[#0C1322] p-4"
                      >
                        <div className="h-20 rounded-2xl bg-[linear-gradient(135deg,_rgba(124,58,237,0.35),_rgba(6,182,212,0.25))]" />
                        <p className="mt-4 font-display text-lg text-white">{slide.name}</p>
                        <p className="mt-2 text-sm text-slate-400">{slide.detail}</p>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    Floating UI Cards
                  </p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                    Glass stack
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-violet-500/12 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-violet-100">
                      Prompt Pack
                    </p>
                    <p className="mt-2 text-sm text-slate-100">
                      Lead-gen website prompts ready
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-cyan-400/10 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100">
                      Deploy Flow
                    </p>
                    <p className="mt-2 text-sm text-slate-100">
                      Live link and handoff setup
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-5 h-4 w-[72%] rounded-b-[999px] bg-slate-700/45 blur-sm" />
    </motion.div>
  );
}

// Kept as a fallback animated workflow component for future experiments.
// eslint-disable-next-line no-unused-vars
function DemoPreview({ activeScene }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/86 p-4 sm:p-5">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-100">
          Workflow Preview
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Active Scene
            </p>
            <motion.div
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-violet-100"
            >
              Live highlight
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={demoScenes[activeScene].title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 space-y-4"
            >
              <div className="rounded-[26px] border border-cyan-400/18 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.16),_transparent_40%),linear-gradient(135deg,_rgba(124,58,237,0.28),_rgba(15,23,42,0.95))] p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-100">
                  {demoScenes[activeScene].title}
                </p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-[20px] border border-white/10 bg-white/8 p-4">
                    <div className="h-3 w-28 rounded-full bg-white/12" />
                    <div className="mt-3 h-10 rounded-2xl bg-white/10" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-12 rounded-2xl bg-white/10" />
                    <div className="h-12 rounded-2xl bg-white/8" />
                    <div className="h-12 rounded-2xl bg-cyan-400/18" />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Prompt
                  </p>
                  <div className="mt-3 h-12 rounded-2xl bg-white/10" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Build
                  </p>
                  <div className="mt-3 h-12 rounded-2xl bg-violet-500/16" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Deploy
                  </p>
                  <div className="mt-3 h-12 rounded-2xl bg-cyan-400/18" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Mobile
                  </p>
                  <div className="mt-3 h-12 rounded-2xl bg-white/8" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          {demoScenes.map((scene, index) => (
            <motion.div
              key={scene.title}
              animate={{
                borderColor:
                  index === activeScene
                    ? "rgba(103,232,249,0.35)"
                    : "rgba(255,255,255,0.1)",
                backgroundColor:
                  index === activeScene
                    ? "rgba(14,165,233,0.08)"
                    : "rgba(255,255,255,0.03)",
              }}
              className="rounded-[22px] border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(124,58,237,0.38),_rgba(6,182,212,0.26))] text-sm font-semibold text-white">
                  0{index + 1}
                </div>
                <div>
                  <p className="font-display text-lg text-white">{scene.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {scene.detail}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLegal, setActiveLegal] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState(createEmptyFieldErrors);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [currentHash, setCurrentHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash
  );

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!activeLegal && !checkoutModalOpen) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;

    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (checkoutModalOpen) {
        if (!isSubmitting) {
          setCheckoutModalOpen(false);
        }
        return;
      }

      if (activeLegal) {
        setActiveLegal(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeLegal, checkoutModalOpen, isSubmitting]);

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash);

    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    console.log("[Checkout] API URL used:", API_BASE_URL);
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));
    setFieldErrors((current) =>
      current[name] ? { ...current, [name]: "" } : current
    );
  };

  const handleFieldBlur = (event) => {
    const { name, value } = event.target;
    const sanitized = sanitizeCheckoutForm({
      ...form,
      [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    });

    setForm((current) => ({
      ...current,
      [name]: sanitized[name],
    }));
    setFieldErrors((current) => ({
      ...current,
      [name]: getCheckoutFieldError(name, sanitized),
    }));
  };

  const handlePayment = async (event) => {
    event.preventDefault();

    const { sanitized, errors } = validateCheckoutForm(form);
    const hasErrors = Object.values(errors).some(Boolean);

    setForm(sanitized);
    setFieldErrors(errors);

    if (hasErrors) {
      setToast("Please review the highlighted checkout details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payment = await createPaymentSession({
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
      });

      setToast("Redirecting to secure PayU checkout...");
      console.log("[Checkout] Payment redirect URL:", payment.paymentUrl);

      // PayU hosted checkout expects a standard HTML form POST, not a fetch/XHR.
      submitPayuForm(payment.paymentUrl, payment.fields);
    } catch (error) {
      console.error("[Checkout] Payment request failed:", error);
      setToast(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);
  const openCheckoutModal = () => {
    setMenuOpen(false);
    setFieldErrors(createEmptyFieldErrors());
    setCheckoutModalOpen(true);
  };
  const closeCheckoutModal = () => {
    if (isSubmitting) {
      return;
    }

    setCheckoutModalOpen(false);
  };
  const paymentRoute = getPaymentRouteFromHash(currentHash);

  if (paymentRoute.page) {
    return (
      <PaymentStatusPage status={paymentRoute.page} params={paymentRoute.params} />
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080B14] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-orb left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] bg-violet-600/25" />
        <div className="hero-orb right-[-8rem] top-[12rem] h-[24rem] w-[24rem] bg-cyan-500/20" />
        <div className="hero-orb bottom-[14rem] left-[12%] h-[18rem] w-[18rem] bg-fuchsia-500/10" />
        <div className="grid-fade" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080B14]/74 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(124,58,237,0.88),_rgba(6,182,212,0.82))] shadow-[0_0_30px_rgba(124,58,237,0.45)]">
              <span className="font-display text-base">AI</span>
            </div>
            <div>
              <p className="font-display text-lg text-white">AI Coding Income</p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Live Cohort
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#real-websites" className="transition hover:text-white">
              Previews
            </a>
            <a href="#curriculum" className="transition hover:text-white">
              Roadmap
            </a>
            <a href="#testimonials" className="transition hover:text-white">
              Reviews
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
            <a href="#payment" className="transition hover:text-white">
              Pricing
            </a>
          </nav>

          <div className="hidden lg:block">
            <MagneticButton
              onClick={openCheckoutModal}
              aria-controls="checkout-modal"
              aria-expanded={checkoutModalOpen}
              aria-haspopup="dialog"
              className="pulse-button"
            >
              Join Live Course — {COURSE_PRICE_LABEL}
            </MagneticButton>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
          >
            <span className="flex flex-col gap-1.5">
              <span
                className={`h-0.5 w-5 rounded-full bg-white transition ${
                  menuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-white transition ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-white transition ${
                  menuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24 }}
              className="border-t border-white/10 bg-slate-950/95 px-4 py-5 lg:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:px-2">
                <a
                  href="#features"
                  onClick={closeMenu}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200"
                >
                  Features
                </a>
                <a
                  href="#real-websites"
                  onClick={closeMenu}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200"
                >
                  Previews
                </a>
                <a
                  href="#curriculum"
                  onClick={closeMenu}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200"
                >
                  Roadmap
                </a>
                <a
                  href="#testimonials"
                  onClick={closeMenu}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200"
                >
                  Reviews
                </a>
                <a
                  href="#faq"
                  onClick={closeMenu}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200"
                >
                  FAQ
                </a>
                <MagneticButton
                  onClick={openCheckoutModal}
                  aria-controls="checkout-modal"
                  aria-expanded={checkoutModalOpen}
                  aria-haspopup="dialog"
                  className="justify-center text-center"
                >
                  Join Live Course — {COURSE_PRICE_LABEL}
                </MagneticButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top" className="relative z-10 overflow-x-hidden pb-32 lg:pb-0">
        <section className="mx-auto grid max-w-7xl gap-7 px-4 pb-8 pt-5 sm:gap-10 sm:px-6 sm:pb-12 sm:pt-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-16 lg:pt-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-violet-100">
              Premium AI Website Ecosystem
            </div>

            <h1 className="mt-5 font-display text-[2.2rem] leading-[1.08] text-white min-[360px]:text-[2.45rem] sm:mt-6 sm:text-5xl sm:leading-tight lg:text-6xl xl:text-7xl">
              AI Tools Se Website Bana Kar
              <span className="block bg-[linear-gradient(135deg,_#FFFFFF_12%,_#9F7AEA_45%,_#67E8F9_100%)] bg-clip-text text-transparent">
                Clients Se Paise Kamao
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
              ChatGPT aur AI coding tools ka use karke modern websites banana,
              deploy karna aur sell karna seekho.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
              {heroPillars.map((item) => (
                <span
                  key={item}
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-200 backdrop-blur-xl sm:px-4 sm:text-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:gap-4 sm:flex-row">
              <MagneticButton
                onClick={openCheckoutModal}
                aria-controls="checkout-modal"
                aria-expanded={checkoutModalOpen}
                aria-haspopup="dialog"
                className="pulse-button justify-center text-center"
              >
                Join Live Course — {COURSE_PRICE_LABEL}
              </MagneticButton>
              <MagneticButton
                href="#demo"
                variant="secondary"
                className="justify-center text-center"
              >
                Watch Demo Workflow
              </MagneticButton>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400 sm:mt-5 sm:gap-4 sm:text-sm">
              <span className="inline-flex max-w-full flex-wrap items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                AI automatically builds websites in real time
              </span>
              <span className="inline-flex max-w-full flex-wrap items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-300" />
                Prompt, refine, deploy and sell workflow
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.value} className="glass-card rounded-3xl p-3.5 sm:p-4">
                  <p className="font-display text-lg text-white">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex min-w-0 items-center justify-center"
          >
            <div className="w-full max-w-[760px]">
              <MediaMockup
                asset={visualAssets.builder}
                label="AI Website Builder"
                caption="Prompt composer, generated landing page, React code editor, analytics aur mobile preview ek complete build workflow me."
              />
            </div>
          </motion.div>
        </section>

        <section className="section-shell pb-10">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="glass-card rounded-[30px] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {socialProofBadges.map((badge, index) => (
                <motion.div
                  key={badge}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.55 }}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/14 bg-cyan-400/[0.06] px-4 py-2.5 text-sm text-cyan-50 shadow-[0_0_24px_rgba(6,182,212,0.08)]"
                >
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
                  {badge}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="features" className="section-shell scroll-mt-24 py-14 sm:py-16 lg:py-24">
          <SectionHeading
            eyebrow="Course Features"
            title="AI tools ke saath build, ship aur earn karne ka practical system"
            description="Har module ka focus real output par hai: prompt se layout, layout se code, code se deployment, aur deployment se client-ready delivery."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.06, duration: 0.76 }}
                whileHover={{ y: -8, rotateX: -3, rotateY: 4, scale: 1.01 }}
                className="glass-card card-tilt glow-hover group rounded-[28px] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(124,58,237,0.45),_rgba(6,182,212,0.32))] font-display text-lg text-white shadow-[0_0_24px_rgba(124,58,237,0.35)]">
                    0{index + 1}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-cyan-400/10 opacity-0 blur-xl transition group-hover:opacity-100" />
                </div>
                <h3 className="mt-6 font-display text-2xl text-white">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section-shell py-14 sm:py-16 lg:py-24">
          <SectionHeading
            eyebrow="Course Toolkit"
            title="Ready assets jo learning ko client delivery ke closer le jate hain"
            description="Sirf class dekhne ki jagah aap reusable prompts, QA checklist aur portfolio packaging flow ke saath kaam karte ho."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {toolkitCards.map((item, index) => (
              <motion.article
                key={item.title}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.05, duration: 0.68 }}
                whileHover={{ y: -7 }}
                className="glass-card glow-hover rounded-[28px] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 font-display text-sm text-emerald-100">
                    0{index + 1}
                  </div>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100">
                    {item.metric}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section
          id="real-websites"
          className="section-shell scroll-mt-24 py-14 sm:py-16 lg:py-24"
        >
          <SectionHeading
            eyebrow="Real Website Previews"
            title="Real Websites You'll Learn To Build"
            description="Abstract cards ki jagah ab realistic premium mockups dikh rahe hain, taki visitor ko instantly samajh aaye ki course ka output normal course page nahi, balki real AI product ecosystem websites hai."
          />

          <div className="mt-12 grid gap-5 xl:grid-cols-2">
            {realWebsiteCards.map((item, index) => (
              <motion.div
                key={item.title}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06, duration: 0.76 }}
                whileHover={{ y: -10, rotateX: -3, rotateY: index % 2 === 0 ? 3 : -3 }}
                className={`glass-card card-tilt glow-hover rounded-[32px] p-6 ${
                  index === realWebsiteCards.length - 1 ? "xl:col-span-2" : ""
                }`}
              >
                <div className="grid gap-8 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
                  <div>
                    <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-violet-100">
                      Build Output
                    </span>
                    <h3 className="mt-5 font-display text-2xl text-white sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                      {item.description}
                    </p>
                  </div>
                  <div className="self-center">
                    <ShowcaseVisual type={item.type} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section-shell py-14 sm:py-16 lg:py-24">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.22 }}
            className="glass-card overflow-hidden rounded-[34px]"
          >
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10 xl:p-12">
                <span className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100">
                  Live Batch
                </span>
                <h2 className="mt-5 font-display text-3xl text-white sm:text-4xl">
                  Live Batch Starts Soon
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  Urgency ko premium tareeke se communicate kiya gaya hai without fake timers. Focus live interaction, practical execution aur support quality par hai.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {liveBatchFeatures.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.06, duration: 0.58 }}
                      className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(124,58,237,0.42),_rgba(6,182,212,0.28))] font-display text-sm text-white shadow-[0_0_18px_rgba(124,58,237,0.28)]">
                        0{index + 1}
                      </div>
                      <h3 className="mt-4 font-display text-xl text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.05),_rgba(255,255,255,0.025))] p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    Why this matters
                  </p>
                  <h3 className="mt-4 font-display text-2xl text-white">
                    Product ecosystem feel, not generic course energy
                  </h3>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-cyan-400/16 bg-cyan-400/[0.06] p-4">
                      <p className="text-sm leading-7 text-cyan-50">
                        Live build flow dekhne se prompt-to-website transformation clear hota hai.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-violet-400/16 bg-violet-400/[0.06] p-4">
                      <p className="text-sm leading-7 text-slate-200">
                        Smaller live batch structure trust aur action dono ko improve karta hai.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-sm leading-7 text-slate-300">
                        Practical projects ensure ki visitors output imagine kar saken before payment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="curriculum" className="section-shell scroll-mt-24 py-14 sm:py-16 lg:py-24">
          <SectionHeading
            eyebrow="Live Roadmap"
            title="7-day roadmap jo beginners ko AI coding se client-ready build flow tak le jata hai"
            description="Timeline ko glowing progression style me retain kiya gaya hai, lekin motion aur readability ko aur polished kiya gaya hai taki product-like journey feel aaye."
          />

          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="absolute left-[22px] top-0 hidden h-full w-px bg-[linear-gradient(180deg,_rgba(124,58,237,0),_rgba(124,58,237,0.9),_rgba(6,182,212,0.9),_rgba(6,182,212,0))] md:block" />
            <div className="space-y-5">
              {liveCourseDays.map((day, index) => (
                <motion.div
                  key={day}
                  variants={reveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.05, duration: 0.72 }}
                  className="grid gap-4 md:grid-cols-[46px_1fr]"
                >
                  <div className="relative hidden md:block">
                    <div className="absolute left-0 top-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-[#0C1221] text-sm font-semibold text-cyan-100 shadow-[0_0_28px_rgba(6,182,212,0.32)]">
                      {index + 1}
                    </div>
                  </div>

                  <div className="glass-card rounded-[28px] p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-sm font-semibold text-cyan-100 md:hidden">
                        {index + 1}
                      </span>
                      <h3 className="font-display text-2xl text-white">{day}</h3>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                      {index === 0 &&
                        "AI tools, prompting basics aur beginner mindset setup jo poore course ki foundation banata hai."}
                      {index === 1 &&
                        "Website structure, sections aur AI-assisted layout building ke practical exercises."}
                      {index === 2 &&
                        "Premium visuals, spacing, typography aur conversion-focused CTA design systems."}
                      {index === 3 &&
                        "Faster build cycle ke liye prompt, iterate, debug aur refine workflow."}
                      {index === 4 &&
                        "Hosting, domains, deployment aur client-facing handoff essentials."}
                      {index === 5 &&
                        "Real-world project packaging, pricing thinking aur delivery expectations."}
                      {index === 6 &&
                        "Freelancing, creator offers aur service monetization strategy ki clarity."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="section-shell scroll-mt-24 py-14 sm:py-16 lg:py-24">
          <SectionHeading
            eyebrow="Demo Experience"
            title="AI website generation workflow ko premium startup walkthrough ki tarah showcase kiya gaya hai"
            description="Generic course feel ki jagah ab yeh section prompting, website generation, deployment, mobile preview testing aur freelancer workflow visuals ko glassmorphism demo container me present karta hai."
          />

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="glow-frame mx-auto mt-12 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-[1px] shadow-[0_30px_100px_rgba(2,6,23,0.55)]"
          >
            <div className="video-glow absolute inset-0 rounded-[34px]" />
            <div className="relative rounded-[34px] bg-[#090E19]/92 p-3">
              <MediaMockup
                asset={visualAssets.workflow}
                label="Prompt To Deployment"
                caption="Prompt composer, AI assistant conversation, generated React/Tailwind code, live website preview aur deployment checklist ek premium workflow me."
              />
            </div>
          </motion.div>
        </section>

        <section id="results" className="section-shell scroll-mt-24 py-14 sm:py-16 lg:py-24">
          <SectionHeading
            eyebrow="Results"
            title="Systems aur visuals jo website ko trusted AI product platform jaisa feel karate hain"
            description="Yahan fake earning screenshots ki jagah workflow outputs, responsive previews aur transformation-style visuals ko highlight kiya gaya hai."
          />

          <div className="mt-12 grid gap-5 xl:grid-cols-2">
            {resultCards.map((item, index) => (
              <motion.div
                key={item.title}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05, duration: 0.72 }}
                className={`glass-card rounded-[32px] p-6 ${
                  index === resultCards.length - 1 ? "xl:col-span-2" : ""
                }`}
              >
                <div className="grid gap-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_290px]">
                  <div>
                    <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-violet-100">
                      Output Preview
                    </span>
                    <h3 className="mt-5 font-display text-2xl text-white sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                      {item.description}
                    </p>
                  </div>
                  <div className="self-center">
                    <ResultVisual type={item.type} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section-shell py-14 sm:py-16 lg:py-24">
          <SectionHeading
            eyebrow="Outcomes"
            title="After This Course You Can"
            description="Conversion flow ko stronger banane ke liye direct visitor outcomes ko premium product-card style me present kiya gaya hai."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {outcomeCards.map((item, index) => (
              <motion.div
                key={item.title}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.05, duration: 0.68 }}
                whileHover={{ y: -8, rotateX: -4, rotateY: index % 2 === 0 ? 4 : -4 }}
                className="glass-card card-tilt glow-hover group rounded-[28px] p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(124,58,237,0.45),_rgba(6,182,212,0.34))] font-display text-lg text-white shadow-[0_0_28px_rgba(124,58,237,0.32)]">
                  {item.icon}
                </div>
                <h3 className="mt-5 font-display text-2xl text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.description}</p>
                <div className="mt-5 h-px w-full bg-[linear-gradient(90deg,_rgba(124,58,237,0.55),_rgba(6,182,212,0.25),_transparent)]" />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section-shell py-14 sm:py-16 lg:py-24">
          <SectionHeading
            eyebrow="Who Is This For"
            title="Yeh course un logon ke liye hai jo AI ko earning skill me convert karna chahte hain"
            description="Audience cards ko premium but relatable style me preserve kiya gaya hai, taki ad traffic instantly self-identify kar sake."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {audienceCards.map((audience, index) => (
              <motion.div
                key={audience.title}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.05, duration: 0.68 }}
                whileHover={{ y: -7, rotateX: -3, rotateY: index % 2 === 0 ? 3 : -3 }}
                className="glass-card card-tilt glow-hover rounded-[28px] p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(124,58,237,0.42),_rgba(6,182,212,0.28))] font-display text-lg text-white shadow-[0_0_24px_rgba(6,182,212,0.22)]">
                  {audience.title.charAt(0)}
                </div>
                <h3 className="mt-5 font-display text-2xl text-white">{audience.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {audience.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section
          id="testimonials"
          className="section-shell scroll-mt-24 py-14 sm:py-16 lg:py-24"
        >
          <SectionHeading
            eyebrow="Student Feedback"
            title="Learners jo practical AI website workflow ko seriously apply kar rahe hain"
            description="Reviews ko believable aur grounded rakha gaya hai: confidence, clarity, deployment aur portfolio outcomes par focus."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {testimonialCards.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </section>

        <section id="faq" className="section-shell scroll-mt-24 py-14 sm:py-16 lg:py-24">
          <SectionHeading
            eyebrow="FAQ"
            title="Join karne se pehle common doubts clear kar lo"
            description="Course beginner-friendly hai, lekin outcome practical rakha gaya hai: live class, recordings, real projects aur freelance direction."
          />

          <div className="mx-auto mt-12 grid max-w-5xl gap-4">
            {faqItems.map((item, index) => (
              <motion.details
                key={item.question}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.24 }}
                transition={{ delay: index * 0.04, duration: 0.58 }}
                className="glass-card group rounded-[24px] p-5 open:border-cyan-400/24"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <span className="font-display text-lg text-white sm:text-xl">
                    {item.question}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-100 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  {item.answer}
                </p>
              </motion.details>
            ))}
          </div>
        </section>

        <section id="payment" className="section-shell scroll-mt-24 py-14 sm:py-16 lg:py-24">
          <div className="glass-card overflow-hidden rounded-[36px]">
            <div className="grid gap-0 lg:grid-cols-[1.04fr_0.96fr]">
              <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10 xl:p-12">
                <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                  Secure PayU Checkout
                </span>
                <h2 className="mt-5 font-display text-3xl text-white sm:text-4xl">
                  {COURSE_NAME}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  Instagram traffic ke liye optimized premium checkout block jahan
                  visitor details, trust signals aur PayU handoff ek clean live
                  enrollment flow me ready hain.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200"
                    >
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.85)]" />
                      {method}
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/55 p-5">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Live Course Price
                      </p>
                      <p className="mt-3 font-display text-5xl text-white">
                        {COURSE_PRICE_LABEL}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm text-violet-100">
                      One-time live batch access
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {pricingHighlights.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(124,58,237,0.4),_rgba(6,182,212,0.28))] text-sm text-white">
                            +
                          </span>
                          <p className="text-white">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {pricingTrust.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-cyan-400/12 bg-cyan-400/[0.06] px-4 py-3 text-center text-sm text-cyan-50"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.05),_rgba(255,255,255,0.02))] p-5 sm:p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        Enrollment
                      </p>
                      <p className="mt-2 font-display text-2xl text-white">
                        Join the live course
                      </p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                        {COURSE_NAME} at {COURSE_PRICE_LABEL}. The hash is generated
                        on the backend, then PayU checkout opens with a standard form
                        POST.
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                      Test Mode
                    </div>
                  </div>

                  <div className="mb-6 grid gap-3 sm:grid-cols-3">
                    {["Backend Hash", "Mobile Ready", "PayU Test"].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-xs uppercase tracking-[0.22em] text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handlePayment} className="space-y-5">
                    <CheckoutField
                      id="payment-name"
                      name="name"
                      label="Full Name"
                      type="text"
                      value={form.name}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      error={fieldErrors.name}
                    />

                    <CheckoutField
                      id="payment-email"
                      name="email"
                      label="Email Address"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="Enter your email"
                      autoComplete="email"
                      error={fieldErrors.email}
                    />

                    <CheckoutField
                      id="payment-phone"
                      name="phone"
                      label="Mobile Number"
                      type="tel"
                      value={form.phone}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      inputMode="numeric"
                      error={fieldErrors.phone}
                    />

                    <MagneticButton
                      type="submit"
                      disabled={isSubmitting}
                      className="pulse-button w-full justify-center text-center"
                    >
                      {isSubmitting
                        ? "Securing your PayU session..."
                        : `Join Live Course — ${COURSE_PRICE_LABEL}`}
                    </MagneticButton>

                    <p className="text-sm leading-6 text-slate-400">
                      Success and failure responses first land on the Express backend.
                      The backend verifies the response hash and redirects the user to
                      the matching frontend status page automatically.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-[#060912]/92 pb-28 pt-12 lg:pb-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr_0.7fr] lg:px-8">
          <div>
            <p className="font-display text-2xl text-white">AI Coding Income</p>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              Premium AI startup aesthetic ke saath designed live course page jo beginners aur freelancers ko AI website business ecosystem me onboard karta hai.
            </p>
          </div>

          <div>
            <p className="font-display text-lg text-white">Connect</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="mailto:shop43856@gmail.com" className="footer-pill">
                Email
              </a>
              <a href="tel:+919229721835" className="footer-pill">
                Call
              </a>
              <a
                href="https://wa.me/919229721835"
                target="_blank"
                rel="noreferrer"
                className="footer-pill"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <p className="font-display text-lg text-white">Legal</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveLegal("privacy")}
                className="footer-pill"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActiveLegal("terms")}
                className="footer-pill"
              >
                Terms
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 px-4 pt-6 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>(c) {new Date().getFullYear()} AI Coding Income. All rights reserved.</p>
          <div className="flex gap-4 text-slate-400">
            <a href="#demo" className="transition hover:text-white">
              Demo
            </a>
            <a href="#results" className="transition hover:text-white">
              Results
            </a>
            <a href="#payment" className="transition hover:text-white">
              Join Now
            </a>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080B14]/94 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 shrink">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">
              Live Course
            </p>
            <p className="font-display text-lg text-white sm:text-xl">{COURSE_PRICE_LABEL}</p>
          </div>
          <MagneticButton
            onClick={openCheckoutModal}
            aria-controls="checkout-modal"
            aria-expanded={checkoutModalOpen}
            aria-haspopup="dialog"
            className="pulse-button flex-1 justify-center text-center text-sm sm:min-w-[220px] sm:text-base"
          >
            Join Live Course
          </MagneticButton>
        </div>
      </div>

      <AnimatePresence>
        {checkoutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-[70] overflow-x-hidden overflow-y-auto overscroll-contain bg-[#020617]/80 px-2 py-3 backdrop-blur-xl sm:px-4 sm:py-6"
            onClick={closeCheckoutModal}
          >
            <div className="flex min-h-full w-full items-center justify-center">
              <motion.div
                id="checkout-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkout-modal-title"
                aria-describedby="checkout-modal-subtitle"
                initial={{ opacity: 0, y: 28, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.96 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-[92vw] max-w-[34rem] max-w-full overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.93))] shadow-[0_44px_120px_rgba(2,6,23,0.72),0_0_0_1px_rgba(255,255,255,0.04)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,_transparent,_rgba(103,232,249,0.82),_rgba(168,85,247,0.9),_transparent)]" />
                <div className="pointer-events-none absolute -left-12 top-14 h-28 w-28 rounded-full bg-violet-500/18 blur-3xl" />
                <div className="pointer-events-none absolute -right-10 bottom-10 h-32 w-32 rounded-full bg-cyan-400/16 blur-3xl" />

                <button
                  type="button"
                  onClick={closeCheckoutModal}
                  disabled={isSubmitting}
                  aria-label="Close checkout modal"
                  className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-cyan-300/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:right-4 sm:top-4"
                >
                  X
                </button>

                <div className="relative max-h-[90vh] overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
                  <div className="flex items-start justify-between gap-4 pr-12 sm:pr-14">
                    <div className="max-w-md min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/85">
                        Secure Enrollment
                      </p>
                      <h3
                        id="checkout-modal-title"
                        className="mt-3 font-display text-[1.45rem] leading-tight text-white sm:text-3xl"
                      >
                        Join AI Coding Live Course
                      </h3>
                      <p
                        id="checkout-modal-subtitle"
                        className="mt-3 text-sm leading-6 text-slate-300 sm:text-base"
                      >
                        Enter your details to continue secure PayU checkout.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handlePayment} className="mt-5 w-full max-w-full space-y-4 sm:mt-6 sm:space-y-5">
                    <CheckoutField
                      id="checkout-name"
                      name="name"
                      label="Full Name"
                      type="text"
                      value={form.name}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      error={fieldErrors.name}
                    />

                    <CheckoutField
                      id="checkout-phone"
                      name="phone"
                      label="Mobile Number"
                      type="tel"
                      value={form.phone}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      inputMode="numeric"
                      error={fieldErrors.phone}
                    />

                    <CheckoutField
                      id="checkout-email"
                      name="email"
                      label="Email Address"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="Enter your email"
                      autoComplete="email"
                      error={fieldErrors.email}
                    />

                    <div className="w-full max-w-full rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[26px] sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                            Price
                          </p>
                          <p className="mt-2 font-display text-3xl text-white sm:text-4xl">
                            {COURSE_PRICE_LABEL}
                          </p>
                        </div>

                        <div className="w-full max-w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100 sm:w-auto sm:text-right sm:tracking-[0.22em]">
                          Secure PayU Checkout
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {paymentMethods.map((method) => (
                          <div
                            key={method}
                            className="inline-flex min-h-[40px] max-w-full items-center rounded-full border border-white/10 bg-slate-950/60 px-3 text-xs text-slate-200 sm:px-4 sm:text-sm"
                          >
                            {method}
                          </div>
                        ))}
                      </div>
                    </div>

                    <MagneticButton
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full max-w-full min-h-[56px] justify-center rounded-[22px] text-base shadow-[0_22px_55px_rgba(124,58,237,0.34)]"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                          Securing your PayU session...
                        </>
                      ) : (
                        "Proceed to Secure Payment"
                      )}
                    </MagneticButton>

                    <p className="text-center text-xs leading-6 text-slate-400 sm:text-sm">
                      Your details stay encrypted and payment happens on PayU's
                      hosted checkout.
                    </p>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeLegal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/82 px-4 py-8 backdrop-blur-md"
            onClick={() => setActiveLegal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              className="glass-card w-full max-w-2xl rounded-[32px] p-6 sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">
                    {activeLegal === "privacy" ? "Privacy" : "Terms"}
                  </p>
                  <h3 className="mt-3 font-display text-3xl text-white">
                    {legalContent[activeLegal].title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLegal(null)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
                >
                  X
                </button>
              </div>

              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300 sm:text-base">
                {legalContent[activeLegal].body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-4 top-24 z-[60] max-w-sm rounded-2xl border border-cyan-400/20 bg-slate-950/90 px-4 py-3 text-sm text-cyan-50 shadow-[0_0_35px_rgba(6,182,212,0.18)] backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

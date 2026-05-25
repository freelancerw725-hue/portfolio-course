import React, { useEffect } from "react";

const supportUrl = "https://wa.me/919229721835";

const statLabels = [
  { key: "txnid", label: "Transaction ID" },
  { key: "mihpayid", label: "PayU Reference" },
  { key: "amount", label: "Amount" },
  { key: "email", label: "Email" },
  { key: "course", label: "Course" },
];

function PaymentMetaRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm text-white sm:text-base">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default function PaymentStatusPage({ status, params }) {
  const isSuccess = status === "success";
  const isVerified = params.verified === "true";
  const title = isSuccess ? "Payment Success" : "Payment Failed";
  const primaryMessage = isSuccess
    ? "Your PayU checkout is complete. You can now move into the live batch onboarding flow."
    : "The checkout did not finish successfully. You can return to the landing page and try again.";
  const secondaryMessage = params.message || primaryMessage;

  useEffect(() => {
    document.title = `${title} | AI Coding Income`;
  }, [title]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      <div className="hero-orb left-[-140px] top-[-80px] h-80 w-80 bg-cyan-500/20" />
      <div className="hero-orb bottom-[-160px] right-[-80px] h-96 w-96 bg-violet-600/18" />
      <div className="grid-fade" />

      <main className="section-shell relative z-10 flex min-h-screen items-center py-10 sm:py-14">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="glass-card rounded-[32px] p-6 sm:p-8 lg:p-10">
            <span
              className={`inline-flex rounded-full border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${
                isSuccess
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                  : "border-amber-400/20 bg-amber-400/10 text-amber-100"
              }`}
            >
              {isSuccess ? "Enrollment confirmed" : "Action needed"}
            </span>

            <h1 className="mt-5 font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              {isSuccess
                ? "You are one step away from the live AI course"
                : "Your payment needs another attempt"}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {secondaryMessage}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Status
                </p>
                <p className="mt-3 font-display text-2xl text-white">
                  {isSuccess ? "Success" : "Failure"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Gateway
                </p>
                <p className="mt-3 font-display text-2xl text-white">PayU</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Response hash
                </p>
                <p className="mt-3 font-display text-2xl text-white">
                  {isVerified ? "Verified" : "Pending"}
                </p>
              </div>
            </div>

            {!isVerified && (
              <div className="mt-6 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-7 text-amber-50">
                The payment gateway returned to your site, but the response hash could
                not be verified. Recheck your live key and salt before switching
                `PAYU_MODE` to production.
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/#payment" className="primary-button justify-center text-center">
                {isSuccess ? "Back to Course Page" : "Try Payment Again"}
              </a>
              <a
                href={supportUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-button justify-center text-center"
              >
                Contact on WhatsApp
              </a>
            </div>
          </section>

          <section className="glass-card rounded-[32px] p-6 sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">
                  Transaction Snapshot
                </p>
                <h2 className="mt-3 font-display text-2xl text-white sm:text-3xl">
                  {title}
                </h2>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                Instagram-ready flow
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {statLabels.map((item) => (
                <PaymentMetaRow key={item.key} label={item.label} value={params[item.key]} />
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-cyan-400/16 bg-cyan-400/[0.06] p-5 text-sm leading-7 text-cyan-50">
              PayU posts the result back to the Express backend first, and the backend
              then redirects the browser to this frontend page with the safe transaction
              summary in the URL hash.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

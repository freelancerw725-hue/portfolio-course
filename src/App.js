import React, { useState, useEffect } from "react";

export default function PortfolioCourseSite() {
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const COURSE_PRICE = 19900;
  const CURRENCY = "INR";

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const gradientBtn =
    "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all";
  const sectionCard =
    "bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all";

  async function loadRazorpayScript() {
    if (window.Razorpay) return true;
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject("Failed to load Razorpay");
      document.body.appendChild(script);
    });
  }

  async function createOrderOnServer() {
    try {
      const res = await fetch("http://localhost:5000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Server error");
      return await res.json();
    } catch (error) {
      console.error("Error creating order:", error);
      return { id: "order_mock_" + Math.random().toString(36).slice(2, 9), amount: COURSE_PRICE * 100, currency: CURRENCY };
    }
  }

  async function handleBuyNow(customer) {
    const name = document.getElementById('cust_name').value.trim();
    const contact = document.getElementById('cust_contact').value.trim();

    if (!name || !contact) {
      setToast("❌ Full name and mobile number are required.");
      return;
    }

    setLoading(true);
    try {
      await loadRazorpayScript();
      const order = await createOrderOnServer();
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_Ra3JsQqrTpsTnQ",
        amount: order.amount,
        currency: order.currency,
        name: "Your Business Name",
        description: "Cybercafe Services & Practical Course",
        order_id: order.id,
        image: "/logo.png",
        handler: () => {
          setToast("✅ Payment successful! Thank you.");
          setPage("success");
          setLoading(false);
        },
        prefill: { name, contact },
        theme: { color: "#059669" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => setToast("❌ Payment failed, please retry."));
      rzp.open();
    } catch (err) {
      setToast("Error: " + err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-gray-900 flex flex-col font-inter">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm border-b z-20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-600">Cybercafe Services</h1>
          <nav className="hidden md:flex space-x-4 text-gray-700 font-medium">
            <button onClick={() => setPage("home")} className="hover:text-emerald-600 transition">Home</button>
            <button onClick={() => setPage("checkout")} className={gradientBtn}>Buy Course</button>
          </nav>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-gray-700 transition-transform ${menuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-700 transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-700 transition-transform ${menuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
            <nav className="flex flex-col space-y-4 p-6 text-gray-700 font-medium">
              <button onClick={() => { setPage("home"); setMenuOpen(false); }} className="text-left hover:text-emerald-600 transition">Home</button>
              <button onClick={() => { setPage("checkout"); setMenuOpen(false); }} className="text-left bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl shadow-lg transition-all">Buy Course</button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-6">
        {page === "home" && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-8 md:py-16">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Learn <span className="text-emerald-600">Practical Cybercafe</span> Services & Earn Locally
                </h2>
                <p className="mt-5 text-base md:text-lg text-gray-700 leading-relaxed">
                  Apply PAN, Voter ID, Aadhaar, e-Shram, and more with step-by-step video tutorials.
                  Build your digital service center and earn confidently.
                </p>

                <ul className="mt-8 space-y-3 text-gray-700 text-sm md:text-base">
                  <li>✅ Step-by-step practical video lessons</li>
                  <li>🎯 Real examples with live portals</li>
                  <li>💼 Grow your customer base easily</li>
                </ul>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setPage("checkout")} className={gradientBtn}>Buy Course — ₹199</button>
                  <a href="#reviews" className="px-6 py-3 border border-emerald-500 text-emerald-600 rounded-xl font-medium hover:bg-emerald-50 transition text-center">See Reviews</a>
                </div>
              </div>

              <div className="space-y-6">
                <div className="aspect-w-16 aspect-h-9 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                  <iframe
                    src="https://www.youtube.com/embed/qk2WMmiiVFE"
                    title="Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-64 md:h-96"
                  ></iframe>
                </div>
                <div className={sectionCard}>
                  <h3 className="font-semibold text-gray-900 text-lg">🧾 What You’ll Get:</h3>
<ul className="list-inside mt-3 text-gray-700 space-y-2">
                    <li>✅ Step-by-step video classes on</li>

                        <li>✅ How to apply PAN Card online</li>

                         <li>✅ How to update Aadhaar Card easily</li>

                       <li>✅  How to apply for Voter ID online</li>

                      <li>✅ How to download and track all documents</li>
                    <li>✅Printable forms & templates</li>
                    <li>✅Free ad creatives for YouTube/FB</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="reviews" className="py-8 md:py-16">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900">Student Reviews ⭐</h3>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Ravi", text: "Learned PAN & Aadhaar update easily!", rating: 5, video: "https://www.youtube.com/embed/GgmFC8y8q3k" },
                  { name: "Sana", text: "Helpful videos for e-Shram and Labour card.", rating: 4, video: "https://www.youtube.com/embed/tgbNymZ7vqY" },
                  { name: "Amit", text: "Worth every rupee! Simple and clear.", rating: 5, video: "https://www.youtube.com/embed/lTTajzrSkCw" },
                ].map((r, i) => (
                  <div key={i} className={sectionCard + " text-center"}>
                    <div className="aspect-w-9 aspect-h-16 rounded-xl overflow-hidden mb-4">
                      <iframe
                        src={r.video}
                        title={`Review ${r.name}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-48"
                      ></iframe>
                    </div>
                    <p className="text-gray-700 mb-2 italic">“{r.text}”</p>
                    <div className="text-yellow-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                    <p className="text-sm text-gray-500 mt-1">— {r.name}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {page === "checkout" && (
          <section className="py-8 md:py-16">
            <div className={sectionCard + " max-w-md mx-auto"}>
              <h2 className="text-2xl md:text-3xl font-bold text-center">Checkout — ₹199</h2>
              <p className="mt-3 text-gray-600 text-center text-sm md:text-base">Secure payment with Razorpay. Instant course access after success.</p>

              <div className="mt-8 space-y-5">
                <input id="cust_name" placeholder="Full name" required className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm md:text-base" />
                <input id="cust_contact" placeholder="Mobile number" required className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm md:text-base" />

                <button
                  onClick={() => handleBuyNow({ name: document.getElementById('cust_name').value || 'Guest', contact: document.getElementById('cust_contact').value || '' })}
                  disabled={loading}
                  className={gradientBtn + " w-full font-semibold text-sm md:text-base"}
                >
                  {loading ? "Processing…" : "Pay ₹199 with Razorpay"}
                </button>

                <button onClick={() => setPage("home")} className="block mx-auto text-sm text-gray-500 hover:text-emerald-600 mt-3">← Back to Home</button>
              </div>
            </div>
          </section>
        )}

        {page === "success" && (
          <section className="py-10 md:py-20 text-center">
            <div className="inline-block bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-emerald-100">
              <h2 className="text-2xl md:text-4xl font-bold text-emerald-600">Thank you! 🎉</h2>
              <p className="mt-4 text-gray-700 text-base md:text-lg">Payment received successfully. Course access link sent to your email.</p>
              <button onClick={() => setPage("home")} className={gradientBtn + " mt-8"}>Back to Home</button>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-20 py-10 bg-gray-900 text-gray-300 border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <div>
            <h4 className="font-semibold text-white mb-3">Contact Us</h4>
            <p>Email: shop43856@gmail.com</p>
            <p>Phone: +91 9229721835</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setPage("home")} className="hover:text-emerald-400">Home</button></li>
              <li><button onClick={() => setPage("checkout")} className="hover:text-emerald-400">Buy Course</button></li>
            </ul>
          </div>
          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} <span className="text-emerald-400 font-semibold">Your Business</span></p>
            <p className="text-sm">Cybercafe Practical Course</p>
          </div>
        </div>
      </footer>

      {toast && <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg animate-bounce">{toast}</div>}
    </div>
  );
}

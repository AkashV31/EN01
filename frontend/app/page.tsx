import Link from "next/link";

const trustSignals = [
  "CHM-ready map workflows",
  "ESG dashboards in INR",
  "Forest restoration ROI tracking",
];

export default function LoginPage() {
  return (
    <main className="app-shell flex flex-1 items-center justify-center px-6 py-10 md:px-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[32px] border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(238,248,239,0.94))] p-8 shadow-[0_24px_70px_rgba(34,107,57,0.08)] md:p-12">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green-600)]">
                CanopyROI
              </span>
              <span className="rounded-full bg-[var(--green-50)] px-3 py-1 text-sm font-medium text-[var(--green-700)]">
                White + Green Interface
              </span>
            </div>

            <div className="max-w-2xl space-y-5">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-[var(--green-600)]">
                Forestry Intelligence Platform
              </p>
              <h1 className="font-display text-5xl font-bold tracking-[-0.04em] text-[var(--green-700)] md:text-6xl">
                Turn canopy insights into measurable rupee returns.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
                A clean investor-facing frontend for carbon projects, ESG reporting,
                and geospatial decision-making. Built to feel premium, calm, and
                ready for enterprise demos.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {trustSignals.map((signal) => (
                <div
                  key={signal}
                  className="metric-card rounded-3xl p-5"
                >
                  <div className="mb-4 h-10 w-10 rounded-2xl bg-[var(--green-100)]" />
                  <p className="text-sm font-semibold text-[var(--green-700)]">
                    {signal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-[var(--line)] bg-white/80 p-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
              <span className="rounded-full bg-[var(--green-50)] px-3 py-1.5 font-medium text-[var(--green-700)]">
                Avg. portfolio uplift
              </span>
              <span className="font-display text-3xl font-bold text-[var(--green-700)]">
                ₹2.8 Cr
              </span>
              <span>across afforestation, CSR, and biodiversity programs</span>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[32px] p-8 md:p-10">
          <div className="mb-8 space-y-3">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-[var(--green-600)]">
              Login
            </p>
            <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-[var(--green-700)]">
              Access your canopy workspace
            </h2>
            <p className="text-[15px] leading-7 text-[var(--muted)]">
              Sign in to monitor project sites, track carbon performance, and
              review impact metrics in Indian rupees.
            </p>
          </div>

          <form className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--green-700)]">
                Work email
              </span>
              <input
                type="email"
                placeholder="analyst@canopyroi.com"
                className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 text-[15px] text-[var(--foreground)] outline-none transition focus:border-[var(--green-500)] focus:ring-4 focus:ring-[rgba(45,138,74,0.12)]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--green-700)]">
                Password
              </span>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 text-[15px] text-[var(--foreground)] outline-none transition focus:border-[var(--green-500)] focus:ring-4 focus:ring-[rgba(45,138,74,0.12)]"
              />
            </label>

            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-[var(--green-600)]" />
                Keep me signed in
              </label>
              <a href="#" className="font-semibold text-[var(--green-600)]">
                Forgot password?
              </a>
            </div>

            <Link
              href="/intro"
              className="flex w-full items-center justify-center rounded-2xl bg-[var(--green-600)] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--green-700)]"
            >
              Continue to Intro
            </Link>

            <button
              type="button"
              className="flex w-full items-center justify-center rounded-2xl border border-[var(--line)] bg-white px-5 py-3.5 text-base font-semibold text-[var(--green-700)] transition hover:bg-[var(--green-50)]"
            >
              Sign in with Google
            </button>
          </form>

          <div className="mt-8 rounded-[28px] bg-[var(--green-50)] p-5">
            <p className="text-sm font-medium text-[var(--green-700)]">
              Demo flow
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Login page first, intro page second, working page third. The app
              now follows that exact structure for your frontend walkthrough.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

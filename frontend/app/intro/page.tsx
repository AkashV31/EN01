import Link from "next/link";

const pillars = [
  {
    title: "Map-led discovery",
    description:
      "Visualize forest parcels, canopy height models, and restoration zones in one streamlined workspace.",
  },
  {
    title: "ESG financial clarity",
    description:
      "Translate carbon capture, biodiversity uplift, and CSR outcomes into investor-friendly rupee metrics.",
  },
  {
    title: "AI-assisted action",
    description:
      "Guide analysts with recommendations, alerts, and project summaries built directly into the workflow.",
  },
];

const milestones = [
  "Import GeoJSON and baseline parcel metadata",
  "Assess canopy growth, carbon trends, and risk signals",
  "Export ROI and impact views for enterprise reporting",
];

export default function IntroPage() {
  return (
    <main className="app-shell flex flex-1 px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="glass-card flex flex-col gap-6 rounded-[32px] p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-3xl space-y-4">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-[var(--green-600)]">
              Intro Page
            </p>
            <h1 className="font-display text-4xl font-bold tracking-[-0.05em] text-[var(--green-700)] md:text-6xl">
              CanopyROI brings geospatial climate intelligence into a crisp,
              enterprise-ready frontend.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              The interface is designed around a mostly white visual language with
              green accents, so the product feels trustworthy, technical, and easy
              to present to investors, ESG teams, and operations leads.
            </p>
          </div>

          <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_18px_40px_rgba(34,107,57,0.06)] md:w-[320px]">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--green-600)]">
              Snapshot
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-[var(--muted)]">Projected carbon revenue</p>
                <p className="font-display text-3xl font-bold text-[var(--green-700)]">
                  ₹1.94 Cr
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Verified restoration zones</p>
                <p className="text-xl font-semibold text-[var(--green-700)]">128 parcels</p>
              </div>
              <Link
                href="/workspace"
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--green-600)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--green-700)]"
              >
                Open Working Page
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-[var(--line)] bg-white p-8 shadow-[0_20px_50px_rgba(24,78,41,0.05)]">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-[var(--green-600)]">
              Product Story
            </p>
            <div className="mt-6 space-y-6">
              <div className="rounded-[28px] bg-[var(--green-50)] p-6">
                <p className="text-sm font-semibold text-[var(--green-700)]">
                  Why this frontend works
                </p>
                <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">
                  It makes technically dense forestry data feel approachable. The
                  layout moves users from trust and onboarding into analytics and
                  operations without visual clutter.
                </p>
              </div>

              <ol className="space-y-4">
                {milestones.map((milestone, index) => (
                  <li
                    key={milestone}
                    className="flex items-start gap-4 rounded-3xl border border-[var(--line)] p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--green-100)] font-display font-bold text-[var(--green-700)]">
                      0{index + 1}
                    </div>
                    <p className="pt-2 text-[15px] leading-7 text-[var(--muted)]">
                      {milestone}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-1">
            {pillars.map((pillar, index) => (
              <article
                key={pillar.title}
                className="metric-card rounded-[32px] p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-5xl font-bold tracking-[-0.08em] text-[var(--green-200)]">
                    0{index + 1}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-600)]">
                    Core Pillar
                  </span>
                </div>
                <h2 className="mt-6 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--green-700)]">
                  {pillar.title}
                </h2>
                <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-col items-start justify-between gap-4 rounded-[28px] border border-[var(--line)] bg-white px-6 py-5 text-sm text-[var(--muted)] md:flex-row md:items-center">
          <p>
            Three-page flow completed: login, intro, and working dashboard with
            rupee-first data storytelling.
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-full border border-[var(--line)] px-4 py-2 font-semibold text-[var(--green-700)] transition hover:bg-[var(--green-50)]"
            >
              Back to Login
            </Link>
            <Link
              href="/workspace"
              className="rounded-full bg-[var(--green-600)] px-4 py-2 font-semibold text-white transition hover:bg-[var(--green-700)]"
            >
              Continue
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

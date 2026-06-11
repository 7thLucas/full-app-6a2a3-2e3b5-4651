import { Link } from "react-router";
import { ArrowRight, ShieldCheck, Users, FileText, BarChart2 } from "lucide-react";
import { BrandMark, ComplianceThemeStyle, Eyebrow } from "~/lib/compliance-theme";
import logoUrl from "../../logo.png?url";

const features = [
  {
    icon: ShieldCheck,
    title: "State Compliance",
    desc: "AML, anti-fraud, privacy, insurance regulations",
  },
  {
    icon: FileText,
    title: "Internal Controls",
    desc: "Code of conduct, IT security, ethics, SOP sign-offs",
  },
  {
    icon: Users,
    title: "Role Requirements",
    desc: "Department targeting for Sales and Compliance teams",
  },
  {
    icon: BarChart2,
    title: "Audit Visibility",
    desc: "Scorecards for missing, submitted, and at-risk items",
  },
];

export default function IndexPage() {
  return (
    <div className="cmp min-h-screen" style={{ background: "var(--paper)" }}>
      <ComplianceThemeStyle />

      {/* Nav */}
      <nav className="sticky top-0 z-10" style={{ background: "var(--ink)", color: "#fff" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark tone="dark" logoSrc={logoUrl} />
          </Link>
          <Link
            to="/login"
            className="dp inline-flex items-center gap-2 rounded-lg px-5 py-2 transition"
            style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.12)", color: "#fff", fontWeight: 600, fontSize: 13 }}
          >
            Login <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-14 lg:grid-cols-[1fr_1fr] lg:items-center">
        {/* Hero copy */}
        <div className="space-y-7">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
            style={{ border: "1px solid var(--line)", background: "var(--surf)", boxShadow: "var(--sh)" }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--teal)" }} />
            <Eyebrow>Compliance Command Center</Eyebrow>
          </span>

          <h1 className="dp" style={{ fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, lineHeight: 1, letterSpacing: "-.025em" }}>
            Audit-ready
            <br />
            <span style={{ color: "var(--teal)" }}>compliance</span>
            <br />
            without the chaos.
          </h1>

          <p style={{ maxWidth: "32rem", fontSize: 15, lineHeight: 1.7, color: "var(--soft)" }}>
            Track SOP acknowledgements, regulatory training, certifications, and department-specific
            compliance evidence for a 500-person insurance organization.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="dp inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition"
              style={{ background: "var(--ink)", color: "#fff", fontWeight: 600, fontSize: 13.5 }}
            >
              Start Demo <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 transition"
              style={{ border: "1px solid var(--line)", background: "var(--surf)", color: "var(--ink2)", fontWeight: 600, fontSize: 13.5 }}
            >
              See all features
            </a>
          </div>

          <div className="flex items-center gap-8 pt-6" style={{ borderTop: "1px solid var(--line)" }}>
            {[["500+", "Employees"], ["3", "Departments"], ["100%", "Audit Ready"]].map(([val, label]) => (
              <div key={label} className="pt-6 first:pt-6">
                <p className="dp" style={{ fontSize: 22, fontWeight: 700 }}>{val}</p>
                <p className="mono" style={{ fontSize: 10.5, color: "var(--softer)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div id="features" className="grid gap-2.5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-[10px] p-5 transition"
              style={{ background: "var(--surf)", border: "1px solid var(--line)", boxShadow: "var(--sh)" }}
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
                style={{ background: "var(--ink)", color: "#fff" }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="dp" style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</p>
                <p className="mt-1" style={{ fontSize: 13, lineHeight: 1.5, color: "var(--soft)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { demoAccounts, findDemoAccount, saveDemoSession } from "~/lib/compliance-demo";
import { BrandMark, ComplianceThemeStyle, Eyebrow } from "~/lib/compliance-theme";
import logoUrl from "../../logo.png?url";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function selectAccount(index: number) {
    const account = demoAccounts[index];
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const account = findDemoAccount(email, password);
    if (!account) {
      setError("Demo account not found. Use one of the quick-select buttons below.");
      return;
    }
    saveDemoSession(account);
    navigate(account.role === "HR" ? "/hr/dashboard" : "/employee/dashboard");
  }

  const hrAccounts = demoAccounts.filter((a) => a.role === "HR");
  const employeeAccounts = demoAccounts.filter((a) => a.role === "Employee");

  return (
    <div className="cmp">
      <ComplianceThemeStyle />
      <main
        className="flex min-h-screen items-center justify-center p-5"
        style={{ background: "var(--paper)" }}
      >
        <div
          className="grid w-full max-w-3xl overflow-hidden rounded-2xl lg:grid-cols-2"
          style={{ border: "1px solid var(--line)", boxShadow: "var(--shl)", background: "var(--surf)" }}
        >
          {/* Left — brand panel */}
          <div
            className="hidden flex-col justify-between p-10 lg:flex"
            style={{ background: "var(--ink)", color: "#fff" }}
          >
            <BrandMark tone="dark" logoSrc={logoUrl} />
            <div>
              <h1
                className="dp"
                style={{ fontWeight: 700, fontSize: 26, lineHeight: 1.2, margin: "16px 0 10px" }}
              >
                Compliance, traceable end-to-end.
              </h1>
              <p style={{ color: "#A0A8B8", fontSize: 13, lineHeight: 1.6, maxWidth: "30ch" }}>
                Configure SOPs per department, evaluate uploads automatically, and keep a
                regulator-ready audit trail.
              </p>
            </div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "#606878", letterSpacing: ".04em" }}
            >
              ALLIED FINANCIAL SERVICES &nbsp;·&nbsp; SOC 2 · GLBA · NAIC #MCR-1140
            </div>
          </div>

          {/* Right — form */}
          <div className="flex flex-col gap-3 p-8">
            <div>
              <Eyebrow>Welcome back</Eyebrow>
              <h2 className="dp" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
                Sign in
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1.5 block" style={{ fontWeight: 600, fontSize: 12 }}>
                  Work email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="username"
                  placeholder="name@alliedfinancial.com"
                  className="form-input"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block" style={{ fontWeight: 600, fontSize: 12 }}>
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className="form-input"
                />
              </label>

              {error ? (
                <p style={{ color: "var(--bad)", fontSize: 12, fontWeight: 500 }}>{error}</p>
              ) : null}

              <button
                type="submit"
                className="dp w-full"
                style={{
                  background: "var(--ink)",
                  color: "#fff",
                  borderRadius: 8,
                  padding: 10,
                  fontWeight: 600,
                  fontSize: 13.5,
                }}
              >
                Sign in
              </button>
            </form>

            {/* Demo accounts */}
            <div
              className="rounded-xl p-3"
              style={{ border: "1px solid var(--line)", background: "var(--paper)" }}
            >
              <Eyebrow className="mb-2">Demo accounts</Eyebrow>

              <div className="grid gap-2">
                {hrAccounts.map((account) => (
                  <DemoButton
                    key={account.email}
                    role="HR"
                    badgeColor="var(--navy)"
                    name={account.name}
                    onClick={() => selectAccount(demoAccounts.indexOf(account))}
                  />
                ))}
                {employeeAccounts.map((account) => (
                  <DemoButton
                    key={account.email}
                    role="EM"
                    badgeColor="#505870"
                    name={account.name}
                    onClick={() => selectAccount(demoAccounts.indexOf(account))}
                  />
                ))}
              </div>

              <div
                className="mono mt-2.5"
                style={{ fontSize: 10.5, color: "var(--softer)" }}
              >
                Password: <b style={{ color: "var(--soft)" }}>Demo@123</b>
              </div>
            </div>

            <Link
              to="/"
              className="mono inline-flex items-center justify-center gap-1.5 self-center pt-1"
              style={{ fontSize: 11, color: "var(--soft)" }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function DemoButton({
  role,
  badgeColor,
  name,
  onClick,
}: {
  role: string;
  badgeColor: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition"
      style={{ background: "var(--surf)", border: "1px solid var(--line)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#C0C6D4";
        e.currentTarget.style.background = "var(--paper)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.background = "var(--surf)";
      }}
    >
      <span
        className="dp grid h-7 w-7 flex-none place-items-center rounded-md"
        style={{ background: badgeColor, color: "#fff", fontWeight: 700, fontSize: 10 }}
      >
        {role}
      </span>
      <span className="min-w-0 flex-1 truncate" style={{ fontWeight: 600, fontSize: 13.5 }}>
        {name}
      </span>
      <ArrowRight className="h-4 w-4 flex-none" style={{ color: "var(--softer)" }} />
    </button>
  );
}

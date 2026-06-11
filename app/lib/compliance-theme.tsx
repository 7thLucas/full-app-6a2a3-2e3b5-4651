/**
 * Shared design tokens + brand chrome for the Allied Financial compliance portal.
 * Visual language mirrors the "Sentinel" reference: light paper surfaces, a dark
 * ink sidebar/header, Inter / Inter Tight / IBM Plex Mono typography, mono eyebrow
 * labels, soft shadows and a teal brand accent.
 *
 * Logic-free: this file only ships styles + a couple of presentational helpers so
 * the route files can stay focused on data + handlers.
 */
import type { ReactNode } from "react";

/** Injects the Google fonts + CSS custom properties used across compliance pages. */
export function ComplianceThemeStyle() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .cmp {
          --ink:#111318;--ink2:#2A2D35;--soft:#72778A;--softer:#9EA4B3;
          --paper:#F7F8FA;--surf:#FFFFFF;--line:#E8EAEF;--line2:#F0F2F6;
          --accent:#2563EB;--accent-f:#EEF3FD;
          --navy:#33415F;--teal:#5AA0A0;
          --ok:#16714A;--ok-f:#EBF5F0;--ok-l:#B8DECE;
          --bad:#B52B2B;--bad-f:#FDF0F0;--bad-l:#F0CECE;
          --warn:#956A0A;--warn-f:#FDF6E7;--warn-l:#F0DFA8;
          --mono:'IBM Plex Mono',ui-monospace,monospace;
          --ui:'Inter',system-ui,sans-serif;
          --dp:'Inter Tight','Inter',sans-serif;
          --sh:0 1px 3px rgba(0,0,0,.05),0 4px 16px -8px rgba(0,0,0,.10);
          --shl:0 16px 48px -12px rgba(0,0,0,.22);
          font-family:var(--ui);
          color:var(--ink);
          -webkit-font-smoothing:antialiased;
          font-size:13.5px;
          line-height:1.5;
        }
        .cmp .dp{font-family:var(--dp);letter-spacing:-.015em}
        .cmp .mono{font-family:var(--mono);font-variant-numeric:tabular-nums}
        .cmp .ey{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--softer)}

        /* form inputs shared by the compliance pages */
        .cmp .form-input{
          width:100%;background:var(--surf);border:1px solid var(--line);border-radius:8px;
          padding:.5rem .75rem;font-family:var(--ui);font-size:13px;color:var(--ink);
          outline:none;transition:border-color .15s, box-shadow .15s;
        }
        .cmp .form-input::placeholder{color:var(--softer)}
        .cmp .form-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-f)}
        .cmp .form-input option{background:var(--surf);color:var(--ink)}

        .cmp ::selection{background:rgba(90,160,160,.22)}
      `}</style>
    </>
  );
}

/**
 * Allied Financial brand mark — just the `logo.png` image. `tone="dark"` is for
 * placement on the ink sidebar/header; `tone="light"` for paper. Pass the imported
 * `logo.png?url` as `logoSrc`.
 */
export function BrandMark({ tone = "light", logoSrc }: { tone?: "dark" | "light"; logoSrc: string }) {
  // The logo is a WHITE, transparent-background PNG. It reads perfectly on the dark
  // ink header (render it bare), but would vanish on paper — so on light surfaces we
  // sit it on a small ink chip.
  //
  // `block`, `w-auto`, `object-contain` and an explicit auto height keep the logo's
  // aspect ratio intact even when it lands inside a flex column (e.g. the login
  // brand panel), where it would otherwise get stretched/squashed.
  const img = (
    <img
      src={logoSrc}
      alt="Allied Financial Services"
      style={{ height: "100%", width: "auto", objectFit: "contain" }}
      className="block flex-none"
    />
  );

  if (tone === "dark") {
    return <span className="inline-flex h-11 flex-none items-center">{img}</span>;
  }
  return (
    <span
      className="inline-flex h-12 flex-none items-center justify-center rounded-lg"
      style={{ background: "var(--ink)", padding: "6px 12px", boxShadow: "var(--sh)" }}
    >
      {img}
    </span>
  );
}

/** Mono uppercase eyebrow label. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`ey ${className}`}>{children}</p>;
}

type ChipTone = "ok" | "bad" | "warn" | "neu";

const CHIP_STYLES: Record<ChipTone, { bg: string; fg: string; bd: string; dot: string }> = {
  ok: { bg: "var(--ok-f)", fg: "var(--ok)", bd: "var(--ok-l)", dot: "var(--ok)" },
  bad: { bg: "var(--bad-f)", fg: "var(--bad)", bd: "var(--bad-l)", dot: "var(--bad)" },
  warn: { bg: "var(--warn-f)", fg: "var(--warn)", bd: "var(--warn-l)", dot: "var(--warn)" },
  neu: { bg: "var(--line2)", fg: "var(--soft)", bd: "var(--line)", dot: "var(--soft)" },
};

/** Status / state chip with an optional leading dot, matching the reference. */
export function Chip({ tone, dot = true, children }: { tone: ChipTone; dot?: boolean; children: ReactNode }) {
  const s = CHIP_STYLES[tone];
  return (
    <span
      className="mono inline-flex items-center gap-1.5 whitespace-nowrap rounded font-medium"
      style={{ fontSize: 11, padding: "2px 8px", background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}
    >
      {dot ? <span className="h-[5px] w-[5px] rounded-full" style={{ background: s.dot }} /> : null}
      {children}
    </span>
  );
}

/** Small AI provenance tag. */
export function AiTag({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span
      className="mono inline-flex items-center gap-1 rounded font-medium uppercase"
      style={{
        fontSize: 9.5,
        letterSpacing: ".06em",
        color: "var(--soft)",
        background: "var(--line2)",
        border: "1px solid var(--line)",
        padding: "2px 6px",
      }}
    >
      {icon}
      {children}
    </span>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  yearlyData,
  categoryData,
  grandTotals,
  sourceInfo,
  grantRate,
  declineRate,
  type YearRow,
} from "@/data/visaData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "NZ Student Visa Trends for Bangladeshi Students",
      },
      {
        name: "description",
        content:
          "A simple dashboard showing application, approval, decline, and grant rate trends for New Zealand student visa applications from Bangladeshi nationals (2015–2026).",
      },
    ],
  }),
  component: Dashboard,
});

const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (n: number) => `${n.toFixed(2)}%`;

type SortKey = "fy" | "total" | "approved" | "declined" | "grantRate";

function Dashboard() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("fy");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredYears: YearRow[] = useMemo(() => {
    if (yearFilter === "all") return yearlyData;
    return yearlyData.filter((y) => y.fy === yearFilter);
  }, [yearFilter]);

  const tableRows = useMemo(() => {
    let rows = filteredYears.map((r) => ({
      ...r,
      grantRate: grantRate(r.approved, r.total),
      declineRate: declineRate(r.declined, r.total),
    }));
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.fy.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      const va = a[sortKey] as number | string;
      const vb = b[sortKey] as number | string;
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [filteredYears, search, sortKey, sortDir]);

  const latest = yearlyData[yearlyData.length - 1];
  const previous = yearlyData[yearlyData.length - 2];
  const latestRate = grantRate(latest.approved, latest.total);
  const previousRate = grantRate(previous.approved, previous.total);
  const rateChange = latestRate - previousRate;

  const lifetimeRate = grantRate(grandTotals.approved, grandTotals.total);

  const trendData = yearlyData.map((y) => ({
    fy: y.fy,
    "Grant Rate": Number(grantRate(y.approved, y.total).toFixed(2)),
    "Decline Rate": Number(declineRate(y.declined, y.total).toFixed(2)),
  }));

  const compareData = filteredYears.map((y) => ({
    fy: y.fy,
    Total: y.total,
    Approved: y.approved,
    Declined: y.declined,
  }));

  const visibleCategories =
    categoryFilter === "all"
      ? categoryData
      : categoryData.filter((c) => c.category === categoryFilter);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "fy" ? "asc" : "desc");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <header
        className="relative overflow-hidden text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-white" />
            Based on official INZ data · Updated 13 April 2026
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
            New Zealand Student Visa Trends
            <span className="block text-white/85">for Bangladeshi Students</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            {sourceInfo.note.split("—")[0]}A simple dashboard showing application,
            approval, decline, and grant rate trends — built directly from the <a
              href="/statistics-student-applications-decided.pdf"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              INZ statistics PDF
            </a>.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Reporting period" value={sourceInfo.period} />
            <MiniStat label="Source" value={sourceInfo.organisation} />
            <MiniStat label="Nationality" value={sourceInfo.nationality} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        {/* Headline grant rate card */}
        <section
          className="rounded-3xl border bg-card p-6 sm:p-10"
          style={{ boxShadow: "var(--shadow-card)" }}
          aria-label="Latest grant rate"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Latest grant rate · FY {latest.fy}
                {latest.partial ? " (partial year)" : ""}
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span
                  className="text-6xl font-bold tracking-tight sm:text-7xl"
                  style={{ color: "var(--success)" }}
                >
                  {pct(latestRate)}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    rateChange >= 0
                      ? "bg-[color:var(--success)]/12 text-[color:var(--success)]"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {rateChange >= 0 ? "▲" : "▼"} {Math.abs(rateChange).toFixed(2)}{" "}
                  pts vs {previous.fy}
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                <strong>Grant rate</strong> means the percentage of student visa
                applications that were approved. Out of {fmt(latest.total)}{" "}
                applications decided in FY {latest.fy},{" "}
                <strong>{fmt(latest.approved)}</strong> were approved and{" "}
                <strong>{fmt(latest.declined)}</strong> were declined.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Total"
                value={fmt(latest.total)}
                tone="primary"
              />
              <StatCard
                label="Approved"
                value={fmt(latest.approved)}
                tone="success"
              />
              <StatCard
                label="Declined"
                value={fmt(latest.declined)}
                tone="destructive"
              />
            </div>
          </div>

          {latest.partial && (
            <p className="mt-6 rounded-xl bg-[color:var(--warning)]/15 px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
              ⓘ FY 2025/26 is a partial year in the PDF — it covers 1 July 2025
              to 31 March 2026 only. Full-year totals will be higher.
            </p>
          )}
        </section>

        {/* Lifetime totals */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total applications"
            sub={`${yearlyData.length} financial years`}
            value={fmt(grandTotals.total)}
            tone="primary"
          />
          <SummaryCard
            label="Approved"
            sub="All time"
            value={fmt(grandTotals.approved)}
            tone="success"
          />
          <SummaryCard
            label="Declined"
            sub="All time"
            value={fmt(grandTotals.declined)}
            tone="destructive"
          />
          <SummaryCard
            label="Overall grant rate"
            sub="Approved ÷ Total"
            value={pct(lifetimeRate)}
            tone="accent"
          />
        </section>

        {/* Filters */}
        <section
          className="rounded-2xl border bg-card p-5"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Filters</h2>
              <p className="text-sm text-muted-foreground">
                Narrow the charts and table below. Filters are kept simple — only
                what the PDF data supports.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Financial year
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All years</option>
                  {yearlyData.map((y) => (
                    <option key={y.fy} value={y.fy}>
                      FY {y.fy}
                      {y.partial ? " (partial)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Visa category
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All categories</option>
                  {categoryData.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Note: The PDF does not provide a year-by-month or year-by-category
            breakdown for Bangladesh specifically. Category figures shown below
            are <strong>lifetime totals</strong> (2015/16 – 2025/26).
          </p>
        </section>

        {/* Grant rate trend */}
        <ChartSection
          title="Grant rate trend"
          subtitle="How the percentage of approved applications has changed each financial year. Higher is better."
          explanation="The green line shows the grant rate (approved ÷ total). The red dashed line shows the decline rate. Together they always add up to 100% of decided applications."
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={trendData}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="fy"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(v: number) => `${v.toFixed(2)}%`}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              <ReferenceLine
                y={lifetimeRate}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                label={{
                  value: `Avg ${lifetimeRate.toFixed(1)}%`,
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                  position: "insideTopRight",
                }}
              />
              <Line
                type="monotone"
                dataKey="Grant Rate"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Decline Rate"
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* Applications overview + comparison */}
        <ChartSection
          title="Applications: total vs approved vs declined"
          subtitle="Each bar shows one financial year. Use this to compare the size of approvals and refusals against the total."
          explanation="Tall blue bar = many applications were decided that year. Green = approved. Red = declined."
        >
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={compareData}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="fy"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(v) => fmt(v)}
              />
              <Tooltip
                formatter={(v: number) => fmt(v)}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              <Bar dataKey="Total" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              <Bar
                dataKey="Approved"
                fill="var(--chart-1)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="Declined"
                fill="var(--chart-2)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* By category */}
        <ChartSection
          title="By application category (lifetime)"
          subtitle="Which student-visa categories Bangladeshi applicants most commonly apply under, across the full reporting period."
          explanation="“Fee Paying” is a standard international student paying their own tuition. “Dependant” is the child of a current visa holder. Other categories are smaller."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={visibleCategories}
              layout="vertical"
              margin={{ top: 10, right: 24, left: 24, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(v) => fmt(v)}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={110}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                formatter={(v: number) => fmt(v)}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              <Bar
                dataKey="approved"
                name="Approved"
                stackId="a"
                fill="var(--chart-1)"
              />
              <Bar
                dataKey="declined"
                name="Declined"
                stackId="a"
                fill="var(--chart-2)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* Data table */}
        <section
          className="rounded-2xl border bg-card p-5 sm:p-6"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Full data table</h2>
              <p className="text-sm text-muted-foreground">
                Numbers shown exactly as extracted from the PDF. Only the grant
                rate column is calculated.
              </p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search years…"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-56"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <Th
                    label="Financial year"
                    active={sortKey === "fy"}
                    dir={sortDir}
                    onClick={() => toggleSort("fy")}
                  />
                  <Th
                    label="Total"
                    active={sortKey === "total"}
                    dir={sortDir}
                    onClick={() => toggleSort("total")}
                    align="right"
                  />
                  <Th
                    label="Approved"
                    active={sortKey === "approved"}
                    dir={sortDir}
                    onClick={() => toggleSort("approved")}
                    align="right"
                  />
                  <Th
                    label="Declined"
                    active={sortKey === "declined"}
                    dir={sortDir}
                    onClick={() => toggleSort("declined")}
                    align="right"
                  />
                  <Th
                    label="Grant rate"
                    active={sortKey === "grantRate"}
                    dir={sortDir}
                    onClick={() => toggleSort("grantRate")}
                    align="right"
                  />
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No rows match your filters.
                    </td>
                  </tr>
                )}
                {tableRows.map((r) => (
                  <tr
                    key={r.fy}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="py-3 pr-2 font-medium">
                      FY {r.fy}
                      {r.partial && (
                        <span className="ml-2 rounded-md bg-[color:var(--warning)]/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[color:var(--warning-foreground)]">
                          Partial
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {fmt(r.total)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-[color:var(--success)]">
                      {fmt(r.approved)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-destructive">
                      {fmt(r.declined)}
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums">
                      {pct(r.grantRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="py-3">Total ({yearlyData.length} years)</td>
                  <td className="py-3 text-right tabular-nums">
                    {fmt(grandTotals.total)}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[color:var(--success)]">
                    {fmt(grandTotals.approved)}
                  </td>
                  <td className="py-3 text-right tabular-nums text-destructive">
                    {fmt(grandTotals.declined)}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {pct(lifetimeRate)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Faq
            q="What is a “grant rate”?"
            a="The percentage of student visa applications that were approved. Formula: Approved ÷ Total × 100."
          />
          <Faq
            q="What is a “decline rate”?"
            a="The percentage of applications that were refused. Formula: Declined ÷ Total × 100."
          />
          <Faq
            q="What does “applications decided” mean?"
            a="Applications that INZ either approved or declined. It does not include applications that failed lodgement or that INZ refused to consider."
          />
          <Faq
            q="What is a “financial year”?"
            a="In this PDF, a financial year runs from 1 July to 30 June. FY 2024/25 means 1 July 2024 – 30 June 2025."
          />
          <Faq
            q="Why is 2025/26 lower than expected?"
            a="The PDF only covers up to 31 March 2026, so FY 2025/26 is a partial year (9 months). Full-year totals will be higher once INZ publishes them."
          />
          <Faq
            q="Are these numbers official?"
            a={`The figures come from the uploaded PDF “${sourceInfo.document}”, prepared by ${sourceInfo.organisation} on ${sourceInfo.preparedOn}. This site only re-displays them.`}
          />
        </section>

        {/* Source / footer note */}
        <section
          className="rounded-2xl border-2 border-dashed bg-secondary/40 p-5 text-sm"
          aria-label="Data source"
        >
          <h3 className="text-base font-semibold">About this data</h3>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>
              <strong className="text-foreground">Document:</strong>{" "}
              {sourceInfo.document}
            </li>
            <li>
              <strong className="text-foreground">Prepared:</strong>{" "}
              {sourceInfo.preparedOn}
            </li>
            <li>
              <strong className="text-foreground">Reporting period:</strong>{" "}
              {sourceInfo.period}
            </li>
            <li>
              <strong className="text-foreground">Source organisation:</strong>{" "}
              {sourceInfo.organisation}
            </li>
            <li>
              <strong className="text-foreground">Nationality filter:</strong>{" "}
              {sourceInfo.nationality}
            </li>
          </ul>
          <p className="mt-3 text-xs">
            All numbers on this page were taken directly from the PDF. Only the
            grant-rate and decline-rate percentages are calculated. This site
            does not claim to be an official source — it simply visualises the
            uploaded document.{" "}
            <a
              href="/statistics-student-applications-decided.pdf"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary-glow"
              target="_blank"
              rel="noreferrer"
            >
              Download the original PDF →
            </a>
          </p>
        </section>
      </div>

      <footer className="border-t bg-secondary/30 py-6 text-center text-xs text-muted-foreground">
        Data-driven trends for Bangladeshi students applying to New Zealand | Vibecoded with Loveable
      </footer>
    </main>
  );
}

/* -------- Small presentational helpers -------- */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-[11px] uppercase tracking-wider text-white/70">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "success" | "destructive";
}) {
  const toneClass =
    tone === "success"
      ? "text-[color:var(--success)]"
      : tone === "destructive"
        ? "text-destructive"
        : "text-primary";
  return (
    <div className="rounded-xl bg-secondary/60 px-4 py-4 text-center">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold tabular-nums sm:text-2xl ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  sub,
  value,
  tone,
}: {
  label: string;
  sub: string;
  value: string;
  tone: "primary" | "success" | "destructive" | "accent";
}) {
  const accent =
    tone === "success"
      ? "var(--success)"
      : tone === "destructive"
        ? "var(--destructive)"
        : tone === "accent"
          ? "var(--primary-glow)"
          : "var(--primary)";
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: accent }}
      />
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className="mt-2 text-3xl font-bold tracking-tight tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function ChartSection({
  title,
  subtitle,
  explanation,
  children,
}: {
  title: string;
  subtitle: string;
  explanation: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border bg-card p-5 sm:p-6"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
      <p className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
        💡 {explanation}
      </p>
    </section>
  );
}

function Th({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className={`py-2 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-foreground ${
          active ? "text-foreground" : ""
        }`}
      >
        {label}
        <span className="text-[10px] opacity-60">
          {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details
      className="group rounded-xl border bg-card p-4 transition hover:border-primary/40"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <summary className="cursor-pointer list-none font-semibold marker:hidden">
        <span className="inline-flex w-full items-center justify-between gap-2">
          {q}
          <span className="text-muted-foreground transition group-open:rotate-45">
            ＋
          </span>
        </span>
      </summary>
      <p className="mt-2 text-sm text-muted-foreground">{a}</p>
    </details>
  );
}

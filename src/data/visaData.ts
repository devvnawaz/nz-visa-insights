// Data extracted from PDF: "statistics-student-applications-decided.pdf"
// Source: New Zealand Immigration (Immigration New Zealand / INZ)
// Date prepared: 13 April 2026
// Period: Date of decision between 31 July 2015 and 31 March 2026
// All numbers preserved exactly as they appear in the PDF. Only percentages
// (grant rate / decline rate) are calculated.

export interface YearRow {
  fy: string;
  approved: number;
  declined: number;
  total: number;
  partial?: boolean;
}

export const yearlyData: YearRow[] = [
  { fy: "2015/16", approved: 499, declined: 832, total: 1331 },
  { fy: "2016/17", approved: 420, declined: 310, total: 730 },
  { fy: "2017/18", approved: 320, declined: 120, total: 440 },
  { fy: "2018/19", approved: 267, declined: 88, total: 355 },
  { fy: "2019/20", approved: 219, declined: 74, total: 293 },
  { fy: "2020/21", approved: 185, declined: 6, total: 191 },
  { fy: "2021/22", approved: 150, declined: 8, total: 158 },
  { fy: "2022/23", approved: 190, declined: 47, total: 237 },
  { fy: "2023/24", approved: 350, declined: 219, total: 569 },
  { fy: "2024/25", approved: 927, declined: 449, total: 1376 },
  { fy: "2025/26", approved: 1469, declined: 497, total: 1966, partial: true },
];

export interface CategoryRow {
  category: string;
  approved: number;
  declined: number;
  total: number;
}

// Lifetime totals (2015/16 – 2025/26) by application substream / criteria.
export const categoryData: CategoryRow[] = [
  { category: "Fee Paying", approved: 3495, declined: 2538, total: 6033 },
  { category: "Dependant", approved: 1236, declined: 82, total: 1318 },
  { category: "Other", approved: 217, declined: 29, total: 246 },
  { category: "Section 61", approved: 31, declined: 1, total: 32 },
  { category: "Scholarship", approved: 16, declined: 0, total: 16 },
  { category: "IPT Order", approved: 1, declined: 0, total: 1 },
  { category: "Humanitarian", approved: 0, declined: 0, total: 0 },
];

export const grandTotals = {
  approved: yearlyData.reduce((s, r) => s + r.approved, 0),
  declined: yearlyData.reduce((s, r) => s + r.declined, 0),
  total: yearlyData.reduce((s, r) => s + r.total, 0),
};

export const sourceInfo = {
  document: "statistics-student-applications-decided.pdf",
  preparedOn: "13 April 2026",
  period: "31 July 2015 – 31 March 2026",
  organisation: "Immigration New Zealand (INZ)",
  nationality: "Bangladesh",
  note: "The 2025/26 financial year is partial — it covers 1 July 2025 to 31 March 2026 only.",
};

export const grantRate = (approved: number, total: number) =>
  total === 0 ? 0 : (approved / total) * 100;

export const declineRate = (declined: number, total: number) =>
  total === 0 ? 0 : (declined / total) * 100;

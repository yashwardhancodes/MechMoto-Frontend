const MONTH_MAP: Record<string, string> = {
  "01": "JAN",
  "02": "FEB",
  "03": "MAR",
  "04": "APR",
  "05": "MAY",
  "06": "JUN",
  "07": "JUL",
  "08": "AUG",
  "09": "SEP",
  "10": "OCT",
  "11": "NOV",
  "12": "DEC",
};

/**
 * Converts:
 * "SWIFT 1ST GEN 05.2005 - 12.2007"
 * → "SWIFT GEN 1 (MAY 2005 – DEC 2007)"
 */
export const formatModificationLabel = (rawName: string): string => {
  if (!rawName) return "";

  // 🔹 Normalize input
  const normalized = rawName
    .trim()
    .replace(/\s+/g, " ")     // collapse spaces
    .replace(/[–—]/g, "-")   // normalize dash
    .toUpperCase();          // 🔥 ensure consistency

  const regex =
    /^(\w+)\s+(\d+)(ST|ND|RD|TH)\s+GEN\s+(\d{2})\.(\d{4})\s*-\s*(\d{2})\.(\d{4})$/;

  const match = normalized.match(regex);
  if (!match) return rawName.toUpperCase(); // safe fallback (also caps)

  const [
    ,
    model,
    gen,
    ,
    startMonth,
    startYear,
    endMonth,
    endYear,
  ] = match;

  return `${model} GEN ${gen} (${MONTH_MAP[startMonth]} ${startYear} – ${MONTH_MAP[endMonth]} ${endYear})`;
};

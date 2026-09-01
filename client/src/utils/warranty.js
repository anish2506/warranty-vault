export const EXPIRING_SOON_DAYS = 30;

/**
 * Safely parses any date input (string, Date, timestamp) to a normalized local Date at midnight 00:00:00.
 * Handles ISO strings and YYYY-MM-DD without timezone offset skew.
 */
export const parseLocalDate = (dateInput) => {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    const d = new Date(dateInput);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const str = String(dateInput).trim();
  if (!str) return null;

  // Handle YYYY-MM-DD specifically to avoid UTC-to-local shift
  const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Helper to extract start and end dates from either a product object or separate parameters.
 */
const extractDates = (startDateOrProduct, possibleEndDate) => {
  let rawStart = null;
  let rawEnd = null;

  if (startDateOrProduct && typeof startDateOrProduct === "object" && !(startDateOrProduct instanceof Date)) {
    rawStart = startDateOrProduct.warrantyStart;
    rawEnd = startDateOrProduct.warrantyEnd;
  } else if (possibleEndDate !== undefined) {
    rawStart = startDateOrProduct;
    rawEnd = possibleEndDate;
  } else {
    rawEnd = startDateOrProduct;
  }

  return {
    startDate: parseLocalDate(rawStart),
    endDate: parseLocalDate(rawEnd),
  };
};

/**
 * Calculates remaining days until warranty ends.
 * Always returns >= 0 (never negative for expired warranties).
 */
export const getRemainingWarrantyDays = (startDateOrProduct, possibleEndDate) => {
  const { endDate } = extractDates(startDateOrProduct, possibleEndDate);
  if (!endDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const differenceMs = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

/**
 * Calculates the warranty status and remaining days.
 * 
 * Statuses:
 * - "Unknown"     -> Missing or invalid dates
 * - "Not Started" -> Current date is before warrantyStart
 * - "Expired"     -> Current date is after warrantyEnd
 * - "Expiring Soon" -> 0 <= remaining days <= EXPIRING_SOON_DAYS
 * - "Active"      -> Current date between start and end, > EXPIRING_SOON_DAYS remaining
 */
export const getWarrantyStatus = (startDateOrProduct, possibleEndDate) => {
  const { startDate, endDate } = extractDates(startDateOrProduct, possibleEndDate);

  if (!endDate) {
    return {
      status: "Unknown",
      daysRemaining: 0,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If warranty start is in the future
  if (startDate && today.getTime() < startDate.getTime()) {
    const diffToStart = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      status: "Not Started",
      daysRemaining: Math.max(0, diffToStart),
    };
  }

  const differenceMs = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "Expired",
      daysRemaining: 0,
    };
  }

  if (diffDays <= EXPIRING_SOON_DAYS) {
    return {
      status: "Expiring Soon",
      daysRemaining: diffDays,
    };
  }

  return {
    status: "Active",
    daysRemaining: diffDays,
  };
};

/**
 * Calculates the warranty progress percentage (0 - 100).
 */
export const getWarrantyProgress = (startDateOrProduct, possibleEndDate) => {
  const { startDate, endDate } = extractDates(startDateOrProduct, possibleEndDate);

  if (!endDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If expired
  if (today.getTime() > endDate.getTime()) {
    return 100;
  }

  // If not started yet
  if (startDate && today.getTime() < startDate.getTime()) {
    return 0;
  }

  const effectiveStart = startDate || today;
  const totalDuration = endDate.getTime() - effectiveStart.getTime();

  if (totalDuration <= 0) {
    return today.getTime() > endDate.getTime() ? 100 : 0;
  }

  const elapsed = today.getTime() - effectiveStart.getTime();
  const percentage = Math.round((elapsed / totalDuration) * 100);

  return Math.min(100, Math.max(0, percentage));
};

/**
 * Returns human-friendly text for remaining warranty days.
 */
export const formatRemainingDays = (daysRemaining, status) => {
  if (status === "Expired") {
    return "Expired";
  }
  if (status === "Not Started") {
    return "Not started";
  }
  if (status === "Unknown") {
    return "Unknown";
  }
  if (daysRemaining === 0) {
    return "Expires today";
  }
  return daysRemaining === 1 ? "1 day remaining" : `${daysRemaining} days remaining`;
};
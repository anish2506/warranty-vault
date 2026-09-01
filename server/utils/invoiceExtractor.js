const extractPrice = (text) => {
  const pricePatterns = [
    /total\s*due\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d{1,2})?)/i,

    /grand\s*total\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d{1,2})?)/i,

    /sub\s*total\s*[^0-9]*([\d,]+(?:\.\d{1,2})?)/i,

    /total\s*[^0-9]*([\d,]+(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);

    if (match) {
      return Number(match[1].replace(/,/g, ""));
    }
  }

  return null;
};

const extractDate = (text) => {
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);

    if (match) {
      return match[1];
    }
  }

  return null;
};

const extractInvoiceNumber = (text) => {
  const patterns = [
    /invoice\s*(?:no|number|#)?\s*[:\-]?\s*([A-Z0-9\-\/]+)/i,
    /invoice\s*#\s*([A-Z0-9\-\/]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return match[1];
    }
  }

  return null;
};

const extractProductName = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    // Ignore common invoice/header/footer lines
    if (
      /invoice|date|company|client|address|city|phone|email|postal|state|mobile|subtotal|total|rupees|bank|account|ifsc|thank you/i.test(
        line
      )
    ) {
      continue;
    }

    // Match an invoice item line starting with quantity
    const match = line.match(
      /^\d+\s+([A-Za-z][A-Za-z\s\-]+?)(?=\s+\d|\s*$)/
    );

    if (match) {
      return match[1].trim();
    }
  }

  return null;
};

const extractLabeledField = (text, labels) => {
  const pattern = new RegExp(
    `(?:${labels.join("|")})\\s*[:\\-]?\\s*([^\\n]+)`,
    "i"
  );

  const match = text.match(pattern);

  if (match) {
    return match[1].trim();
  }

  return null;
};

const extractBrand = (text) => {
  return extractLabeledField(text, ["brand", "manufacturer"]);
};

const extractModel = (text) => {
  return extractLabeledField(text, ["model", "model no", "model number"]);
};

const extractCategory = (text) => {
  return extractLabeledField(text, ["category", "product category", "type"]);
};

const extractWarrantyStart = (text) => {
  return extractLabeledField(text, [
    "warranty start",
    "warranty from",
    "warranty begins",
  ]);
};

const extractWarrantyEnd = (text) => {
  return extractLabeledField(text, [
    "warranty end",
    "warranty until",
    "warranty expires",
    "warranty expiry",
  ]);
};

const extractFields = (text) => {
  return {
    name: extractProductName(text),

    brand: extractBrand(text),

    model: extractModel(text),

    category: extractCategory(text),

    purchaseDate: extractDate(text),

    purchasePrice: extractPrice(text),

    warrantyStart: extractWarrantyStart(text),

    warrantyEnd: extractWarrantyEnd(text),

    notes: null,

    invoiceNumber: extractInvoiceNumber(text),
  };
};

module.exports = {
  extractFields,
};
const { GoogleGenAI, Type } = require("@google/genai");
const fs = require("fs");
const path = require("path");

/**
 * Determine MIME type based on file extension or provided mimetype
 */
const getMimeType = (file) => {
  if (file.mimetype) return file.mimetype;
  const ext = path.extname(file.originalname || file.path).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".pdf":
      return "application/pdf";
    default:
      return "image/jpeg";
  }
};

/**
 * Extract structured invoice fields using Gemini Multimodal Vision API
 */
const extractFieldsWithLLM = async (file) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is missing or not configured in server/.env"
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const mimeType = getMimeType(file);

  const fileData = fs.readFileSync(file.path);
  const base64Data = fileData.toString("base64");

  const prompt = `You are an expert invoice and receipt reader. Carefully analyze this image/document and extract the exact details for product warranty registration into structured JSON.

Guidelines:
- name: The main product description or title.
- brand: Manufacturer or brand name (e.g. Apple, Samsung, Sony, LG, Dell).
- model: Specific model number or model code if visible.
- category: Standard category (e.g., Electronics, Home Appliances, Mobile, Computer Accessories, Furniture, etc.).
- purchaseDate: Date of purchase formatted strictly as YYYY-MM-DD (return null if not found).
- purchasePrice: Grand total or purchase price as a numeric value (return null if not found).
- warrantyStart: Date when warranty begins, formatted as YYYY-MM-DD (defaults to purchaseDate if not explicitly different, return null if unknown).
- warrantyEnd: Expiry date of warranty, formatted as YYYY-MM-DD (calculated based on warranty period if explicitly stated, e.g. +1 year from purchase, return null if unknown).
- invoiceNumber: Invoice or receipt reference number (return null if missing).
- notes: Brief summary of warranty period or special conditions (e.g., "1 Year Limited Hardware Warranty").`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Product name" },
          brand: { type: Type.STRING, description: "Brand / manufacturer" },
          model: { type: Type.STRING, description: "Model identifier" },
          category: { type: Type.STRING, description: "Product category" },
          purchaseDate: { type: Type.STRING, description: "Purchase date (YYYY-MM-DD)" },
          purchasePrice: { type: Type.NUMBER, description: "Numeric purchase price" },
          warrantyStart: { type: Type.STRING, description: "Warranty start date (YYYY-MM-DD)" },
          warrantyEnd: { type: Type.STRING, description: "Warranty end date (YYYY-MM-DD)" },
          invoiceNumber: { type: Type.STRING, description: "Invoice number" },
          notes: { type: Type.STRING, description: "Warranty duration/notes" },
        },
        required: ["name", "brand", "category"],
      },
    },
  });

  if (response && response.text) {
    const parsedData = JSON.parse(response.text);
    return parsedData;
  }

  throw new Error("Empty response received from Gemini API");
};

module.exports = {
  extractFieldsWithLLM,
};

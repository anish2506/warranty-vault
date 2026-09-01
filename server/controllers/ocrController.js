const { createWorker } = require("tesseract.js");
const { extractFields } = require("../utils/invoiceExtractor");
const { extractFieldsWithLLM } = require("../utils/llmExtractor");

const extractText = async (req, res) => {
  let worker;

  try {
    // Check whether a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    console.log("OCR file received:", req.file.originalname);

    let extractedFields = null;
    let methodUsed = "LLM (Gemini Vision)";
    let rawText = "";

    // 1. Attempt extraction using Gemini API if key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        console.log("Attempting structured extraction with Gemini LLM Vision...");
        extractedFields = await extractFieldsWithLLM(req.file);
        console.log("Gemini LLM extraction successful!");
      } catch (llmError) {
        console.warn("Gemini LLM extraction failed:", llmError.message);
        console.warn("Falling back to Tesseract OCR + Regex...");
      }
    } else {
      console.log("GEMINI_API_KEY not configured. Falling back to Tesseract OCR + Regex.");
    }

    // 2. Fallback to Tesseract OCR + Regex if LLM was skipped or failed
    if (!extractedFields) {
      methodUsed = "Tesseract OCR + Regex";
      console.log("Initializing Tesseract worker...");
      worker = await createWorker("eng");

      console.log("Running Tesseract OCR...");
      const { data } = await worker.recognize(req.file.path);
      rawText = data.text;
      extractedFields = extractFields(data.text);
      console.log("Tesseract OCR completed");
    }

    res.status(200).json({
      success: true,
      message: `Extraction completed successfully via ${methodUsed}`,
      method: methodUsed,
      text: rawText,
      fields: extractedFields,
    });
  } catch (error) {
    console.error("OCR ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    // Always terminate worker if it was initialized
    if (worker) {
      await worker.terminate();
      console.log("OCR worker terminated");
    }
  }
};

module.exports = {
  extractText,
};
const { createWorker } = require("tesseract.js");

const createOCRWorker = async () => {
  const worker = await createWorker("eng");

  return worker;
};

module.exports = {
  createOCRWorker,
};
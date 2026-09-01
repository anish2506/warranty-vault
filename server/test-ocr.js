const { createWorker } = require("tesseract.js");

const testOCR = async () => {
  const worker = await createWorker("eng");

  console.log("OCR worker initialized.");

  const { data } = await worker.recognize(
    "./assets/image.jpg"
  );

  console.log("\n========== OCR RESULT ==========\n");
  console.log(data.text);
  console.log("\n================================\n");

  await worker.terminate();

  console.log("OCR worker terminated.");
};

testOCR();
const { extractFields } = require("./utils/invoiceExtractor");

const sampleText = `
Samsung Galaxy S26
Purchase Date: 20/08/2026
Total Due: ₹80,000
Invoice No: INV12345
`;

const result = extractFields(sampleText);

console.log("========== EXTRACTED FIELDS ==========");
console.log(result);
console.log("=======================================");
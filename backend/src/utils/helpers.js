const { v4: uuidv4 } = require("uuid");

function generateId() {
  return uuidv4();
}

function generateBillNumber() {
  return `INV-${Date.now()}`;
}

function roundToTwo(num) {
  return Math.round(num * 100) / 100;
}

function calculateTax(amount, taxRate = 0) {
  return roundToTwo(amount * (taxRate / 100));
}

module.exports = {
  generateId,
  generateBillNumber,
  roundToTwo,
  calculateTax,
};

const XLSX = require('xlsx');
const fs = require('fs');

// Create test data array
const testData = [
  {
    question: "What is the standard procedure for engine startup in cold weather?",
    response: "Ensure engine block heater has been active for at least 2 hours prior. Verify oil viscosity is appropriate for sub-zero temperatures. Conduct start procedure with APU bleed air.",
    "key point of the answer": "Mention the block heater time requirement and oil viscosity check.",
    "expected resources": "FCOM Chapter 7, Section Cold Weather Operations",
    categoryId: "General Operations",
    likes: 0,
    dislikes: 0
  },
  {
    question: "How do you handle a suspected bird strike on the radome?",
    response: "Immediately decelerate. Do not retract flaps or gear if extended. Land at the nearest suitable airport. Ground crew must inspect radome and pitot-static probes before next flight.",
    "key point of the answer": "Emphasize not changing aircraft configuration (flaps/gear) until landed.",
    "expected resources": "QRH Abnormal Procedures - Bird Strike",
    categoryId: "Emergency Procedures",
    likes: 0,
    dislikes: 0
  }
];

// Create worksheet and workbook
const qsSheet = XLSX.utils.json_to_sheet(testData);
const wb = XLSX.utils.book_new();

// IMPORTANT: Name the sheet "Questions" so the dashboard recognizes it
XLSX.utils.book_append_sheet(wb, qsSheet, "Questions");

// Write to file
XLSX.writeFile(wb, "test_questions.xlsx");
console.log("Successfully generated test_questions.xlsx!");

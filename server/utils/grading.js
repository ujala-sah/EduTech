const GRADE_SCALE = [
  { min: 90, grade: 'A+', gradePoint: 4.0 },
  { min: 80, grade: 'A', gradePoint: 3.7 },
  { min: 70, grade: 'B+', gradePoint: 3.3 },
  { min: 60, grade: 'B', gradePoint: 3.0 },
  { min: 50, grade: 'C+', gradePoint: 2.7 },
  { min: 40, grade: 'C', gradePoint: 2.0 },
  { min: 0, grade: 'F', gradePoint: 0 },
];

function getGradeFromMarks(marks) {
  const numericMarks = Number(marks);
  const match = GRADE_SCALE.find((item) => numericMarks >= item.min);
  return match || GRADE_SCALE[GRADE_SCALE.length - 1];
}

function getGpa(results) {
  if (!results.length) return 0;
  const total = results.reduce((sum, result) => sum + (result.gradePoint || 0), 0);
  return Number((total / results.length).toFixed(2));
}

module.exports = { GRADE_SCALE, getGradeFromMarks, getGpa };

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    marks: { type: Number, required: [true, 'Marks are required'], min: 0, max: 100 },
    grade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, course: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);

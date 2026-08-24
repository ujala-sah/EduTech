const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Exam title is required'], trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    examDate: { type: Date, required: [true, 'Exam date is required'] },
    startTime: { type: String, required: [true, 'Start time is required'] },
    endTime: { type: String, required: [true, 'End time is required'] },
    room: { type: String, required: [true, 'Room is required'] },
    examType: {
      type: String,
      enum: ['midterm', 'final', 'quiz', 'practical'],
      default: 'midterm',
    },
    instructions: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);

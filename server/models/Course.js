const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Course name is required'], trim: true },
    code: { type: String, required: [true, 'Course code is required'], unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Teacher is required'] },
    semester: { type: String, required: [true, 'Semester is required'] },
    credits: { type: Number, required: [true, 'Credits are required'], min: 1, max: 6 },
    department: { type: String, default: '' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);

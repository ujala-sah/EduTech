const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

const canAccessAssignment = async (user, assignment) => {
  const course = await Course.findById(assignment.course);
  if (!course) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') return course.teacher.toString() === user._id.toString();
  return course.students.some((studentId) => studentId.toString() === user._id.toString());
};

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment is required.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a submission file.' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const allowed = await canAccessAssignment(req.user, assignment);
    if (!allowed || req.user.role !== 'student') {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    const isLate = new Date() > new Date(assignment.dueDate);
    const filePath = `/uploads/${req.file.filename}`;

    if (existing) {
      if (existing.marks !== undefined && existing.marks !== null) {
        return res.status(400).json({ message: 'This assignment has already been graded.' });
      }
      existing.file = filePath;
      existing.submittedAt = new Date();
      existing.isLate = isLate;
      await existing.save();
      return res.json(existing);
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      file: filePath,
      isLate,
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Unable to submit assignment. Please try again.' });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const allowed = await canAccessAssignment(req.user, assignment);
    if (!allowed || req.user.role === 'student') {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    const submissions = await Submission.find({ assignment: assignment._id })
      .populate('student', 'name email studentId')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load submissions. Please try again.' });
  }
};

const listTeacherSubmissions = async (req, res) => {
  try {
    const courseFilter = req.user.role === 'admin' ? {} : { teacher: req.user._id };
    const courses = await Course.find(courseFilter).select('_id');
    const assignments = await Assignment.find({
      course: { $in: courses.map((course) => course._id) },
    }).select('_id');

    const submissions = await Submission.find({
      assignment: { $in: assignments.map((item) => item._id) },
    })
      .populate('student', 'name email studentId')
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'name code' },
      })
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load submissions. Please try again.' });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findById(req.params.id).populate('assignment');
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    const allowed = await canAccessAssignment(req.user, submission.assignment);
    if (!allowed || req.user.role === 'student') {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    if (marks === undefined || marks === '') {
      return res.status(400).json({ message: 'Marks are required.' });
    }

    const numericMarks = Number(marks);
    if (numericMarks < 0 || numericMarks > submission.assignment.maxMarks) {
      return res.status(400).json({ message: `Marks must be between 0 and ${submission.assignment.maxMarks}.` });
    }

    submission.marks = numericMarks;
    submission.feedback = feedback || '';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    await submission.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Unable to grade submission. Please try again.' });
  }
};

module.exports = { submitAssignment, getSubmissions, listTeacherSubmissions, gradeSubmission };

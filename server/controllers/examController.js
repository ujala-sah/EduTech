const Exam = require('../models/Exam');
const Course = require('../models/Course');
const { notifyUsers } = require('../utils/notify');

const canManageCourse = async (user, courseId) => {
  if (user.role === 'admin') return true;
  const course = await Course.findById(courseId);
  return course && course.teacher.toString() === user._id.toString();
};

const listExams = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).select('_id');
      filter.course = { $in: courses.map((item) => item._id) };
    } else if (req.user.role === 'student') {
      const courses = await Course.find({ students: req.user._id }).select('_id');
      filter.course = { $in: courses.map((item) => item._id) };
    }

    if (req.query.course) filter.course = req.query.course;

    const exams = await Exam.find(filter)
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .sort({ examDate: 1 });

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load exams. Please try again.' });
  }
};

const createExam = async (req, res) => {
  try {
    const { title, course, examDate, startTime, endTime, room, examType, instructions } = req.body;
    if (!title || !course || !examDate || !startTime || !endTime || !room) {
      return res.status(400).json({ message: 'Exam title, course, date, time, and room are required.' });
    }

    const allowed = await canManageCourse(req.user, course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    const exam = await Exam.create({
      title,
      course,
      examDate,
      startTime,
      endTime,
      room,
      examType,
      instructions,
      createdBy: req.user._id,
    });

    const courseDoc = await Course.findById(course);
    await notifyUsers(courseDoc.students, {
      title: 'Exam scheduled',
      message: `${title} for ${courseDoc.name} is scheduled on ${new Date(examDate).toDateString()}.`,
      type: 'exam',
      link: '/exams',
    });

    const populated = await Exam.findById(exam._id).populate('course', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create exam. Please try again.' });
  }
};

const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    const allowed = await canManageCourse(req.user, exam.course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    ['title', 'examDate', 'startTime', 'endTime', 'room', 'examType', 'instructions'].forEach((field) => {
      if (req.body[field] !== undefined) exam[field] = req.body[field];
    });

    await exam.save();
    const populated = await Exam.findById(exam._id).populate('course', 'name code');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update exam. Please try again.' });
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    const allowed = await canManageCourse(req.user, exam.course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    await exam.deleteOne();
    res.json({ message: 'Exam deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete exam. Please try again.' });
  }
};

module.exports = { listExams, createExam, updateExam, deleteExam };

const Result = require('../models/Result');
const Course = require('../models/Course');
const { getGradeFromMarks, getGpa } = require('../utils/grading');
const { notifyUsers } = require('../utils/notify');

const canManageCourse = async (user, courseId) => {
  if (user.role === 'admin') return true;
  const course = await Course.findById(courseId);
  return course && course.teacher.toString() === user._id.toString();
};

const listResults = async (req, res) => {
  try {
    const filter = { published: true };

    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).select('_id');
      filter.course = { $in: courses.map((item) => item._id) };
      delete filter.published;
    } else {
      delete filter.published;
    }

    if (req.query.course) filter.course = req.query.course;
    if (req.query.student) filter.student = req.query.student;

    const results = await Result.find(filter)
      .populate('student', 'name studentId')
      .populate('course', 'name code')
      .populate('exam', 'title examDate')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    const gpa = req.user.role === 'student' ? getGpa(results) : undefined;
    res.json({ results, gpa });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load results. Please try again.' });
  }
};

const createResult = async (req, res) => {
  try {
    const { student, course, exam, marks } = req.body;
    if (!student || !course || marks === undefined || marks === '') {
      return res.status(400).json({ message: 'Student, course, and marks are required.' });
    }

    const allowed = await canManageCourse(req.user, course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    const numericMarks = Number(marks);
    if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({ message: 'Marks must be between 0 and 100.' });
    }

    const { grade, gradePoint } = getGradeFromMarks(numericMarks);

    const result = await Result.findOneAndUpdate(
      { student, course, exam: exam || null },
      {
        student,
        course,
        exam: exam || undefined,
        marks: numericMarks,
        grade,
        gradePoint,
        teacher: req.user._id,
        published: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    const courseDoc = await Course.findById(course);
    await notifyUsers([student], {
      title: 'Result published',
      message: `Your result for ${courseDoc.name} has been published.`,
      type: 'result',
      link: '/results',
    });

    const populated = await Result.findById(result._id)
      .populate('student', 'name studentId')
      .populate('course', 'name code')
      .populate('exam', 'title');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to save result. Please try again.' });
  }
};

const deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found.' });

    const allowed = await canManageCourse(req.user, result.course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    await result.deleteOne();
    res.json({ message: 'Result deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete result. Please try again.' });
  }
};

module.exports = { listResults, createResult, deleteResult };

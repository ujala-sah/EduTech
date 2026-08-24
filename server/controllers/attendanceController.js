const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const { notifyUsers } = require('../utils/notify');

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const canManageCourse = async (user, courseId) => {
  if (user.role === 'admin') return true;
  const course = await Course.findById(courseId);
  return course && course.teacher.toString() === user._id.toString();
};

const markAttendance = async (req, res) => {
  try {
    const { course, date, records } = req.body;
    if (!course || !date || !Array.isArray(records) || !records.length) {
      return res.status(400).json({ message: 'Course, date, and attendance records are required.' });
    }

    const allowed = await canManageCourse(req.user, course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    const attendanceDate = startOfDay(date);
    const saved = [];

    for (const record of records) {
      if (!record.student || !['present', 'absent', 'late'].includes(record.status)) {
        continue;
      }

      const updated = await Attendance.findOneAndUpdate(
        { student: record.student, course, date: attendanceDate },
        {
          student: record.student,
          course,
          date: attendanceDate,
          status: record.status,
          markedBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      saved.push(updated);
    }

    const absentees = records.filter((record) => record.status === 'absent').map((record) => record.student);
    if (absentees.length) {
      const courseDoc = await Course.findById(course);
      await notifyUsers(absentees, {
        title: 'Attendance marked absent',
        message: `You were marked absent in ${courseDoc.name} on ${attendanceDate.toDateString()}.`,
        type: 'attendance',
        link: '/attendance',
      });
    }

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Unable to save attendance. Please try again.' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { course, date, student } = req.query;
    const filter = {};

    if (course) filter.course = course;
    if (date) filter.date = startOfDay(date);
    if (student) filter.student = student;

    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).select('_id');
      filter.course = { $in: courses.map((item) => item._id) };
      if (course) filter.course = course;
    }

    const records = await Attendance.find(filter)
      .populate('student', 'name studentId')
      .populate('course', 'name code')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load attendance. Please try again.' });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user._id : req.query.student;
    if (!studentId && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Student is required.' });
    }

    const courseFilter = req.user.role === 'teacher' ? { teacher: req.user._id } : {};
    if (req.user.role === 'student') courseFilter.students = req.user._id;

    const courses = await Course.find(courseFilter).select('name code students');
    const summary = [];

    for (const course of courses) {
      if (studentId && !course.students.some((id) => id.toString() === studentId.toString()) && req.user.role === 'student') {
        continue;
      }

      const query = { course: course._id };
      if (studentId) query.student = studentId;

      const records = await Attendance.find(query);
      const present = records.filter((item) => item.status === 'present' || item.status === 'late').length;
      const absent = records.filter((item) => item.status === 'absent').length;
      const total = records.length;
      const percentage = total ? Math.round((present / total) * 100) : 0;

      summary.push({
        course: { _id: course._id, name: course.name, code: course.code },
        present,
        absent,
        late: records.filter((item) => item.status === 'late').length,
        total,
        percentage,
      });
    }

    const overallPresent = summary.reduce((sum, item) => sum + item.present, 0);
    const overallTotal = summary.reduce((sum, item) => sum + item.total, 0);
    const overallPercentage = overallTotal ? Math.round((overallPresent / overallTotal) * 100) : 0;

    res.json({ summary, overallPercentage });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load attendance summary. Please try again.' });
  }
};

module.exports = { markAttendance, getAttendance, getAttendanceSummary };

const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Notification = require('../models/Notification');
const { getGpa } = require('../utils/grading');

const getDashboard = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const courses = await Course.find({ students: req.user._id }).populate('teacher', 'name');
      const courseIds = courses.map((course) => course._id);
      const assignments = await Assignment.find({ course: { $in: courseIds } })
        .populate('course', 'name code')
        .sort({ dueDate: 1 });
      const submissions = await Submission.find({
        student: req.user._id,
        assignment: { $in: assignments.map((item) => item._id) },
      });

      const now = new Date();
      const pendingAssignments = assignments.filter((assignment) => {
        const submitted = submissions.find((item) => item.assignment.toString() === assignment._id.toString());
        return !submitted;
      });
      const completedAssignments = assignments.filter((assignment) =>
        submissions.some((item) => item.assignment.toString() === assignment._id.toString())
      );

      const attendance = await Attendance.find({ student: req.user._id });
      const present = attendance.filter((item) => item.status !== 'absent').length;
      const attendancePercentage = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

      const upcomingExams = await Exam.find({
        course: { $in: courseIds },
        examDate: { $gte: now },
      })
        .populate('course', 'name code')
        .sort({ examDate: 1 })
        .limit(5);

      const recentResults = await Result.find({ student: req.user._id, published: true })
        .populate('course', 'name code')
        .sort({ createdAt: -1 })
        .limit(5);

      const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);

      return res.json({
        user: req.user,
        stats: {
          courses: courses.length,
          pendingAssignments: pendingAssignments.length,
          completedAssignments: completedAssignments.length,
          attendancePercentage,
          gpa: getGpa(recentResults),
        },
        upcomingAssignments: pendingAssignments.slice(0, 5),
        upcomingExams,
        recentResults,
        notifications,
        courses,
      });
    }

    if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).populate('students', 'name');
      const courseIds = courses.map((course) => course._id);
      const assignments = await Assignment.find({ course: { $in: courseIds } })
        .populate('course', 'name')
        .sort({ createdAt: -1 });
      const submissions = await Submission.find({
        assignment: { $in: assignments.map((item) => item._id) },
      });
      const pendingSubmissions = submissions.filter((item) => item.marks === undefined || item.marks === null);
      const upcomingExams = await Exam.find({
        course: { $in: courseIds },
        examDate: { $gte: new Date() },
      })
        .populate('course', 'name')
        .sort({ examDate: 1 })
        .limit(5);
      const attendance = await Attendance.find({ course: { $in: courseIds } });
      const present = attendance.filter((item) => item.status !== 'absent').length;
      const attendancePercentage = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
      const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
      const totalStudents = new Set(courses.flatMap((course) => course.students.map((student) => student._id.toString()))).size;

      return res.json({
        user: req.user,
        stats: {
          courses: courses.length,
          students: totalStudents,
          pendingSubmissions: pendingSubmissions.length,
          attendancePercentage,
        },
        recentAssignments: assignments.slice(0, 5),
        upcomingExams,
        notifications,
        courses,
      });
    }

    const [students, teachers, courses, assignments, activeUsers, pendingApprovals, recentUsers, pendingUsers, attendance, submissions] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher' }),
        Course.countDocuments(),
        Assignment.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isApproved: false, role: { $in: ['student', 'teacher'] } }),
        User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).limit(5),
        User.find({ isApproved: false, role: { $in: ['student', 'teacher'] } }).sort({ createdAt: -1 }).limit(8),
        Attendance.find(),
        Submission.find(),
      ]);

    const present = attendance.filter((item) => item.status !== 'absent').length;
    const attendancePercentage = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
    const graded = submissions.filter((item) => item.marks !== undefined && item.marks !== null).length;

    res.json({
      user: req.user,
      stats: {
        students,
        teachers,
        courses,
        assignments,
        activeUsers,
        attendancePercentage,
        submissions: submissions.length,
        gradedSubmissions: graded,
        pendingApprovals,
      },
      recentUsers,
      pendingUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load dashboard. Please try again.' });
  }
};

module.exports = { getDashboard };

const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const { notifyUsers } = require('../utils/notify');

const canManageCourse = async (user, courseId) => {
  if (user.role === 'admin') return true;
  const course = await Course.findById(courseId);
  if (!course) return false;
  return course.teacher.toString() === user._id.toString();
};

const withStatus = (assignment, submission) => {
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  let status = 'Pending';

  if (submission) {
    if (submission.marks !== undefined && submission.marks !== null) status = 'Graded';
    else if (submission.isLate || submission.submittedAt > dueDate) status = 'Late';
    else status = 'Submitted';
  } else if (now > dueDate) {
    status = 'Late';
  }

  return { ...assignment.toObject(), status, submission: submission || null };
};

const listAssignments = async (req, res) => {
  try {
    const { search, course, status } = req.query;
    const filter = {};

    if (course) filter.course = course;
    if (search) filter.title = { $regex: search, $options: 'i' };

    if (req.user.role === 'teacher' || req.user.role === 'student') {
      const ownedCourses = await Course.find(
        req.user.role === 'teacher' ? { teacher: req.user._id } : { students: req.user._id }
      ).select('_id');
      const ownedIds = ownedCourses.map((item) => item._id);
      if (course && ownedIds.some((id) => id.toString() === course)) {
        filter.course = course;
      } else {
        filter.course = { $in: ownedIds };
      }
    }

    const assignments = await Assignment.find(filter)
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 });

    const assignmentIds = assignments.map((item) => item._id);
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      ...(req.user.role === 'student' ? { student: req.user._id } : {}),
    });

    let payload = assignments.map((assignment) => {
      const submission =
        req.user.role === 'student'
          ? submissions.find((item) => item.assignment.toString() === assignment._id.toString())
          : null;
      return withStatus(assignment, submission);
    });

    if (status) {
      payload = payload.filter((item) => item.status.toLowerCase() === status.toLowerCase());
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load assignments. Please try again.' });
  }
};

const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'name code teacher students')
      .populate('createdBy', 'name');

    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const submission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id,
    });

    res.json(withStatus(assignment, submission));
  } catch (error) {
    res.status(500).json({ message: 'Unable to load assignment. Please try again.' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, course, dueDate, maxMarks } = req.body;

    if (!title || !course || !dueDate) {
      return res.status(400).json({ message: 'Assignment title, course, and due date are required.' });
    }

    const allowed = await canManageCourse(req.user, course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course,
      dueDate,
      maxMarks: maxMarks || 100,
      attachment: req.file ? `/uploads/${req.file.filename}` : '',
      createdBy: req.user._id,
    });

    const courseDoc = await Course.findById(course);
    await notifyUsers(courseDoc.students, {
      title: 'New assignment',
      message: `${title} has been posted for ${courseDoc.name}.`,
      type: 'assignment',
      link: '/assignments',
    });

    const populated = await Assignment.findById(assignment._id).populate('course', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create assignment. Please try again.' });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const allowed = await canManageCourse(req.user, assignment.course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    ['title', 'description', 'dueDate', 'maxMarks'].forEach((field) => {
      if (req.body[field] !== undefined) assignment[field] = req.body[field];
    });
    if (req.file) assignment.attachment = `/uploads/${req.file.filename}`;

    await assignment.save();
    const populated = await Assignment.findById(assignment._id).populate('course', 'name code');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update assignment. Please try again.' });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const allowed = await canManageCourse(req.user, assignment.course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    await assignment.deleteOne();
    await Submission.deleteMany({ assignment: assignment._id });
    res.json({ message: 'Assignment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete assignment. Please try again.' });
  }
};

module.exports = {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};

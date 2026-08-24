const Resource = require('../models/Resource');
const Course = require('../models/Course');
const { notifyUsers } = require('../utils/notify');

const canManageCourse = async (user, courseId) => {
  if (user.role === 'admin') return true;
  const course = await Course.findById(courseId);
  return course && course.teacher.toString() === user._id.toString();
};

const listResources = async (req, res) => {
  try {
    const { search, course, fileType } = req.query;
    const filter = {};

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (fileType) filter.fileType = { $regex: fileType, $options: 'i' };

    if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).select('_id');
      filter.course = { $in: courses.map((item) => item._id) };
    } else if (req.user.role === 'student') {
      const courses = await Course.find({ students: req.user._id }).select('_id');
      filter.course = { $in: courses.map((item) => item._id) };
    }

    if (course) filter.course = course;

    const resources = await Resource.find(filter)
      .populate('course', 'name code')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load resources. Please try again.' });
  }
};

const createResource = async (req, res) => {
  try {
    const { title, description, course } = req.body;
    if (!title || !course) {
      return res.status(400).json({ message: 'Resource title and course are required.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file.' });
    }

    const allowed = await canManageCourse(req.user, course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    const resource = await Resource.create({
      title,
      description,
      course,
      file: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      uploadedBy: req.user._id,
    });

    const courseDoc = await Course.findById(course);
    await notifyUsers(courseDoc.students, {
      title: 'New study material',
      message: `${title} was uploaded for ${courseDoc.name}.`,
      type: 'resource',
      link: '/resources',
    });

    const populated = await Resource.findById(resource._id)
      .populate('course', 'name code')
      .populate('uploadedBy', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to upload resource. Please try again.' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });

    const allowed = await canManageCourse(req.user, resource.course);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete resource. Please try again.' });
  }
};

module.exports = { listResources, createResource, deleteResource };

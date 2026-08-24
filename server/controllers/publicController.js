const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Blog = require('../models/Blog');
const ContactMessage = require('../models/ContactMessage');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPublicStats = async (req, res) => {
  try {
    const [students, teachers, courses, assignments] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      Course.countDocuments(),
      Assignment.countDocuments(),
    ]);

    res.json({ students, teachers, courses, assignments });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load homepage statistics.' });
  }
};

const getPublicCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'name')
      .select('name code description semester credits department students')
      .sort({ name: 1 });

    res.json(
      courses.map((course) => ({
        _id: course._id,
        name: course.name,
        code: course.code,
        description: course.description,
        semester: course.semester,
        credits: course.credits,
        department: course.department,
        teacher: course.teacher?.name || 'Unassigned',
        enrolled: course.students.length,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Unable to load courses.' });
  }
};

const listBlogs = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { published: true };

    if (category) filter.category = category;
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: regex }, { excerpt: regex }, { content: regex }, { category: regex }];
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load blog posts.' });
  }
};

const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) return res.status(404).json({ message: 'Blog post not found.' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load blog post.' });
  }
};

const searchPublic = async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.json({ query: '', courses: [], blogs: [] });
    }

    const regex = new RegExp(escapeRegex(query), 'i');
    const [courses, blogs] = await Promise.all([
      Course.find({
        $or: [{ name: regex }, { code: regex }, { description: regex }, { department: regex }],
      })
        .populate('teacher', 'name')
        .select('name code description semester credits department students'),
      Blog.find({
        published: true,
        $or: [{ title: regex }, { excerpt: regex }, { content: regex }, { category: regex }],
      }).sort({ createdAt: -1 }),
    ]);

    res.json({
      query,
      courses: courses.map((course) => ({
        _id: course._id,
        name: course.name,
        code: course.code,
        description: course.description,
        teacher: course.teacher?.name || 'Unassigned',
        enrolled: course.students.length,
      })),
      blogs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to search. Please try again.' });
  }
};

const sendContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required.' });
    }

    const saved = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({
      message: 'Your message has been sent. The admin team will review it.',
      id: saved._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to send message. Please try again.' });
  }
};

const listMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load messages.' });
  }
};

const markMessageRead = async (req, res) => {
  try {
    const item = await ContactMessage.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Message not found.' });
    item.isRead = true;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update message.' });
  }
};

module.exports = {
  getPublicStats,
  getPublicCourses,
  listBlogs,
  getBlog,
  searchPublic,
  sendContact,
  listMessages,
  markMessageRead,
};

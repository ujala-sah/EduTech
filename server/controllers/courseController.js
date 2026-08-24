const Course = require('../models/Course');
const User = require('../models/User');

const getCourseFilter = async (user) => {
  if (user.role === 'admin') return {};
  if (user.role === 'teacher') return { teacher: user._id };
  return { students: user._id };
};

const listCourses = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = await getCourseFilter(req.user);

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter)
      .populate('teacher', 'name email')
      .populate('students', 'name email studentId')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load courses. Please try again.' });
  }
};

const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email studentId department');

    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const isTeacher = course.teacher && course.teacher._id.toString() === req.user._id.toString();
    const isStudent = course.students.some((student) => student._id.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isTeacher && !isStudent) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load course. Please try again.' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { name, code, description, teacher, semester, credits, department, students } = req.body;

    if (!name || !code || !teacher || !semester || !credits) {
      return res.status(400).json({ message: 'Course name, code, teacher, semester, and credits are required.' });
    }

    const teacherUser = await User.findById(teacher);
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(400).json({ message: 'Please assign a valid teacher.' });
    }

    const course = await Course.create({
      name,
      code,
      description,
      teacher,
      semester,
      credits,
      department,
      students: students || [],
    });

    const populated = await Course.findById(course._id)
      .populate('teacher', 'name email')
      .populate('students', 'name email studentId');

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A course with this code already exists.' });
    }
    res.status(500).json({ message: 'Unable to create course. Please try again.' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const fields = ['name', 'code', 'description', 'teacher', 'semester', 'credits', 'department', 'students'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) course[field] = req.body[field];
    });

    await course.save();
    const populated = await Course.findById(course._id)
      .populate('teacher', 'name email')
      .populate('students', 'name email studentId');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update course. Please try again.' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete course. Please try again.' });
  }
};

module.exports = { listCourses, getCourse, createCourse, updateCourse, deleteCourse };

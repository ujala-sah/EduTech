require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const Resource = require('./models/Resource');
const Attendance = require('./models/Attendance');
const Exam = require('./models/Exam');
const Result = require('./models/Result');
const Notification = require('./models/Notification');
const Blog = require('./models/Blog');
const ContactMessage = require('./models/ContactMessage');
const { getGradeFromMarks } = require('./utils/grading');

const DEMO_PASSWORD = 'Demo@123';

const startOfDay = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return date;
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Clearing old demo data...');

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Assignment.deleteMany({}),
    Submission.deleteMany({}),
    Resource.deleteMany({}),
    Attendance.deleteMany({}),
    Exam.deleteMany({}),
    Result.deleteMany({}),
    Notification.deleteMany({}),
    Blog.deleteMany({}),
    ContactMessage.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@edutrack.com',
    password: DEMO_PASSWORD,
    role: 'admin',
    phone: '9800000001',
    department: 'Administration',
    isEmailVerified: true,
    isApproved: true,
    isActive: true,
  });

  const teacher1 = await User.create({
    name: 'Sita Sharma',
    email: 'teacher@edutrack.com',
    password: DEMO_PASSWORD,
    role: 'teacher',
    employeeId: 'TCH1001',
    phone: '9800000002',
    department: 'Computer Science',
  });

  const teacher2 = await User.create({
    name: 'Ram Adhikari',
    email: 'teacher2@edutrack.com',
    password: DEMO_PASSWORD,
    role: 'teacher',
    employeeId: 'TCH1002',
    phone: '9800000003',
    department: 'Computer Science',
  });

  const studentData = [
    ['Ujala Sah', 'student@edutrack.com', 'STU1001'],
    ['Anisha Karki', 'anisha@edutrack.com', 'STU1002'],
    ['Bikash Thapa', 'bikash@edutrack.com', 'STU1003'],
    ['Nirajan Shrestha', 'nirajan@edutrack.com', 'STU1004'],
    ['Pratima Magar', 'pratima@edutrack.com', 'STU1005'],
  ];

  const students = [];
  for (const [name, email, studentId] of studentData) {
    const student = await User.create({
      name,
      email,
      password: DEMO_PASSWORD,
      role: 'student',
      studentId,
      phone: '9810000000',
      department: 'Computer Science',
      semester: '6',
      batch: '2023',
      address: 'Kathmandu, Nepal',
      dateOfBirth: new Date('2003-04-12'),
      enrollmentDate: new Date('2023-08-01'),
    });
    students.push(student);
  }

  const web = await Course.create({
    name: 'Web Development',
    code: 'CS301',
    description: 'Frontend and backend web application development using the MERN stack.',
    teacher: teacher1._id,
    semester: '6',
    credits: 4,
    department: 'Computer Science',
    students: students.map((student) => student._id),
  });

  const dbCourse = await Course.create({
    name: 'Database Systems',
    code: 'CS302',
    description: 'Relational databases, MongoDB, and data modeling.',
    teacher: teacher1._id,
    semester: '6',
    credits: 3,
    department: 'Computer Science',
    students: students.slice(0, 4).map((student) => student._id),
  });

  const programming = await Course.create({
    name: 'Programming Fundamentals',
    code: 'CS201',
    description: 'Problem solving and programming with JavaScript.',
    teacher: teacher2._id,
    semester: '6',
    credits: 3,
    department: 'Computer Science',
    students: students.map((student) => student._id),
  });

  const assignment1 = await Assignment.create({
    title: 'Build a React Login Page',
    description: 'Create a responsive login form with controlled inputs and basic validation.',
    course: web._id,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    maxMarks: 20,
    createdBy: teacher1._id,
  });

  const assignment2 = await Assignment.create({
    title: 'ER Diagram for College Portal',
    description: 'Design an ER diagram for students, courses, and enrollments.',
    course: dbCourse._id,
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    maxMarks: 25,
    createdBy: teacher1._id,
  });

  await Assignment.create({
    title: 'JavaScript Array Practice',
    description: 'Solve the attached array and object exercises.',
    course: programming._id,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    maxMarks: 15,
    createdBy: teacher2._id,
  });

  await Submission.create({
    assignment: assignment1._id,
    student: students[0]._id,
    file: '/uploads/demo-submission.pdf',
    isLate: false,
  });

  const exam1 = await Exam.create({
    title: 'Web Development Midterm',
    course: web._id,
    examDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    startTime: '10:00',
    endTime: '12:00',
    room: 'Lab 2',
    examType: 'midterm',
    instructions: 'Bring your college ID. No electronic devices.',
    createdBy: teacher1._id,
  });

  await Exam.create({
    title: 'Database Quiz',
    course: dbCourse._id,
    examDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    startTime: '09:00',
    endTime: '09:45',
    room: 'Room 104',
    examType: 'quiz',
    instructions: 'Closed book quiz.',
    createdBy: teacher1._id,
  });

  for (const student of students) {
    for (let day = 1; day <= 8; day += 1) {
      await Attendance.create({
        student: student._id,
        course: web._id,
        date: startOfDay(day),
        status: day === 3 && student.email !== 'student@edutrack.com' ? 'absent' : 'present',
        markedBy: teacher1._id,
      });
    }
  }

  const webMarks = [88, 76, 64, 91, 55];
  for (let i = 0; i < students.length; i += 1) {
    const { grade, gradePoint } = getGradeFromMarks(webMarks[i]);
    await Result.create({
      student: students[i]._id,
      course: web._id,
      exam: exam1._id,
      marks: webMarks[i],
      grade,
      gradePoint,
      teacher: teacher1._id,
      published: true,
    });
  }

  await Resource.create({
    title: 'MERN Stack Lecture Notes',
    description: 'Week 1-4 notes covering React, Express, and MongoDB.',
    course: web._id,
    file: '/uploads/demo-notes.pdf',
    fileType: 'application/pdf',
    uploadedBy: teacher1._id,
  });

  await Notification.insertMany(
    students.map((student) => ({
      user: student._id,
      title: 'Welcome to EduTrack',
      message: 'Your student account is ready. Check your courses and upcoming assignments.',
      type: 'announcement',
      link: '/dashboard',
    }))
  );

  await Notification.create({
    user: students[0]._id,
    title: 'New assignment',
    message: 'Build a React Login Page has been posted for Web Development.',
    type: 'assignment',
    link: '/assignments',
  });

  await Blog.create([
    {
      title: 'How students can track every assignment deadline in one place',
      slug: 'track-assignment-deadlines',
      category: 'Students',
      authorName: 'Sita Sharma',
      excerpt:
        'Missing a deadline is often a systems problem, not a motivation problem. Here is how EduTrack keeps pending, late, and graded work visible.',
      content: `Students usually keep assignment dates in notebooks, group chats, and different college portals. That is how deadlines get missed.

EduTrack stores every assignment against a real course record. When a teacher posts work, enrolled students see the title, course, due date, and status immediately.

The useful statuses are Pending, Submitted, Late, and Graded. If a due date has passed and no file has been uploaded, the assignment is marked Late. After a teacher adds marks and feedback, the status becomes Graded.

Use the Assignments page search box to find a title, then filter by course or status. Submit the file from the same page. PDF, DOC, DOCX, ZIP, and image files are accepted.

This only works if you log in with your student account and stay enrolled in the course. The numbers on your dashboard come from MongoDB, not from placeholder text.`,
    },
    {
      title: 'Why attendance percentage matters before exam week',
      slug: 'attendance-percentage-before-exams',
      category: 'Attendance',
      authorName: 'Ram Adhikari',
      excerpt:
        'Colleges often require a minimum attendance percentage. EduTrack calculates present, absent, and late records per course from teacher-marked data.',
      content: `Attendance is not a decoration on a dashboard. Many departments will not allow a student to sit an exam below a required percentage, often around 75%.

In EduTrack, a teacher marks each enrolled student as Present, Absent, or Late for a selected date. Those records are stored with the student, course, date, and teacher.

The student Attendance page then totals Present and Late against all marked days and shows a percentage for every course, plus an overall percentage. Rows below 75% are highlighted so the warning is visible before exam week.

If you were marked absent, you should also receive a notification. That message is created when attendance is saved, not added by hand later.`,
    },
    {
      title: 'Understanding EduTrack grades and GPA',
      slug: 'understanding-grades-and-gpa',
      category: 'Results',
      authorName: 'Admin User',
      excerpt:
        'Marks entered by a teacher are converted to a letter grade and grade point using one shared scale. Students cannot edit published results.',
      content: `When a teacher publishes a result, they enter marks out of 100. EduTrack converts those marks with a single grading file on the server:

90–100 = A+ (4.0)
80–89 = A (3.7)
70–79 = B+ (3.3)
60–69 = B (3.0)
50–59 = C+ (2.7)
40–49 = C (2.0)
Below 40 = F (0)

GPA on the student Results page is the average of grade points from published results. Students can view this data. They cannot change it.

If a result looks wrong, contact the course teacher or send a message through the Contact page. That message is stored for the administrator.`,
    },
    {
      title: 'A practical guide for teachers using EduTrack',
      slug: 'teacher-guide-edutrack',
      category: 'Teachers',
      authorName: 'Sita Sharma',
      excerpt:
        'Teachers only manage courses assigned to them. This guide covers assignments, submissions, notes, attendance, exams, and results.',
      content: `After logging in as a teacher, the dashboard shows assigned courses, enrolled students, pending submissions, and attendance from your classes.

Create an assignment from the Assignments page. Choose one of your courses, set a due date, and optionally attach a file. Enrolled students are notified automatically.

Open Submissions to download student files and enter marks with feedback. Upload lecture notes on Resources. Mark attendance by course and date. Add exams so students see room, time, and instructions. Publish results so grades appear on student accounts.

You cannot manage another teacher’s course. The API checks the logged-in teacher against the course record before it allows create, update, or delete actions.`,
    },
  ]);

  console.log('Demo data created.');
  console.log('Login with any of these accounts. Password for all: Demo@123');
  console.log('Admin:    admin@edutrack.com');
  console.log('Teacher:  teacher@edutrack.com');
  console.log('Student:  student@edutrack.com');

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

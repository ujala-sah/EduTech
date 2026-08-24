import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    teacher: '',
    semester: '',
    credits: 3,
    department: '',
    students: [],
  });

  const load = async () => {
    setError('');
    try {
      const response = await api.get('/courses', { params: { search } });
      setCourses(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user.role !== 'admin') return;
    api.get('/users', { params: { role: 'teacher' } }).then((res) => setTeachers(res.data));
    api.get('/users', { params: { role: 'student' } }).then((res) => setStudents(res.data));
  }, [user.role]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      code: '',
      description: '',
      teacher: '',
      semester: '',
      credits: 3,
      department: '',
      students: [],
    });
    setOpen(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      name: course.name,
      code: course.code,
      description: course.description || '',
      teacher: course.teacher?._id || '',
      semester: course.semester,
      credits: course.credits,
      department: course.department || '',
      students: course.students?.map((item) => item._id) || [],
    });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) await api.put(`/courses/${editing._id}`, form);
      else await api.post('/courses', form);
      setOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (course) => {
    if (!window.confirm(`Delete ${course.name}?`)) return;
    try {
      await api.delete(`/courses/${course._id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{user.role === 'student' ? 'My courses' : user.role === 'teacher' ? 'Assigned courses' : 'Courses'}</h1>
          <p className="muted">Search and manage academic courses</p>
        </div>
        {user.role === 'admin' && (
          <button type="button" className="primary-btn" onClick={openCreate}>
            Add course
          </button>
        )}
      </div>
      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          load();
        }}
      >
        <input
          placeholder="Search by name or code"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="submit" className="primary-btn">
          Search
        </button>
      </form>
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loading />
      ) : courses.length === 0 ? (
        <p className="empty">No courses found.</p>
      ) : (
        <div className="card-grid">
          {courses.map((course) => (
            <article className="info-card" key={course._id}>
              <p className="eyebrow">{course.code}</p>
              <h3>{course.name}</h3>
              <p>{course.description || 'No description yet.'}</p>
              <p className="muted">Teacher: {course.teacher?.name || '-'}</p>
              <p className="muted">
                Semester {course.semester} · {course.credits} credits · {course.students?.length || 0} students
              </p>
              {user.role === 'admin' && (
                <div className="row-actions">
                  <button type="button" onClick={() => openEdit(course)}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => remove(course)}>
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {open && (
        <Modal title={editing ? 'Edit course' : 'Create course'} onClose={() => setOpen(false)} wide>
          <form className="form-grid" onSubmit={save}>
            <label>
              Course name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Code
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </label>
            <label>
              Teacher
              <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} required>
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Semester
              <input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required />
            </label>
            <label>
              Credits
              <input
                type="number"
                min="1"
                max="6"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                required
              />
            </label>
            <label>
              Department
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </label>
            <label className="full">
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="full">
              Enrolled students
              <select
                multiple
                value={form.students}
                onChange={(e) =>
                  setForm({ ...form, students: Array.from(e.target.selectedOptions).map((option) => option.value) })
                }
              >
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="primary-btn">
              Save course
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Courses;

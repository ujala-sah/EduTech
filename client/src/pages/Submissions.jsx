import { useEffect, useState } from 'react';
import api, { assetUrl } from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });

  const load = async () => {
    try {
      const response = await api.get('/submissions');
      setSubmissions(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grade = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/submissions/${selected._id}/grade`, gradeForm);
      setSelected(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>Student submissions</h1>
      </div>
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loading />
      ) : submissions.length === 0 ? (
        <p className="empty">No submissions yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Assignment</th>
              <th>Course</th>
              <th>Submitted</th>
              <th>Marks</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((item) => (
              <tr key={item._id}>
                <td>{item.student?.name}</td>
                <td>{item.assignment?.title}</td>
                <td>{item.assignment?.course?.name}</td>
                <td>{new Date(item.submittedAt).toLocaleString()}</td>
                <td>{item.marks ?? 'Not graded'}</td>
                <td>
                  <a href={assetUrl(item.file)} target="_blank" rel="noreferrer">
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(item);
                      setGradeForm({ marks: item.marks ?? '', feedback: item.feedback || '' });
                    }}
                  >
                    Grade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selected && (
        <Modal title={`Grade ${selected.student?.name}`} onClose={() => setSelected(null)}>
          <form className="form-grid" onSubmit={grade}>
            <label>
              Marks
              <input
                type="number"
                min="0"
                value={gradeForm.marks}
                onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
                required
              />
            </label>
            <label className="full">
              Feedback
              <textarea
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              />
            </label>
            <button type="submit" className="primary-btn">
              Save marks
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Submissions;

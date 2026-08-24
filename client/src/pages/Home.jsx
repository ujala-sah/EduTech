import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import Glyph from '../components/Glyph';
import { useAuth } from '../context/AuthContext';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/public/stats'), api.get('/public/courses'), api.get('/public/blogs')])
      .then(([statsRes, courseRes, blogRes]) => {
        setStats(statsRes.data);
        setCourses(courseRes.data);
        setPosts(blogRes.data.slice(0, 3));
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  if (!stats && !error) return <Loading label="Loading homepage..." />;

  return (
    <div className="home-2026">
      <section className="hero-stage">
        <img className="hero-stage-photo" src="/hero-campus.jpg" alt="" />
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
        <div className="hero-stage-inner">
          <div className="hero-glass-panel">
            <p className="eyebrow">Campus operating system</p>
            <h1>
              Academic work, finally in <span className="accent-word">one quiet place</span>.
            </h1>
            <p className="hero-subtitle">
              EduTrack is a live MERN portal for colleges. Students, teachers, and admins share the same campus
              record — courses, attendance, assignments, exams, and GPA — with Gmail OTP and role-based access.
            </p>
            <form className="hero-search-bar" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search courses, guides, or topics"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search EduTrack"
              />
              <button type="submit" className="accent-btn">Search</button>
            </form>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="accent-btn hero-btn">Open dashboard</Link>
              ) : (
                <>
                  <Link to="/register" className="accent-btn hero-btn">Create account</Link>
                  <Link to="/login" className="ghost-btn hero-btn">Sign in</Link>
                </>
              )}
            </div>
            <div className="hero-pills">
              <span>Gmail OTP verification</span>
              <span>Admin-approved login</span>
              <span>Live MongoDB records</span>
            </div>
          </div>
        </div>
      </section>

      {error && <p className="alert error page-alert">{error}</p>}

      <section className="stats-band">
        <article><strong>{stats?.students ?? 0}</strong><span>Active students</span></article>
        <article><strong>{stats?.teachers ?? 0}</strong><span>Teachers</span></article>
        <article><strong>{stats?.courses ?? 0}</strong><span>Live courses</span></article>
        <article><strong>{stats?.assignments ?? 0}</strong><span>Assignments</span></article>
        <article><strong>{stats?.submissions ?? 0}</strong><span>Submissions</span></article>
        <article><strong>24/7</strong><span>Portal access</span></article>
      </section>

      <section className="public-section">
        <div className="ribbon-row">
          <span>Computer Science</span>
          <span>Mathematics</span>
          <span>Management</span>
          <span>Education</span>
          <span>Engineering</span>
          <span>Humanities</span>
        </div>
      </section>

      <section className="public-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Platform</p>
            <h2>A campus stack that stays <span className="accent-word">transparent</span></h2>
            <p className="section-desc left">Every number on this site is loaded from the API. When a teacher marks attendance, a student sees the new percentage on the next visit.</p>
          </div>
        </div>
        <div className="bento">
          <article className="bento-wide glass-card">
            <Glyph name="courses" />
            <h3>Course rooms that stay in sync</h3>
            <p>Admins open a course, assign a teacher, and enroll students. Notes, deadlines, and exam dates sit in that same room — no extra WhatsApp group.</p>
            <img className="bento-photo" src="/blog-cover.jpg" alt="Students working in a glass library" />
          </article>
          <article className="glass-card">
            <Glyph name="attendance" />
            <h3>Attendance you can trust</h3>
            <p>Daily marks per course. Low-percentage alerts fire automatically so students are not surprised at semester end.</p>
          </article>
          <article className="glass-card">
            <Glyph name="assignments" />
            <h3>Deadlines with receipts</h3>
            <p>File submissions, late flags, and teacher feedback live on the assignment record instead of in chat history.</p>
          </article>
          <article className="glass-card">
            <Glyph name="results" />
            <h3>Published GPA</h3>
            <p>Grades post once. The portal calculates GPA and keeps a transcript students can return to later.</p>
          </article>
          <article className="glass-card">
            <Glyph name="exams" />
            <h3>Exam board</h3>
            <p>Date, room, and paper in one schedule. Each student only sees papers they are enrolled for.</p>
          </article>
          <article className="glass-card">
            <Glyph name="bell" />
            <h3>Quiet alerts</h3>
            <p>Assignment drops, result releases, and attendance warnings appear in-app — not as a pile of forwarded messages.</p>
          </article>
        </div>
      </section>

      <section className="public-section alt">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">Journey</p>
            <h2>Four steps from register to <span className="accent-word">classroom</span></h2>
          </div>
        </div>
        <div className="steps-row">
          <article className="glass-card step-card">
            <span className="step-index">01</span>
            <h3>Create an account</h3>
            <p>Students and teachers register with a Gmail address. EduTrack sends a 6-digit OTP to prove the mailbox is real.</p>
          </article>
          <article className="glass-card step-card">
            <span className="step-index">02</span>
            <h3>Wait for approval</h3>
            <p>An administrator activates the profile. Until then, login is blocked — so campus records stay closed to strangers.</p>
          </article>
          <article className="glass-card step-card">
            <span className="step-index">03</span>
            <h3>Join your courses</h3>
            <p>Admins enroll students and assign teachers. The dashboard only lists rooms that belong to you.</p>
          </article>
          <article className="glass-card step-card">
            <span className="step-index">04</span>
            <h3>Work in one login</h3>
            <p>Submit files, check attendance, read exam dates, and open results without switching tools.</p>
          </article>
        </div>
      </section>

      <section className="public-section">
        <div className="split about-split security-split">
          <div>
            <p className="eyebrow">Access control</p>
            <h2>OTP, JWT, and roles — not a shared password sheet</h2>
            <p>
              Registration uses Gmail OTP. Sessions use JWT. Routes are wrapped so a student cannot open teacher
              grading tools, and a teacher cannot open admin user tables. Passwords are hashed with bcrypt before they
              ever sit in MongoDB.
            </p>
            <ul className="plain-list">
              <li>Public register for students and teachers only</li>
              <li>Admin-created accounts for campus staff who need extra access</li>
              <li>Demo logins on the sign-in page for reviewers</li>
            </ul>
            <Link to="/about" className="ghost-btn">Read how roles work</Link>
          </div>
          <div className="glass-card security-card">
            <Glyph name="shield" />
            <h3>What you will never see</h3>
            <p>No fake student counts. No hardcoded assignment lists. Dashboard widgets call `/dashboard` and render whatever MongoDB currently holds.</p>
            <Glyph name="lock" />
            <h3>Approval gate</h3>
            <p>A verified Gmail is not enough. The campus admin still has to switch the account to active before the first login.</p>
          </div>
        </div>
      </section>

      <section className="public-section alt">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">Roles</p>
            <h2>Three desks. One <span className="accent-word">campus file</span>.</h2>
          </div>
        </div>
        <div className="card-grid roles-grid">
          <article className="role-card glass-card">
            <div className="role-card-body">
              <Glyph name="graduate" />
              <p className="role-number">Student</p>
              <h3>See your own academic week</h3>
              <p>Enrolled courses, pending files, attendance percentage, exam timetable, published GPA, and downloads from teachers.</p>
            </div>
          </article>
          <article className="role-card glass-card">
            <div className="role-card-body">
              <Glyph name="teach" />
              <p className="role-number">Teacher</p>
              <h3>Run only the rooms you own</h3>
              <p>Create assignments, mark the register, upload notes, schedule papers, grade submissions, and release results.</p>
            </div>
          </article>
          <article className="role-card glass-card">
            <div className="role-card-body">
              <Glyph name="users" />
              <p className="role-number">Admin</p>
              <h3>Keep the institution complete</h3>
              <p>Approve accounts, open courses, assign faculty, read contact messages, and watch live campus totals.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="public-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2>Courses currently on the <span className="accent-word">live server</span></h2>
          </div>
          <Link to="/register" className="ghost-btn">Join to enroll</Link>
        </div>
        {courses.length === 0 ? (
          <p className="empty">No courses have been created yet.</p>
        ) : (
          <div className="card-grid public-cards">
            {courses.map((course) => (
              <article className="info-card catalog-card glass-card" key={course._id}>
                <div className="catalog-card-body">
                  <p className="eyebrow">{course.code}</p>
                  <h3>{course.name}</h3>
                  <p>{course.description}</p>
                  <p className="muted">
                    {course.teacher} · Semester {course.semester} · {course.enrolled} enrolled
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="public-section alt">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">Voices</p>
            <h2>Built for the week campus staff actually live</h2>
          </div>
        </div>
        <div className="card-grid trust-grid">
          <article className="trust-card glass-card">
            <p className="trust-quote">We replaced three different systems with EduTrack. Attendance, assignments, and results sit behind one login.</p>
            <div className="trust-author">
              <div className="avatar">D</div>
              <div>
                <strong>Dr. Ramesh Sharma</strong>
                <span className="muted">Head of Department, CS</span>
              </div>
            </div>
          </article>
          <article className="trust-card glass-card">
            <p className="trust-quote">I can see attendance and pending work without asking anyone. The student dashboard is quiet and clear.</p>
            <div className="trust-author">
              <div className="avatar">A</div>
              <div>
                <strong>Anita Thapa</strong>
                <span className="muted">BSc CSIT, 4th Semester</span>
              </div>
            </div>
          </article>
          <article className="trust-card glass-card">
            <p className="trust-quote">Grading used to take an evening. Now the register and marks close from a laptop between classes.</p>
            <div className="trust-author">
              <div className="avatar">S</div>
              <div>
                <strong>Prof. Sunita Karki</strong>
                <span className="muted">Mathematics Faculty</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="public-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Field notes</p>
            <h2>Guides from the <span className="accent-word">running portal</span></h2>
          </div>
          <Link to="/blog" className="ghost-btn">All articles</Link>
        </div>
        <div className="card-grid public-cards">
          {posts.map((post) => (
            <article className="blog-card glass-card" key={post._id}>
              <img className="blog-card-media" src="/blog-cover.jpg" alt="" />
              <div className="blog-card-body">
                <span className="blog-category">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`} className="text-link">Read article</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section alt">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2>Short answers before you <span className="accent-word">register</span></h2>
          </div>
        </div>
        <div className="faq-grid">
          <details className="faq-item">
            <summary>Can I log in right after OTP?</summary>
            <p>No. Gmail verification proves the mailbox. An administrator still has to activate the account before sign-in works.</p>
          </details>
          <details className="faq-item">
            <summary>Who can create a teacher account?</summary>
            <p>Teachers may register publicly, but they cannot teach a course until an admin approves them and assigns rooms.</p>
          </details>
          <details className="faq-item">
            <summary>Where does attendance come from?</summary>
            <p>Teachers mark it per course. The student percentage is calculated from those live records, not from a spreadsheet upload.</p>
          </details>
          <details className="faq-item">
            <summary>Is there a demo?</summary>
            <p>Yes. The login page can fill Admin, Teacher, and Student demo accounts so reviewers can walk the dashboards.</p>
          </details>
        </div>
        <p className="section-desc">Need a longer answer? The contact form stores messages for the campus admin.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link to="/contact" className="ghost-btn">Ask the admin team</Link>
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-inner glass-card cta-glass">
          <h2>Bring the campus file into one login</h2>
          <p>Students register free. Teachers keep their rooms. Admins keep the register honest.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="accent-btn hero-btn">Open dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="accent-btn hero-btn">Create free account</Link>
                <Link to="/login" className="ghost-btn hero-btn">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

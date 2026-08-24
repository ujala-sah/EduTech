import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';

function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setResult({ query: '', courses: [], blogs: [] });
      return;
    }
    api
      .get('/public/search', { params: { q: query } })
      .then((response) => setResult(response.data))
      .catch((err) => setError(err.message));
  }, [query]);

  if (!result && !error) return <Loading label="Searching..." />;

  return (
    <div>
      <section className="page-hero">
        <p className="eyebrow">Search</p>
        <h1>Results for “{query}”</h1>
        <p>This search reads live course and blog records from MongoDB.</p>
      </section>
      <section className="public-section">
        {error && <p className="alert error">{error}</p>}
        {result && result.courses.length === 0 && result.blogs.length === 0 && (
          <p className="empty">No matching courses or articles.</p>
        )}
        {result?.courses?.length > 0 && (
          <>
            <h2>Courses</h2>
            <div className="card-grid public-cards">
              {result.courses.map((course) => (
                <article className="info-card" key={course._id}>
                  <p className="eyebrow">{course.code}</p>
                  <h3>{course.name}</h3>
                  <p>{course.description}</p>
                  <p className="muted">
                    {course.teacher} · {course.enrolled} enrolled
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
        {result?.blogs?.length > 0 && (
          <>
            <h2>Articles</h2>
            <div className="card-grid public-cards">
              {result.blogs.map((post) => (
                <article className="info-card" key={post._id}>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`}>Read article</Link>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default SearchPage;

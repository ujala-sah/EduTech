import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';

const CATEGORIES = ['All', 'Guides', 'Features', 'Tips', 'Updates'];

function Blog() {
  const [params] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState(params.get('q') || '');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (value = search) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.get('/public/blogs', { params: { search: value } });
      setPosts(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(params.get('q') || '');
  }, []);

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div>
      <section className="page-hero-wide">
        <p className="eyebrow">Blog</p>
        <h1>Guides &amp; updates from the live academic <span className="accent-word">portal</span></h1>
        <p>These articles are stored in MongoDB and cover features that already run in EduTrack — from attendance tracking to GPA calculation. Search or filter by category; nothing here is a static marketing copy deck.</p>
        <form
          className="hero-search-bar compact"
          onSubmit={(e) => { e.preventDefault(); load(); }}
        >
          <input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="accent-btn">Search</button>
        </form>
      </section>

      <section className="public-section">
        <div className="blog-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {error && <p className="alert error">{error}</p>}
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No matching articles</h3>
            <p className="muted">Try a different search term or category filter.</p>
          </div>
        ) : (
          <div className="card-grid blog-grid">
            {filtered.map((post) => (
              <article className="blog-card glass-card" key={post._id}>
                <img className="blog-card-media" src="/blog-cover.jpg" alt="" />
                <div className="blog-card-body">
                  <span className="blog-category">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="blog-meta">
                    <span>{post.authorName}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="text-link">Read article →</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="cta-band compact">
        <div className="cta-inner">
          <h2>Have a topic you'd like covered?</h2>
          <p>Teachers and admins can create blog posts from the dashboard. Students can suggest topics via the contact form.</p>
          <div className="hero-actions">
            <Link to="/contact" className="accent-btn hero-btn">Suggest a topic</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Blog;

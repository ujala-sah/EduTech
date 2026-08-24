import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/public/blogs/${slug}`)
      .then((response) => setPost(response.data))
      .catch((err) => setError(err.message));
  }, [slug]);

  if (!post && !error) return <Loading />;
  if (error) {
    return (
      <section className="page-hero">
        <p className="alert error">{error}</p>
        <Link to="/blog">Back to blog</Link>
      </section>
    );
  }

  return (
    <article className="blog-post">
      <p className="eyebrow">{post.category}</p>
      <h1>{post.title}</h1>
      <p className="muted">
        {post.authorName} · {new Date(post.createdAt).toLocaleDateString()}
      </p>
      {post.content.split('\n\n').map((paragraph) => (
        <p key={paragraph.slice(0, 24)}>{paragraph}</p>
      ))}
      <Link to="/blog" className="ghost-btn">
        All articles
      </Link>
    </article>
  );
}

export default BlogPost;

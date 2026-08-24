function BrandLogo({ compact = false }) {
  return (
    <span className={`brand-lockup ${compact ? 'compact' : ''}`}>
      <img src="/logo-edutrack.png" alt="" className={compact ? 'brand-logo sm' : 'brand-logo'} />
      <span className="logo-text">
        Edu<span className="logo-accent">Track</span>
      </span>
    </span>
  );
}

export default BrandLogo;

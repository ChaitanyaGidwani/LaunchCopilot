export default function Loading() {
  return (
    <div>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text short" />
      <div className="card">
        <div className="skeleton skeleton-title" style={{ marginBottom: 16 }} />
        <div className="skeleton skeleton-input" />
        <div className="skeleton skeleton-input" />
        <div className="skeleton skeleton-input" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}

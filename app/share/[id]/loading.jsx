export default function Loading() {
  return (
    <div>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text short" />
      {[1, 2, 3].map((i) => (
        <div className="card" key={i}>
          <div className="skeleton skeleton-text short" style={{ marginBottom: 14 }} />
          <div className="skeleton skeleton-input" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" />
        </div>
      ))}
    </div>
  );
}

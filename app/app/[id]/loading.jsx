export default function Loading() {
  return (
    <div>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />

      <div className="card" style={{ marginTop: 24 }}>
        <div className="skeleton skeleton-title" style={{ width: "60%" }} />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
      </div>

      <div className="card">
        <div className="skeleton skeleton-title" style={{ width: "40%" }} />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
      </div>

      <div className="card">
        <div className="skeleton skeleton-title" style={{ width: "50%" }} />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card" style={{ marginTop: 48, textAlign: "center", padding: "40px 24px" }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🔭</div>
      <h2 style={{ marginTop: 0 }}>This kit doesn&apos;t exist</h2>
      <p className="hint" style={{ maxWidth: 420, margin: "0 auto 18px" }}>
        The app or launch kit you&apos;re looking for was deleted or the link is
        wrong. Every great launch starts somewhere else — yours can start here.
      </p>
      <Link className="btn" href="/">
        Create a launch kit →
      </Link>
    </div>
  );
}

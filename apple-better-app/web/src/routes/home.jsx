// web/src/routes/home.jsx
import './home.css';

export default function Home() {
  return (
    <header className="hero">
      {/* centered pill at the very top of the header */}
      <div className="hero__badge">⚡ Next-Gen Home Protection</div>

      <div className="hero__inner">
        <h1 className="hero__title">
          Secure Your <span className="accent">Entire Life</span>
        </h1>
        <p className="hero__subtitle">
          Advanced inventory system with AI-powered recall monitoring.
          Your belongings, <strong>instantly protected.</strong>
        </p>

        {/* clear CTA directly under text */}
        <div className="hero__cta">
          <a className="btn btn-primary btn-lg" href="/app" aria-label="Get Started with KeepSafe">
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

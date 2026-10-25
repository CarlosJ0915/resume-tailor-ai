import { SparkleIcon } from "./Icons";

const steps = ["Add your resume", "Paste the job post", "Get a tailored version"];

const HeaderComponent = () => {
  return (
    <header className="header">
      <nav className="nav">
        <a className="brand" href="/">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span>Resume Tailor</span>
          <span className="brand-tag">AI</span>
        </a>
      </nav>

      <div className="hero">
        <span className="eyebrow">
          <SparkleIcon width={14} height={14} /> Write, judge, refine
        </span>
        <h1>
          Land the interview with a resume{" "}
          <span className="gradient-text">tailored to every job</span>
        </h1>
        <p className="subtitle">
          Paste your resume and a job description. Our AI agent rewrites your
          bullets to match the role and scores how well you fit.
        </p>
        <ol className="steps">
          {steps.map((step, i) => (
            <li key={step}>
              <span className="step-num">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
};

export default HeaderComponent;

import { AlertIcon, CheckIcon } from "./Icons";

const scoreTone = (score) => (score >= 75 ? "good" : score >= 50 ? "warn" : "bad");
const scoreLabel = (score) => (score >= 75 ? "Strong match" : score >= 50 ? "Decent match" : "Needs work");

const MatchRatingComponent = ({ matchData, loading }) => {
  if (loading) {
    return (
      <div className="match-card" aria-busy="true">
        <h3>Match rating</h3>
        <div className="score-ring is-loading">
          <span className="spinner" />
        </div>
        <div className="skeleton-lines">
          <span className="skeleton" style={{ width: "80%" }} />
          <span className="skeleton" style={{ width: "65%" }} />
          <span className="skeleton" style={{ width: "72%" }} />
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="match-card is-empty">
        <h3>Match rating</h3>
        <div className="score-ring is-empty">
          <span className="score-value">–</span>
        </div>
        <p className="hint">
          Your match score, matched keywords and feedback will appear here after you tailor your
          resume.
        </p>
      </div>
    );
  }

  const { matchScore, keywords, feedback } = matchData;
  const tone = scoreTone(matchScore);

  return (
    <div className="match-card reveal">
      <h3>Match rating</h3>
      <div className={`score-ring tone-${tone}`} style={{ "--score": matchScore }}>
        <span className="score-value" role="img" aria-label={`${matchScore}%`} />
      </div>
      <span className={`score-label tone-${tone}`}>{scoreLabel(matchScore)}</span>

      {keywords.length > 0 && (
        <section className="match-section">
          <h4>Matched keywords</h4>
          <ul className="keywords">
            {keywords.map((keyword, i) => (
              <li key={keyword} style={{ "--i": i }}>
                {keyword}
              </li>
            ))}
          </ul>
        </section>
      )}

      {feedback.length > 0 && (
        <section className="match-section">
          <h4>Feedback</h4>
          <ul className="feedback">
            {feedback.map((item, index) => (
              <li key={index} className={`feedback-item ${item.type}`} style={{ "--i": index }}>
                <span className="feedback-icon">
                  {item.type === "good" ? (
                    <CheckIcon width={12} height={12} strokeWidth={3} />
                  ) : (
                    <AlertIcon width={12} height={12} strokeWidth={3} />
                  )}
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default MatchRatingComponent;

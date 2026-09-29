const MatchRatingComponent = ({ matchData }) => {
    if (!matchData) {
        return (
            <div className="match-card">
                <h3>Match rating</h3>
                <p className="hint">Your match rating will appear here after you tailor your resume.</p>
            </div>
        );
    }


    const { matchScore, keywords, feedback } = matchData;

    return (
        <div className="match-card">
            <div className="match-header">
                <div>
                    <h3>Match rating</h3>
                    <p className="hint">How well the rewritten version lines up with the job post.</p>
                </div>
                <div className="score-ring" style={{ "--score": matchScore }}>
                    <span>{matchScore}%</span>
                </div>
            </div>

            <ul className="keywords">
                {keywords.map((keyword) => (
                    <li key={keyword}>{keyword}</li>
                ))}
            </ul>

            <ul className="feedback">
                {feedback.map((item, index) => (
                  <li key={index} className={`feedback-item ${item.type}`}>
                    <span className="feedback-icon">{item.type === "good" ? "✓" : "!"}</span>
                    <span>{item.text}</span>
                  </li>  
                ))}
            </ul>
        </div>
    );
};

export default MatchRatingComponent;
const ProgressBar = ({ completed, total }) => {
    const percent = Math.min((completed / total) * 100, 100);

    return (
        <div className="progress-wrapper">
            <div className="progress-info">
                <span className="progress-text">Survey progress</span>
                <span className="progress-percentage">{Math.round(percent)}% Complete</span>
            </div>
            <div className="progress">
                <div
                    className="progress-bar"
                    style={{ width: `${percent}%` }}
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                />
            </div>
        </div>
    );
};

export default ProgressBar;

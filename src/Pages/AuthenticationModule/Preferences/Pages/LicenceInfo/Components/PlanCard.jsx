import PropTypes from 'prop-types';
import './SubscriptionPlans.scss';

/**
 * PlanCard component - Displays a single subscription plan
 */
const PlanCard = ({
    planName,
    badge,
    badgeColor,
    description,
    features,
    onSelect,
    isActive = false,
}) => {
    return (
        <div className={`plan-card ${isActive ? 'active' : ''}`}>
            {/* Badge */}
            <div className={`plan-badge ${badgeColor}`}>
                {badge}
            </div>

            {/* Plan Name */}
            <h3 className={`plan-name ${badgeColor}-text`}>{planName}</h3>

            {/* Description */}
            <p className="plan-description">{description}</p>

            {/* Features List */}
            <ul className="plan-features">
                {features.map((feature, index) => (
                    <li key={index} className="feature-item">
                        <span className="feature-icon">◎</span>
                        <span className="feature-text">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* Select Button */}
            <div className="plan-action">
                <button
                    className={`select-plan-btn ${badgeColor}-btn`}
                    onClick={() => onSelect && onSelect(planName)}
                >
                    Select plan
                </button>
            </div>
        </div>
    );
};

PlanCard.propTypes = {
    planName: PropTypes.string.isRequired,
    badge: PropTypes.string.isRequired,
    badgeColor: PropTypes.oneOf(['green', 'orange', 'blue']).isRequired,
    description: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func,
    isActive: PropTypes.bool,
};

export default PlanCard;

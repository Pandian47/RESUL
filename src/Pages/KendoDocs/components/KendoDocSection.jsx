import { arrow_down_medium, arrow_up_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo } from 'react';
import PropTypes from 'prop-types';
import { Accordion } from 'react-bootstrap';
const KendoDocSection = ({ entry, isActive, onToggle }) => {
    return (
        <article id={entry.id} className={`kendo-docs-section ${isActive ? 'is-active' : ''}`}>
            <Accordion flush activeKey={isActive ? entry.id : undefined}>
                <Accordion.Item eventKey={entry.id}>
                    <div className="kendo-docs-section__header-wrapper" onClick={() => onToggle(entry.id)}>
                        <div className="kendo-docs-section__header-content">
                            <h2 className="kendo-docs-section__title">{entry.title}</h2>
                            <p className="kendo-docs-section__desc">{entry.description}</p>
                        </div>
                        <div className="kendo-docs-section__chevron">
                            <i className={isActive ? arrow_up_medium : arrow_down_medium} />
                        </div>
                    </div>
                </Accordion.Item>
            </Accordion>
        </article>
    );
};

KendoDocSection.propTypes = {
    entry: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        note: PropTypes.string,
    }).isRequired,
    isActive: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
};

export default memo(KendoDocSection);

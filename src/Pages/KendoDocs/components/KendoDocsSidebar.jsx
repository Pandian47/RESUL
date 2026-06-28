import { document_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo } from 'react';
import PropTypes from 'prop-types';

import { ALL_KENDO_DOC_SECTIONS } from '../catalog';
const KendoDocsSidebar = ({ activeId, onSelect }) => (
    <nav className="kendo-docs-sidebar" aria-label="Kendo component navigation">
        {ALL_KENDO_DOC_SECTIONS.map((section) => (
            <div key={section.group} className="kendo-docs-sidebar__group">
                <h3 className="kendo-docs-sidebar__group-title">{section.group}</h3>
                <ul>
                    {section.items.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                className={`kendo-docs-sidebar__link${activeId === item.id ? ' is-active' : ''}`}
                                onClick={() => onSelect(item.id)}
                                aria-current={activeId === item.id ? 'true' : undefined}
                            >
                                <i className={document_medium} aria-hidden="true" />
                                <span className="kendo-docs-sidebar__link-text">{item.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </nav>
);

KendoDocsSidebar.propTypes = {
    activeId: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
};

export default memo(KendoDocsSidebar);


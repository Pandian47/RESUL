import { Link } from 'react-router-dom';
import { COMPONENT_REGISTRY } from './docsConfig';
import './componentDocs.scss';

const ComponentsDocsList = () => {
    return (
        <div className="docs-module">
            <h1>Component Library</h1>
            <p>
                Browse and view the interactive documentation for our standardized React components.
                Each component includes a live preview, source code, styling, and configuration.
            </p>

            <div className="components-grid">
                {COMPONENT_REGISTRY.map((comp) => (
                    <Link
                        key={comp.componentName}
                        to={`/docs/components/${comp.componentName}`}
                        className="component-card"
                    >
                        <h3>{comp.title || comp.componentName}</h3>
                        <p>View component documentation, props, and code implementation.</p>
                    </Link>
                ))}
                {COMPONENT_REGISTRY.length === 0 && (
                    <p>No components have been registered in docsConfig.js yet.</p>
                )}
            </div>
        </div>
    );
};

export default ComponentsDocsList;

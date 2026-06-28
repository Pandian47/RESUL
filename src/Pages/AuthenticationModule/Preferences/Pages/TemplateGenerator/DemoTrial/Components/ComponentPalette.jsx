// src/components/ComponentPalette.js
import { useDraggable } from '@dnd-kit/core';

const components = [
    { id: 'text', label: 'Text Block' },
    { id: 'image', label: 'Image Block' },
    { id: 'url', label: 'URL Link' },
];

function ComponentPalette() {
    return (
        <div className="palette">
            <h3>Components</h3>
            {components.map((component) => (
                <DraggableComponent key={component.id} id={component.id} label={component.label} />
            ))}
        </div>
    );
}

function DraggableComponent({ id, label }) {
    const { attributes, listeners, setNodeRef } = useDraggable({ id });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className="draggable-component">
            {label}
        </div>
    );
}

export default ComponentPalette;

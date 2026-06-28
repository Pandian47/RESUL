// src/App.js
import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import TemplateEditor from './Components/TemplateEditor';
import ComponentPalette from './Components/ComponentPalette';
import ImageBlockForm from './Components/ImageBlockForm';

const EBuilderDemo = () => {
    const [blocks, setBlocks] = useState([]); // Stores the dropped blocks
    const [selectedBlock, setSelectedBlock] = useState(null);
    const handleDrop = (event) => {
        const { active } = event;
        const newBlock = { id: new Date().getTime(), type: active.id, properties: {} };
        setBlocks([...blocks, newBlock]); // Add the dropped block to the state
        setSelectedBlock(newBlock); // Select the block for editing
    };
    // Update block properties (mainly for ImageBlock)
    const updateBlockProperties = (id, updatedProperties) => {
        setBlocks(blocks.map((block) => (block.id === id ? { ...block, properties: updatedProperties } : block)));
    };
    return (
        <div className="App">
            <h1>Template Builder</h1>

            <div className="builder">
                <DndContext onDragEnd={handleDrop}>
                    <div className="left-pane">
                        <ComponentPalette />
                        <TemplateEditor blocks={blocks} onSelectBlock={setSelectedBlock} />
                    </div>
                </DndContext>
                <div className="right-pane">
                    {selectedBlock && selectedBlock.type === 'image' && (
                        <ImageBlockForm block={selectedBlock} updateBlockProperties={updateBlockProperties} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EBuilderDemo;

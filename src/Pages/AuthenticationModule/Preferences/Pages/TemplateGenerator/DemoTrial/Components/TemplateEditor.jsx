// src/components/TemplateEditor.js
import TextBlock from './Blocks/TextBlock';
import ImageBlock from './Blocks/ImageBlock';
import UrlLink from './Blocks/UrlLink';
function TemplateEditor({ blocks, onSelectBlock }) {
    const renderComponent = (block) => {
        switch (block.type) {
            case 'text':
                return <TextBlock key={block.id} />;
            case 'image':
                return <ImageBlock key={block.id} onClick={() => onSelectBlock(block)} />;
            case 'url':
                return <UrlLink key={block.id} />;
            default:
                return null;
        }
    };

    return (
        <div className="template-editor">
            <h3>Template Editor</h3>
            {blocks.map(renderComponent)}
        </div>
    );
}

export default TemplateEditor;

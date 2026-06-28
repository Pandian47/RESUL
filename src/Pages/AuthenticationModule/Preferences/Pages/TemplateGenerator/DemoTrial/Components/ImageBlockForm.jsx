import { useEffect, useState } from 'react';
function ImageBlockForm({ block, updateBlockProperties }) {
    const [src, setSrc] = useState(block.properties.src || '');
    const [alt, setAlt] = useState(block.properties.alt || '');
    const [width, setWidth] = useState(block.properties.width || '');
    const [height, setHeight] = useState(block.properties.height || '');
    const [caption, setCaption] = useState(block.properties.caption || '');

    useEffect(() => {
        updateBlockProperties(block.id, { src, alt, width, height, caption });
    }, [src, alt, width, height, caption]);

    return (
        <div className="image-block-form">
            <h3>Edit Image Block</h3>
            <div>
                <label>Image URL:</label>
                <input type="text" value={src} onChange={(e) => setSrc(e.target.value)} />
            </div>
            <div>
                <label>Alt Text:</label>
                <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} />
            </div>
            <div>
                <label>Width:</label>
                <input type="text" value={width} onChange={(e) => setWidth(e.target.value)} />
            </div>
            <div>
                <label>Height:</label>
                <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div>
                <label>Caption:</label>
                <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
        </div>
    );
}

export default ImageBlockForm;

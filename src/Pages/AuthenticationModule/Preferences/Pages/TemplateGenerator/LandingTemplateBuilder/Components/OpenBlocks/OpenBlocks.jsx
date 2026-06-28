import { OPEN_BLOCK_ELEMENTS } from './constants';
const OpenBlocks = () => {
    return (
        <div className="rsbstc-settings-blocks">
            <div style={{ display: 'block' }}>
                {OPEN_BLOCK_ELEMENTS.map((item, idx) => {
                    return (
                        <div
                            key={item.id}
                            className=""
                            draggable
                            onDragStart={(e) => {
                                e.stopPropagation();
                                e.dataTransfer.setData('name', item.label);
                            }}
                        >
                            {item.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OpenBlocks;

import { memo } from 'react';
import { Row } from 'react-bootstrap';
import { ICONLIST } from './constants';

const ContentIcons = ({ containers, onDragEnd }) => {
    const handleDragOver = (event) => {
        event.preventDefault();
    };
    const handleDragStart = (id) => {
        return (event) => event.dataTransfer.setData('task', id);
    };

    return (
        <div className="rs-builder-elements-holder py10" onDragOver={handleDragOver}>
            <Row>
                <ul>
                    {ICONLIST.map((ele) => {
                        return (
                            <li
                                key={ele.content}
                                className={ele.id == 5 && containers.some((e) => e.id == 5) ? 'click-off' : ''}
                                onDragStart={handleDragStart(ele.id)}
                                draggable
                                onMouseLeave={(event) => onDragEnd(event)}
                            >
                                <div className="rs-element-icon-holder lh0">
                                    {/* <i className={`${ele.icon} icon-lg`} /> */}
                                    <i className={`${ele.icon} icon-lg`} />
                                    {/* <img src={`${ele.elementImage}`} alt={ele.content} /> */}
                                    <h6 className="mt0 fs13">{ele.content}</h6>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </Row>
        </div>
    );
};

export default memo(ContentIcons);

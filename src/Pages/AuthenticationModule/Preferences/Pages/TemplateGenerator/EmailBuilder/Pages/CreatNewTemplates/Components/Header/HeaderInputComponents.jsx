import { Fragment, useState } from 'react';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { TEMPLATE_COMPONENTS } from '../EmailBuildArea/Constant';

const HeaderInputComponents = () => {

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const [blockFlag, setBlackFlag] = useState(false)

    const handleOpen = (ind) => {
        if (ind == 0 || ind == 1)
            setBlackFlag(!blockFlag)
    }

    const onDragStart = (ev, id) => {
        ev.dataTransfer.setData("ebChildId", id);
        if (id !== 1 || id !== 2) {
            // handleDragging('child');
            ev.dataTransfer.setData("ebCompoType", 'child');
        }
    }

    return (
        <Fragment>
            <div className="d-flex justify-content-between mx20 mt94">
                <div className="d-flex">
                    {TEMPLATE_COMPONENTS.map((ele, ind) => {
                        return (
                            <Fragment key={ele.name}>
                                <span
                                    className="mx10 text-center"
                                    onDragStart={(e) => onDragStart(e, ele.id)}
                                    draggable
                                    key={ele?.name}
                                    onClick={() => { handleOpen(ind) }}
                                >
                                    <img src={ele.icons} /><br />
                                    <label>{ele.name}</label>
                                </span>
                            </Fragment>
                        );
                    })}
                </div>
                <div className="align-self-center">
                    <RSSecondaryButton>Cancel</RSSecondaryButton>
                    <RSPrimaryButton type="submit">Save</RSPrimaryButton>
                </div>
            </div>
            {/* <div className="card" onDragOver={handleDragOver}>
                {
                    blockFlag && <BlockBox />
                }
            </div> */}
        </Fragment>
    );
};

export default HeaderInputComponents;

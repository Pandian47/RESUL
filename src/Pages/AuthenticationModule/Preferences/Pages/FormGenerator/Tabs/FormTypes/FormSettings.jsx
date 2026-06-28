import { CANCEL, FORM_SETTINGS, SAVE, SELECT_LAYOUT } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useContext, useState } from 'react';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTooltip from 'Components/RSTooltip';
import { availableLayouts } from './constant';
import { FormGeneratorContext } from './FormGenerator';
const FormSettings = ({ show, onHide, onSave }) => {
    const { dispatchState } = useContext(FormGeneratorContext);
    const [layoutType, setLayoutType] = useState('form-theme-default');

    const handleLayoutChange = (layout, layoutName) => {
        setLayoutType(layout);
        dispatchState({
            type: 'UPDATE',
            field: 'layoutName',
            payload: layoutName,
        });
    };

    return (
        <RSModal
            show={show}
            // show={true}
            size="lg"
            header={FORM_SETTINGS}
            handleClose={onHide}
            body={
                <div className="rs-form-builder-settings d-flex align-items-start justify-content-evenly">
                    <h5>{SELECT_LAYOUT}</h5>
                    <div className="rsfbs-themes ">
                        <ul className="rli-space-15 d-flex  gap-5 m0">
                            {availableLayouts.map(({ themeLabel, themeId, themePreviewImage }) => (
                                <Fragment key={themeId}>
                                    <div className='d-flex align-items-center flex-column gap-3'>
                                        <RSTooltip position="top" text={themeLabel} className="lh0">
                                            <li
                                                key={themeId}
                                                onClick={() => handleLayoutChange(themeId, themeLabel)}
                                                className={`m0 ${themeId} ${layoutType === themeId ? 'active' : ''}`}
                                            >
                                                <img src={themePreviewImage} alt={themeLabel} />
                                            </li>
                                        </RSTooltip>
                                        <p>{themeLabel}</p>
                                    </div>
                                </Fragment>
                            ))}
                        </ul>
                    </div>
                    {/* <div className="theme-customize">
                        <FormOptions layout={layoutType} />
                    </div> */}
                </div>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={onHide}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton onClick={() => onSave(layoutType)}>{SAVE}</RSPrimaryButton>
                </>
            }
        />
    );
};

export default FormSettings;

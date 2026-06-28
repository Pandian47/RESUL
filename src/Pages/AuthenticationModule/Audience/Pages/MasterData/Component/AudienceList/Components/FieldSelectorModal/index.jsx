import { CHOOSE_ATTRIBUTES_TO_DISPLAY_IN_TABLE } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSSearchField from 'Components/RSSearchField';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
const FieldSelectorModal = ({ handleClose, show: showModal, checkboxData, SelectedColumns }) => {
    const [show, setShow] = useState(false);
    const { control, handleSubmit } = useForm();

    useEffect(() => {
        setShow(showModal);
    }, [showModal]);

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={CHOOSE_ATTRIBUTES_TO_DISPLAY_IN_TABLE}
            body={
                <div>
                    <div className="flex-row justify-content-end mb10 top-sub-heading">
                        <ul className="rs-list-group-horizontal">
                            <li>
                                <RSSearchField />
                            </li>
                        </ul>
                    </div>
                    {checkboxData.map((itemName, index) => (
                        <RSCheckbox key={index} control={control} name={itemName} labelName={itemName} />
                    ))}
                </div>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={() => handleClose(false)}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={handleSubmit((data) => {
                            let keys = Object.keys(data).filter((k) => data[k] === true);
                            SelectedColumns(keys);
                            handleClose(false);
                        })}
                        id="rs_FieldSelectorModal_Load"
                    >
                        Load
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export default FieldSelectorModal;

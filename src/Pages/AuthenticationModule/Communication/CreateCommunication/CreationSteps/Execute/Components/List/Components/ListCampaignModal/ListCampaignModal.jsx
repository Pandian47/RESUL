import { FIRST_ROW, OK, SELECT } from 'Constants/GlobalConstant/Placeholders';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
import { useFormContext } from 'react-hook-form';
import { RSPrimaryButton } from 'Components/Buttons';

import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSCheckbox from 'Components/FormFields/RSCheckbox';

const ListCampaignModal = ({ show, handleClose, data, switchName, ddListName, title }) => {
    const { control, watch } = useFormContext();
    const toggle = watch(switchName);
    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={
                <div style={{ display: 'flex' }}>
                    <span className="mx10">{title}</span>
                    <RSSwitch control={control} name={switchName} />
                </div>
            }
            body={
                toggle && (
                    <>
                        <div className="mb30">
                            <RSMultiSelect control={control} data={data} name={ddListName} label={SELECT} />
                        </div>
                        {title === 'Suppression List' && (
                            <div className="mt30">
                                <RSFileUpload
                                    name={'suppressionCSV'}
                                    control={control}
                                    isbase64
                                    required
                                    className={'click-off'}
                                    watch={watch}
                                />
                                <RSCheckbox
                                    name={'suppressionCheck'}
                                    control={control}
                                    labelName={FIRST_ROW}
                                    defaultValue
                                />
                            </div>
                        )}
                    </>
                )
            }
            footer={
                <div className="buttons-holder">
                    {toggle && (
                        <RSPrimaryButton
                            onClick={(e) => {
                                                                handleClose();
                            }}
                        >
                           {OK} 
                        </RSPrimaryButton>
                    )}
                </div>
            }
        />
    );
};

export default ListCampaignModal;

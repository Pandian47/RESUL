import { FIRST_ROW, MAP_ATTRIBUTES, OK, SUPPRESSION_LIST as SUPPRESSION_LIST_PH } from 'Constants/GlobalConstant/Placeholders';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { SUPPRESSION_LIST } from '../../constant';
import { RSPrimaryButton } from 'Components/Buttons';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
const SuppressionModal = ({ show, handleClose }) => {
    const { control, watch } = useFormContext();
    const [suppressionList, selectSuppression] = watch(['suppressionList', 'selectSuppression']);
    return (
        <div>
            <RSModal
                show={show}
                handleClose={handleClose}
                size="md"
                header={SUPPRESSION_LIST_PH}
                body={
                    <>
                     <Row className='align-items-end'>
                            <Col sm={4} className='pr0'>
                                <label className='fs19'>{SUPPRESSION_LIST_PH}</label>
                            </Col>
                            <Col sm={8} >
                               <RSSwitch control={control} name={'suppressionList'} />
                            </Col>
                        </Row>
                     
                     {  suppressionList && (
                        <>
                            <div className="form-group mt30">
                                <RSMultiSelect
                                    control={control}
                                    data={SUPPRESSION_LIST}
                                    name={'selectSuppression'}
                                    label={MAP_ATTRIBUTES}
                                />
                            </div>
                            <>
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
                            </>
                        </>
                    )}
                    </>
                  
                }
                footer={
                    <>
                        {suppressionList && (
                            <RSPrimaryButton
                                className={selectSuppression?.length !== 0 ? '' : 'click-off'}
                                onClick={(e) => {
                                                                        handleClose();
                                }}
                            >
                                {OK}
                            </RSPrimaryButton>
                        )}
                    </>
                }
            />
        </div>
    );
};

export default SuppressionModal;

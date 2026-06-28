import { baseURL } from 'Constants/EndPoints';
import { REPEAT_TIMES } from '../../constant';
import { SELECT_AUDIO_FILE, SELECT_RETRY_TIMES } from 'Constants/GlobalConstant/ValidationMessage';
import { ALLOWED_FORMATS, AUDIO_FILE, FILE_NAME_EXTENSIONSAUDIO, FILE_SIZE5MB, NO_OF_RETRIES, RETRY } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import _isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import AudioPlayer from '../../../../Component/AudioPlayer/AudioPlayer';

import { uploadAudioFile } from 'Reducers/communication/createCommunication/Create/request';
import { getVmsDetails } from 'Reducers/communication/createCommunication/Create/selectors';

const Audio = () => {
    const dispatch = useDispatch();
    const {
        control,
        setError,
        clearErrors,
        watch,
        getValues,
        setValue,
        formState: { errors },
    } = useFormContext();
    const { campaignDetails } = useSelector((state) => getVmsDetails(state));
    const [filename, setFilename] = useState('Choose file');
    const [isEdit, setIsEdit] = useState(false);
    useEffect(() => {
        if (!_isEmpty(campaignDetails)) {
            setIsEdit(true);
            //setValue('audioPath', campaignDetails?.content[0]?.audioFilePath);
            setFilename(getValues('audioPath')?.split('/')?.pop())
        }
    }, [campaignDetails]);
    const audioFile = watch('audioFile');
    return (
        <Fragment>
            <div className="form-group mt41">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{AUDIO_FILE}</label>
                    </Col>
                    <Col sm={6}>
                        <RSFileUpload
                            control={control}
                            name={'audioFile'}
                            accept={'.mp3,.wav'}
                            setError={setError}
                            clearErrors={clearErrors}
                            size={5000000}
                            required
                            rules={{
                                required: SELECT_AUDIO_FILE,
                            }}
                            watch={watch}
                            placeholder={filename}
                            handleChange={({ target }) => {
                                try {
                                    const file = target.files[0];
                                    const reader = new FileReader();
                                    reader.readAsDataURL(file);
                                    setFilename(file.name)
                                    reader.onload = async () => {
                                        const payload = {
                                            fileName: file.name,
                                            fileByte: reader.result.split(',')[1],
                                        };
                                        const { status, data } = await dispatch(uploadAudioFile({ payload }));
                                        if (status) {
                                            setIsEdit(true);
                                            setValue('audioPath', baseURL + filePath);
                                            setValue('audioFile', baseURL + filePath);
                                            setValue('fileWeight', file?.size || null);
                                        } else {
                                            setIsEdit(false);
                                            setValue('audioPath', null);
                                            setValue('audioFile', null);
                                        }
                                    };
                                } catch (err) {
                                }
                            }}
                        />
                     
                            <small className="small-text-space-top d-flex">{ALLOWED_FORMATS} {FILE_NAME_EXTENSIONSAUDIO} {FILE_SIZE5MB}</small>
                       
                    </Col>
                </Row>
            </div>
            {/* {(!_isNil(audioFile?.[0]) || isEdit) && ( */}
            {isEdit && !!audioFile && (
                <Row>
                    <div className='form-group'>
                    <Col sm={{ span: 6, offset: 3 }} className='px10'>
                        <AudioPlayer
                            fieldName={'audioFile'}
                            // audio={audioFile[0]}
                            // src={URL.createObjectURL(audioFile[0])}
                            audio={getValues('audioPath')}
                            src={getValues('audioPath')}
                            onDelete={() => {
                                // setValue('audioPath', null);
                                setValue('audioFile', '');
                                setFilename('')
                            }}
                        />
                    </Col>
                    </div>
                </Row>
            )}
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{RETRY}</label>
                    </Col>
                    <Col sm={6}>
                        <RSKendoDropdown
                            control={control}
                            name={'repeat'}
                            required
                            data={REPEAT_TIMES}
                            label={NO_OF_RETRIES}
                            rules={{
                                required: SELECT_RETRY_TIMES,
                            }}
                        />
                    </Col>
                </Row>
            </div>
        </Fragment>
    );
};

export default Audio;


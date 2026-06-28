import { pencil_edit_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import AddImageModal from '../Components/AddImageModal';

const ImageStyles = ({ element }) => {
    const { control, watch, getValues } = useFormContext();
    const [addImageModal, setAddImageModal] = useState(false);

    return (
        <>
            <div className="rsbstc-settings-block">
                <div className="form-group mt20">
                    <img
                        src={
                            getValues(`${element}.imageSrc`) ||
                            'https://t4.ftcdn.net/jpg/01/43/42/83/360_F_143428338_gcxw3Jcd0tJpkvvb53pfEztwtU9sxsgT.jpg'
                        }
                        width={'50px'}
                        height={'auto'}
                    />
                    <span>{getValues(`${element}.imageName`)}</span>
                    <i className={`${pencil_edit_medium} icon-md color-primary-blue`} id='rs_data_pencil_edit'/>
                    <i
                        id='rs_data_refresh'
                        className={`${restart_medium} icon-md color-primary-blue`}
                        onClick={() => setAddImageModal(true)}
                    />
                </div>
            </div>

            <div className="rsbstc-settings-block">
                <div className="form-group">
                    <RSInput name={`${element}.alt`} control={control} placeholder={'Alt text'} />
                </div>
            </div>

            <AddImageModal
                show={addImageModal}
                handleClose={() => setAddImageModal(false)}
                name={`${element}.imageSrc`}
            />
        </>
    );
};

export default ImageStyles;

import { useContext } from 'react';
import RSModal from 'Components/RSModal';
import RSSearchField from 'Components/RSSearchField';
import { Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { TEMP_ICONS } from '../constant';

const SelectIconModal = ({ show, handleClose, element }) => {
    const { control, setValue } = useFormContext();
    // const {element} = useContext(LandingTemplateContext);
    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={'Select Icon'}
            body={
                <div>
                    <Row className="mb30 d-flex justify-content-center">
                        <RSSearchField />
                    </Row>
                    <Row>
                        <div className="m3  d-flex" style={{ flexWrap: 'wrap' }}>
                            {TEMP_ICONS.map((icon, idx) => {
                                return (
                                    <div className="icon-hover m5 p5">
                                        <i
                                            className={`${icon} icon-md`}
                                            onClick={() => {
                                                setValue(element, icon);
                                                handleClose();
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </Row>
                </div>
            }
        />
    );
};

export default SelectIconModal;

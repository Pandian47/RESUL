import { FAILED, SUCCESS, TEMPLATE_ERROR } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { thumbs_up_fill_large, thumbs_down_fill_large } from 'Constants/GlobalConstant/Glyphicons';
const AlertModal = ({ show, data, handleClose }) => {
    const [isShow, setShow] = useState(false);
    const [statusIcon, setStatusIcon] = useState('');
    const [statusText, setStatusText] = useState('');
    const [color, setColor] = useState('');

    useEffect(() => {
        setShow(show);
    }, [show]);
    useEffect(() => {
        const { type, text } = data;
        const icon = type ? thumbs_up_fill_large : thumbs_down_fill_large;
        const color = type ? 'color-green-medium' : 'color-red-medium';
        setStatusIcon(icon);
        setStatusText(text);
        setColor(color);
    }, [data]);

    return (
        <RSModal
            size={'md'}
            show={isShow}
            header={data?.type ? SUCCESS : FAILED}
            handleClose={handleClose}
            // isBorder={false}
            body={
                <Row className="text-center">
                    <Col sm="12" className="mb20">
                        <i className={`${statusIcon} font-xxl ${color}`} />
                    </Col>
                    <Col sm="12" className="mb20">
                        <span>{data?.type ? statusText : TEMPLATE_ERROR}</span>
                    </Col>
                </Row>
            }
        ></RSModal>
    );
};

export default AlertModal;

import { ImageSettingCommonResolution } from '../../../../../constant';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
const ResolutionSize = ({ fieldName }) => {
    const SCALE_FACTOR = 0.2;

    const { setValue, watch } = useFormContext();

    const sizeWatch = watch(fieldName);

    const handleResolutionSize = (size) => {
        setValue(fieldName, size);
    };

    return (
        <>
        <Row>
        <Col sm={3}>
            <h4 className='mb10'>Image size</h4>
            </Col>
            <Col md={9}>
            <div className='temp-grid-wrapper' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                {ImageSettingCommonResolution?.map((resolution, index) => {
                    const [width, height] = resolution?.size?.split('x').map(Number);
                    return (
                        <div
                            key={index}
                            style={{
                                border: resolution?.size === sizeWatch?.size ? '1px solid #0000ff' : '1px solid #c2cfe3',
                            }}
                            onClick={() => handleResolutionSize(resolution)}
                            className="temp-grid-box cp"
                        >
                            <div
                                className="temp-card"
                                style={{
                                    width: `${width * SCALE_FACTOR}px`,
                                    height: `${height * SCALE_FACTOR}px`,
                                }}
                            />
                            <p>{resolution.label} <br /> {resolution.size}</p>
                        </div>
                    );
                })}
            </div>
            </Col>
            </Row>
        </>
    );
};

export default ResolutionSize;

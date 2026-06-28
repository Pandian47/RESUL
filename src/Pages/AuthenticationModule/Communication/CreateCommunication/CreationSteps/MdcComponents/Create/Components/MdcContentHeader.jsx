import { encodeUrl } from 'Utils/modules/crypto';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import useQueryParams from 'Hooks/useQueryParams';

const MdcContentHeader = ({ title }) => {
    const navigate = useNavigate();
    const location = useQueryParams('/communication');
    const [queryParam, setQueryParam] = useState({});

    useEffect(() => {
        setQueryParam(location);
    }, [location]);
    const backToCanvas = () => {
        if (queryParam.mdcContentSetupDetails) delete queryParam.mdcContentSetupDetails;
        const encryptState = encodeUrl(queryParam);
        const url = '/communication/mdc-workflow';
        navigate(`${url}?q=${encryptState}`);
    };
    return (
        <>
            <Container  className={`main-heading-wrapper px0`}>
                <Container className={`mhw-container`}>
                    <div className="mhwc-left">
                        <h1>
                            <div className="mh-wrapper">
                                <span className="mh-text">{title}</span>
                            </div>
                        </h1>
                    </div>
                    <div className="mhwc-right">
                        {/* <div className="mhwcr-item mhwcr-back">
                            <Icon icon={arrow_left_mini} size={'xs'} mainClass={'mr10'} >
                                <span>Back to canvas</span>
                            </Icon>
                        </div> */}
                        <div className="mhwcr-item mhwcr-back" onClick={backToCanvas}>
                            <i className="icon-rs-arrow-left-mini icon-xs color-primary-blue"></i> Back to canvas
                        </div>
                    </div>
                </Container>
            </Container>
        </>
    );
};

export default MdcContentHeader;

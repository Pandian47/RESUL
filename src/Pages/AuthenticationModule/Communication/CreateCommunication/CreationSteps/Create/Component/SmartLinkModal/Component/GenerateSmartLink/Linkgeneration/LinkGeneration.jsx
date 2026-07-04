import { PARAMETER_ALREADY_EXISTS } from 'Constants/GlobalConstant/ValidationMessage';
import { duplicate_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment } from 'react';
///packages
import { useFormContext, useWatch } from 'react-hook-form';
///custom comps
import RSTooltip from 'Components/RSTooltip';
import { Row, Col } from 'react-bootstrap';
//constants
//components
import { RSPrimaryButton } from 'Components/Buttons';
// import { UpdateState } from 'Utils/modules/misc';

const LinkGeneration = (props) => {
    const { findDuplicates, isGenerateLink, state, setIsGenerateLink, fieldName } = props;

    const {
        control,
        trigger,
        formState: { isValid, isDirty },
    } = useFormContext();
    const watchLink = useWatch({
        control,
        name: fieldName,
    });
    return (
        <Fragment>
            <Row>
                <Col sm={11}>
                    <div className="buttons-holder mt0 mb20 mr25">
                        <RSPrimaryButton
                            className={!isDirty || !isValid ? 'click-off' : ''}
                            onClick={() => {
                                if (isValid) {
                                    const [status, link, params] = findDuplicates(watchLink);
                                    if (status) {
                                        setError(`${fieldName}[${link}].parameters[${params}].tags`, {
                                            type: 'custom',
                                            message: PARAMETER_ALREADY_EXISTS,
                                        });
                                        setActiveIndex(i);
                                    } else {
                                        setIsGenerateLink(true);
                                    }
                                } else {
                                    trigger();
                                }
                            }}
                        >
                            Generate
                        </RSPrimaryButton>
                    </div>
                </Col>
            </Row>

            {isGenerateLink && (
                <div className="smart-url">
                    <h4>Smart URL</h4>
                    <ul>
                        {state.smartLinks?.map((smartLink, linkIndex) => (
                            <Fragment>
                                <li key={linkIndex}>{smartLink.link}</li>
                                {smartLink.isCopied && (
                                    <div>
                                        <p>Copied</p>
                                    </div>
                                )}
                                <RSTooltip text="Copy" position="top">
                                    <i
                                        className={`${duplicate_medium} icon-md color-primary-blue`}
                                        onClick={async () => {
                                            if ('clipboard' in navigator) {
                                                const result = await navigator.clipboard.writeText(smartLink.link);

                                                // try {
                                                //     // await navigator.clipboard.writeText(text).then(() => {
                                                //     //     let temp = { ...state };
                                                //     //     temp.smartLinks[linkIndex].isCopied = true;
                                                //     //     UpdateState(setState, 'smartLinks', temp.smartLinks);
                                                //     //     setTimeout(() => {
                                                //     //         temp.smartLinks[linkIndex].isCopied = false;
                                                //     //         UpdateState(setState, 'smartLinks', temp.smartLinks);
                                                //     //     }, 1500);
                                                //     // });

                                                // } catch {
                                                //     console.log(err);
                                                // }
                                            }
                                        }}
                                    />
                                </RSTooltip>
                            </Fragment>
                        ))}
                    </ul>
                </div>
            )}
        </Fragment>
    );
};

export default LinkGeneration;

import { MAX_LENGTH, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { MAX75LENGTH, MINLENGTH } from 'Constants/GlobalConstant/ValidationMessage';
import { SUBJECT_LINE } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSTabbar from 'Components/RSTabber';
import RSInput from 'Components/FormFields/RSInput';
import { IMPORT_MAIL_TAB } from '../ImportTabs';
import { ENTER_SUBJECT_LINE } from 'Constants/GlobalConstant/ValidationMessage';
const MailContent = ({ isEditContent }) => {
    const {
        control,
        getValues,
        trigger,
        setError,
        setValue,
        clearErrors,
        formState: { errors, isDirty },
        reset,
        watch,
    } = useFormContext();

 
    
    function tabResolver (value)  {
        const map = ['R', 'E', 'T'];

        // index ➜ type
        if (typeof value === 'number') {
            return map[value] || 'R';
        }

        // type ➜ index
        const index = map.indexOf(value);
        return index !== -1 ? index : 0;
    };
    return (
        <div>
            <Row>
                <Col sm={3}>
                    <label className="control-label-left">{SUBJECT_LINE}</label>
                </Col>
                <Col sm={9}>
                    <RSInput
                        type={'text'}
                        name={'welcomeMail.subjectLine'}
                        id="rs_MailContent_subjectline"
                        placeholder={SUBJECT_LINE}
                        control={control}
                        required
                        maxLength={50}
                        rules={{
                            required: ENTER_SUBJECT_LINE,
                            minLength: {
                                value: MIN_LENGTH,
                                message: MINLENGTH,
                            },
                            maxLength: {
                                value: MAX_LENGTH,
                                message: MAX75LENGTH,
                            },
                            validate: (data) => (!!data ? true : ENTER_SUBJECT_LINE),
                        }}
                        handleOnBlur={({ target: { value } }) => {
                            if (value?.length < 3) {
                                setError('welcomeMail.subjectLine', {
                                    type: 'custom',
                                    message: MINLENGTH,
                                });
                            } else {
                                clearErrors('welcomeMail.subjectLine');
                            }
                        }}
                    />
                </Col>
            </Row>

            <Row className="mt25">
                <Col sm={12} id="rs_MailContent_Emailcontent" className="Emailcontenttab">
                    <RSTabbar
                        dynamicTab={`rs-content-tabs-flat col-sm-9  offset-sm-1`}
                        activeClass={`active`}
                        heading="Email content"
                        flatTabs
                        noMarginLeftRight
                        tabData={IMPORT_MAIL_TAB(control)}
                        callBack={(data, index) => {
                            data && setValue('welcomeMail.contentType', tabResolver(index));
                        }}
                        defaultTab={tabResolver(watch('welcomeMail.contentType') || 'R') || 0}
                        disableOtherTabs
                        refresh
                        noHeader={true}
                        isRefreshConfirmation={true}
                        onRefresh={() => {
                            const currentSubject = getValues('welcomeMail.subjectLine');
                          setValue('welcomeMail', {
                         subjectLine: currentSubject, // keep subject line
                   });
                        }}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default MailContent;

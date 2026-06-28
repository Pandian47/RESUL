import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSTabbar from 'Components/RSTabber';
import { IMPORT_SUCESS_CONTENT_TAB } from '../ImportTabs';

const SucessContent = ({ isEditContent }) => {
    const {
        control,
        getValues,
        trigger,
        setError,
        setValue,
        clearErrors,
        formState: { errors, isDirty },
        watch,
        reset,
    } = useFormContext();
    const tabResolver = (value) => {
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
                <Col sm={12} id="rs_MailContent_Emailcontent" className="Emailcontenttab">
                    <RSTabbar
                        dynamicTab={`rs-content-tabs-flat col-sm-9 pl0 offset-sm-1`}
                        activeClass={`active`}
                        heading="Email content"
                        flatTabs
                        noMarginLeftRight
                        tabData={IMPORT_SUCESS_CONTENT_TAB(control)}
                        callBack={(data, index) => {
                           data && setValue('success.contentType', tabResolver(index));
                        }}
                        defaultTab={tabResolver(watch('success.contentType') || 'R')}
                        disableOtherTabs
                        refresh
                        noHeader={true}
                        isRefreshConfirmation={true}
                        onRefresh={() => {
                            setValue('success', {});
                        }}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default SucessContent;

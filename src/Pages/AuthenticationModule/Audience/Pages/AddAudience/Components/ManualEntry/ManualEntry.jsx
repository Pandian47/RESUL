import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ENTER_AUDIENCE_DETAILS, ENTER_DESCRIPTION, ENTER_IMPORT_DESCRIPTION, FIRST_ROW_COLUMN_HEADER } from 'Constants/GlobalConstant/ValidationMessage';
import { COLUMN_HEADER, COLUMN_HEADER_TEXT, DOWNLOAD_SAMPLE, FIRSTROW_COLUMN_HEADER, IMPORT_DESCRIPTION, MAXIMUM_1000_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_mini, download_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';
import { LIST_NAME_RULES } from 'Pages/AuthenticationModule/Audience/audienceFormRules';
import RSTextarea from 'Components/FormFields/RSTextarea';
import ListNameExists from 'Components/ListNameExists';
import { checkImportDescriptionExists } from 'Reducers/audience/addAudience/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { handleKendoGridData } from '../../constants';
import CustomKendoGrid from 'Components/RSCustomKendoGrid';
import { numberWithCommas } from 'Utils/modules/formatters';
import { isConfigurationAttributeColumn, isNumericGridValue } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
const ManualEntry = () => {
    const { control, setError, watch } = useFormContext();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [isValidListname, setIsValidListname] = useState(false);
    const dispatch = useDispatch();
    
    const audienceData = watch('manualEntry.audienceData');

    const { gridColumns, gridData } = useMemo(() => {
        const { gridColumns: columns, gridData: data } = handleKendoGridData(audienceData);
        const columnsWithCells = columns.map((col) => ({
            ...col,
            cell: (props) => {
                const value = props?.dataItem?.[col.field];
                const columnLabel = col.title || col.field;
                const isConfigField = isConfigurationAttributeColumn(columnLabel);
                const isNumericCell = !isConfigField && isNumericGridValue(value);
                const displayValue = isNumericCell ? numberWithCommas(value) : value;
                const { className, style, colSpan, title } = props || {};

                return (
                    <td
                        className={`${className || ''} ${isNumericCell ? 'text-right' : ''}`}
                        style={style}
                        {...(colSpan ? { colSpan } : {})}
                        {...(title ? { title } : {})}
                    >
                        {displayValue}
                    </td>
                );
            },
        }));

        return { gridColumns: columnsWithCells, gridData: data };
    }, [audienceData]);

    return (
        <>
            <div className="form-group">
                <Row>
                    <Col sm={{ span: 3, offset: 1 }} className="text-right">
                        <label className="control-label-left">{IMPORT_DESCRIPTION}</label>
                    </Col>
                    <Col md={4}>
                        <ListNameExists
                            name="manualEntry.importDescription"
                            field="importDescription"
                            onValid={(valid) => setIsValidListname(valid)}
                            apiCallback={checkImportDescriptionExists}
                            condition={(data) => {
                                const { status, message } = data;
                                if (status) return false;
                                else if (!status && message === 'Import description does not exist') return true;
                                else return false;
                            }}
                            extraPayload={{ listType: 5 }}
                            rules={LIST_NAME_RULES(ENTER_IMPORT_DESCRIPTION)}
                            customErrorMessage={ENTER_IMPORT_DESCRIPTION}
                            placeholder={IMPORT_DESCRIPTION}
                            maxLength={MAX_LENGTH50}
                        />
                        {/* <RSInput
                            control={control}
                            name="manualEntry.importDescription"
                            placeholder={IMPORT_DESCRIPTION}
                            required
                            rules={{
                                required: ENTER_DESCRIPTION,
                            }}
                            onKeyDown={charNumUnderScore}
                            handleOnBlur={(e) => {
                                const { value } = e.target;
                            }}
                            maxLength={MAX_LENGTH50}
                        /> */}
                    </Col>
                </Row>
            </div>
            <div className="form-group mb0">
                {/* <Row>
                    <Col sm={12} className="pe-none">
                        <RSCheckbox
                            control={control}
                            name="manualEntry.isColumnHeader"
                            // checked
                            // containerClass={'pe-none'}
                            labelName={FIRSTROW_COLUMN_HEADER}
                            rules={{
                                required: FIRST_ROW_COLUMN_HEADER,
                            }}
                        />
                    </Col>
                </Row> */}
                <Row>
                    <Col className="addAudienceTextarea">
                        <RSTextarea
                            rows={5}
                            control={control}
                            name="manualEntry.audienceData"
                            placeholder={COLUMN_HEADER}
                            rules={{
                                required: ENTER_AUDIENCE_DETAILS,
                            }}
                        />
                        <span className='align-items-center d-flex justify-content-between mt3'>
                            <small className='d-flex align-items-center'>
                                 <i
                                    id="rs_data_circle_info"
                                    className={`${circle_info_mini} icon-xs position-relative color-primary-blue mr5`}
                                ></i>{COLUMN_HEADER_TEXT}</small>
                            <small>{MAXIMUM_1000_ATTRIBUTES}</small>
                            </span>
                    </Col>
                </Row>
                {/* <div
                    className="no-hover flex-vertical-center float-start mt15 cp"
                    onClick={() => {
                        const link = document.createElement('a');
                        const content = sampleDownloadContent;
                        const file = new Blob([content.join('\n')], { type: 'text/plain' });
                        file.text().then((x) => {})
                        link.href = URL.createObjectURL(file);
                        link.download = 'sample.txt';
                        link.click();
                        URL.revokeObjectURL(link.href);
                    }}
                >
                    <i id="rs_data_download" className={`${download_medium} icon-md color-primary-blue`}></i>
                    <small className="color-primary-grey ml5">{DOWNLOAD_SAMPLE}</small>
                </div> */}
            </div>
            {gridData.length > 0 && gridColumns.length > 0 && (
                <div className="mt30">
                    <Row>
                        <Col sm={12}>
                            <CustomKendoGrid
                                data={gridData}
                                column={gridColumns}
                                pageable={true}
                                sortable={true}
                                scrollable={'scrollable'}
                                isListTable={true}
                                config={{ pageSize: 10 }}
                                settings={{ total: gridData.length }}
                                isScrollTop={false}
                                noBoxShadow ={true}
                            />
                        </Col>
                    </Row>
                </div>
            )}
        </>
    );
};

export default ManualEntry;

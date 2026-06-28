import { formatName } from 'Utils/modules/formatters';
import { NOTE_ACTION, SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_edge_mini, circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import _find from 'lodash/find';

import { useFormContext, useWatch } from 'react-hook-form';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';


import {
    BODYCONFIG,
    ASTERISK_ICON,
    SETTINGS_ICON,
    MATRIX_ROW,
    MATRIX_COL,
    mapToItemRender,
    handleAttributeDuplicates,
} from '../../constant';
import SettingsPopup from './SettingsPopup';
import { uniqueId } from 'lodash';

import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import useQueryParams from 'Hooks/useQueryParams';
const Matrix = ({
    index,
    labelName,
    mandatory,
    preview,
    mapTo,
    disabled,
    rowDefaultValue,
    colDefaultValue,
    matrixSub,
    matrixTitle,
    matrix,
    isQrPreview,
    matrixColumnValueType,
}) => {
    const fromId = useQueryParams('/preferences/form-generator/add-form-generator');
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
    const [matrixSettings, setMatrixSettings] = useState({
        checked: true,
    });

    // Helper function to extract plain text from HTML
    const getTextFromHtml = (html) => {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };


    const [label, setlabel] = useState(labelName);
    const [settingsPopup, setSettingsPopup] = useState(false);
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    // const { formState, dispatchState } = useContext(FormGeneratorContext);
    const { tag } = useContext(FormGeneratorContext);
    const [removeState, setRemoveState] = useState({
        removePopup: false,
        removeType: null,
        matrix: null,
    });
    const isInitialMount = useRef(true);
    const hasSetInitialSettings = useRef(false);

    const { tempRows, tempCol } = useMemo(() => {
        let rows = [], cols = [];
        for (let i = 0; i < matrix?.columns?.length; i++) {
            cols?.push({
                id: uniqueId(),
                title: matrixTitle?.[i]?.tinyMceLableHeading,
            });
        }
        for (let i = 0; i < matrix?.rows?.length; i++) {
            let cb = new Array(matrixTitle?.length).fill(0)?.map((ele, i) => matrixSub?.[i]?.[`checkBox${i}`]);
            rows?.push({
                id: uniqueId(),
                title: matrixSub?.[i]?.tinyMceLableHeading,
                checkBox: cb,
            });
        }
        return { tempRows: rows, tempCol: cols };
    }, [matrix?.columns?.length, matrix?.rows?.length, matrixTitle, matrixSub]);

    const isEdit = watch('isEdit');
    // const [allCol, setAllCol] = useState(preview ? matrixTitle : isEdit ? tempCol : MATRIX_COL);

    // const [allData, setAllData] = useState(preview ? matrixSub : isEdit ? tempRows : MATRIX_ROW);
    const [allCol, setAllCol] = useState(() => {
        if (preview) return matrixTitle;
        const rhfCols = getValues(`formGenerator[${index}].matrix.columns`);
        if (rhfCols && rhfCols.length > 0) return rhfCols;
        if (matrix?.columns && matrix.columns.length > 0) return matrix.columns;
        if (isEdit && tempCol && tempCol.length > 0) return tempCol;
        return MATRIX_COL;
    });
    const [allData, setAllData] = useState(() => {
        if (preview) return matrixSub;
        const rhfRows = getValues(`formGenerator[${index}].matrix.rows`);
        if (rhfRows && rhfRows.length > 0) return rhfRows;
        if (matrix?.rows && matrix.rows.length > 0) return matrix.rows;
        if (isEdit && tempRows && tempRows.length > 0) return tempRows;
        return MATRIX_ROW;
    });

    // console.log('colData: ', getValues(`matrixTitle`));
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const handleChangeAtt = ({ target: { value } }) => {
        const formGenerator = getValues('formGenerator');
        let tempMapValue = formGenerator?.map((e) => {
            return e.mapToValue?.attributeName || '';
        });
        if (tempMapValue?.includes(value.attributeName)) {
            setTimeout(() => {
                setError(`formGenerator[${index}].mapToValue`, {
                    type: 'custom',
                    message: `Duplicate attribute`,
                });
            }, 100);
        }
        // else {
        //     if (value?.attributeName === 'New attributes') {
        //         setNewAttributeFlag(true);
        //     }
        // }
    };
    // useEffect(() => {
    //     const [rows, columns] = getValues([
    //         `formGenerator[${index}].matrix.rows`,
    //         `formGenerator[${index}].matrix.columns`,
    //     ]);
    //     if (rows && columns) {
    //         setAllData(rows);
    //         setAllCol(columns);
    //     }
    // }, []);

    // useEffect(() => {
    //     let colIds = allCol.map((col) => col.id);
    //     setAllData((prev) => prev.map((row) => ({ ...row, checkBox: colIds })));
    // }, [allCol]);

    // Update form values when allCol or allData changes
    useEffect(() => {
        if (!preview) {
            setValue(`formGenerator[${index}].matrix.rows`, allData, { shouldValidate: false, shouldDirty: false });
            setValue(`formGenerator[${index}].matrix.columns`, allCol, { shouldValidate: false, shouldDirty: false });
        }
    }, [allCol, allData, preview, index, setValue]);

    // Set initial matrix settings only once on edit mode
    useEffect(() => {
        if (isEdit === true && !hasSetInitialSettings.current) {
            const savedSettings = getValues(`formGenerator[${index}].settings.isChecked`);
            if (savedSettings !== undefined && savedSettings !== null) {
                                setMatrixSettings({
                    checked: savedSettings,
                });
                hasSetInitialSettings.current = true;
            }
        }
    }, [isEdit, index, getValues]);
    // useEffect(() => {
    //     if (preview) {
    //         setAllCol(matrixTitle);
    //         setAllData(matrixSub);
    //         setValue(`formGenerator[${index}].matrix.rows`, matrixSub);
    //         setValue(`formGenerator[${index}].matrix.columns`, matrixTitle);
    //     }
    // }, [preview]);
    // useEffect(() => {
    //     if (!!fromId) {
    //         setAllCol(tempCol);
    //         setAllData(tempRows);
    //         setValue(`formGenerator[${index}].matrix.rows`, tempRows);
    //         setValue(`formGenerator[${index}].matrix.columns`, tempCol);
    //     }
    // }, [!!fromId]);
    // console.log('Cols ::::: ', allCol, matrixTitle);
    // useEffect(() => {
    //     let col = isArray(colData) ? [...colData].pop() : [colData];
    //     let row =  isArray(colData) ? [...colData].pop() : [colData];
    //     setValue(`formGenerator[${index}].colData`, col);
    //     setValue(`formGenerator[${index}].rowData`, row);
    // }, [colData, rowData]);

    const handleColEdit = (e, i, col) => {
        // console.log('Check d3edit :::::: ', e, i, col);
        // // debugger;
        // let temp = [...allCol];
        // temp[i].title = e?.html || 'Column value';
        // setAllCol([...temp]);
    };

    const removeFieldPopup = (type, mat) => {
        setRemoveState({
            removePopup: true,
            removeType: type,
            matrix: mat,
        });
    };
    const removeField = (type, mat) => {
        const formGenerator = getValues('formGenerator');
        if (type === 'column') {
            // let temp = [...allCol];
            let temp = [...formGenerator[index].matrixTitle];
            temp.forEach((item, index) => {
                if (index === mat) {
                    temp.splice(index, 1);
                }
            });
            let temp1 = [...allCol];
            temp1.pop();
            setAllCol(temp1);
            setValue(`formGenerator[${index}].matrixTitle`, temp);
            //  temp.splice(mat, 1);
            // setAllCol([...temp]);
            setAllData((prev) => {
                const updatedRows = prev.map((row) => {
                    const updatedCheckBoxes = [...row.checkBox];
                    updatedCheckBoxes.pop();
                    return { ...row, checkBox: updatedCheckBoxes };
                });
                return updatedRows;
            });
        } else if (type === 'row') {
            // setAllData((prev) => prev.filter((rmRow) => rmRow.id !== mat.id));
            let temp = [...formGenerator[index].matrixSub];
            temp.forEach((item, index) => {
                if (index === mat) {
                    temp.splice(index, 1);
                }
            });
            let temp1 = [...allData];
            temp1.pop();
            setAllData(temp1);
            setValue(`formGenerator[${index}].matrixSub`, temp);
            //  temp.splice(mat, 1);
        }
        setRemoveState({
            removePopup: false,
        });
    };

    // Initialize radio and settings on mount only
    useEffect(() => {
        if (!preview && isInitialMount.current) {
            const formGenerator = getValues('formGenerator');
            const radioCheck = formGenerator[index]?.settings?.isChecked;
            setValue(`formGenerator[${index}].radio`, '', { shouldValidate: false });
            setValue(`formGenerator[${index}].settings.isChecked`, isEdit ? radioCheck : true, { shouldValidate: false });
            isInitialMount.current = false;
        }
    }, [preview, isEdit, index, setValue, getValues]);

    // Only watch the specific settings field we need
    const watchedSettings = useWatch({ control, name: `formGenerator[${index}].settings.isChecked` });
    const settings = useMemo(() => {
        return isQrPreview ? matrixColumnValueType : watchedSettings;
    }, [isQrPreview, matrixColumnValueType, watchedSettings]);

    // Watch matrix titles and subs for tooltips - do it once at component level
    const watchedMatrixTitles = useWatch({ control, name: `formGenerator[${index}].matrixTitle` });
    const watchedMatrixSubs = useWatch({ control, name: `formGenerator[${index}].matrixSub` });
    const watchedRadio = useWatch({ control, name: `formGenerator[${index}].radio` });

    return (
        <div
            className={` ${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'matrix-required' : 'matrix-optional'
                }`}
        >
            <div className={`rs-form-element-wrapper rsfch-multi-top `}>
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label`}>
                        <RSEditorPopup
                            name={`formGenerator[${index}].tinyMceLableMain`}
                            control={control}
                            initialValue={label}
                            init={BODYCONFIG}
                            disabled={preview}
                            required
                            minChars={tag === 'Survey' ? 3 : 3}
                            maxChars={120}
                            rules={{
                                required: THIS_FIELD_IS_REQUIRED,
                                validate: (data) => (!!data ? true : THIS_FIELD_IS_REQUIRED),
                            }}
                        />
                        {mandatory && preview && <span className="rs-form-mandatory">*</span>}
                    </div>
                    {preview && (
                         <div className={`form-group mb0 mt20 rs-form-builder-matrix-table-wrapper matrixbottom ${preview && getValues()?.isProgressiveProfiling ? ' css-scrollbar overflow-auto' : preview ? 'css-scrollbar overflow-auto' : ""}`}>
                <table width={'100%'} cellPadding={'0'} cellSpacing={'0'} className={`rs-form-builder-matrix-table ${preview ? 'pe-none' : ''}`}>
                    <thead>
                        <tr>
                            <td></td>
                            {allCol.map((col, i) => {
                                const currentColValue = watchedMatrixTitles?.[i]?.tinyMceLableHeading;
                                const colTooltipText = currentColValue ? getTextFromHtml(currentColValue) : '';

                                return (
                                    <td key={col + i}>
                                        {colTooltipText && !preview ? (
                                            <RSTooltip position="top" text={colTooltipText} className="matrix-cell-tooltip"  {...(colTooltipText?.length > 28 ? {} : { show: false })}
                                            >
                                                <div
                                                    className="matrix-cell-wrapper"
                                                >
                                                    <RSEditorPopup
                                                        name={`formGenerator[${index}].matrixTitle.${i}.tinyMceLableHeading`}
                                                        control={control}
                                                        {...(!preview
                                                            ? {
                                                                initialValue: getValues(`formGenerator[${index}].matrixTitle.${i}.tinyMceLableHeading`) || col?.title,
                                                            }
                                                            : {
                                                                initialValue: col?.tinyMceLableHeading || colDefaultValue,
                                                            })}
                                                        init={BODYCONFIG}
                                                        disabled={preview}
                                                        required
                                                        handleChange={(e) => {
                                                            handleColEdit(e, i, col);
                                                        }}
                                                        rules={{
                                                            required: THIS_FIELD_IS_REQUIRED,
                                                            validate: (data) => (!!data ? true : THIS_FIELD_IS_REQUIRED),
                                                        }}
                                                        iscustomWidth={i > 1 ? true : false}
                                                    />
                                                </div>
                                            </RSTooltip>
                                        ) : (
                                            <div
                                                className="matrix-cell-wrapper"
                                            >
                                                <RSEditorPopup
                                                    name={`formGenerator[${index}].matrixTitle.${i}.tinyMceLableHeading`}
                                                    control={control}
                                                    {...(!preview
                                                        ? {
                                                            initialValue: getValues(`formGenerator[${index}].matrixTitle.${i}.tinyMceLableHeading`) || col?.title,
                                                        }
                                                        : {
                                                            initialValue: col?.tinyMceLableHeading || colDefaultValue,
                                                        })}
                                                    init={BODYCONFIG}
                                                    disabled={preview}
                                                    required
                                                    handleChange={(e) => {
                                                        handleColEdit(e, i, col);
                                                    }}
                                                    rules={{
                                                        required: THIS_FIELD_IS_REQUIRED,
                                                        validate: (data) => (!!data ? true : THIS_FIELD_IS_REQUIRED),
                                                    }}
                                                    iscustomWidth={i > 1 ? true : false}
                                                />
                                            </div>
                                        )}
                                        {!preview && (
                                            <>
                                                <RSTooltip position="top" text="Remove column" className='rsfbmt-column-remove'>
                                                    <i
                                                        id="rs_data_circle_minus_fill_edge"
                                                        className={`${circle_minus_fill_edge_mini
                                                            } icon-mini color-primary-red  ${allCol?.length === 1 ? 'hide' : ''
                                                            }`}
                                                        onClick={() => {
                                                            // setAllCol((prev) =>
                                                            //     prev.filter((rmCol) => rmCol.id !== col.id),
                                                            // );
                                                            // let temp = [...allCol];
                                                            // temp.splice(i, 1);
                                                            // setAllCol([...temp]);
                                                            removeFieldPopup('column', i);
                                                        }}
                                                    ></i>
                                                </RSTooltip>
                                                <RSTooltip position="top" text="Add column" className='rsfbmt-column-add'>
                                                    <i
                                                        id="rs_data_circle_plus_fill_edge"
                                                        className={`${circle_plus_fill_edge_medium
                                                            } icon-md color-primary-blue  ${allCol?.length >= 5 ? 'click-off' : ''
                                                            }`}
                                                        onClick={() => {
                                                            setAllCol((prev) => [
                                                                ...prev,
                                                                {
                                                                    id: uuid(),
                                                                    title: 'Column value',
                                                                },
                                                            ]);
                                                            setAllData((prev) => {
                                                                const updatedRows = prev.map((row) => ({
                                                                    ...row,
                                                                    checkBox: [...row.checkBox, { id: uuid() }],
                                                                }));
                                                                return updatedRows;
                                                            });
                                                        }}
                                                    />
                                                </RSTooltip>
                                            </>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {allData.map((mat, ind, row) => {
                            const currentRowValue = watchedMatrixSubs?.[ind]?.tinyMceLableHeading;
                            const rowTooltipText = currentRowValue ? getTextFromHtml(currentRowValue) : '';

                            return (
                                <tr key={'col' + ind}>
                                    <td className={allCol?.length > 3 ? 'm-width' : ''}>
                                        {rowTooltipText && !preview ? (
                                            <RSTooltip position="top" text={rowTooltipText} className="matrix-cell-tooltip" {...(rowTooltipText?.length > 23 ? {} : { show: false })}>
                                                <div
                                                    className="matrix-cell-wrapper"
                                                >
                                                    <RSEditorPopup
                                                        name={`formGenerator[${index}].matrixSub.${ind}.tinyMceLableHeading`}
                                                        control={control}
                                                        {...(!preview
                                                            ? {
                                                                initialValue: getValues(`formGenerator[${index}].matrixSub.${ind}.tinyMceLableHeading`) || rowDefaultValue,
                                                            }
                                                            : {
                                                                initialValue: mat?.title || rowDefaultValue,
                                                            })}
                                                        init={BODYCONFIG}
                                                        disabled={preview}
                                                        required
                                                        rules={{
                                                            required: THIS_FIELD_IS_REQUIRED,
                                                            validate: (data) => (!!data ? true : THIS_FIELD_IS_REQUIRED),
                                                        }}
                                                    />
                                                </div>
                                            </RSTooltip>
                                        ) : (
                                            <div
                                                className="matrix-cell-wrapper"
                                            >
                                                <RSEditorPopup
                                                    name={`formGenerator[${index}].matrixSub.${ind}.tinyMceLableHeading`}
                                                    control={control}
                                                    {...(!preview
                                                        ? {
                                                            initialValue: getValues(`formGenerator[${index}].matrixSub.${ind}.tinyMceLableHeading`) || rowDefaultValue,
                                                        }
                                                        : {
                                                            initialValue: mat?.title || rowDefaultValue,
                                                        })}
                                                    init={BODYCONFIG}
                                                    disabled={preview}
                                                    required
                                                    rules={{
                                                        required: THIS_FIELD_IS_REQUIRED,
                                                        validate: (data) => (!!data ? true : THIS_FIELD_IS_REQUIRED),
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {!preview && (
                                            <RSTooltip position="top" text="Remove row" className='rsfbmt-row-remove'>
                                                <i
                                                    id="rs_data_circle_minus_fill_edge"
                                                    className={`${circle_minus_fill_edge_mini
                                                        } icon-mini color-primary-red ${allData?.length === 1 ? 'hide' : ''
                                                        }`}
                                                    // onClick={() => {
                                                    //     setAllData((prev) =>
                                                    //         prev.filter((rmRow) => rmRow.id !== mat.id),
                                                    //     );
                                                    // }}
                                                    // onClick={() => removeFieldPopup('row', mat)}
                                                    onClick={() => removeFieldPopup('row', ind)}
                                                ></i>
                                            </RSTooltip>
                                        )}
                                    </td>
                                    {mat?.checkBox?.map((ck, i) => {
                                        const formName = isQrPreview
                                            ? `formGenerator[${index}]`
                                            : `formGenerator[${index}].matrixSub[${ind}].checkBox${i}`;

                                        return (
                                            <td key={ck + i}>
                                                <div className="text-center">
                                                    {/* <RSCheckbox
                                                        className="smaller"
                                                        name={`formGenerator[${index}].matrixSub[${ind}].checkBox${i}`}
                                                        control={control}
                                                    /> */}
                                                    {matrixSettings?.checked ? (
                                                        <RSCheckbox
                                                            className="smaller"
                                                            name={`formGenerator[${index}].matrixSub[${ind}].checkBox${i}`}
                                                            control={control}
                                                            labelClass="mr0"
                                                        />
                                                    ) : (
                                                        <RSRadioButton
                                                            control={control}
                                                            name={formName}
                                                            defaultValue={watchedRadio}
                                                            // labelName={`formGenerator[${index}].options[${ind}].radio`}
                                                            isLabel={false}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}

                                    {ind + 1 === row?.length && !preview && (
                                        <RSTooltip position="top" text="Add row" className='rsfbmt-row-add'>
                                            <i
                                                className={`${circle_plus_fill_edge_medium
                                                    } icon-md color-primary-blue  ${allData?.length >= 8 ? 'click-off' : ''
                                                    }`}
                                                onClick={() => {

                                                    setAllData((prev) => [
                                                        ...prev,
                                                        {
                                                            id: uuid(),
                                                            title: 'Row value',
                                                            checkBox: allCol,
                                                        },
                                                    ])
                                                }

                                                }
                                            />
                                        </RSTooltip>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
                    )}
                </div>
                {!preview && (
                    <div className="rs-form-properties-holder">
                        <div className="rsfph-icons">
                            <ul className="rs-list-inline rli-space-5 ">
                                <li>
                                    <RSTooltip position="top" text="Set as mandatory">
                                        <i
                                            name={`formGenerator[${index}].mandatory`}
                                            className={
                                                mandatoryValue
                                                    ? `${ASTERISK_ICON} color-primary-red`
                                                    : `${ASTERISK_ICON} color-secondary-grey`
                                            }
                                            onClick={() => {
                                                setMandatoryValue(!mandatoryValue);
                                                setValue(`formGenerator[${index}].mandatory`, !mandatoryValue);
                                            }}
                                        ></i>
                                    </RSTooltip>
                                </li>
                                <li>
                                    <RSTooltip position="top" text={SETTINGS} className="lh0">
                                        <i
                                            className={`${SETTINGS_ICON} icon-md color-primary-blue`}
                                            onClick={() => setSettingsPopup(true)}
                                        ></i></RSTooltip>
                                    {settingsPopup && (
                                        <SettingsPopup
                                            show={settingsPopup}
                                            onHide={() => setSettingsPopup(false)}
                                            setFieldSettings={setMatrixSettings}
                                            fieldSettings={matrixSettings}
                                            header="Matrix settings"
                                            type={'multiChoice'}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'matrix'}
                                        />
                                    )}
                                </li>
                            </ul>
                        </div>
                        <div className="rsfph-map">
                            <RSKendoDropDown
                                name={`formGenerator[${index}].mapToValue`}
                                data={mapTo}
                                isCustomRender
                                itemRender={(ele, props) => mapToItemRender(ele, props, disabled)}
                                control={control}
                                required
                                textField={'attributeName'}
                                dataItemKey={'dataAttributeId'}
                                label={'Map to'}
                                // handleChange={handleChangeAtt}
                                popupSettings={{
                                    popupClass: `addImportAudienceDropdownListContainer`,
                                }}
                                rules={{
                                    required: THIS_FIELD_IS_REQUIRED,
                                    validate: (data) => {
                                        !!data ? true : THIS_FIELD_IS_REQUIRED;
                                        const formGenerator = getValues('formGenerator');
                                        return handleAttributeDuplicates(formGenerator, data);
                                    },
                                }}
                                footer={
                                    <NewAttributeFormBtn
                                        title="New attribute"
                                        handleModalAttribute={() => setNewAttributeFlag(true)}
                                    />
                                }
                            />
                        </div>
                    </div>
                )}
            </div>

           {!preview && (
              <div className={`form-group mb0 mt20 rs-form-builder-matrix-table-wrapper matrixbottom ${preview && getValues()?.isProgressiveProfiling ? ' css-scrollbar overflow-auto' : preview ? 'css-scrollbar overflow-auto' : ""}`}>
                <table width={'100%'} cellPadding={'0'} cellSpacing={'0'} className={`rs-form-builder-matrix-table ${preview ? 'pe-none' : ''}`}>
                    <thead>
                        <tr>
                            <td></td>
                            {allCol.map((col, i) => {
                                const currentColValue = watchedMatrixTitles?.[i]?.tinyMceLableHeading;
                                const colTooltipText = currentColValue ? getTextFromHtml(currentColValue) : '';

                                return (
                                    <td key={col + i}>
                                        {colTooltipText && !preview ? (
                                            <RSTooltip position="top" text={colTooltipText} className="matrix-cell-tooltip"  {...(colTooltipText?.length > 28 ? {} : { show: false })}
                                            >
                                                <div
                                                    className="matrix-cell-wrapper"
                                                >
                                                    <RSEditorPopup
                                                        name={`formGenerator[${index}].matrixTitle.${i}.tinyMceLableHeading`}
                                                        control={control}
                                                        {...(!preview
                                                            ? {
                                                                initialValue: getValues(`formGenerator[${index}].matrixTitle.${i}.tinyMceLableHeading`) || col?.title,
                                                            }
                                                            : {
                                                                initialValue: col?.tinyMceLableHeading || colDefaultValue,
                                                            })}
                                                        init={BODYCONFIG}
                                                        disabled={preview}
                                                        required
                                                        handleChange={(e) => {
                                                            handleColEdit(e, i, col);
                                                        }}
                                                        rules={{
                                                            required: THIS_FIELD_IS_REQUIRED,
                                                            validate: (data) => (!!data ? true : THIS_FIELD_IS_REQUIRED),
                                                        }}
                                                        iscustomWidth={i > 1 ? true : false}
                                                    />
                                                </div>
                                            </RSTooltip>
                                        ) : (
                                            <div
                                                className="matrix-cell-wrapper"
                                            >
                                                <RSEditorPopup
                                                    name={`formGenerator[${index}].matrixTitle.${i}.tinyMceLableHeading`}
                                                    control={control}
                                                    {...(!preview
                                                        ? {
                                                            initialValue: getValues(`formGenerator[${index}].matrixTitle.${i}.tinyMceLableHeading`) || col?.title,
                                                        }
                                                        : {
                                                            initialValue: col?.tinyMceLableHeading || colDefaultValue,
                                                        })}
                                                    init={BODYCONFIG}
                                                    disabled={preview}
                                                    required
                                                    handleChange={(e) => {
                                                        handleColEdit(e, i, col);
                                                    }}
                                                    rules={{
                                                        required: THIS_FIELD_IS_REQUIRED,
                                                        validate: (data) => (!!data ? true : THIS_FIELD_IS_REQUIRED),
                                                    }}
                                                    iscustomWidth={i > 1 ? true : false}
                                                />
                                            </div>
                                        )}
                                        {!preview && (
                                            <>
                                                <RSTooltip position="top" text="Remove column" className='rsfbmt-column-remove'>
                                                    <i
                                                        id="rs_data_circle_minus_fill_edge"
                                                        className={`${circle_minus_fill_edge_mini
                                                            } icon-mini color-primary-red  ${allCol?.length === 1 ? 'hide' : ''
                                                            }`}
                                                        onClick={() => {
                                                            // setAllCol((prev) =>
                                                            //     prev.filter((rmCol) => rmCol.id !== col.id),
                                                            // );
                                                            // let temp = [...allCol];
                                                            // temp.splice(i, 1);
                                                            // setAllCol([...temp]);
                                                            removeFieldPopup('column', i);
                                                        }}
                                                    ></i>
                                                </RSTooltip>
                                                <RSTooltip position="top" text="Add column" className='rsfbmt-column-add'>
                                                    <i
                                                        id="rs_data_circle_plus_fill_edge"
                                                        className={`${circle_plus_fill_edge_medium
                                                            } icon-md color-primary-blue  ${allCol?.length >= 5 ? 'click-off' : ''
                                                            }`}
                                                        onClick={() => {
                                                            setAllCol((prev) => [
                                                                ...prev,
                                                                {
                                                                    id: uuid(),
                                                                    title: 'Column value',
                                                                },
                                                            ]);
                                                            setAllData((prev) => {
                                                                const updatedRows = prev.map((row) => ({
                                                                    ...row,
                                                                    checkBox: [...row.checkBox, { id: uuid() }],
                                                                }));
                                                                return updatedRows;
                                                            });
                                                        }}
                                                    />
                                                </RSTooltip>
                                            </>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {allData.map((mat, ind, row) => {
                            const currentRowValue = watchedMatrixSubs?.[ind]?.tinyMceLableHeading;
                            const rowTooltipText = currentRowValue ? getTextFromHtml(currentRowValue) : '';

                            return (
                                <tr key={'col' + ind}>
                                    <td className={allCol?.length > 3 ? 'm-width' : ''}>
                                        {rowTooltipText && !preview ? (
                                            <RSTooltip position="top" text={rowTooltipText} className="matrix-cell-tooltip" {...(rowTooltipText?.length > 23 ? {} : { show: false })}>
                                                <div
                                                    className="matrix-cell-wrapper"
                                                >
                                                    <RSEditorPopup
                                                        name={`formGenerator[${index}].matrixSub.${ind}.tinyMceLableHeading`}
                                                        control={control}
                                                        {...(!preview
                                                            ? {
                                                                initialValue: getValues(`formGenerator[${index}].matrixSub.${ind}.tinyMceLableHeading`) || rowDefaultValue,
                                                            }
                                                            : {
                                                                initialValue: mat?.title || rowDefaultValue,
                                                            })}
                                                        init={BODYCONFIG}
                                                        disabled={preview}
                                                        required
                                                        rules={{
                                                            required: THIS_FIELD_IS_REQUIRED,
                                                            validate: (data) => (!!data ? true : THIS_FIELD_IS_REQUIRED),
                                                        }}
                                                    />
                                                </div>
                                            </RSTooltip>
                                        ) : (
                                            <div
                                                className="matrix-cell-wrapper"
                                            >
                                                <RSEditorPopup
                                                    name={`formGenerator[${index}].matrixSub.${ind}.tinyMceLableHeading`}
                                                    control={control}
                                                    {...(!preview
                                                        ? {
                                                            initialValue: getValues(`formGenerator[${index}].matrixSub.${ind}.tinyMceLableHeading`) || rowDefaultValue,
                                                        }
                                                        : {
                                                            initialValue: mat?.title || rowDefaultValue,
                                                        })}
                                                    init={BODYCONFIG}
                                                    disabled={preview}
                                                    required
                                                    rules={{
                                                        required: THIS_FIELD_IS_REQUIRED,
                                                        validate: (data) => (!!data ? true : THIS_FIELD_IS_REQUIRED),
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {!preview && (
                                            <RSTooltip position="top" text="Remove row" className='rsfbmt-row-remove'>
                                                <i
                                                    id="rs_data_circle_minus_fill_edge"
                                                    className={`${circle_minus_fill_edge_mini
                                                        } icon-mini color-primary-red ${allData?.length === 1 ? 'hide' : ''
                                                        }`}
                                                    // onClick={() => {
                                                    //     setAllData((prev) =>
                                                    //         prev.filter((rmRow) => rmRow.id !== mat.id),
                                                    //     );
                                                    // }}
                                                    // onClick={() => removeFieldPopup('row', mat)}
                                                    onClick={() => removeFieldPopup('row', ind)}
                                                ></i>
                                            </RSTooltip>
                                        )}
                                    </td>
                                    {mat?.checkBox?.map((ck, i) => {
                                        const formName = isQrPreview
                                            ? `formGenerator[${index}]`
                                            : `formGenerator[${index}].matrixSub[${ind}].checkBox${i}`;

                                        return (
                                            <td key={ck + i}>
                                                <div className="text-center">
                                                    {/* <RSCheckbox
                                                        className="smaller"
                                                        name={`formGenerator[${index}].matrixSub[${ind}].checkBox${i}`}
                                                        control={control}
                                                    /> */}
                                                    {matrixSettings?.checked ? (
                                                        <RSCheckbox
                                                            className="smaller"
                                                            name={`formGenerator[${index}].matrixSub[${ind}].checkBox${i}`}
                                                            control={control}
                                                            labelClass="mr0"
                                                        />
                                                    ) : (
                                                        <RSRadioButton
                                                            control={control}
                                                            name={formName}
                                                            defaultValue={watchedRadio}
                                                            // labelName={`formGenerator[${index}].options[${ind}].radio`}
                                                            isLabel={false}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}

                                    {ind + 1 === row?.length && !preview && (
                                        <RSTooltip position="top" text="Add row" className='rsfbmt-row-add'>
                                            <i
                                                className={`${circle_plus_fill_edge_medium
                                                    } icon-md color-primary-blue  ${allData?.length >= 8 ? 'click-off' : ''
                                                    }`}
                                                onClick={() => {

                                                    setAllData((prev) => [
                                                        ...prev,
                                                        {
                                                            id: uuid(),
                                                            title: 'Row value',
                                                            checkBox: allCol,
                                                        },
                                                    ])
                                                }

                                                }
                                            />
                                        </RSTooltip>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
           )}
            {newAttributeFlag && (
                <NewAttributeModal
                    show={newAttributeFlag}
                    handleClose={() => {
                        setNewAttributeFlag(false);
                    }}
                    catType={''}
                    addAudience={false}
                    handleSaveAttribute={async (data) => {
                        let res = await dispatch(saveDataAttribute(data, false));
                        if (res?.status) {
                            setNewAttributeFlag(false);
                            const payload = {
                                departmentId,
                                clientId,
                                userId,
                            };
                            let attrs = await dispatch(getDataAttributes(payload, true));
                            if (attrs?.status) {
                                const currAttr = _find(attrs?.data, (item) => formatName(item?.uIPrintableName) === formatName(data?.name));
                                setValue(`formGenerator[${index}].mapToValue`, currAttr);
                                clearErrors(`formGenerator[${index}].mapToValue`);
                            }
                        }
                    }}
                />
            )}
            <RSModal
                show={removeState.removePopup}
                size="md"
                header={'Confirmation'}
                isCloseButton={false}
                body={
                    <>
                        <h4 className="text-center mb5">
                            Are you sure you want to delete this{' '}
                            {removeState.removeType === 'column' ? 'column' : 'row'}?
                        </h4>
                        <small className="text-center">
                            <p>{NOTE_ACTION}</p>
                        </small>
                    </>
                }
                footer={
                    <div className="buttons-holder mt10">
                        <RSSecondaryButton
                            onClick={() => {
                                setRemoveState({
                                    removePopup: false,
                                });
                            }}
                        >
                            No
                        </RSSecondaryButton>
                        <RSPrimaryButton onClick={() => removeField(removeState.removeType, removeState.matrix)}>
                            Yes
                        </RSPrimaryButton>
                    </div>
                }
            />
        </div>
    );
};

export default memo(Matrix);

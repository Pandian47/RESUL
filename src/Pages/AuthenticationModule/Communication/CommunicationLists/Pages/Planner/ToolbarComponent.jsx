import { MM_LIST, MM_MONTHS, YEAR_AFTER_LIST, YEAR_BELOW_LIST } from 'Utils/modules/dateTime';
import { getUserDetails } from 'Utils/modules/crypto';
import { NO_EVENTS_IN_MONTH } from 'Constants/GlobalConstant/Placeholders';
import { arrow_left_mini, arrow_right_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { RSButton } from 'Components/Buttons';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { MONTH_LIST, getCurrentMonthDate, getMonthDate } from './constants';
import { useSelector } from 'react-redux';
import _find from 'lodash/find';
import moment from 'moment/moment';
import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';

const ToolbarComponent = ({
    control,
    reset,
    setPayload,
    setCurrentDate,
    currentDate,
    onNavigate,
    date,
    watch,
    render,
}) => {
    const { plannerData } = useSelector(({ plannerReducer }) => plannerReducer);
    const { createdDate } = getUserDetails();

    const [month, year] = watch(['month', 'year']);
    const [u_Months, setU_Months] = useState([]);
    const handlePreviousAndNext = (type) => {
        if (type === 'today') {
            onNavigate('TODAY');
        } else {
            const direction = type === 'next' ? 'NEXT' : 'PREV';
            onNavigate(direction);
        }
        const getDateValue = getMonthDate(currentDate, type);
        handleChangeDate(getDateValue);
        setCurrentDate(getDateValue);
        reset((pre) => ({
            ...pre,
            month: _find(MONTH_LIST, ['month', getDateValue.getMonth()]).title,
            year: getDateValue.getFullYear(),
        }));
    };

    const handleMonthAndYear = (selectedField, type) => {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        let newDate;
        let newMonths;

        if (createdDate && type === 'year') {
            let selectedYear = selectedField?.value;

            const createdMonth = new Date(createdDate).getMonth() || 0;

            // if (new Date(createdDate).getFullYear() === new Date().getFullYear()) {
            //     newMonths = MM_MONTHS_NEW();
            // } else if (new Date().getFullYear() === selectedYear) {
            //     newMonths = MM_MONTHS_NEW();
            // } else if (
            //     new Date(createdDate).getFullYear() !== new Date().getFullYear() &&
            //     new Date(createdDate).getFullYear() === selectedYear
            // ) {
            //     newMonths = MM_MONTHS(createdMonth);
            // } else if (
            //     new Date(createdDate).getFullYear() !== new Date().getFullYear() &&
            //     new Date(createdDate).getFullYear() < selectedYear
            // ) {
            //     newMonths = MM_LIST;
            // } else {
            //     newMonths = MM_LIST;
            // }


            if (new Date(createdDate).getFullYear() === selectedYear) {
                newMonths = MM_MONTHS(createdMonth);
            } else {
                newMonths = MM_LIST;
            }
            
            reset((state) => ({
                ...state,
                month: selectedYear > year ? newMonths[0] : newMonths[newMonths?.length - 1],
            }));
        }
        if (type === 'month') {
            const newMonth = _find(MONTH_LIST, ['title', selectedField?.value]);
            newDate = new Date(currentYear, newMonth?.month, currentDate.getDate());
        } else if (type === 'year') {
            const newMonth = _find(MONTH_LIST, ['title', newMonths[newMonths?.length - 1]]);
            newDate = new Date(parseInt(selectedField?.value, 10), newMonth?.month, currentDate.getDate());
        }
        setCurrentDate(newDate);
        handleChangeDate(newDate);
        onNavigate('GOTO_DATE', newDate);
    };

    useEffect(() => {
        if (!createdDate || !year) setU_Months(MM_LIST);
        const created = new Date(createdDate);
        const createdYear = created.getFullYear();
        const createdMonth = created.getMonth();
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        // if (createdYear === currentYear) {
        //     setU_Months(MM_MONTHS(createdMonth));
        //     //setU_Months(MM_MONTHS_NEW()?.slice(createdMonth, currentMonth + 1));
        // } else if (currentYear === year) {
        //     setU_Months(MM_MONTHS_NEW());
        // } else if (createdYear === year) {
        //     return setU_Months(MM_MONTHS(createdMonth));
        // } else if (createdYear < year) {
        //     return setU_Months(MM_LIST);
        // } else {
        //     return setU_Months(MM_LIST);
        // }


        if (createdYear === year) {
            setU_Months(MM_MONTHS(createdMonth));
            //setU_Months(MM_MONTHS_NEW()?.slice(createdMonth, currentMonth + 1));
        } else {
            return setU_Months(MM_LIST);
        }
    }, [createdDate, year]);
    useOnlyDepChangeEffect(() => {
        if (u_Months?.length > 0 && render?.current) {
            render.current = false;
            const currentMonthName = moment().format('MMMM');
            const monthToSet = u_Months.includes(currentMonthName)
                ? currentMonthName 
                : u_Months[u_Months.length - 1];
            reset((state) => ({
                ...state,
                month: monthToSet,
            }));
        }
    }, [u_Months]);

    const handleChangeDate = async (crtDate) => {
        const currentDate = getCurrentMonthDate(crtDate);
        await setPayload((pre) => ({
            ...pre,
            startDate: currentDate.startDate,
            endDate: currentDate.endDate,
        }));
    };

    return (
        <>
            <div className="rbcc-toolbar mb10">
                <div className="rbcct-icons">
                    <ul className="rs-list-inline rli-space-10">
                        <li
                            className={
                                month === new Date(createdDate)?.toLocaleString('default', { month: 'long' }) &&
                                year === new Date(createdDate)?.getFullYear()
                                    ? 'click-off'
                                    : ''
                            }
                        >
                            <RSButton onClick={() => handlePreviousAndNext()}>
                                <i
                                    className={`${arrow_left_mini} icon-mini`}
                                    id="rs_ToolbarComponent_arrowleft"
                                />
                            </RSButton>
                        </li>
                        <li>
                            <RSButton
                                className="rbccti-today"
                                onClick={() => handlePreviousAndNext('today')}
                                id="rs_ToolbarComponent_Today"
                            >{`Today`}</RSButton>
                        </li>
                        <li
                            className={
                                month === u_Months[u_Months?.length -1] &&
                                year === YEAR_AFTER_LIST(createdDate)[YEAR_AFTER_LIST(createdDate)?.length -1]
                                    ? 'click-off'
                                    : ''
                            }
                        >
                            <RSButton onClick={() => handlePreviousAndNext('next')}>
                                <i
                                    className={`${arrow_right_mini} icon-mini`}
                                    id="rs_ToolbarComponent_arrowright"
                                />
                            </RSButton>
                        </li>
                    </ul>
                </div>
                <div className="rbcct-dates">
                    <ul className="rs-list-inline rli-space-20">
                        <li>
                            <RSKendoDropdown
                                name={'month'}
                                data={u_Months}
                                control={control}
                                handleChange={(selectedMonth) => {
                                    handleMonthAndYear(selectedMonth, 'month');
                                }}
                                className={'kendo-dd-size-2 fs-19'}
                                defaultValue={u_Months[u_Months?.length - 1]}
                                noBottomBorder
                            />
                        </li>
                        <li>
                            <RSKendoDropdown
                                name={'year'}
                                data={YEAR_AFTER_LIST(createdDate)}
                                control={control}
                                defaultValue={
                                    YEAR_BELOW_LIST(new Date().getFullYear() - new Date(createdDate).getFullYear())?.[
                                        YEAR_BELOW_LIST(new Date().getFullYear() - new Date(createdDate).getFullYear())
                                            ?.length - 1
                                    ]
                                }
                                handleChange={(selectedYear) => {
                                    handleMonthAndYear(selectedYear, 'year');
                                }}
                                className={'kendo-dd-size-3'}
                                noBottomBorder
                            />
                        </li>
                    </ul>
                </div>
            </div>
            {plannerData?.length === 0 && <span className="text-center">{NO_EVENTS_IN_MONTH}</span>}
        </>
    );
};

export default ToolbarComponent;

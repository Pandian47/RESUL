import { delete_medium, duplicate_medium, eye_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { guid } from '@progress/kendo-react-common';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Scheduler, MonthView, AgendaView } from '@progress/kendo-react-scheduler';

import MonthViewSlot from './MonthViewScheduler/MonthViewScheduler';

import { customModelFields } from './constant';

const PostScheduler = ({ schedulerProps, defaultView = 'agenda', data: schedule, onDuplicate = () => {}, onDelete = () => {}, onEdit = () => {} }) => {
    const [data, setData] = useState(schedule);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        setData(schedule);
    }, [schedule]);

    const handleDateChange = useCallback((event) => setDate(event.value), [setDate]);

    const handleDataChange = useCallback(
        ({ created, updated, deleted }) => {
            setData((old) =>
                old
                    .filter((item) => deleted.find((current) => current.taskId === item.taskId) === undefined)
                    .map((item) => updated.find((current) => current.taskId === item.taskId) || item)
                    .concat(
                        created.map((item) =>
                            Object.assign({}, item, {
                                taskId: guid(),
                            }),
                        ),
                    ),
            );
        },
        [setData],
    );

    const customViewAgendaTask = useCallback(({ dataItem }) => {
        const { title, time, text } = dataItem;
        return (
            <Fragment>
                <div className="rs-scheduler-content-wrapper">
                    <div className="rsscw-time">{time}</div>
                    <div className="rsscw-post">
                        <h3 className="rsscwp-title">{title}</h3>
                        <div className="rsscwp-description">{parse(text)}</div>
                    </div>
                    <div className="rsscw-icons">
                        <OverlayTrigger
                            overlay={
                                <Popover>
                                    <Popover.Body>{title}</Popover.Body>
                                </Popover>
                            }
                            placement="top"
                        >
                            <i className={`${eye_medium} icon-md`}   id='rs_data_eye' />
                        </OverlayTrigger>
                        <i className={`${pencil_edit_medium} icon-md`} onClick={() => onEdit(dataItem)} id='rs_data_pencil_edit' />
                        <i className={`${duplicate_medium} icon-md`} onClick={() => onDuplicate(dataItem)} />
                        <i className={`${delete_medium} icon-md`} onClick={() => onDelete(dataItem?.taskId)} id="rs_data_delete" />
                    </div>
                </div>
            </Fragment>
        );
    }, []);

    return (
        <Scheduler
            data={data}
            date={date}
            onDataChange={handleDataChange}
            onDateChange={handleDateChange}
            modelFields={customModelFields}
            defaultView={defaultView}
            {...schedulerProps}
        >
            <AgendaView numberOfDays={1} title="Day" viewTask={customViewAgendaTask} />
            <MonthView viewSlot={MonthViewSlot} />
        </Scheduler>
    );
};

PostScheduler.propTypes = {};

export default PostScheduler;

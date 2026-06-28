import { SELECT_CAMPAIN } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import expand from 'Assets/Images/expand-all-mini.svg';
import collapse from 'Assets/Images/collapse-all-mini.svg';
import { square_minus_fill_medium, square_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSFlowChart from 'Components/RSFlowChart';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';

import { goalSettingsAccord, goalSettingsCampaignDropdown } from '../../../constants';

const GoalSettings = () => {
    const [activeKey, setActiveKey] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const { control } = useForm();

    const handleAccord = (key) => {
        if (key) {
            if (activeKey.includes(key)) setActiveKey(activeKey.filter((accord) => accord !== key));
            else setActiveKey([...activeKey, key]);
        } else {
            if (activeKey?.length === goalSettingsAccord?.length) setActiveKey([]);
            else setActiveKey(goalSettingsAccord.map((_, ind) => ind.toString()));
        }
    };

    return (
        <Fragment>
            <div className="d-flex justify-content-end">
                <RSTooltip text={`${activeKey?.length > 0 ? 'Collapse all' : 'Expand all'}`} position="top">
                    <img
                        src={activeKey?.length > 0 ? collapse : expand}
                        alt="expandcollapse"
                        width="25"
                        height="25"
                        onClick={() => handleAccord()}
                    />
                </RSTooltip>
            </div>
            <Accordion alwaysOpen activeKey={activeKey}>
                {goalSettingsAccord?.map((goal, index) => {
                    return (
                        <Accordion.Item eventKey={index.toString()} key={goal.title}>
                            <Accordion.Header onClick={() => handleAccord(index.toString())}>
                                <i
                                    className={`${
                                        activeKey?.includes(index.toString())
                                            ? square_minus_fill_medium
                                            : square_plus_fill_medium
                                    } mr5`}
                                />
                                {goal.title}
                            </Accordion.Header>
                            <Accordion.Body>
                                <RSFlowChart
                                    chartData={goal.chartData}
                                    actionMenus={['Add to communication']}
                                    onEdgeClick={setShowModal}
                                />
                                {/* <p className="position-absolute bottom0 right10">(Last action performed on: {goal.updatedOn})</p> */}
                            </Accordion.Body>
                        </Accordion.Item>
                    );
                })}
            </Accordion>
            <RSModal
                show={showModal ? true : false}
                handleClose={() => setShowModal(false)}
                isBorder
                header="Add to communication"
                footer={
                    <span>
                        <RSPrimaryButton onClick={() => setShowModal(false)} type="submit">
                            Save
                        </RSPrimaryButton>
                    </span>
                }
                body={
                    <Fragment>
                        <p>Select your communication name</p>
                        <RSMultiSelect
                            name="Communication"
                            data={goalSettingsCampaignDropdown}
                            control={control}
                            placeholder={SELECT_CAMPAIN}
                            label={''}
                        />
                    </Fragment>
                }
            />
        </Fragment>
    );
};

export default GoalSettings;

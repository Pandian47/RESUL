import { Fragment, useEffect, useState } from 'react';
import _get from 'lodash/get';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import RSTabbarFluid from 'Components/RSTabberFluid';

import DedupeModal from 'Pages/AuthenticationModule/Components/DedupeModal';
import { leftAttWealth, rightAttWealth, rightAtt_crm } from 'Pages/AuthenticationModule/Preferences/Pages/DataExchange/data';
import { COLUMN_DATA_DEDUPE } from './constants';
import { useNavigate } from 'react-router-dom';
// import AttributeListBox from './AttributeListBox';
// import Preview from './Preview';

const dropVal = [
    { selectedKey: 'All', selectedKeyId: 0 },
    { selectedKey: 'User details', selectedKeyId: 1 },
    { selectedKey: 'Fixed deposit data', selectedKeyId: 2 },
];

const TableAttributes = ({
    leftAtt,
    rightAtt,
    connectType,
    tabledetails,
    tabs = [],
    type = '',
    getCard,
    setConnectFlag,
}) => {
    const dispatch = useDispatch();
    const { control, watch } = useForm();
    const navigate = useNavigate();
    const [connectionVal] = watch(['connection type']);
    const connection = _get(connectionVal, 'typeId', null);
    // const [connection, setConnections] = useState(null);
    const [tableDetail, setTableDetail] = useState(null);
    const [recency, setRecency] = useState(1);
    const [dedupeFlag, setDedupeFlag] = useState(false);
    const [tableName, setTableName] = useState(0);
    const [tableNameFlag, setTableNameFlag] = useState(false);
    const [primaryKey, setprimaryKey] = useState([]);
    const [primaryKeyFlag, setprimaryKeyFlag] = useState(0);
    const [attributes, setAttributes] = useState({
        leftAttributes: leftAtt[`leftAtt_${type}_${1}`],
        rightAttributes: rightAtt_crm,
    });
    const [attributesWealth, setAttributesWealth] = useState({
        leftAttributes: leftAttWealth,
        rightAttributes: rightAttWealth,
    });

    useEffect(() => {
        if (tableDetail === 0) return setAttributes((pre) => ({ ...pre, leftAttributes: [] }));
        if (tableDetail !== null) {
            setprimaryKey([]);
            let obj = leftAtt[`leftAtt_${type}_${tableDetail}`]; //leftAtt_crm_1
                        setAttributes((pre) => ({ ...pre, leftAttributes: obj }));
            setprimaryKey(obj);
        }
    }, [tableDetail]);

 
    return (
        <Fragment>
            {tabs?.length !== 0 && (
                <div className="customTabDesign">
                    <RSTabbarFluid
                        defaultClass={`col-md-4`}
                        dynamicTab={`mb0 mini rst-left-space`}
                        activeClass={`active`}
                        className="rs-tabs row"
                        tabData={[
                            {
                                id: tabs[0],
                                text: tabs[0],
                                component: () => <></>,
                            },
                            {
                                id: tabs[1],
                                text: tabs[1],
                                component: () => <></>,
                            },
                        ]}
                        defaultTab={0}
                    />
                </div>
            )}
            <div className="box-design mb20">
                <form className="card-header"></form>
            </div>

            <DedupeModal
                show={dedupeFlag}
                handleClose={(status) => {
                    setDedupeFlag(status);
                }}
                columnData={COLUMN_DATA_DEDUPE}
            />
        </Fragment>
    );
};

export default TableAttributes;

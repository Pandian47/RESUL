import React from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import { Switch } from '@progress/kendo-react-inputs';
import { truncateTitle } from 'Utils/index';
import RSTooltip from 'Components/RSTooltip';
const WebPermissionGrid = ({ control, loaddata, setValue }) => {
    // const [pageGridChange, setPageGridChange] = React.useState(WEB_PERMISSIONS.data.webPermissionclientnew);
    const [pageGridChange, setPageGridChange] = React.useState(loaddata);
    const [disableElement, setDisableElement] = React.useState(true);
    // const handleChange = (value, index) => {
    //     setPageGridChange((prev) => {
    //         let tempState = [...prev];
    //         if (index === 0 && !value) {
    //             setDisableElement(value);
    //             _map(tempState, (a) => (a.isActive = value));
    //             // tempState.map((a) => (a.isActive = value));
    //         } else if (index === 0 && value) {
    //             setDisableElement(value);
    //             tempState[index].isActive = value;
    //         } else {
    //             tempState[index].isActive = value;
    //         }
    //         return tempState;
    //     });
    // };
    React.useEffect(() => {
        // const tempState = [...WEB_PERMISSIONS.data.webPermissionclientnew];
        const tempState = [...loaddata];
        if (tempState[0].isActive) {
            setDisableElement(true);
        } else {
            setDisableElement(false);
        }
    }, []);

    const handleChange = (value, index) => {
        let temp = [...pageGridChange];
        if (index === 0 && !value) {
            temp = temp.map((item, ind) => ({
                ...item,
                isActive: false
            }));
        }
        else if (index === 0 && value) {
            temp = temp.map((item, ind) => ({
                ...item,
                isActive: true
            }));
        }
        else {
            temp[index] = { ...temp[index], isActive: value };
            const allOtherItemsOn = temp.slice(1).every(item => item.isActive);
            const allOtherItemsOff = temp.slice(1).every(item => !item.isActive);
            
            if (allOtherItemsOn) {
                temp[0] = { ...temp[0], isActive: true };
            } else if (allOtherItemsOff) {
                temp[0] = { ...temp[0], isActive: false };
            }
        }
        setPageGridChange(temp);
        setValue('pageGrid', temp);
    };

    return (
        <div className="rs-grid-border-radius">
            <KendoGrid
                data={pageGridChange}
                pageable={false}
                isDataStateRequired={true}
                // settings={{ total: pageGridChange?.count }}
                column={[
                    {
                        field: 'appName',
                        title: 'alertNotification',
                        filter:'text',
                        cell: ({ dataItem }) => (
                            <td>
                                {dataItem?.appName?.length > 50 ? (
                                    <RSTooltip text={dataItem?.appName} position="top" className="d-inline-block">
                                        <span className="m0">{truncateTitle(dataItem?.appName,50)}</span>
                                    </RSTooltip>
                                ) : (
                                    <span className="m0">{dataItem?.appName}</span>
                                )}
                            </td>
                        ),
                    },
                    {
                        field: 'isActive',
                        title: 'Action',
                        width: '200px',
                        cell: ({ dataItem, dataIndex }) => {
                            return (
                                <td 
                                className='border-start text-right'
                                >
                                    <Switch
                                        onChange={(e) => {
                                            handleChange(e.target.value, dataIndex);
                                        }}
                                        checked={dataItem?.isActive}
                                    />
                                </td>
                            );
                        },
                    },
                ]}
            />
        </div>
    );
};

export default WebPermissionGrid;

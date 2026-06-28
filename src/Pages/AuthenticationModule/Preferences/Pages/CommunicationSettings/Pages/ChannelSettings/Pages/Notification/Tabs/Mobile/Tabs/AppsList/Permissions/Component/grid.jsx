import { useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import { Switch } from '@progress/kendo-react-inputs';
const MobilePermissionGrid = ({ control, loaddata, setValue }) => {
    const [pageGridChange, setPageGridChange] = useState(loaddata);

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
                column={[
                    {
                        field: 'appName',
                        title: 'alertNotification',
                         filter:'text',
                    },
                    {
                        field: 'isActive',
                        title: 'Action',
                        width: '200px',
                        cell: ({ dataItem, dataIndex }) => {
                            return (
                                <td className='border-start text-right'>
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

export default MobilePermissionGrid;

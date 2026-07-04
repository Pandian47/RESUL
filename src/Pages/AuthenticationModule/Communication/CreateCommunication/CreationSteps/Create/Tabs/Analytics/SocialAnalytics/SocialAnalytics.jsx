import { menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { findIndex as _findIndex } from 'Utils/modules/lodashReplacements';
import { useForm } from 'react-hook-form';

import RSCheckbox from 'Components/FormFields/RSCheckbox';
import KendoGrid from 'Components/RSKendoGrid';
import { KendoIconDropdown } from 'Components/RSDropDown';
import RSSwicth from 'Components/FormFields/RSSwitch';

const SocialAnalytics = () => {
    const { control, watch, setValue } = useForm({
        defaultValues: {
            defaultAccount: [],
        },
    });
    const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);

    useEffect(() => {
        setAccounts(['team_resulticks', 'Iphone mobile', 'Fun Games']);
    }, []);

    const defaultAccount = watch('defaultAccount');

    return (
        <Fragment>
            <KendoIconDropdown
                icon={` ${menu_dot_medium}`}
                data={accounts.map((list, listIndex) => {
                    return {
                        id: list,
                        text: (
                            <RSCheckbox control={control} name={`defaultAccount[${listIndex}].name`} labelName={list} />
                        ),
                    };
                })}
                textField={'text'}
                onItemClick={({ itemIndex, item }) => {
                    const currentItemState = defaultAccount[itemIndex].name;
                    if (currentItemState) {
                        const tempAccounts = [...selectedAccounts];
                        const findIndex = _findIndex(tempAccounts, (accounts) => accounts.id === item.id);
                        tempAccounts.splice(findIndex, 1);
                        setValue(`defaultAccount[${findIndex}]`, { name: '' });
                        setSelectedAccounts(tempAccounts);
                    } else {
                        setSelectedAccounts((prev) => [...prev, { ...item }]);
                    }
                    setValue(`defaultAccount[${itemIndex}].name`, !currentItemState);
                }}
                defaultValue={'Default accounts'}
            />
            <div>
                <KendoGrid
                    data={selectedAccounts}
                    column={[
                        { title: 'Configured acounts', field: 'id' },
                        {
                            title: 'Tracking',
                            field: 'sample',
                            cell: ({ dataIndex }) => (
                                <td>
                                    <RSSwicth control={control} name={`defaultAccount[${dataIndex}].tracking`} />
                                </td>
                            ),
                        },
                    ]}
                />
            </div>
        </Fragment>
    );
};

export default SocialAnalytics;

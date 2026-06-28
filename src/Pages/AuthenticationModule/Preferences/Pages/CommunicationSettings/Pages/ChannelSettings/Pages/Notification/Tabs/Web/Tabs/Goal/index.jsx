import { useState } from 'react';
import { Push_WebGoalContext } from './Context';
import WebPushGoalSettingsCreate from './Create';
import WebPushGoalSettingsGrid from './Grid';
import { ACTION_INITIAL_STATE } from './constant';
const Goal = () => {
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const value = { setGridCreate };
    return (
        <Push_WebGoalContext.Provider value={value}>
            {gridCreate.showGrid ? (
                <WebPushGoalSettingsGrid />
            ) : (
                <WebPushGoalSettingsCreate
                    config={gridCreate.pushWebAction.edit.editState}
                    type={gridCreate.pushWebAction.edit.isEdit ? 'edit' : 'create'}
                    handleCancel={(status) => {
                        if (status) {
                            setGridCreate((prev) => ({
                                ...prev,
                                showGrid: status,
                                pushWebAction: {
                                    edit: {
                                        editState: [],
                                        isEdit: false,
                                    },
                                    create: false,
                                },
                            }));
                        }
                    }}
                />
            )}
        </Push_WebGoalContext.Provider>
    );
};

export default Goal;

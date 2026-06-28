import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import KendoGrid from 'Components/RSKendoGrid';
import RSModal from 'Components/RSModal';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

const AdobeAnalyticsModal = () => {
    const { control } = useForm();
    const dispatch = useDispatch();
    const { adobeAnalyticFlag, analytics, integratedSystem, addCard } = useSelector(
        ({ dataExchangeReducer }) => dataExchangeReducer,
    );
    const closeModal = () => {
        dispatch(updateIntegartedSytem({ field: 'adobeAnalyticFlag', data: false }));
    };
    const handleSave = () => {
        dispatch(updateIntegartedSytem({ field: 'adobeAnalyticFlag', data: false }));
        dispatch(updateIntegartedSytem({ field: 'connectFields', data: addCard }));
    };

    return (
        <>
            <RSModal
                show={adobeAnalyticFlag}
                header={analytics.name}
                isBorder={true}
                size="md"
                handleClose={closeModal}
                body={
                    <div className="rs-kendo-table-hide-header">
                        <KendoGrid
                            data={analytics.data}
                            noBoxShadow
                            pageable={false}
                            column={[
                                {
                                    field: 'val',
                                    cell: ({ dataItem, dataIndex }) => {
                                        return (
                                            <td>
                                                <div className="rs-scrubbled-data-lable">
                                                    <RSCheckbox
                                                        control={control}
                                                        name={dataItem?.val}
                                                        labelName={dataItem?.val}
                                                    />
                                                </div>
                                            </td>
                                        );
                                    },
                                },
                            ]}
                        />
                    </div>
                }
                footer={
                    <Fragment>
                        <RSSecondaryButton onClick={closeModal}>{'Cancel'}</RSSecondaryButton>
                        <RSPrimaryButton onClick={handleSave}>{'Save'}</RSPrimaryButton>
                    </Fragment>
                }
            />
        </>
    );
};

export default AdobeAnalyticsModal;

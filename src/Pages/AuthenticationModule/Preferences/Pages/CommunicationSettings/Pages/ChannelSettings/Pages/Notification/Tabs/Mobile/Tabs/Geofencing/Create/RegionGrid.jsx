import { ACTIONS, LATITUDE, LONGITUDE, OK, PLACE_NAME, RADIUS } from 'Constants/GlobalConstant/Placeholders';
import { delete_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSCustomKendoGrid from 'Components/RSCustomKendoGrid';
import { useDispatch } from 'react-redux';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
const RegionGrid = ({
    regions = [],
    onEdit = () => {},
    onDelete = () => {},
}) => {
    const dispatch = useDispatch();
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [showMinimumRegionModal, setShowMinimumRegionModal] = useState(false);
    const [showScheduledCommModal, setShowScheduledCommModal] = useState(false);
    
    const showDelete = deleteIndex !== null && deleteIndex !== undefined;

    const handleDeleteClick = (index) => {
        // Check if this is the last region
        if (regions.length <= 1) {
            setShowMinimumRegionModal(true);
            return;
        }
        
        // Show confirmation for scheduled communications
        setDeleteIndex(index);
        setShowScheduledCommModal(true);
    };

    const handleConfirmDelete = async (status) => {
        if (status && deleteIndex !== null && deleteIndex !== undefined) {
            setDeleteIndex(null);
            setShowScheduledCommModal(false);
            onDelete(deleteIndex);
            return;
        }
       
    };

    return (
        <div className="rsgdv-plain">
            <RSCustomKendoGrid
                noBoxShadow
                isCustomBox
                data={regions}
                pageable={regions?.length > 5}
                isDataStateRequired={true}
                column={[
                    {
                        field: 'placeName',
                        title: PLACE_NAME ,
                        filter: 'text',
                         width: '250px',
                    },
                    {
                        field: 'latitude',
                        title: LATITUDE,
                         width: '250px',
                    },
                    {
                        field: 'longitude',
                        title: LONGITUDE,
                         width: '250px',
                    },
                    {
                        field: 'radius',
                        title: RADIUS,
                        width: '160px',
                    },
                    {
                        field: 'actions',
                        title: ACTIONS,
                        width: '150px',
                        cell: ({ dataIndex }) => (
                            <td >
                               <ul className="rs-list-inline rli-space-10 grid-view-icons">
                                <li>
                                      <RSTooltip position="top" text={'Edit'} className="lh0">
                                    <i
                                        className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                        onClick={() => onEdit(dataIndex)}
                                    />
                                </RSTooltip>
                                </li>
                               <li>
                                 <RSTooltip position="top" text={'Delete'} className="lh0">
                                    <i
                                        className={`${delete_medium} icon-md color-primary-red`}
                                        onClick={() => handleDeleteClick(dataIndex)}
                                    />
                                </RSTooltip>
                               </li>
                                </ul>
                            </td>
                        ),
                    },
                ]}
            />
            
            {/* Minimum Region Validation Modal */}
            <RSModal
                show={showMinimumRegionModal}
                size="md"
                header="Cannot delete region"
                handleClose={() => setShowMinimumRegionModal(false)}
                body={
                        <p>At least one region must be present under the cluster. You cannot delete all the regions.</p>

                }
                footer={
                    <RSPrimaryButton  onClick={() => setShowMinimumRegionModal(false)}>{OK}</RSPrimaryButton>
                }
            />

            {/* Scheduled Communications Warning Modal */}
            <RSConfirmationModal
                show={showScheduledCommModal}
                text="Deleting this region will affect scheduled communications. Are you sure you want to proceed?"
                handleClose={() => {
                    setDeleteIndex(null);
                    setShowScheduledCommModal(false);
                }}
                handleConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default RegionGrid;



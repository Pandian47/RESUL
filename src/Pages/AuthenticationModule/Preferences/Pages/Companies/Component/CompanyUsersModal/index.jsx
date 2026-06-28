import PropTypes from 'prop-types';
import { RSPrimaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import { clientbranchtype } from '../../constants';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';

const USER_ROW_SKELETON_COUNT = 6;

const CompanyUsersModalSkeleton = () => (
    <div className="cum-body cum-modal-skeleton" aria-hidden="true">
        <div className="cum-section">
            <div className="cum-section-title">
                <CommonSkeleton box height={16} width="55%" stopAnimation />
            </div>
            <div className="cum-user-list">
                {Array.from({ length: USER_ROW_SKELETON_COUNT }, (_, idx) => (
                    <div key={idx} className={`cum-user-row ${idx % 2 !== 0 ? 'alt' : ''}`}>
                        <div className="cum-user-info">
                            <CommonSkeleton box height={20} width={140} stopAnimation />
                        </div>
                        <CommonSkeleton box height={26} width={72} stopAnimation mainClass="cum-user-role-skeleton" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const TYPE_LABEL = {
  GHQ: 'Global HQ',
  RHQ: 'Regional HQ',
  LOC: 'LOC',
  BU: 'BU(s)',
  Brand: 'Brand',
  'Sub-brand': 'Sub-brand'
};

const CompanyUsersModal = ({
  companyName,
  node,
  show,
  onClose,
  onAdd,
  list = {},
  userList = [],
  isLoading = false,
}) => {
  const sectionTitle = `${companyName || ''} ${clientbranchtype(list?.clientbranchTypeId)}`;

  const bodyContent = isLoading ? (
    <CompanyUsersModalSkeleton />
  ) : (
    <div className="cum-body">
      <div className="cum-section">
        <div className="cum-section-title">{sectionTitle}</div>
        <div className="cum-user-list css-scrollbar">
          {userList?.length > 0 ? (
            userList.map((user, idx) => (
              <div key={user.id ?? idx} className={`cum-user-row gap-2 ${idx % 2 !== 0 ? 'alt' : ''}`}>
                <div className="cum-user-info">
                  <span className="cum-user-name">
                    {`${user.FirstName || ''} ${user.LastName || ''}`}
                  </span>
                </div>
                <span className="cum-user-role">{user.Role ? user.Role : 'Unassigned'}</span>
              </div>
            ))
          ) : (
            <NoDataAvailableRender message="No data available" />
          )}
        </div>
      </div>
    </div>
  );


  const footerContent = (
      <RSPrimaryButton onClick={onAdd} disabledClass={isLoading ? 'pe-none click-off' : ''}>
        Assign
      </RSPrimaryButton>
  );


  return (
    <RSModal
      header={companyName}
      show={show}
      handleClose={onClose}
      body={bodyContent}
      footer={footerContent}
      className="cum-modal"
      size="md" />);


};

CompanyUsersModal.propTypes = {
  companyName: PropTypes.string,
  node: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onAdd: PropTypes.func,
  list: PropTypes.object,
  userList: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default CompanyUsersModal;
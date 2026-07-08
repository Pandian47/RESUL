import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { EDIT, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { pencil_edit_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useMemo, useRef } from 'react';
import RSModal from 'Components/RSModal';
import KendoGrid from 'Components/RSKendoGrid';

import RSTooltip from 'Components/RSTooltip';
const IntegratedSystemsConnectionsModal = ({
  show,
  onHide,
  title,
  connections = [],
  onEditRow,
  variant,
  editingRowKey = null,
}) => {

  const onEditRowRef = useRef(onEditRow);
  useEffect(() => {
    onEditRowRef.current = onEditRow;
  }, [onEditRow]);

  const isApiConsumptionGrid = variant === 'apiConsumption';

  const isSocialMediaGrid = useMemo(
    () =>
      !isApiConsumptionGrid &&
      (connections || []).length > 0 &&
      (connections || []).every((row) => row?.sourceGroupName === 'Social media'),
    [connections, isApiConsumptionGrid],
  );

  const gridData = useMemo(
    () =>
      (connections || []).map((row, idx) => {
        if (isApiConsumptionGrid) {
          return {
            ...row,
            _gridRowKey: row?.apiConsumptionsDetailsId ?? `row_${idx}`,
            _sourceDisplay: row?.sourceName || '—',
            _createdDateDisplay: getUserCurrentFormat(row?.CreatedDate)?.dateFormat || '—',
          };
        }
        return {
          ...row,
          _gridRowKey: row?.remoteSettingId ?? `row_${idx}`,
          _pageNameDisplay: row?.pageName || '—',
          _friendlyDisplay:
            row?.sourceGroupName === 'Social media'
              ? row?.pageName
              : row?.friendlyName || row?.sourceName || '—',
          _lastSyncDisplay: getUserCurrentFormat(row?.lastGeneratedDate)?.dateFormat || '—',
          _updateCycleDisplay:
            row?.remoteDataSourceID === 56 ? '—' : row?.scheduleFrequency || '—',
        };
      }),
    [connections, isApiConsumptionGrid],
  );

  const actionsCell = (props) => {
    const { dataItem, tdProps } = props;
    const isRowEditing =
      editingRowKey != null &&
      (editingRowKey === dataItem?.remoteSettingId || editingRowKey === dataItem?._gridRowKey);
    const isOneTime = dataItem?.scheduleFrequency?.toString()?.toLowerCase() === 'one time';
    const runEdit = (e) => {
      e?.stopPropagation?.();
      e?.preventDefault?.();
      if (isRowEditing) return;
      onEditRowRef.current?.(dataItem);
    };
    return (
      <td {...tdProps} className={[tdProps?.className, 'text-center'].filter(Boolean).join(' ')}>
        <ul className="rs-list-inline rli-space-15 grid-view-icons m0 p0">
          <li
            className={isRowEditing ? '' : 'cp'}
            onClick={runEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') runEdit(e);
            }}
            role="button"
            tabIndex={0}
          >
            {isRowEditing ? (
              <div className="d-inline-flex align-items-center justify-content-center">
                <div className="segment_loader" />
              </div>
            ) : (
              <RSTooltip text={isOneTime ? VIEW : EDIT} position="top">
                <div className="d-inline-flex align-items-center justify-content-center">
                  <i
                    id={`rs_integrated_systems_row_${isOneTime ? 'view' : 'edit'}_${dataItem?._gridRowKey}`}
                    className={`${isOneTime ? eye_medium : pencil_edit_medium} color-primary-blue icon-md`}
                  />
                </div>
              </RSTooltip>
            )}
          </li>
        </ul>
      </td>
    );
  };

  const column = useMemo(() => {
    const actionsColumn = {
      field: '_actions',
      title: 'Actions',
      width: 90,
      truncate: false,
      cell: actionsCell,
      sortable:false,
    };

    if (isSocialMediaGrid) {
      return [{ field: '_pageNameDisplay', title: 'Page name' }];
    }

    if (isApiConsumptionGrid) {
      return [
        { field: '_sourceDisplay', title: 'Source' },
        { field: '_createdDateDisplay', title: 'Created date' },
        actionsColumn,
      ];
    }

    return [
      { field: '_friendlyDisplay', title: 'Friendly name' },
      { field: '_lastSyncDisplay', title: 'Last sync' },
      { field: '_updateCycleDisplay', title: 'Update cycle' },
      actionsColumn,
    ];
  }, [isSocialMediaGrid, isApiConsumptionGrid, editingRowKey]);

  return (
    <RSModal
      show={show}
      handleClose={onHide}
      header={title || 'Connections'}
      size="lg"
      footer={false}
      body={
      <div className="integrated-systems-connections-grid">
        <KendoGrid
          data={gridData}
          column={column}
          pageable={true}
          noBoxShadow
          settings={{ total: gridData?.length || 0 }}
          isFailure={!gridData?.length}
          isScrollTop={false} />
        
                </div>
      } />);


};

export default memo(IntegratedSystemsConnectionsModal);
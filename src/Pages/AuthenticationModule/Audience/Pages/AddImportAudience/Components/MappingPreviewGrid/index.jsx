import { useState } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';

import { SAVE_PREVIEW_GRID_CONFIG } from '../../constant';

const MappingPreviewGrid = ({ data = [] }) => {
    const [dataState, setDataState] = useState({
        take: SAVE_PREVIEW_GRID_CONFIG.take,
        skip: SAVE_PREVIEW_GRID_CONFIG.skip,
    });

    const processed = process(data, dataState);

    return (
        <div className="rs-kendo-grid-table rs-kendo-scrollable-grid">
            <Grid
                data={processed.data}
                total={processed.total}
                skip={dataState.skip}
                take={dataState.take}
                onDataStateChange={(event) => setDataState(event.dataState)}
                pageable={{
                    info: true,
                    pageSizes: SAVE_PREVIEW_GRID_CONFIG.pageSizes,
                    previousNext: true,
                    buttonCount: 4,
                    className: 'rs-kendo-pager',
                }}
                sortable={false}
                scrollable="scrollable"
            >
                <GridColumn field="sourceColumnName" title="Source header" width={240} />
                <GridColumn field="destinationColumnName" title="Mapped attribute" width={240} />
            </Grid>
        </div>
    );
};

export default MappingPreviewGrid;

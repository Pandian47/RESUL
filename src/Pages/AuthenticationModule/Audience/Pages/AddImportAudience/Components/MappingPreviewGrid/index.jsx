import KendoGrid from 'Components/RSKendoGrid';
import { SAVE_PREVIEW_GRID_CONFIG } from '../../constant';

const MAPPING_PREVIEW_COLUMNS = [
    { field: 'sourceColumnName', title: 'Source header', width: 240 },
    { field: 'destinationColumnName', title: 'Mapped attribute', width: 240 },
];

const MappingPreviewGrid = ({ data = [] }) => (
    <KendoGrid
        data={data}
        column={MAPPING_PREVIEW_COLUMNS}
        sortable={false}
        scrollable="scrollable"
        pageable
        noBoxShadow
        isDataStateRequired={false}
        config={{
            take: SAVE_PREVIEW_GRID_CONFIG.take,
            skip: SAVE_PREVIEW_GRID_CONFIG.skip,
        }}
        settings={{ total: data.length }}
    />
);

export default MappingPreviewGrid;

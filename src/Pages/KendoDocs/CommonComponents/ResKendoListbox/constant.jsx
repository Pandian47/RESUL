import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

export const SELECTED_FIELD = 'selected';
export const TOOLBAR_TOOLS = ['transferTo', 'transferFrom'];

export const itemLeftRender = (props) => {
    return (
        <>
            {props.dataItem?.dataFlag ? (
                <NoDataAvailableRender />
            ) : (
                <li className="k-item" {...props}>
                    <div className="d-flex flex-column align-items-start">
                        <span>{props.dataItem?.name}</span>
                        {props.dataItem?.isPrimaryKey && (
                            <span className="primaryKey">
                                <i
                                    className={`icon-md key-icon white ${
                                        props.dataItem?.side ? 'key' + props.dataItem?.side : ''
                                    }`}
                                ></i>
                            </span>
                        )}
                    </div>
                </li>
            )}
        </>
    );
};

export const itemRightRender = (props) => {
    return (
        <li className="k-item" {...props}>
            <div className="d-flex flex-column align-items-start table-item">
                {props.dataItem?.tablename && (
                    <small>
                        <i className="color-primary-grey">{props.dataItem?.tablename}</i>
                    </small>
                )}
                <span>{props.dataItem?.name}</span>
                {props.dataItem?.isPrimaryKey && (
                    <span className="primaryKey">
                        <i
                             className={`icon-active-key-mini icon-md key-icon white ${
                                props.dataItem?.side ? 'key' + props.dataItem?.side : ''
                            }`}
                        ></i>
                    </span>
                )}
            </div>
        </li>
    );
};

export const NoDataFlag = [
    {
        name: 'No data available',
        dataFlag: true,
        selected: false,
    },
];

export const LISTBOX_COLUMN_SKELETON_HEIGHT = 196;
export const LISTBOX_COLUMN_SKELETON_ROWS = 6;

export const ListboxColumnSkeleton = () => (
    <div
        style={{
            width: '100%',
            flex: 1,
            minWidth: 220,
            border: '1px solid #c2cfe3',
            borderRadius: 5,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            background: '#ffffff',
            position: 'relative',
        }}
        aria-busy="true"
        aria-live="polite"
    >
       
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
            }}
        >
            {[1, 2, 3, 4, 5].map((item) => (
                <div
                    key={item}
                    style={{
                        height: 28,
                        background: '#e0e5eb',
                        borderRadius: 4,
                    }}
                />
            ))}
        </div>
    </div>
);

export const addUniqueKey = (list = [], key = '_uid') => {
    return list.map((item, index) => ({
        ...item,
        [key]: item.key || `${item.name || ''}_${item.table || ''}_${index}`,
    }));
};

export const removeUniqueKey = (list = [], key = '_uid') => {
    return list.map((item) => {
        const { [key]: _, ...rest } = item;
        return rest;
    });
};

export const isSameAttributeItem = (a, b) => {
    if (!a || !b) return false;
    const nameMatch = a.name === b.name && a?.table === b?.table;
    if (a?.columnFieldName && b?.columnFieldName) {
        return nameMatch && a.columnFieldName === b.columnFieldName;
    }
    return nameMatch;
};

export const reorderRightAttributesByTable = (attrs, selectedTable) => {
    if (!selectedTable || !attrs?.length) return attrs;
    const selectedTableAttrs = attrs.filter((attr) => attr.table === selectedTable);
    const otherAttrs = attrs.filter((attr) => attr.table !== selectedTable);
    return [...selectedTableAttrs, ...otherAttrs];
};

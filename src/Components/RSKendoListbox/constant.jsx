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

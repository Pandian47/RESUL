import { AVAILABLE_ATTRIBUTES, COUNT, SELECTED_ATTRIBUTES, SELECT_LEFT_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Component, memo } from 'react';
import PropTypes from 'prop-types';
import { ListBox, ListBoxToolbar, processListBoxData, processListBoxDragAndDrop } from '@progress/kendo-react-listbox';
import { TOOLBAR_TOOLS } from './constant';
import RSSearchField from 'Components/RSSearchField';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { numberWithCommas } from 'Utils/modules/formatters';
import ListBoxNodataAvailable from 'Components/FormFields/Component/NoDataAvailableRender/ListBoxNodataAvailable';
import KendoListboxSkeleton from 'Components/Skeleton/Components/KendoListboxSkeleton';

class RSKendoListbox extends Component {
    // Replaces the removed static defaultProps (unsupported for function
    // components in React 19; dropped here too so props are sourced one way).
    get defaultedProps() {
        return {
            rightColumnValues: this.props.rightColumnValues ?? [],
            leftColumnValues: this.props.leftColumnValues ?? [],
            getSelectedData: this.props.getSelectedData ?? (() => {}),
            textField: this.props.textField ?? 'name',
            rightColumnName: this.props.rightColumnName ?? 'rightColumnValues',
            leftColumnName: this.props.leftColumnName ?? 'leftColumnValues',
            leftNotes: this.props.leftNotes ?? '',
            rightNotes: this.props.rightNotes ?? '',
            selectedField: this.props.selectedField ?? 'selected',
            rightColumnProps: this.props.rightColumnProps ?? {},
            listBoxHeader: this.props.listBoxHeader ?? 'columns / attributes',
            loading: this.props.loading ?? false,
        };
    }

    state = {
        leftColumnValues: this.defaultedProps.leftColumnValues,
        rightColumnValues: this.defaultedProps.rightColumnValues,
        draggedItem: {},
        searchInput: '',
        isSearchOpen: false,
        leftAttributes: '',
        rightAttributes: '',
        listBoxHeader: this.defaultedProps.listBoxHeader,
        clickedItems: [],
        setSelectedLength: this.props.setSelectedLength,
        customText: this.props.customText,
        isMac: false,
        ctrlKeyPressed: false,
        nodataText: this.props.nodataText,
        searchClassName: this.props.searchClassName,
        showCount: this.props.showCount || false,
        rightEmptyDropActive: false,
    };
    componentDidMount() {
        const isMac = navigator.platform.toLowerCase().includes('mac');
        this.setState({ isMac });
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        document.addEventListener('dragend', this.handleDragEndClearRightHighlight);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('dragend', this.handleDragEndClearRightHighlight);
    }

    handleDragEndClearRightHighlight = () => {
        if (this.state.rightEmptyDropActive) {
            this.setState({ rightEmptyDropActive: false });
        }
        this._draggedItem = null;
    };

    handleKeyDown = (event) => {
        if ((this.state.isMac && event.metaKey) || (!this.state.isMac && event.ctrlKey)) {
            this.setState({ ctrlKeyPressed: true });
        }
    };

    handleKeyUp = (event) => {
        if ((this.state.isMac && !event.metaKey) || (!this.state.isMac && !event.ctrlKey)) {
            this.setState({ ctrlKeyPressed: false });
        }
    };
    componentDidUpdate = (prevProps) => {
        if (
            prevProps.leftColumnValues !== this.props.leftColumnValues ||
            prevProps.rightColumnValues !== this.props.rightColumnValues
        ) {
            this.setState({
                leftColumnValues: this.defaultedProps.leftColumnValues,
                rightColumnValues: this.defaultedProps.rightColumnValues,
            });
        }
    };

    handleItemClick = (event, data, connectedData) => {
        const clickedItem = event.dataItem;
        const { ctrlKeyPressed } = this.state;
        this.setState(
            (prevState) => ({
                clickedItems: [...prevState.clickedItems, clickedItem],
            }),
            () => {
                this.state?.setSelectedLength(this.state?.clickedItems?.length);
            },
        );
        const { selectedField, textField } = this.defaultedProps;
        this.setState({
            [data]: this.state[data].map((attr) => {
                if (attr[textField] === event.dataItem[textField]) {
                    return { ...attr, [selectedField]: !attr[selectedField] };
                } else if (!ctrlKeyPressed) {
                    return { ...attr, [selectedField]: false };
                }
                return { ...attr };
            }),
            [connectedData]: this.state[connectedData].map((attr) => ({
                ...attr,
                [selectedField]: false,
            })),
        });
    };
    handleToolBarClick = (e, data, connectedData) => {
        const { selectedField, getSelectedData } = this.defaultedProps;
        let result = processListBoxData(this.state[data], this.state[connectedData], e.toolName, selectedField);
        this.setState({
            [data]: result.listBoxOneData,
            [connectedData]: result.listBoxTwoData,
        });
        getSelectedData({
            [data]: result.listBoxOneData,
            [connectedData]: result.listBoxTwoData,
        });
    };

    handleDragStart = (e) => {
        const listKey = e?.target?.props?.name;
        if (!e?.dataItem) return;
        e.dataItem.dataCollection = listKey;
        this._draggedItem = e.dataItem;
        this.setState({
            draggedItem: e.dataItem,
        });
    };

    applyListBoxDrop = (dropDataItem, dropListKey) => {
        const { textField, getSelectedData, leftColumnName, rightColumnName, selectedField } = this.defaultedProps;
        const draggedItem = this._draggedItem || this.state.draggedItem;
        const dragListKey = draggedItem?.dataCollection;
        if (!dragListKey || !dropListKey) return;

        const sourceList = this.state[dragListKey] || [];
        const selectedInSource = sourceList.filter((item) => item[selectedField]);
        const draggedIsSelected = draggedItem?.[selectedField];
        const isMultiDrag =
            dragListKey !== dropListKey &&
            selectedInSource.length > 1 &&
            draggedIsSelected &&
            selectedInSource.some((item) => item[textField] === draggedItem[textField]);

        const result = isMultiDrag
            ? processListBoxData(
                  this.state[leftColumnName],
                  this.state[rightColumnName],
                  dragListKey === leftColumnName && dropListKey === rightColumnName
                      ? 'transferTo'
                      : 'transferFrom',
                  selectedField,
              )
            : processListBoxDragAndDrop(
                  this.state[leftColumnName],
                  this.state[rightColumnName],
                  draggedItem,
                  dropDataItem,
                  textField,
              );

        this._draggedItem = null;
        this.setState(
            {
                [leftColumnName]: result.listBoxOneData,
                [rightColumnName]: result.listBoxTwoData,
                draggedItem: {},
                rightEmptyDropActive: false,
            },
            () => {
                getSelectedData({
                    [leftColumnName]: this.state[leftColumnName],
                    [rightColumnName]: this.state[rightColumnName],
                });
            },
        );
    };

    handleDrop = (e) => {
        const dropListKey = e?.target?.props?.name;
        if (!dropListKey || !e?.dataItem) return;
        this.applyListBoxDrop(e.dataItem, dropListKey);
    };

    handleEmptyRightNativeDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    handleEmptyRightNativeDrop = (e) => {
        e.preventDefault();
        this.applyListBoxDrop(null, this.defaultedProps.rightColumnName);
    };

    handleEmptyRightDragEnter = (e) => {
        e.preventDefault();
        this.setState({ rightEmptyDropActive: true });
    };

    handleEmptyRightDragLeave = (e) => {
        const { currentTarget, relatedTarget } = e;
        if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
            this.setState({ rightEmptyDropActive: false });
        }
    };

    handleItemDoubleClick = (event, data, connectedData) => {
        const { selectedField, textField, getSelectedData, leftColumnName, rightColumnName } = this.defaultedProps;
        const list = this.state[data] || [];
        const clicked = event?.dataItem;
        if (!clicked) return;

        const clickedIndex = list.findIndex((item) => item?.[textField] === clicked?.[textField]);
        if (clickedIndex === -1) return;

        const markedList = list.map((item, index) => ({
            ...item,
            [selectedField]: index === clickedIndex,
        }));
        const result = processListBoxData(
            data === leftColumnName ? markedList : this.state[connectedData],
            data === leftColumnName ? this.state[connectedData] : markedList,
            data === leftColumnName ? 'transferTo' : 'transferFrom',
            selectedField,
        );

        this.setState({
            [leftColumnName]: result.listBoxOneData,
            [rightColumnName]: result.listBoxTwoData,
        });
        getSelectedData({
            [leftColumnName]: result.listBoxOneData,
            [rightColumnName]: result.listBoxTwoData,
        });
    };

    render() {
        const { leftColumnValues, rightColumnValues, listBoxHeader, searchClassName } = this.state;
        const { textField, rightColumnName, leftColumnName, selectedField, leftNotes, rightNotes, loading, rightColumnProps } =
            this.defaultedProps;

        if (loading) {
            return <KendoListboxSkeleton />;
        }
        const searchedAttrs = (val = 'left') => {
            const finder = `${val}Attributes`;
            const cols = val === 'left' ? 'leftColumnValues' : 'rightColumnValues';
            if (this.state[finder])
                return this.state[cols]?.filter((attr) =>
                    attr[textField]?.toLowerCase()?.includes(this.state[finder].toLowerCase()),
                );
            const tempSort = this.state[cols];
            // let tempSortValue = tempSort?.sort((a, b) =>
            //     a?.uIPrintableName.toLowerCase() > b?.uIPrintableName.toLowerCase() ? 1 : -1,
            // );
            const tempSortValue = tempSort;

            return tempSortValue;
        };

        if (
            (!leftColumnValues || leftColumnValues?.length === 0) &&
            (!rightColumnValues || rightColumnValues?.length === 0)
        ) {
            return (
              
                <ListBoxNodataAvailable
                    message={this.props.nodataText}
                />
            );
        }
        const isLengthcheck = searchedAttrs('left')?.length > 0;

        return (
            <div className="kendolist-wrapper">
                <div className="multiSelect">
                    <div className="multiClm multiLftClm">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="m0">{AVAILABLE_ATTRIBUTES}</h4>
                            {leftColumnValues?.length > 6 && (
                                <RSSearchField
                                    searchedText={(text) => {
                                        this.setState({ leftAttributes: text });
                                    }}
                                    debounceOnChange={true}
                                    searchClassName={searchClassName}
                                />
                            )}
                        </div>
                        <div className="position-relative">
                            <div onKeyUp={(e) => this.handleKeyDown(e)}>
                                <ListBox
                                    data={searchedAttrs('left')}
                                    textField={textField}
                                    selectedField={selectedField}
                                    onItemClick={(e) => {
                                        if (e?.syntheticEvent?.detail === 2) {
                                            this.handleItemDoubleClick(e, leftColumnName, rightColumnName);
                                            return;
                                        }
                                        this.handleItemClick(e, leftColumnName, rightColumnName);
                                    }}
                                    onDragStart={this.handleDragStart}
                                    onDrop={this.handleDrop}
                                    name={leftColumnName}
                                    // item={itemLeftRender}
                                    toolbar={() => (
                                        <ListBoxToolbar
                                            tools={TOOLBAR_TOOLS}
                                            data={searchedAttrs('left')}
                                            dataConnected={searchedAttrs('right')}
                                            onToolClick={(e) =>
                                                this.handleToolBarClick(e, leftColumnName, rightColumnName)
                                            }
                                        />
                                    )}
                                />
                                <div className="d-grid">
                                    <small className="text-right">
                                        {COUNT}: {numberWithCommas(searchedAttrs('left')?.length || 0)}{' '}
                                    </small>
                                    <div className="align-items-center d-flex mt10">
                                        <i
                                            className={`${circle_info_mini} icon-xs color-primary-blue mr5 cursor-default`}
                                        ></i>
                                        <small>{`Hold ${this.state.isMac ? 'Cmd' : 'Ctrl'} to select multiple items`}</small>
                                    </div>
                                </div>
                            </div>
                            <div className={isLengthcheck ? 'd-none' : ''}>
                                <NoDataAvailableRender />
                            </div>
                        </div>

                        {leftNotes}
                    </div>
                    <div className="multiClm multiRghtClm">
                        <h4 className="m0 py10">{SELECTED_ATTRIBUTES}</h4>
                        {rightColumnValues?.length > 6 && (
                            <RSSearchField
                                searchedText={(text) => {
                                    this.setState({ rightAttributes: text });
                                }}
                                debounceOnChange={true}
                                searchClassName={searchClassName}
                            />
                        )}
                        {searchedAttrs('right')?.length ? (
                            <>
                                <ListBox
                                    data={searchedAttrs('right')}
                                    textField={textField}
                                    selectedField={selectedField}
                                    onItemClick={(e) => {
                                        if (e?.syntheticEvent?.detail === 2) {
                                            this.handleItemDoubleClick(e, rightColumnName, leftColumnName);
                                            return;
                                        }
                                        this.handleItemClick(e, rightColumnName, leftColumnName);
                                    }}
                                    onDragStart={this.handleDragStart}
                                    onDrop={this.handleDrop}
                                    name={rightColumnName}
                                    {...rightColumnProps}
                                />
                                <small className="float-end">
                                    {COUNT}: {numberWithCommas(searchedAttrs('right')?.length || 0)}{' '}
                                </small>
                            </>
                        ) : (
                            <div className="k-listbox attribute-right-empty-host">
                                <div
                                    role="region"
                                    aria-label={this.props.customText || SELECT_LEFT_ATTRIBUTES}
                                    className={`attribute-right-empty-dropzone k-list border${this.state.rightEmptyDropActive ? ' is-drag-over' : ''
                                        }`}
                                    onDragEnter={this.handleEmptyRightDragEnter}
                                    onDragOver={this.handleEmptyRightNativeDragOver}
                                    onDragLeave={this.handleEmptyRightDragLeave}
                                    onDrop={this.handleEmptyRightNativeDrop}
                                >
                                    <NoDataAvailableRender message={this.props.customText} />
                                </div>
                            </div>
                        )}
                        {rightNotes}
                    </div>
                </div>
            </div>
        );
    }
}

RSKendoListbox.propTypes = {
    rightColumnValues: PropTypes.array.isRequired,
    getSelectedData: PropTypes.func,
    leftColumnValues: PropTypes.array,
    textField: PropTypes.string,
    rightColumnName: PropTypes.string,
    leftColumnName: PropTypes.string,
    listBoxHeader: PropTypes.string,
    leftNotes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    rightNotes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    selectedField: PropTypes.string,
    loading: PropTypes.bool,
};

export default memo(RSKendoListbox);

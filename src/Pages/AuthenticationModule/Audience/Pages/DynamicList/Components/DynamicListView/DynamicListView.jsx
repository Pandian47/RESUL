import { Fragment, useEffect, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { AudienceTargetListTabSkeleton } from 'Components/Skeleton/pages/audience';
import SingleList from '../SingleList/SingleList';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import dynamicListInitialState from 'Reducers/audience/dynamicList/initialState';

const DynamicListView = ({ params, SetheadrerView }) => {
    const { dynamicListView, listLoading, listFailure } = useSelector(
        (state) => state?.dynamicListReducer ?? dynamicListInitialState,
    );
    const [pageState, setPageState] = useState();
    const [duplicate, setDuplicate] = useState(false);

    useEffect(() => {
        if (dynamicListView?.listData && Array.isArray(dynamicListView.listData) && dynamicListView.listData.length > 0) {
            updateData();
        } else {
            setPageState([]);
        }
    }, [dynamicListView]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }, [dynamicListView, pageState]);

    function updateData() {
        if (dynamicListView?.listData && Array.isArray(dynamicListView.listData)) {
            setPageState(
                dynamicListView.listData.map((list) => ({
                    ...list,
                    duplicate: false,
                    status: list.blastedCount === 0 ? 'scheduled' : 'completed',
                })),
            );
        } else {
            setPageState([]);
        }
    }

    const renderListSkeleton = (showNoData) => (
        <div className='p0 skeleton-span-con'>
            <AudienceTargetListTabSkeleton showToolbar={false} isNoDataAvailable={showNoData} />
            {showNoData && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <NoDataAvailableRender />
                </div>
            )}
        </div>
    );

    return (
        <Fragment>
            {listLoading ? (
                renderListSkeleton(false)
            ) : listFailure ? (
                renderListSkeleton(true)
            ) : pageState?.length ? (
                <Row className="targetListPageCSS">
                    {pageState?.map((list, listIndex) => (
                        <SingleList
                            list={list}
                            key={listIndex}
                            type="dynamicList"
                            setDuplicate={setDuplicate}
                            duplicate={duplicate}
                            setPageState={setPageState}
                            params={params}
                            SetheadrerView={SetheadrerView}
                        />
                    ))}
                </Row>
            ) : (
                renderListSkeleton(false)
            )}
        </Fragment>
    );
};

export default DynamicListView;

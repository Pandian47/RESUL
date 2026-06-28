import { Fragment, useEffect, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { AudienceTargetListTabSkeleton } from 'Components/Skeleton/pages/audience';
import Card from 'Pages/AuthenticationModule/Audience/Pages/TargetList/Components/Card';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const TargetListView = ({ params, listLoading, listFailure = false }) => {
    const { targetListView } = useSelector(({ targetListViewReducer }) => targetListViewReducer);

    const [pageState, setPageState] = useState();
    const [duplicate, setDuplicate] = useState(false);
    const [duplicateId, setDuplicateId] = useState(0);
    const [listNameEdit, setlistNameEdit] = useState(0);

    useEffect(() => {
        if (targetListView && Array.isArray(targetListView)) {
            setPageState(
                targetListView.map((list) => ({
                    ...list,
                    duplicate: false,
                    listNameEdit: 0,
                    status:
                        list.recipientsBunchName === 'All audience'
                            ? 'standard'
                            : list.communicationsentCount === 0
                            ? 'scheduled'
                            : 'completed',
                })),
            );
        } else {
            setPageState([]);
        }
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }, [targetListView]);

    const listSkeleton = (
        <div className='p0 skeleton-span-con'>
            <AudienceTargetListTabSkeleton showToolbar={false} isNoDataAvailable={listFailure} />
            {listFailure && (
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
            {listLoading || listFailure ? (
                listSkeleton
            ) : pageState?.length ? (
                <Row className="targetListPageCSS">
                    {pageState?.map((list, listIndex) => (
                        <Card
                            list={list}
                            key={listIndex}
                            type="targetList"
                            setDuplicate={setDuplicate}
                            duplicate={duplicate}
                            setlistNameEdit={setlistNameEdit}
                            listNameEdit={listNameEdit}
                            setPageState={setPageState}
                            params={params}
                        />
                    ))}
                </Row>
            ) : (
                listSkeleton
            )}
        </Fragment>
    );
};

export default TargetListView;

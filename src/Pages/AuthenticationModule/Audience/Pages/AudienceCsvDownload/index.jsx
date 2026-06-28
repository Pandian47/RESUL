import { downloadCSVcommasFile } from 'Utils/modules/download';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { download_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { RSPrimaryButton } from 'Components/Buttons';
import { Container } from 'react-bootstrap';
import { getAudienceDownloadFile } from 'Reducers/audience/targetList/request';
import { downloadDynamicListFiles_csv } from 'Reducers/audience/dynamicList/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { resetTargetListData } from 'Reducers/audience/targetList/reducer';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';

import useQueryParams from 'Hooks/useQueryParams';
const AudienceCsvDownload = () => {
    const dispatch = useDispatch();
    const downloadFileName = new URLSearchParams(window.location.search).get('fn');
    const isDynamic = new URLSearchParams(window.location.search).get('isDynamic');
    const state = useQueryParams('/audience');
    //window.location.search;
    const title = downloadFileName && downloadFileName.toLowerCase().includes('datacatalogue')
    ? 'Data catalogue download' : 'Audience - CSV download list';
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { getAudienceDownloadCSVFileName } = useSelector(({ targetListViewReducer }) => targetListViewReducer);
    useEffect(() => {
        // handleCSVDownload();
        return () => {
            dispatch(resetTargetListData());
        };
    }, [departmentId, clientId, userId]);

    const handleCSVData = async () => {
        const payload = {
            filename: downloadFileName,
            departmentId,
            clientId,
            userId,
        };
        let res;

        if (isDynamic === 'true') {
            res = await dispatch(downloadDynamicListFiles_csv(payload));
        } else {
            res = await dispatch(getAudienceDownloadFile(payload));
        }

        downloadCSVcommasFile(res, downloadFileName);
    };
    const handleCSVDownload = async () => {
        const payload = {
            filename: downloadFileName,
            departmentId,
            clientId,
            userId,
        };
        const res = await dispatch(getAudienceDownloadFile(payload));
        // downloadCSVcommasFile(res, downloadFileName);
    };
    useComponentWillUnmount(() => {
        dispatch(resetTargetListData());
    });
    return (
        <div className="page-content-holder">
            <RSPageHeader title={title} />
          <Container fluid>
              <div className='page-content'>
            <Container className=" px0">
                <div className="box-design text-center">
                    <div className="downloadIcons">
                        <i className={`${download_large} color-primary-blue font-xxl`} id="rs_data_download" />
                    </div>
                    <p className="mb5">{downloadFileName}</p>
                    {new URLSearchParams(window.location.search).get('size') !== null && (
                        <p className="color-primary-grey mb15">
                            File size: {new URLSearchParams(window.location.search).get('size').split('_')[0]}{' '}
                            {new URLSearchParams(window.location.search).get('size').split('_')[1]}
                        </p>
                    )}

                    <RSPrimaryButton
                        className={`
                         ${
                             new Date(atob(new URLSearchParams(window.location.search).get('date'))) >= new Date()
                                 ? ''
                                 : 'click-off'
                         }`}
                        onClick={() => {
                            handleCSVData();
                            // window.location = '../../../../../../public/documents/SampleFile.zip';
                        }}
                    >
                        Download
                    </RSPrimaryButton>
                    <small className="mt20">
                        Available until:{' '}
                        {/* {getUserDateTimeFormat(
                            atob(new URLSearchParams(window.location.search).get('date')),
                            'formatDate',
                        )} */}
                        {getUserCurrentFormat(
                            atob(new URLSearchParams(window.location.search).get('date'))
                        )?.dateFormat}
                    </small>
                </div>
            </Container></div>
          </Container>
        </div>
    );
};

export default AudienceCsvDownload;

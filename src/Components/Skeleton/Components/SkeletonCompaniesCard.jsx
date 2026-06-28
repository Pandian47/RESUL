import { Col } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const CARD_HEIGHT = 155;
const CARD_PADDING = '10px 15px 5px 23px';

const SkeletonCompaniesCard = ({ message = 'No data available', isMessage = true, isDataReady = false }) => (
    <Col sm={4} style={{ marginBottom: 27 }}>
        <div style={{
            position: 'relative',
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e0e5eb',
            height: CARD_HEIGHT,
            padding: CARD_PADDING,
            fontSize: 13,
            color: '#222',
            overflow: 'hidden',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
        }}>
            {/* Left vertical gray line */}
            {/* <div style={{
                content: "''",
                position: 'absolute',
                top: 2,
                left: 2,
                width: 3,
                height: 149,
                background: '#e0e5eb',
                borderTopLeftRadius: 3,
                borderBottomLeftRadius: 3,
                zIndex: 1,
            }} /> */}
            {/* Enterprise badge (ENT+) with black curvy icon */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 15,
                zIndex: 3,
                width: '45px',
                height: '25px',
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
                background: '#e0e5eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}>
                {/* <div style={{
          width: 32,
          height: 12,
          background: '#d3d6db',
          borderRadius: 4,
        }} /> */}
            </div>

            {/* 
      <div
        style={{
          width: '120px',
          height: '60px',
          background: 'black',
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
      ></div> */}


            {/* Info row: table layout */}
            <div style={{
                display: 'table',
                width: '100%',
                height: 90,
                marginTop: 20,
                borderBottom: '1px solid #e0e5eb',
            }}>
                <div style={{
                    display: 'table-row',
                }}>
                    {/* Logo left */}
                    <div className='position-relative bottom10' style={{
                        display: 'table-cell',
                        verticalAlign: 'middle',
                        width: '30%',
                        paddingRight: 10,
                        textAlign: 'center',
                    }}>
                        <Skeleton enableAnimation={!isDataReady} width={65} height={65} style={{ background: '#e0e5eb' }} />
                    </div>
                    {/* Text right */}
                    <div style={{
                        display: 'table-cell',
                        verticalAlign: 'middle',
                        width: '70%',
                        paddingLeft: 10,
                        borderLeft: '1px solid #e0e5eb',
                    }}>
                        <div className='d-flex gap-2 align-items-center'>
                            <Skeleton enableAnimation={!isDataReady} width={140} height={20} style={{ background: '#e0e5eb' }} />
                            <Skeleton enableAnimation={!isDataReady} width={60} height={20} style={{ background: '#e0e5eb' }} />
                        </div>
                        {/* <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
              <Skeleton enableAnimation={!isDataReady} width={80} height={10} style={{ marginRight: 8, background: '#e0e5eb' }} />
              <Skeleton enableAnimation={!isDataReady} width={60} height={10} style={{ background: '#e0e5eb' }} />
            </div> */}
                    </div>
                    <div className="no-data-message">
                        {isMessage && (
                            <div className="no-data-message" style={{ marginTop: 10 }}>
                                <NoDataAvailableRender message={message} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Status line */}
            {/* <div style={{ minHeight: 18, marginTop: 4, marginLeft: 10 }}>
        <Skeleton enableAnimation={!isMessage} width={110} height={10} style={{ background: '#e0e5eb' }} />
      </div> */}
            {/* Bottom action icons */}
            <div className='d-flex gap-3'>
                <div className='d-flex flex-column align-items-center'>
                    <Skeleton enableAnimation={!isDataReady} circle width={14} height={14} style={{ background: '#e0e5eb' }} />
                    <Skeleton enableAnimation={!isDataReady} width={40} height={14} style={{ background: '#e0e5eb' }} />

                </div>
                <div className='d-flex flex-column align-items-center'>
                    <Skeleton enableAnimation={!isDataReady} circle width={14} height={14} style={{ background: '#e0e5eb' }} />
                    <Skeleton enableAnimation={!isDataReady} width={40} height={14} style={{ background: '#e0e5eb' }} />
                </div>
            </div>
            <div style={{ position: 'absolute', bottom: 8, right: 18, display: 'flex', gap: 10 }}>
                <Skeleton enableAnimation={!isDataReady} circle width={14} height={14} style={{ background: '#e0e5eb' }} />
                <Skeleton enableAnimation={!isDataReady} circle width={14} height={14} style={{ background: '#e0e5eb' }} />
                <Skeleton enableAnimation={!isDataReady} circle width={14} height={14} style={{ background: '#e0e5eb' }} />
            </div>
        </div>
    </Col>
);

export default SkeletonCompaniesCard;
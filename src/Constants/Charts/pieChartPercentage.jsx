import { Col, Row } from 'react-bootstrap';
const pieChartPercentage = (data, height, color, text) => {
    return {
        chart: {
            height: height || 150,
            // className: 'piechart-render',
        },
        title: {
            text: '',
        },
        subtitle: {
            text: `<div class='percent-value font-md mt16' style='color: #111111', font-family:'Muktamedium' !important;>${data}%</div>`,
            align: 'center',
            verticalAlign: 'middle',
            style: {
                textAlign: 'center',
            },
            x: 0,
            y: 5,
            useHTML: true,
        },
        plotOptions: {
            pie: {
                size: 112,
            },
        },
        series: [
            {
                type: 'pie',
                enableMouseTracking: false,
                innerSize: '75%',
                dataLabels: {
                    enabled: false,
                },
                data: [
                    {
                        y: data,
                        color: color,
                    },
                    {
                        y: 100 - data,
                        color: '#e3e3e3',
                    },
                ],
            },
        ],
    };
};

const Progressbar = ({ bgcolor, progress, height, width, borderRadius, icon = '', tooltip, isToolTip = false ,isDetailStatus,  listingProgressbarClassName = '',}) => {
    const Parentdiv = {
        height: height,
        backgroundColor: 'whitesmoke',
        width: width,
        borderRadius: borderRadius,
    };

    const Childdiv = {
        height: '100%',
        width: `${progress}%`,
        backgroundColor: bgcolor,
        textAlign: 'right',
        borderRadius: borderRadius,

        
    };

    return (
        <Row className={`m0 ${listingProgressbarClassName}`}>
            <div className="d-flex align-items-end justify-content-center p0">
                {/* {isToolTip ? (
                    <OverlayTrigger key={tooltip} placement={'top'} overlay={<Tooltip>{tooltip}</Tooltip>}>
                        {icon}
                    </OverlayTrigger>
                ) : (
                    { icon }
                )} */}
                <div className="profileCircle">{tooltip?.length > 0 && tooltip.slice(0, 1)}</div>
            </div>
            <Col sm={9} className="progressbar-content">
                <small>{tooltip}</small>
                <div className="progress-parent" style={Parentdiv}>
                    <div className="row " style={Childdiv}></div>
                </div>
            </Col>
            {!isDetailStatus &&
            <Col sm={2} className="d-flex align-items-end pl0">
                <span className="progress-value">{`${progress}%`}</span>
            </Col>
}
        </Row>
    );
};

export { pieChartPercentage, Progressbar };

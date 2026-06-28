import { Col, Row } from 'react-bootstrap';
const profileCompleteChart = (percent, color) => {
    const safePercent = Math.min(100, Math.max(0, Number(percent) || 0));
    return {
        title: {
            text: '',
        },
            subtitle: {
            text: `<div class='percent-value font-lg font-bold' style='color: #111111'>${safePercent}<span class="font-md">%</span></div>`,
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
                size: 180,
            },
        },
        series: [
            {
                type: 'pie',
                enableMouseTracking: false,
                innerSize: '60%',
                size: '90%',
                dataLabels: {
                    enabled: false,
                },
                data: [
                    {
                        y: safePercent,
                        color: color,
                    },
                    {
                        y: 100 - safePercent,
                        color: '#e3e3e3',
                    },
                ],
            },
        ],
    };
};

const Progressbar = ({ bgcolor, progress, height, icon = '', tooltip = '', isToolTip = false }) => {
    const safeTooltip = String(tooltip ?? '');
    const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));
    const Parentdiv = {
        height: height,
        backgroundColor: 'whitesmoke',
    };

    const Childdiv = {
        height: '100%',
        width: `${safeProgress}%`,
        backgroundColor: bgcolor,
        textAlign: 'right',
    };

    return (
        <Row className="m0">
            <Col sm={1} className="d-flex align-items-end justify-content-center p0">
                <div className="profileCircle">{safeTooltip.slice(0, 1)}</div>
            </Col>
            <Col sm={9}>
                <small>{safeTooltip}</small>
                <div className="progress-parent" style={Parentdiv}>
                    <div style={Childdiv}></div>
                </div>
            </Col>
            <Col sm={2} className="d-flex align-items-end justify-content-end pl0">
                <span className="progress-value">
                    {`${safeProgress}`}
                    <span className="font-xxs">%</span>
                </span>
            </Col>
        </Row>
    );
};

export { profileCompleteChart, Progressbar };

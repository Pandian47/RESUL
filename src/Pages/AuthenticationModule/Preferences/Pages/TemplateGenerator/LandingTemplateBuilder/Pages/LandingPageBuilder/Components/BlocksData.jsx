import { Col, Row } from 'react-bootstrap';
const BlocksData = ({ value, setBlockContent }) => {
    switch (value) {
        case '12':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '1 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={12} className={'selected bg-info'}></Col>
                </Row>
            );
        case '2':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '2 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={6} className={'selected bg-info'}></Col>
                    <Col sm={6} className={'selected bg-info'}></Col>
                </Row>
            );
        case '3':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '3 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={4} className={'selected bg-info'}></Col>
                    <Col sm={4} className={'selected bg-info'}></Col>
                    <Col sm={4} className={'selected bg-info'}></Col>
                </Row>
            );
        case '4':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '4 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={3} className={'selected bg-info'}></Col>
                    <Col sm={3} className={'selected bg-info'}></Col>
                    <Col sm={3} className={'selected bg-info'}></Col>
                    <Col sm={3} className={'selected bg-info'}></Col>
                </Row>
            );
        case 'center':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', 'Center Column')}
                    onDragEnd={() => setBlockContent(false)}
                    className={'d-flex justify-content-center'}
                >
                    <Col sm={6} className={'selected bg-info'}></Col>
                </Row>
            );
        case '2/10':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '2/10 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={2} className={'selected bg-info'}></Col>
                    <Col sm={10} className={'selected bg-info'}></Col>
                </Row>
            );
        case '10/2':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '10/2 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={10} className={'selected bg-info'}></Col>
                    <Col sm={2} className={'selected bg-info'}></Col>
                </Row>
            );
        case '3/9':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '3/9 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={3} className={'selected bg-info'}></Col>
                    <Col sm={9} className={'selected bg-info'}></Col>
                </Row>
            );
        case '9/3':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '9/3 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={9} className={'selected bg-info'}></Col>
                    <Col sm={3} className={'selected bg-info'}></Col>
                </Row>
            );
        case '4/8':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '4/8 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={4} className={'selected bg-info'}></Col>
                    <Col sm={8} className={'selected bg-info'}></Col>
                </Row>
            );
        case '8/4':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', ' 8/4Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={8} className={'selected bg-info'}></Col>
                    <Col sm={4} className={'selected bg-info'}></Col>
                </Row>
            );
        case '5/7':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '5/7 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={5} className={'selected bg-info'}></Col>
                    <Col sm={7} className={'selected bg-info'}></Col>
                </Row>
            );
        case '7/5':
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '7/5 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={7} className={'selected bg-info'}></Col>
                    <Col sm={5} className={'selected bg-info'}></Col>
                </Row>
            );
        default:
            return (
                <Row
                    style={{ width: '300px', height: '40px' }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('name', '1 Column')}
                    onDragEnd={() => setBlockContent(false)}
                >
                    <Col sm={12} className={'selected bg-info'}></Col>
                </Row>
            );
    }
};

export default BlocksData;

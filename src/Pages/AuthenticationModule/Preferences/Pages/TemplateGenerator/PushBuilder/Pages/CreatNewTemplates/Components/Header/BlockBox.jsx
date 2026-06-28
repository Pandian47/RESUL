import { Card, Col, Container, Row } from 'react-bootstrap';
const BlockBox = () => {


    const onDragStart = (ev, id) => {
        ev.dataTransfer.setData("ebCompoId", id);
        // handleDragging('block');
    }

    const cardsStyle = {
        border: '1px solid black',
        borderRadius: '10px',
        height: '50px',
        background: '#e9e9e9',
        borderStyle: 'dashed',
    };

    return (
        <>
            <Container fluid>
                <Card draggable onDragStart={(e) => onDragStart(e, 1)}>
                    <Row>
                        <Col>
                            {' '}
                            <Card style={cardsStyle}></Card>
                        </Col>
                    </Row>
                </Card>
                <Card draggable onDragStart={(e) => onDragStart(e, 2)}>
                    <Row>
                        <Col>
                            <Card style={cardsStyle}></Card>
                        </Col>
                        <Col>
                            <Card>
                                {' '}
                                <Card style={cardsStyle}></Card>
                            </Card>
                        </Col>
                    </Row>
                </Card>
                <Card draggable onDragStart={(e) => onDragStart(e, 3)}>
                    <Row>
                        <Col>
                            {' '}
                            <Card style={cardsStyle}></Card>
                        </Col>
                        <Col>
                            {' '}
                            <Card style={cardsStyle}></Card>
                        </Col>
                        <Col>
                            {' '}
                            <Card style={cardsStyle}></Card>
                        </Col>
                    </Row>
                </Card>

                <Row>
                    <Col>
                        {' '}
                        <Card style={cardsStyle}></Card>
                    </Col>
                    <Col>
                        {' '}
                        <Card style={cardsStyle}></Card>
                    </Col>
                    <Col>
                        {' '}
                        <Card style={cardsStyle}></Card>
                    </Col>
                    <Col>
                        {' '}
                        <Card style={cardsStyle}></Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {' '}
                        <Card style={cardsStyle}></Card>
                    </Col>
                    <Col>
                        {' '}
                        <Card style={cardsStyle}></Card>
                    </Col>
                    <Col>
                        {' '}
                        <Card style={cardsStyle}></Card>
                    </Col>
                    <Col>
                        {' '}
                        <Card style={cardsStyle}></Card>
                    </Col>
                    <Col>
                        {' '}
                        <Card style={cardsStyle}></Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default BlockBox;

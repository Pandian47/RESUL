import { brand, projectTitle } from '../../../constant';
import { Col, Container, Row } from "react-bootstrap"
import logo_resul from '../../../Assests/Images/resulticks-logo-white.svg'
import logo_smartdx from '../../../Assests/Images/logo-smartdx-white.svg'
const Header = ({disable}) => {
    return (
        <Container fluid className={`header-wrapper ${disable ? 'd-none' : ''}`}>
            <Row>
                <Col md={3}>
                    { brand === 'R' && <img src={logo_resul} alt="Logo" className="logo-img" /> }
                    { brand === 'S' && <img src={logo_smartdx} alt="Logo" className="logo-img" /> }
                </Col>
                <Col md={9}>
                    <h1 className="hheading">{projectTitle}</h1>
                </Col>
            </Row>
        </Container>
    )
}

export default Header
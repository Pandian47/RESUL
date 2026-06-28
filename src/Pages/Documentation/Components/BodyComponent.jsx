import { Col } from "react-bootstrap"
import HeaderList from "./HeadingList"
import Pagination from "./Pagination"

const BodyComponent = ({data, selectedPage, setSelected, nextIndex, prevIndex}) => {
    return (
        <Col md={8} className="body-component-wrapper">
            <HeaderList selectPage={selectedPage} data={data} linkId="example" />
            <Pagination selectPage={selectedPage} data={data} next={nextIndex} prev={prevIndex} setSelected={setSelected}/>
        </Col>
    )
}
export default BodyComponent
import { Col, Row } from 'react-bootstrap';
import CopyToClipboard from 'react-copy-to-clipboard'
import RSTooltip from 'Components/RSTooltip';

export const ColorSnippets = (props) => {
    return (
        <Row>
            <ColorsComponent data={props.data} />
        </Row>
    )
}

const ColorsComponent = (props) => {
    const portletWrapper = {
        borderWidth: 0,
        borderStyle: 'solid',
        marginBottom: 30,
        borderRadius: 8
    }
    return (
        <Col md={12}>
            <div style={portletWrapper}>
                <h3 className='font-bold count-length' style={{ marginBottom: 20 }}>{props.data?.title} {props.data?.length}</h3>
                <Row className='color-list'>
                        {
                            props.data.map((item, index) => {
                                const { color, name, type, js, scss, classColor } = item
                                return (
                                    <>
                                        <ColorComponent
                                            key={index}
                                            color={color}
                                            name={name}
                                            type={type}
                                            js={js}
                                            scss={scss}
                                            classColor={classColor}
                                        />
                                    </>
                                )
                            })
                        }
                </Row>
            </div>
        </Col>
    )
}

const ColorComponent = (props) => {
    const colorSpan = {
        backgroundColor: props.color,
    }
    const { name, color, type, js, scss, classColor } = props
    return (
        <Col md={3} className='view-box'>
            <div className='view-box-list'>
                <span className='color-dotted' style={colorSpan}></span>
                <span className='color-text'>
                    {name}
                    <br />
                    <CopyToClipboard text={`${color}`}><b className='cursor-pointer'>{`${color}`}</b></CopyToClipboard>
                    <br />
                    {
                        type 
                        ? <small>
                            <span style={{ color: '#777' }}>{type}</span>
                        </small>
                        : null
                    }
                </span>
                <div className='d-flex'>
                    { scss && <RSTooltip position="top" text={`${scss}`}><CopyToClipboard text={`$${scss}`}><span className='cursor-pointer labelcss'>scss</span></CopyToClipboard></RSTooltip> }
                    { js && <RSTooltip position="top" text={`${js}`}><CopyToClipboard text={`${js}`}><span className='cursor-pointer labeljs'>js</span></CopyToClipboard></RSTooltip> }
                    {
                        classColor && <>
                            <RSTooltip position="top" text={`color-${classColor}`}><CopyToClipboard text={`color-${classColor}`}><span className='cursor-pointer labelclass'>color</span></CopyToClipboard></RSTooltip>
                            <RSTooltip position="top" text={`bg-${classColor}`}><CopyToClipboard text={`bg-${classColor}`}><span className='cursor-pointer labelbgclass'>bg</span></CopyToClipboard></RSTooltip>
                        </>
                    }
                    
                </div>

            </div>
        </Col>
    )
}
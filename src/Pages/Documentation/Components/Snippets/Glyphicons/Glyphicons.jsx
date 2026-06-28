import { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard'
import RSTooltip from 'Components/RSTooltip';
import { Col, Row } from 'react-bootstrap'
import Icon from 'Components/Icon/Icon'


class GlypIcons extends Component {
    state = {
        icons: this.props.data,
        value: '',
        copied: false,
        clsName: this.props.clsName,
        size: this.props.size
    }
    render() {
        
        const labelText = {
            color: '#333',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // position: 'absolute',
            // bottom: 10,
            // left: 0,
            width: '100%'
        }
        return (
            <>
                <h3 className='mb20'>Glyphicons ({this.state.icons?.length})</h3>
                <Row>
                    {
                        this.state.icons.map((item, index) => {
                            return (
                                <Col md={2} className="doc-icon-list-col">
                                    <div className='doc-icon-list'>
                                        <label className='label-icon'>{index + 1}</label>
                                        {/* <CopyToClipboard text={`<i className="${item?.varient} ${this.state.clsName ?? 'icon-md'}"></i>`}> */}
                                        <CopyToClipboard text={`<Icon icon={` + `${item?.varient}` +`} size={` + `'${this.state?.size}'` + `} />`}>
                                            <Icon icon={`${item?.value}`} size={this.state?.size} />
                                        </CopyToClipboard>
                                        <label style={labelText}>{item?.value}</label>
                                        
                                        <div className='d-flex mt5'>
                                            
                                            <RSTooltip text={`<Icon icon={` + `${item?.varient}` +`} size={` + `'${this.state?.size}'` + `} />`} position='top'>
                                                <CopyToClipboard text={`<Icon icon={` + `${item?.varient}` +`} size={` + `'${this.state?.size}'` + `} />`}>
                                                    <span className='cursor-pointer labelcss'>ico</span>
                                                </CopyToClipboard>
                                            </RSTooltip>

                                            <RSTooltip text={`${item?.value}`} position='top'>
                                                <CopyToClipboard text={`${item?.value}`}>
                                                    <span className='cursor-pointer labelcss'>cls</span>
                                                </CopyToClipboard>
                                            </RSTooltip>

                                            <RSTooltip text={`${item?.varient}`} position='top'>
                                                <CopyToClipboard text={`${item?.varient}`}>
                                                    <span className='cursor-pointer labeljs'>var</span>
                                                </CopyToClipboard>
                                            </RSTooltip>

                                        </div>
                                    </div>
                                </Col>
                            )
                        })
                    }
                </Row>
            </>
        )
    }
}

export default GlypIcons

import { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard'
import Icon, { Icons } from 'Components/Icon/Icon'
import RSTooltip from 'Components/RSTooltip'

class IconCircle extends Component {
    state = {
        icons: this.props.data,
        value: this.props.data?.value,
        copied: false,
        size: this.props.size,
    }
    render() {
        const title = this.props.value
        return (
            <>
                <h3>{title} ({this.state.icons?.length})</h3>
                <div className='theme-space-mt'>
                    <Icons>
                        {
                            this.state.icons.map((item, index) => {
                                return (
                                    // <CopyToClipboard text={`<Icon icon={` + `${item?.varient}` + `} size={` + `'${this.state?.size}'` + `} />`}>
                                    // <CopyToClipboard text={`${item?.varient}`}>
                                    <span>
                                        <Icon
                                            icon={item?.value}
                                            pophover={
                                                <div className='d-flex p5'>
                                                    <RSTooltip text='click to copy' position='top'>
                                                        <CopyToClipboard text={`<Icon icon={` + `${item?.varient}` + `} size={` + `'${this.state?.size}'` + `} />`}>
                                                            <span className='labelcss bg-whites cursor-pointer'>ico</span>
                                                        </CopyToClipboard>
                                                    </RSTooltip>

                                                    <RSTooltip text='click to copy' position='top'>
                                                        <CopyToClipboard text={`${item?.varient}`}>
                                                            <span className='labeljs bg-whites cursor-pointer'>var</span>
                                                        </CopyToClipboard>
                                                    </RSTooltip>

                                                    <RSTooltip text='click to copy' position='top'>
                                                        <CopyToClipboard text={`${item?.value}`}>
                                                            <span className='labelcss bg-whites cursor-pointer'>class</span>
                                                        </CopyToClipboard>
                                                    </RSTooltip>
                                                </div>
                                            }
                                            circle
                                            mainClass='mb5'
                                            size={this.state?.size}
                                        />
                                    </span>
                                )
                            })
                        }
                    </Icons>
                </div>
            </>
        )
    }
}

export default IconCircle

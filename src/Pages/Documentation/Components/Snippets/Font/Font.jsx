import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard'
import RSTooltip from 'Components/RSTooltip';

export const FontFamilySnippets = (props) => {
    const [data, setData] = useState(props.data)
    return (
        <table className='table' style={{ width: '100%', marginBottom: 50, marginTop: 10 }}>
            <tbody>
                {
                    data.map((item, index) => {
                        const { fname, fdontFamily, fdontFamilyVariable } = item
                        return <FontFamilyRow fname={fname} fdontFamily={fdontFamily} fdontFamilyVariable={fdontFamilyVariable} />
                    })
                }
            </tbody>
        </table>
    )
}
export const FontSnippets = (props) => {
    const [data, setData] = useState(props.data)
    return (
        <table className='table' style={{ width: '100%', marginBottom: 50, marginTop: 10 }}>
            <tbody>
                {
                    data.map((item, index) => {
                        const { fdontSize, fontType, description } = item
                        return <FontRow fSize={fdontSize} fText={fontType} type='font' source={description} />
                    })
                }
            </tbody>
        </table>
    )
}
export const IconSnippets = (props) => {
    const [data, setData] = useState(props.data)
    return (
        <table className='table' style={{ width: '100%', marginTop: 10 }}>
            <tbody>
                {
                    data.map((item, index) => {
                        const { fdontSize, fontType, description } = item
                        return <IconsRow fSize={fdontSize} fontType={fontType} type='icon' source={description} />
                    })
                }
            </tbody>
        </table>
    )
}

const FontFamilyRow = (props) => {
    return (
        <tr>
            <td width={300}>
                <small>{props?.fdontFamily.replace('font-', '')}</small>
                <div className={props?.fdontFamily} style={{ fontSize: `23px` }}>Sample Text</div>
            </td>
            <td>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <small>{props?.fdontFamily}</small>
                        <CommonCopyProp copy={`${props?.fdontFamily}`} format='class' />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <small>${props?.fdontFamilyVariable}</small>
                        <CommonCopyProp copy={`$${props?.fdontFamilyVariable}`} format='scss' />
                    </div>
                </div>
            </td>
        </tr>
    )
}
const FontRow = (props) => {
    return (
        <tr>
            <td width={300}>
                <div style={{ fontSize: `${props.fSize}px`, marginBottom: 20 }}>Sample Text</div>
            </td>
            <td>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontSize: 20 }}>{props?.type === 'font' ? 'font' : 'icon'}-{props.fText}:</div>
                        <div>&nbsp;{props.fSize}px</div>

                        <CommonCopyProp copy={`font-${props?.fText}`} format='class' />
                        <CommonCopyProp copy={`$font-${props?.fText}`} format='scss' />

                    </div>
                    <small>{props.source}</small>
                </div>
            </td>
        </tr>
    )
}
const IconsRow = (props) => {
    return (
        <tr>
            <td width={300}>
                <div style={{ fontSize: `${props.fSize}px`, marginBottom: 20 }}>
                    <i className={`icon-rs-heart-fill-mini icons-${props?.fontType}`} />
                </div>
            </td>
            <td>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontSize: 20 }}>icons-{props?.fontType}:</div>
                        <div>&nbsp;{props.fSize}px</div>

                        <CommonCopyProp copy={`icons-${props.fontType}`} format='class' />
                        <CommonCopyProp copy={`$icons-${props?.fontType}`} format='scss' />

                    </div>
                    <small>{props.source}</small>
                </div>
            </td>
        </tr>
    )
}

const CommonCopyProp = (props) => {
    const { copy, format } = props
    const type = {
        'scss': 'labelscss',
        'class': 'labelclass',
        'js': 'labeljs',
        'bg': 'labelbgclass',
    }
    return (
        <RSTooltip position="top" text={copy}>
            <CopyToClipboard text={copy}>
                <span className={`cursor-pointer ${type[format]} marginR10`}>{format}</span>
            </CopyToClipboard>
        </RSTooltip>
    )
}
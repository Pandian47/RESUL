import { barcode_large, circle_plus_fill_edge_medium, crown_fill_large, email_large, email_medium, plus_mini, social_facebook_large, social_facebook_medium, social_facebook_mini } from 'Constants/GlobalConstant/Glyphicons';
import { CustomCode, CustomCodePreview, PropsList } from '../Common'
import Icon, {Icons} from 'Components/Icon/Icon';
export const SIcons = () => {

    return (
        <>

            <CustomCode title="Overall props" c1='icon' c2='size="md"' value={codeMultiIconsAll}></CustomCode>
            <CustomCode title="Icon" c1='icon' value={codeIcons}></CustomCode>
            <CustomCodePreview>
                <Icon icon={email_medium} />
            </CustomCodePreview>
            
            <CustomCode title="Icon circle" c1='circle' value={codeIconsCircle}></CustomCode>
            <CustomCodePreview>
                <Icon icon={email_medium} circle />
            </CustomCodePreview>

            <CustomCode title="Group icons" c1='icon' value={codeIconsMulti}></CustomCode>
            <CustomCodePreview>
                <Icons>
                    <Icon icon={email_medium} />
                    <Icon icon={social_facebook_medium} />
                    <Icon icon={circle_plus_fill_edge_medium} />
                </Icons>
            </CustomCodePreview>
            

            <CustomCode title="Icon with Tooltip" c1='icon' value={codeIconsTooltip}></CustomCode>
            <CustomCodePreview>
                <Icon
                    icon={email_medium}
                    tooltip='Email'
                />
            </CustomCodePreview>
            

            <CustomCode title="Icon with Pophover" c1='icon' value={codeIconsPophover}></CustomCode>
            <CustomCodePreview>
                <Icon
                    icon={email_medium}
                    pophover='Email'
                />
            </CustomCodePreview>


            <CustomCode title="Medium icon" c1='icon' c2='size="md"' value={codeIconsmd}></CustomCode>
            <CustomCodePreview>
                <Icon icon={email_medium} size='md' />
            </CustomCodePreview>
            
            <CustomCode title="Medium group icons" c1='icon="md"' c2='size' value={codeIconsmdMulti}></CustomCode>
            <CustomCodePreview>
                <Icons>
                    <Icon icon={email_medium} size='md' />
                    <Icon icon={social_facebook_medium} size='md' />
                    <Icon icon={circle_plus_fill_edge_medium} size='md' />
                </Icons>
            </CustomCodePreview>
            



            <CustomCode title="Large icon" c1='icon' c2='size="lg"' value={codeMultiIcons}></CustomCode>
            <CustomCodePreview>
                <Icon icon={email_large} size='lg' />
            </CustomCodePreview>
            
            <CustomCode title="Large group icons" c1='icon' c2='size="lg"' value={codeMultiIcons2Multi}></CustomCode>
            <CustomCodePreview>
                <Icons>
                    <Icon icon={email_large} size='lg' />
                    <Icon icon={social_facebook_large} size='lg' />
                    <Icon icon={crown_fill_large} size='lg' />
                    <Icon icon={barcode_large} size='lg' />
                </Icons>
            </CustomCodePreview>
        </>
    )
}
export const SIconsProps = () => {
    return (
        <>
            <h1 className="">Props</h1>
            <PropsList title="icon?" type="string" type2="variable">
                <p>Sets the <code>icon</code> of the Icon name.</p>
            </PropsList>
            <PropsList title="size?" type="string">
                <p>Specifies the <code>size</code> of icon size (md, lg).</p>
            </PropsList>
            <PropsList title="tooltip?" type="string">
                <p>Specifies the <code>tooltip</code> name.</p>
            </PropsList>
            <PropsList title="position?" type="string">
                <p>Specifies the <code>position</code> of default top, If you change position='' (top, right, bottom, left).</p>
            </PropsList>
            <PropsList title="color?" type="string">
                <p>Specifies the <code>color</code> of default color 'blue' if you change custom this props.</p>
            </PropsList>
        </>
    )
}


let codeIcons =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";

<Icon icon={email_medium} />`

let codeIconsMulti =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";


<Icons>
    <Icon icon={email_medium} />
    <Icon icon={social_facebook_mini} />
    <Icon icon={plus_mini} />
</Icons>`

let codeIconsTooltip =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";

<Icon icon={email_medium} tooltip='Email' />`

let codeIconsPophover =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";

<Icon icon={email_medium} pophover='Email' />`



let codeIconsmd =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";

<Icon icon={email_medium} size='md' />`

let codeIconsmdMulti =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";

<Icons>
    <Icon icon={email_medium} size='md' />
    <Icon icon={social_facebook_medium} size='md' />
    <Icon icon={circle_plus_fill_edge_medium} size='md' />
</Icons>
<Icon icon={email_medium} size='md' />`


let codeMultiIcons =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";

<Icon icon={email_large} size='lg' />`

let codeMultiIcons2Multi =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";

<Icons>
    <Icon icon={email_large} size='lg' />
    <Icon icon={social_facebook_large} size='lg' />
    <Icon icon={crown_fill_large} size='lg' />
    <Icon icon={barcode_large} size='lg' />
</Icons>`

let codeMultiIconsAll =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";

<Icon
    icon={email_medium}
    tooltip='Email'
    pophover='Email'
    size='md'
    color=''
    mainClass=''
    iconClass=''
    onClick={() => {
    }}
/>`

let codeIconsCircle =
    `import Icon from 'Components/Icon/Icon';
import * as icons from "Constants/GlobalConstant/Glyphicons/Glyphicons-v5.0";

<Icon icon={email_medium} circle />`
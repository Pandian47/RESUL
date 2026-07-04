import { CustomCode, CustomCodePreview } from '../Common';
import { RSPTooltip } from 'Components/Tooltip';
export const STooltip = () => {

    return (
        <>
            <CustomCode title="RSPTooltip" c1='position' c2='text' value={codeTooltip}></CustomCode>
            <CustomCodePreview>
                <RSPTooltip position="top" text="Your tooltip"><span>Sample</span></RSPTooltip>
            </CustomCodePreview>

            <CustomCode title="RSPTooltip" c1='position' c2='text' value={codeClockTooltip}></CustomCode>
            <CustomCodePreview>
                <RSPTooltip position="top" text="Your tooltip"><span style={{marginRight: 25, paddingRight: 5}}>Top</span></RSPTooltip>
                <RSPTooltip position="right" text="Your tooltip"><span style={{marginRight: 25, paddingRight: 5}}>Right</span></RSPTooltip>
                <RSPTooltip position="bottom" text="Your tooltip"><span style={{marginRight: 25, paddingRight: 5}}>Bottom</span></RSPTooltip>
                <RSPTooltip position="left" text="Your tooltip"><span style={{marginRight: 25, paddingRight: 5}}>Left</span></RSPTooltip>
            </CustomCodePreview>
        </>
    )
}
let codeTooltip =
    `import { RSPTooltip } from 'Components/Tooltip';

<RSPTooltip position="top" text="Your tooltip">
    <span>Sample</span>
</RSPTooltip>`

let codeClockTooltip =
    `import { RSPTooltip } from 'Components/Tooltip';

<RSPTooltip position="top" text="Your tooltip">
    <span>Sample</span>
</RSPTooltip>

<RSPTooltip position="right" text="Your tooltip">
    <span>Right</span>
</RSPTooltip>

<RSPTooltip position="bottom" text="Your tooltip">
    <span>Bottom</span>
</RSPTooltip>

<RSPTooltip position="left" text="Your tooltip">
    <span>Left</span>
</RSPTooltip>`

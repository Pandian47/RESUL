import { CustomCode, CustomCodePreview, PropsList } from '../Common';
import { RSCancelBtn, RSPrimaryBtn, RSSecondaryBtn } from 'Components/RSButtons';
export const Button = () => {

    return(
        <>
            <CustomCode title="Primary" c1='btn' c2='default' value={codePrimaryBtn}></CustomCode>
            <CustomCodePreview><RSPrimaryBtn>Next</RSPrimaryBtn></CustomCodePreview>

            <CustomCode title="Secondary" c1='btn' value={codeSecondaryBtn}></CustomCode>
            <CustomCodePreview><RSSecondaryBtn>Save</RSSecondaryBtn></CustomCodePreview>

            <CustomCode title="Cancel" c1='btn' value={codeCancelBtn2}></CustomCode>
            <CustomCodePreview><RSCancelBtn>Cancel</RSCancelBtn></CustomCodePreview>

            <CustomCode title="Button" c1='default' value={codeGenerateBtn}></CustomCode>
            <CustomCodePreview><RSPrimaryBtn bgc="#2896f0">Generate</RSPrimaryBtn></CustomCodePreview>

            <CustomCode title="Secondary" c1='multi btn' value={codeMultiBtn}></CustomCode>
            <CustomCodePreview>
                <div className="btn-container">
                    <RSCancelBtn>Cancel</RSCancelBtn>
                    <RSSecondaryBtn className="blue">Save</RSSecondaryBtn>
                    <RSPrimaryBtn>Next</RSPrimaryBtn>
                </div>
            </CustomCodePreview>

            <CustomCode title="Secondary" c1='multi btn' c2='right align' value={codeMultiRightBtn}></CustomCode>
            <CustomCodePreview>
                <div className="btn-container d-flex justify-content-end">
                    <RSCancelBtn>Cancel</RSCancelBtn>
                    <RSSecondaryBtn className="blue">Save</RSSecondaryBtn>
                    <RSPrimaryBtn>Next</RSPrimaryBtn>
                </div>
            </CustomCodePreview>
        </>
    )
}
export const ButtonProps = () => {
    return(
        <>
            <h1 className="mt50">ButtonProps</h1>
            <PropsList title="className?" type="string">
                <p>Sets the <code>className</code> of the RSPrimaryBtn component.</p>
            </PropsList>
            <PropsList title="bgc?" type="string">
                <p>Specifies the <code>bgc</code> of backgroundColor in this button.</p>
            </PropsList>
            <PropsList title="paddingR?" type="string">
                <p>Specifies the <code>paddingR</code> of paddingRight value.</p>
            </PropsList>
            <PropsList title="txtc?" type="string">
                <p>Specifies the <code>txtc</code> of button text Color.</p>
            </PropsList>
        </>
    )
}


let codePrimaryBtn = 
`import { RSPrimaryBtn } from "Components/RSButtons";

<RSPrimaryBtn>Next</RSPrimaryBtn>`

let codeSecondaryBtn = 
`import { RSSecondaryBtn } from "Components/RSButtons";

<RSSecondaryBtn>Save</RSSecondaryBtn>`

let codeCancelBtn2 = 
`import { RSCancelBtn } from "Components/RSButtons";

<RSCancelBtn className="blue">Cancel</RSCancelBtn>`

let codeGenerateBtn = 
`import { RSPrimaryBtn } from "Components/RSButtons";

<RSPrimaryBtn bgc="#2896f0">Generate</RSPrimaryBtn>`

let codeMultiBtn = 
`import { RSPrimaryBtn } from "Components/RSButtons";
import { RSSecondaryBtn } from "Components/RSButtons";

<div className="btn-container">
    <RSSecondaryBtn className="pr0">Cancel</RSSecondaryBtn>
    <RSSecondaryBtn className="blue">Save</RSSecondaryBtn>
    <RSPrimaryBtn>Next</RSPrimaryBtn>
</div>`

let codeMultiRightBtn = 
`import { RSPrimaryBtn } from "Components/RSButtons";
import { RSSecondaryBtn } from "Components/RSButtons";

<div className="btn-container d-flex justify-content-end">
    <RSSecondaryBtn className="pr0">Cancel</RSSecondaryBtn>
    <RSSecondaryBtn className="blue">Save</RSSecondaryBtn>
    <RSPrimaryBtn>Next</RSPrimaryBtn>
</div>`
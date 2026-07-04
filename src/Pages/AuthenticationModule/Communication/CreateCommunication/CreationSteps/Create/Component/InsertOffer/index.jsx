import { coupon_medium, editor_coupon_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { useFormContext } from 'react-hook-form';
import OfferModal from 'Pages/AuthenticationModule/Components/OfferModal/OfferModal';
import RSTooltip from 'Components/RSTooltip';

const splitObj = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
};

const InsertOffer = (props) => {
    let textArea = props.textArea || false;
    const { onEditorMaxLen, maxLength = 350 } = props;
    const { watch } = useFormContext();
    const [splitTest, currentSplitTab] = watch(['splitTest', 'currentSplitTab']);
    const [show, setShow] = useState(false);

    // const canInsert = view && EditorUtils.canInsert(view.state, nodeType);
    return (
        <div className="rs-editor-custom-icon editor-custom-offer rseci-icon">
            <Button
                fillMode="flat"
                onClick={() => setShow(!show)}
                type="button"
                className={`k-icon-button p0 lh0 ${props?.fromRCS ? 'rcs-coupon-icon' : ''}`.trim()}
            >
                <RSTooltip text="Offer code" className="lh0" trigger={['hover', 'focus']}>
                    {/* <i className={`${editor_coupon_medium} icon-md `}></i> */}
                    <i
                        className={`${props?.fromRCS ? coupon_medium : editor_coupon_medium} icon-md ${
                            props?.fromRCS ? 'color-primary-blue' : ''
                        }`}
                    ></i>
                </RSTooltip>
            </Button>
            <OfferModal
                split={splitTest ? splitObj[currentSplitTab] : ''}
                show={show}
                handleClose={() => setShow(!show)}
                confirm={(data) => {
                    const { offerVal } = data;
                    if (textArea) {
                        props?.insert(`[${offerVal}]`);
                        setShow(!show);
                    } else {
                        replaceTextWithBounds(props.view, `[OFFER_CODE_`, `]`, `[${offerVal?.replace(/\s+/g, '')}]`, onEditorMaxLen, maxLength);
                        setShow(!show);
                    }
                }}
            />
        </div>
    );
};

export default InsertOffer;

const replaceTextWithBounds = (view, startText, endText, replaceText, onEditorMaxLen, maxLength = 350) => {
    const { state, dispatch } = view;
    const { doc, schema } = state;
    const { tr } = state;
    let found = false;

    // Iterate over the document nodes to find matching text
    doc.descendants((node, pos) => {
        if (node.isText) {
            let text = node.text;
            let startIndex = text.indexOf(startText);

            while (startIndex !== -1) {
                let endIndex = text.indexOf(endText, startIndex + startText?.length);

                if (endIndex !== -1) {
                    endIndex += endText?.length; // Adjust endIndex to include endText

                    // Create the replacement content
                    const startPos = pos + startIndex;
                    const endPos = pos + endIndex;
                    tr.replaceWith(startPos, endPos, schema.text(replaceText));

                    // Mark as found
                    found = true;

                    // Continue searching after the replaced text
                    startIndex = text.indexOf(startText, endIndex);
                } else {
                    break; // No more endText found after startText
                }
            }
        }
    });

    if (found) {
        // Dispatch the transaction to apply changes
        dispatch(tr);
    } else {
        setTimeout(() => {
            const state = view.state;
            const currentText = state.doc.textContent || '';
            const currentLength = currentText.length;
            const contentText = ' ' + replaceText + ' ';
            if (currentLength + contentText?.length > maxLength && onEditorMaxLen) {
                onEditorMaxLen(true)
                setTimeout(() => {
                    onEditorMaxLen(false)
                },3000)
                return;
            }
            const tr = state.tr;
            const markType = state.schema.marks.style;
            const mark = markType.create({ class: 'offer' });
            const content = state.schema.text(contentText);
            tr.addStoredMark(mark);
            // https://prosemirror.net/docs/ref/#state.Transaction.replaceSelectionWith
            tr.replaceSelectionWith(content, true);
            view.dispatch(tr);
            view.focus();
        },10)
    }
};

import { circle_minus_fill_mini, duplicate_mini, text_document_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo } from 'react';
import RSTooltip from 'Components/RSTooltip';

const EBElementActions = ({ contentTarget = false, handleActions }) => {

    return (
        <Fragment>
            <RSTooltip text="Save as snippet">
                <i className={`${text_document_mini} icon-xs white`} />
            </RSTooltip>
            <RSTooltip text="Duplicate">
                <i className={`${duplicate_mini} icon-xs white`} />
            </RSTooltip>
            {
                contentTarget &&
                <RSTooltip text="Content target">
                    <i onClick={() => { }} className={`${circle_minus_fill_mini} icon-xs white`}  id='rs_data_circle_minus_fill'/>
                </RSTooltip>
            }
            <RSTooltip text="Delete">
                <i onClick={() => handleActions('delete')} className={`${circle_minus_fill_mini} icon-xs white`}  id='rs_data_circle_minus_fill'/>
            </RSTooltip>
        </Fragment>
    );
};

export default memo(EBElementActions);
import { numberWithCommas } from 'Utils/modules/formatters';
import { arrow_down_mini, arrow_up_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const RenderAudienceCount = ({ fieldName, fieldIndex, audienceCount }) => {
    const { control, watch } = useFormContext();
    const attributesCount = useWatch({
        control,
        name: `${['attributeslistCount']}.${fieldName}`,
    });
    const { totalAudiences } = watch();
    const attributeCount = numberWithCommas(attributesCount?.[`${fieldIndex}`]?.[1] || 0);
    const audience = Number(attributesCount?.[`${fieldIndex}`]?.[0]);

    return (
        <Fragment>
            {fieldName === 'zeroDayLists' && fieldIndex === 0 ? (
                <div className="text-end lh0">
                    <span>({numberWithCommas(audienceCount)})</span>
                </div>
            ) : (
                <div className="text-end lh0">
                    <span>
                        {fieldIndex === 0 ? (
                            audience < totalAudiences ? (
                                <span>
                                    (-
                                    {attributeCount}
                                    <i className={`${arrow_down_mini} icon-xs color-primary-red`}></i>)
                                </span>
                            ) : (
                                <span>
                                    (+
                                    {attributeCount}
                                    <i className={`${arrow_up_mini} icon-xs color-primary-green`}></i>)
                                </span>
                            )
                        ) : audience < attributesCount?.[`${fieldIndex}` - 1]?.[0] ? (
                            <span>
                                (-
                                {attributeCount}
                                <i className={`${arrow_down_mini} icon-xs color-primary-red`}></i>)
                            </span>
                        ) : (
                            <span>
                                (+
                                {attributeCount}
                                <i className={`${arrow_up_mini} icon-xs color-primary-green`}></i>)
                            </span>
                        )}
                    </span>
                    &nbsp;&nbsp;
                    <span>{numberWithCommas(audience || 0)}</span>{' '}
                </div>
            )}
        </Fragment>
    );
};

export default memo(RenderAudienceCount);

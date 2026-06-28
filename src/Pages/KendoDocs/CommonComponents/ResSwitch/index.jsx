import { memo } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { Controller } from 'react-hook-form';
import { Switch } from '@progress/kendo-react-inputs';
import { RES_KENDO_SWITCH_CLASS as SW_CLASS } from '../../kendoDocsVariables';

import './resSwitch.scss';
const INPUT_CLASS = `${SW_CLASS}__input`;

const ResSwitch = ({
    mainClass = '',
    className = '',
    name,
    rules,
    control,
    defaultValue = false,
    onLabel = 'ON',
    offLabel = 'OFF',
    handleChange = () => {},
    preventChange = false,
    ...rest
}) => (
    <Controller
        rules={rules}
        control={control}
        name={name}
        defaultValue={defaultValue}
        render={({ field: { onChange, value } = {}, fieldState: { error } }) => {
            const hasError = get(error, 'message', '').length > 0;
            return (
                <div className={`${SW_CLASS} ${mainClass}`.trim()}>
                    {hasError && <div className="validation-message">{get(error, 'message', '')}</div>}
                    <Switch
                        {...rest}
                        className={`${INPUT_CLASS} ${className}`.trim()}
                        name={name}
                        onLabel={onLabel}
                        offLabel={offLabel}
                        checked={Boolean(value)}
                        onChange={(e) => {
                            if(!preventChange){
                                handleChange(e.target.value);
                                onChange(e.target.value);
                            }
                        }}
                    />
                </div>
            );
        }}
    />
);

ResSwitch.propTypes = {
    mainClass: PropTypes.string,
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    rules: PropTypes.object,
    control: PropTypes.object.isRequired,
    defaultValue: PropTypes.bool,
    onLabel: PropTypes.string,
    offLabel: PropTypes.string,
    handleChange: PropTypes.func,
    preventChange: PropTypes.bool,
};

export default memo(ResSwitch);

import { memo } from 'react';
const RSButton = ({ disabledClass = '', className = '', children, as = 'button', ...props }) => {
    const Component = as;
    return (
        <>
            <span className={`rs-button-wrapper ${disabledClass}`}>
                {as === 'button' ? (
                    <button {...props} className={`rs-button ${className}`}>
                        {children}
                    </button>
                ) : (
                    <Component {...props} className={`rs-button ${className}`}>
                        {children}
                    </Component>
                )}
            </span>
        </>
    );
};


export default memo(RSButton);

import { forwardRef } from 'react';
const CustomToggle = forwardRef(({ children, onClick }, ref) => (
    <div
        ref={ref}
        className={'menu-items'}
        onClick={(e) => {
            onClick?.(e);
        }}
    >
        {children}
    </div>
));

export default CustomToggle;

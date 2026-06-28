import { memo } from 'react';
const RSCard = ({
    children,
    className,
}) => {
  return (
    <div className={`rs-card-box ${className}`}>
        {children}
    </div>
  )
}
export default memo(RSCard)
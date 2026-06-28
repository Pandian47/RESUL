import { memo } from 'react';
import PropTypes from 'prop-types';

const HeaderNode = memo(({ data }) => {
    const { label, visits, dropOffs } = data;

    return (
        <div className="header-node">
            <div className="header-label">{label}</div>
            <div className="header-stats">
                {visits} visits, {dropOffs} drop-offs
            </div>
        </div>
    );
});

HeaderNode.displayName = 'HeaderNode';

HeaderNode.propTypes = {
    data: PropTypes.shape({
        label: PropTypes.string,
        visits: PropTypes.number,
        dropOffs: PropTypes.number,
    }),
};

export default HeaderNode;

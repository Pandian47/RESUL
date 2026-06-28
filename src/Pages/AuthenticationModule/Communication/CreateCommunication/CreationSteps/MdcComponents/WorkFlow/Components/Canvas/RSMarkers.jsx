const RSMarkers = ({ svgClick }) => {
    return (
        <svg style={{ position: 'absolute', top: 0, left: 0 }} onClick={svgClick} pointerEvents={'none'}>
            <defs>
                <marker
                    id="rs-marker-expand-collapse"
                    viewBox="0 0 40 40"
                    markerHeight={20}
                    markerWidth={20}
                    refX={0}
                    refY={18}
                    pointerEvents={'none'}
                    onClick={svgClick}
                >
                    <path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z"></path>
                </marker>
            </defs>
        </svg>
    );
};

export default RSMarkers;

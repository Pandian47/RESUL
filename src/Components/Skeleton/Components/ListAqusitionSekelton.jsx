import { scolor1, scolor2 } from './constants';
import { memo } from 'react';
import PropTypes from 'prop-types';

import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { mdmListAcquisitionSkeletonCriticalCss } from 'Components/Skeleton/pages/audience/mdm/mdmSkeletonCriticalCss';
import { skeletonBlockStyle } from 'Components/Skeleton/pages/audience/mdm/mdmSkeletonUtils';

const BAR_CHART_SKELETON_COLORS = ['#e2e7ee', '#e2e7ee', '#e2e7ee'];

const ListAqusitionSekelton = ({
	className = '',
	isChartSkeleton = false,
	isCustom = false,
	disableLegendAnimation = false,
	isError = false,
	stopAnimation = false,
	removeOffset = false,
	height = null,
	isCommunicationSent = false,
	injectCriticalCss = true,
}) => {
	const freezeAnimation = isError || stopAnimation;

	const viewWidth = 1220;
	const viewHeight = height ?? (isCommunicationSent ? 180 : (isCustom ? 275 : 335));
	const marginLeft = 12;
	const marginRight = 12;
	const marginTop = 8;
	const marginBottom = 8;
	const chartWidth = viewWidth - marginLeft - marginRight;
	const chartHeight = viewHeight - marginTop - marginBottom;

	const chartAreaHeight =
		height != null ? `${height}px` : isCommunicationSent ? '180px' : isCustom ? '275px' : '300px';

	const pt = (px, py) => {
		const x = marginLeft + chartWidth * px;
		const y = marginTop + chartHeight * (1 - py);
		return `${x},${y}`;
	};

	const seriesEmail = [
		[0.02, 0.25],
		[0.06, 0.74],
		[0.10, 0.47],
		[0.135, 0.06],
		[0.18, 0.42],
		[0.215, 0.78],
		[0.25, 0.56],
		[0.285, 0.40],
		[0.325, 0.95],
		[0.36, 0.28],
		[0.405, 0.94],
		[0.44, 0.46],
		[0.475, 0.86],
		[0.51, 0.87],
		[0.55, 0.48],
		[0.585, 0.47],
		[0.62, 0.06],
		[0.655, 0.04],
		[0.69, 0.97],
		[0.725, 0.29],
		[0.76, 0.09],
		[0.80, 0.98],
		[0.84, 0.28],
		[0.88, 0.10],
		[0.92, 0.90],
		[0.965, 0.25],
	];

	const seriesMobile = [
		[0.02, 0.10],
		[0.06, 0.32],
		[0.10, 0.23],
		[0.135, 0.00],
		[0.18, 0.22],
		[0.215, 0.38],
		[0.25, 0.25],
		[0.285, 0.02],
		[0.325, 0.38],
		[0.36, 0.10],
		[0.405, 0.42],
		[0.44, 0.26],
		[0.475, 0.23],
		[0.51, 0.23],
		[0.55, 0.03],
		[0.585, 0.00],
		[0.62, 0.11],
		[0.655, 0.44],
		[0.69, 0.24],
		[0.725, 0.21],
		[0.76, 0.24],
		[0.80, 0.05],
		[0.84, 0.39],
		[0.88, 0.12],
		[0.92, 0.37],
		[0.965, 0.00],
	];

	const toPolyline = (points) => points.map(([x, y]) => pt(x, y)).join(' ');

	const getSeriesColor = (seriesColorIndex) =>
		BAR_CHART_SKELETON_COLORS[seriesColorIndex] ?? BAR_CHART_SKELETON_COLORS[0];

	const renderSeriesLine = (points, keyPrefix, seriesColorIndex = 0, lineOpacity = 1) => {
		const staticColor = getSeriesColor(seriesColorIndex);
		const strokeColor = freezeAnimation ? staticColor : 'url(#list-shimmer)';
		const fillColor = freezeAnimation ? staticColor : 'url(#list-shimmer)';

		return (
			<>
				<polyline
					points={toPolyline(points)}
					fill="none"
					stroke={strokeColor}
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
					opacity={lineOpacity}
				/>
				{points.map(([x, y], idx) => {
					const [cx, cy] = pt(x, y).split(',').map(Number);
					return (
						<circle
							key={`${keyPrefix}-dot-${idx}`}
							cx={cx}
							cy={cy}
							r="6"
							fill={fillColor}
							opacity={lineOpacity}
						>
							{!freezeAnimation ? (
								<animate
									attributeName="opacity"
									values="0.7;1;0.7"
									dur="1.6s"
									begin={`${idx * 0.05}s`}
									repeatCount="indefinite"
								/>
							) : null}
						</circle>
					);
				})}
			</>
		);
	};

	const rootClassName = [
		'mdm-sk-list-acquisition-skeleton',
		isChartSkeleton && 'mdm-sk-list-acquisition-skeleton--chart-only',
		removeOffset && 'mdm-sk-list-acquisition-skeleton--no-offset',
		className,
	]
		.filter(Boolean)
		.join(' ');

	const legendHeight = isCustom ? 11 : 14;

	return (
		<div className={rootClassName} aria-hidden="true">
			{injectCriticalCss ? <style>{mdmListAcquisitionSkeletonCriticalCss}</style> : null}
			{isError && (
				<div className="mdm-sk-list-acquisition-error">
					<NoDataAvailableRender />
				</div>
			)}
			{!isChartSkeleton && (
				<div className='' style={{ display: "flex", alignItems: 'center', position: 'relative', justifyContent: 'space-between',marginBottom:"30px" }}>
					<div className="mdm-sk-list-acquisition-header">
						<div className="mdm-sk-block" style={skeletonBlockStyle({ width: 160, height: 24, radius: 5 })} />
						<div className="mdm-sk-block" style={skeletonBlockStyle({ width: 24, height: 24, circle: true })} />
					</div>
					<div className="mdm-sk-list-acquisition-controls">
						<div className="mdm-sk-block" style={skeletonBlockStyle({ width: 100, height: 24, radius: 5 })} />
						<div className="mdm-sk-block" style={skeletonBlockStyle({ width: 200, height: 24, radius: 5 })} />
						<div className="mdm-sk-block" style={skeletonBlockStyle({ width: 140, height: 24, radius: 5 })} />
					</div>
				</div>
			)}
			<div className="mdm-sk-list-acquisition-chart" style={{ height: chartAreaHeight }}>
				<div className="mdm-sk-list-acquisition-axes" />
				<svg
					className="mdm-sk-list-acquisition-chart-svg"
					viewBox={`0 0 ${viewWidth} ${viewHeight}`}
					preserveAspectRatio="none"
					role="img"
					aria-label="List acquisition skeleton"
				>
					{!freezeAnimation ? (
						<defs>
							<linearGradient id="list-shimmer" x1="-100%" y1="0%" x2="0%" y2="0%" gradientUnits="objectBoundingBox">
								<stop offset="0%" stopColor={scolor1} />
								<stop offset="50%" stopColor={scolor2} />
								<stop offset="100%" stopColor={scolor1} />
								<animate attributeName="x1" from="-100%" to="100%" dur="1.6s" repeatCount="indefinite" />
								<animate attributeName="x2" from="0%" to="200%" dur="1.6s" repeatCount="indefinite" />
							</linearGradient>
						</defs>
					) : null}
					{renderSeriesLine(seriesEmail, 'e', 0)}
					{!isCustom ? renderSeriesLine(seriesMobile, 'm', 1, 0.9) : null}
				</svg>
			</div>
			<div className="mdm-sk-list-acquisition-legend">
				<div className="mdm-sk-list-acquisition-legend-item">
					<div
						className="mdm-sk-block"
						style={skeletonBlockStyle({ width: 80, height: legendHeight, radius: 5 })}
					/>
				</div>
				{!isCustom && (
					<div className="mdm-sk-list-acquisition-legend-item">
						<div
							className="mdm-sk-block"
							style={skeletonBlockStyle({ width: 80, height: 14, radius: 5 })}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

ListAqusitionSekelton.propTypes = {
	className: PropTypes.string,
	isChartSkeleton: PropTypes.bool,
	isCustom: PropTypes.bool,
	disableLegendAnimation: PropTypes.bool,
	isError: PropTypes.bool,
	stopAnimation: PropTypes.bool,
	removeOffset: PropTypes.bool,
	height: PropTypes.number,
	isCommunicationSent: PropTypes.bool,
	injectCriticalCss: PropTypes.bool,
};

export default memo(ListAqusitionSekelton);

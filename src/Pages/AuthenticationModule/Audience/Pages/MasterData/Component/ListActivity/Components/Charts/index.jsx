import { chartBookMark, getChartColor } from 'Utils/modules/charts';
import { standardizeDateFormat } from 'Utils/modules/dateTime';
import { ListAqusitionSekelton } from 'Components/Skeleton/Skeleton';
import { areasplineChartOptions } from 'Constants/Charts';
import { AUDIENCE_CHART_COLORS } from 'Pages/AuthenticationModule/Audience/audienceChartColors';
import { Fragment, memo, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Highcharts from 'highcharts';

import RSHighchartsContainer from 'Components/Highcharts';

import MakeAcquisition from '../MakeAcquisition/MakeAcquisition';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { transformListAcquisitionData, MDM_LIST_ACTIVITY_CHART_HEIGHT, getListActivityChannelDisplayLabel } from '../../constant';
const NOTES_BOOKMARK_COLOR = AUDIENCE_CHART_COLORS.ch_primary_blue;

const BOOKMARK_MARKER = {
    symbol: 'bookmark',
    radius: 7,
    fillColor: NOTES_BOOKMARK_COLOR,
    lineColor: NOTES_BOOKMARK_COLOR,
    lineWidth: 1,
    states: {
        hover: {
            fillColor: NOTES_BOOKMARK_COLOR,
            lineColor: NOTES_BOOKMARK_COLOR,
            lineWidth: 2,
            radius: 8,
        },
    },
};

const hasNonZeroSeriesValues = (seriesData = []) =>
    seriesData.some((value) => Number(value) !== 0);

// Register custom bookmark symbol with Highcharts
if (typeof Highcharts !== 'undefined') {
    Highcharts.SVGRenderer.prototype.symbols.bookmark = function (x, y, w, h) {
        // Bookmark shape: rectangle with triangle on top
        // x, y: top-left corner
        // w: width, h: height
        const triangleHeight = h * 0.3; // Triangle takes 30% of height
        const rectHeight = h * 0.7; // Rectangle takes 70% of height
        const triangleWidth = w * 0.6; // Triangle width is 60% of total width
        const triangleOffset = (w - triangleWidth) / 2; // Center the triangle
        
        return [
            'M', x + triangleOffset, y, // Move to top-left of triangle
            'L', x + w / 2, y + triangleHeight, // Line to triangle point
            'L', x + triangleOffset + triangleWidth, y, // Line to top-right of triangle
            'L', x + w, y, // Line to top-right of rectangle
            'L', x + w, y + h, // Line to bottom-right
            'L', x, y + h, // Line to bottom-left
            'L', x, y, // Line to top-left
            'Z' // Close path
        ];
    };
}

const Charts = ({ type = '', chartType = 'LIST_ACTIVITY', activityType = 'activity', fromDate, toDate }) => {
    const {
        listAcquisitionChart = {},
        recipientAcquisition = [],
        errors = {},
        listAcquisitionChartLoading = false,
        listAcquisitionApiData = null,
        isListAcquisitionApiSuccess = false,
    } = useSelector((state) => state?.masterDataReducer ?? {});

    const [note, setNote] = useState({ show: false, data: {} });
    const [chartKey, setChartKey] = useState(0);

    // Determine which data source to use
    const dataSource = useMemo(() => {
        try {
            if (isListAcquisitionApiSuccess && listAcquisitionApiData) {
                return transformListAcquisitionData(listAcquisitionApiData);
            }

            if (listAcquisitionChart?.recipientListSeries?.length) {
                return {
                    dateRanges: listAcquisitionChart?.dateRanges ?? [],
                    recipientListSeries: listAcquisitionChart?.recipientListSeries ?? [],
                    allImportedSources: listAcquisitionChart?.allImportedSources ?? [],
                };
            }
        } catch {
            // Malformed API/chart payload — fall through to empty chart
        }

        return {
            dateRanges: [],
            recipientListSeries: [],
        };
    }, [isListAcquisitionApiSuccess, listAcquisitionApiData, listAcquisitionChart]);

    const noDataMessage = useMemo(() => {
        const chartError = errors?.listAcquisitionChart ?? errors?.listAcquisitionApiData;
        return typeof chartError === 'string' && chartError.trim() ? chartError : 'No data available';
    }, [errors?.listAcquisitionChart, errors?.listAcquisitionApiData]);

    const callBack = (e, record, FilterAcqusitionNotes) => {
        if (FilterAcqusitionNotes?.length) {
            setNote((prev) => ({ ...prev, show: true, data: { ...FilterAcqusitionNotes[0], date: e?.category } }));
        } else setNote((prev) => ({ ...prev, show: true, data: { ...record, date: e?.category } }));
    };

    const chartData = useMemo(() => {
        let finalData = {};
        const bookmarkOverlayPoints = [];

        const bookMarked = chartBookMark(recipientAcquisition, dataSource?.dateRanges);
        const activeSeries = (dataSource?.recipientListSeries ?? []).filter((rec) =>
            hasNonZeroSeriesValues(rec?.seriesData),
        );
        finalData['series'] = activeSeries.map((rec) => {
            const seriesColor = getChartColor(rec.seriesName);
            const displayName = rec.displayName || getListActivityChannelDisplayLabel(rec.seriesName);

            return {
            type: 'spline',
            zIndex: 1,
            point: {
                events: {
                    click: (e) => {
                        const FilterAcqusitionNotes = recipientAcquisition?.filter((filteritem) => {
                            const eventDate = new Date(standardizeDateFormat(filteritem?.eventDate));
                            const pointDate = new Date(standardizeDateFormat(e?.point?.category));
                            return (
                                eventDate.getTime() === pointDate.getTime() &&
                                rec.seriesName === filteritem.eventChannelName
                            );
                        });
                        return callBack(e?.point, rec, FilterAcqusitionNotes);
                    },
                },
            },
            name: displayName,
            marker: {
                symbol: 'square',
                lineColor: seriesColor,
                fillColor: seriesColor,
            },
            data: (Array.isArray(rec?.seriesData) ? rec.seriesData : []).map((data, index) => {
                const numValue = Number(data);
                const findItem = bookMarked.some((series) => series[0] === index && series[1] === rec?.seriesName);

                if (findItem) {
                    bookmarkOverlayPoints.push({
                        x: index,
                        y: numValue,
                        marker: BOOKMARK_MARKER,
                        _seriesRecord: rec,
                    });
                    return {
                        y: numValue,
                        marker: {
                            enabled: false,
                        },
                    };
                }
                return {
                    y: numValue,
                    marker: {
                        symbol: 'circle',
                        lineColor: seriesColor,
                        fillColor: seriesColor,
                    },
                };
            }),
            color: seriesColor,
        };
        });

        if (bookmarkOverlayPoints.length) {
            finalData['series'].push({
                type: 'scatter',
                name: '_listActivityNotes',
                showInLegend: false,
                zIndex: 10,
                enableMouseTracking: true,
                stickyTracking: false,
                lineWidth: 0,
                marker: BOOKMARK_MARKER,
                data: bookmarkOverlayPoints,
                point: {
                    events: {
                        click: (e) => {
                            const rec = e?.point?.options?._seriesRecord;
                            if (!rec) return;

                            const category =
                                e?.point?.category ??
                                dataSource?.dateRanges?.[e?.point?.x ?? e?.point?.index];
                            const FilterAcqusitionNotes = recipientAcquisition?.filter((filteritem) => {
                                const eventDate = new Date(standardizeDateFormat(filteritem?.eventDate));
                                const pointDate = new Date(standardizeDateFormat(category));
                                return (
                                    eventDate.getTime() === pointDate.getTime() &&
                                    rec.seriesName === filteritem.eventChannelName
                                );
                            });
                            return callBack({ category }, rec, FilterAcqusitionNotes);
                        },
                    },
                },
            });
        }

        finalData['categories'] = dataSource?.dateRanges;
        return finalData;
    }, [dataSource, recipientAcquisition]);

    return (
        <Fragment>
            <div
                className="mdm-list-activity-chart-body"
                style={{ minHeight: MDM_LIST_ACTIVITY_CHART_HEIGHT, height: MDM_LIST_ACTIVITY_CHART_HEIGHT }}
            >
                {listAcquisitionChartLoading ? (
                    <ListAqusitionSekelton
                        isChartSkeleton={true}
                        height={MDM_LIST_ACTIVITY_CHART_HEIGHT}
                    />
                ) : chartData?.series?.length ? (
                    <RSHighchartsContainer
                        key={`${type}-${chartKey}`}
                        options={areasplineChartOptions({ formatdateListactivity: true, ...chartData })}
                        type={type}
                    />
                ) : (
                    <div style={{ position: 'relative', height: '100%' }}>
                        <ListAqusitionSekelton
                            isChartSkeleton={true}
                            disableLegendAnimation
                            height={MDM_LIST_ACTIVITY_CHART_HEIGHT}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                            }}
                        >
                            <NoDataAvailableRender message={noDataMessage} />
                        </div>
                    </div>
                )}
            </div>
            <MakeAcquisition
                data={note.data}
                show={note.show}
                activityType={activityType}
                fromDate={fromDate}
                toDate={toDate}
                handleClose={() => {
                    setNote((prev) => ({ ...prev, show: !prev.show }));
                    setChartKey(prevKey => prevKey + 1);
                }}
            />
        </Fragment>
    );
};

export default memo(Charts);

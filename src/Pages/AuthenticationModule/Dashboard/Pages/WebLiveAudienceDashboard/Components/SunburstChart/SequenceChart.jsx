import { ch_age, ch_androidColor, ch_call_center, ch_color1, ch_color2, ch_color3, ch_color4, ch_color5, ch_color6, ch_color7, ch_color8, ch_color9, ch_country, ch_direct_mail, ch_email, ch_facebook, ch_female, ch_gender, ch_google_plus, ch_iosColor, ch_linkedIn, ch_male, ch_mobile_push, ch_notifications, ch_others, ch_paid_media, ch_pinterest, ch_qR_code, ch_rcs, ch_secondary_green, ch_sms, ch_twitter, ch_vms, ch_web_push, ch_website, ch_whatsapp } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// import ProductData from "./ProductData";

const WIDTH = 495;
const Height = 300;
const RADIUS = Math.min(WIDTH, Height) / 2;
const b = {
    w: 75,
    h: 30,
    s: 3,
    t: 10,
};

// Mapping of step names to colors.
// custom edit
// var sunColors = { };

// sunColors['clientName'] = ch_linkedIn;
// sunColors['Product_Analytics'] = ch_linkedIn;
// sunColors['equity'] = ch_linkedIn;
// sunColors['banking & financial services fund'] = ch_call_center;

// brand name
// sunColors['clientName'] = ch_linkedIn;

// 1st level
// sunColors['audProductName1'] = ch_call_center;
// sunColors['audProductName2'] = ch_web_push;

// 2nd level
// sunColors['audProductCate1'] = ch_mobile_push;
// sunColors['audProductCate2'] = ch_vms;

// 3rd level
// sunColors['audProductType1'] = ch_qR_code;
// sunColors['audProductType2'] = ch_direct_mail;

// 4th level
// sunColors['audProduct1'] = ch_country;
// sunColors['audProduct2'] = ch_website;

// console.log("sassasas", sunColors);

// const colorss = {
//   'Vision Bank': '#5f77ac',
//   'equity': '#31ccfd',
// };

// Mapping of step names to colors.
// custom edit
// var colors = {};

// const colorsDatas = [
//   { key: 'Vision Bank', value: '#5f77ac' },
//   { key: 'equity', value: '#31ccfd' },
// ];

// const paColorLogic = (data) => {
//   console.log("MAIN DATA::", data);
//   let namesLength = data.children?.length
//   let cnMerge = {}
//   let cnMerge2 = []
//   let colorsField = Object.assign(JSON.stringify(colorsNames))
//   let mergeColor = JSON.parse(colorsField)?.splice(0, namesLength)
//   // console.log("namesLength", namesLength);
//   // console.log("colorsNames", colorsNames);
//   // console.log("colorsField", colorsField);
//   // console.log("mergeColor", mergeColor);
//   // console.log("data.children", data?.children);
//    data?.children?.map((item, index) => {
//     cnMerge[item.name] = mergeColor[index]
//     cnMerge2.push({key: item.name, value: mergeColor[index]})
//     // console.log("cnMerge[item.name]", `${item.name}, ${index}`);
//     // console.log("mergeColor[index]", mergeColor[index]);
//   })
//   // console.log("CN MERGE", cnMerge);
//   // console.log("CN MERGE 2", cnMerge2);
//   return [cnMerge, cnMerge2]
// }

const paColorLogic = (data) => {
    // console.log("MAIN DATA::", data);

    let cnMerge = {};
    let cnMerge2 = [];
    let colorsField = [...colorsNames]; // Copy the array to avoid mutation
    let colorIndex = 0;

    const extractNames = (obj) => {
        if (Array.isArray(obj)) {
            obj.forEach((item) => extractNames(item));
        } else if (typeof obj === 'object') {
            if (obj.hasOwnProperty('name')) {
                const color = colorsField[colorIndex % colorsField?.length];
                cnMerge[obj.name] = color;
                cnMerge2.push({ key: obj.name, value: color });
                colorIndex++;
            }
            if (obj.hasOwnProperty('children')) {
                extractNames(obj.children);
            }
        }
    };

    extractNames(data.children);

    return [cnMerge, cnMerge2];
};

// function extractNames(obj) {
//   let result = [];
//   let colorIndex = 0;

//   function recurse(innerObj) {
//     if (innerObj instanceof Array) {
//       innerObj.forEach(item => {
//         recurse(item);
//       });
//     } else if (typeof innerObj === 'object') {
//       if (innerObj.hasOwnProperty('name')) {
//         result.push({ key: innerObj['name'], value: colorsNames[colorIndex % colorsNames?.length] });
//         colorIndex++;
//       }
//       Object.keys(innerObj).forEach(key => {
//         recurse(innerObj[key]);
//       });
//     }
//   }

//   recurse(obj);
//   return result;
// }

// const getAllNames = (data) => {
//   let names = [];
//   function recurse(node) {
//     if (node.name) {
//       names.push(node.name);
//     }
//     if (node.children) {
//       node.children.forEach(child => recurse(child));
//     }
//   }
//   recurse(data);
//   return names;
// }

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select('#sequence').append('div:ul').attr('width', WIDTH).attr('height', 50).attr('id', 'trail');
    // Add the label at the end, for the percentage.
    trail.append('ul:div').attr('id', 'endlabel').style('fill', '#cccccc');
}

function drawLegend(data) {
    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
        w: 75,
        h: 30,
        s: 3,
        r: 3,
    };

    // const namesArray = extractNames(data)
    // const namesArray2 = paColorLogic(data)
    // console.log("namesArray::", namesArray);
    // console.log("namesArray2::", namesArray2);
    // console.log("getAllNames::", getAllNames(data)?.length);

    const [colorsx, colorsData] = paColorLogic(data);
    // console.log("colorsData", colorsData);
    var legend = d3
        .select('#legend')
        .append('svg:svg')
        .attr('width', li.w)
        // .attr("height", d3.keys(colors)?.length * (li.h + li.s));
        .attr('height', colorsData?.length * (li.h + li.s));

    var g = legend
        .selectAll('g')
        // .data(d3.entries(colors))
        .data(colorsData)
        .enter()
        .append('svg:g')
        .attr('transform', function (d, i) {
            return 'translate(0,' + i * (li.h + li.s) + ')';
        });

    g.append('svg:rect')
        .attr('rx', li.r)
        .attr('ry', li.r)
        .attr('width', li.w)
        .attr('height', li.h)
        .style('fill', function (d) {
            return d.value;
        });

    g.append('svg:text')
        .attr('x', li.w / 2)
        .attr('y', li.h / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text(function (d) {
            return d.key;
        });
}

function toggleLegend() {
    var legend = d3.select('#legend');
    if (legend.style('visibility') === 'hidden') {
        legend.style('visibility', null);
    } else {
        legend.style('visibility', 'hidden');
    }
}

export const SequenceChart = (props) => {
    const svgRef = useRef(null);
    // const [viewBox, setViewBox] = useState("0,0,0,0");
    const partition = (data) =>
        d3.partition().size([2 * Math.PI, RADIUS * RADIUS])(
            d3
                .hierarchy(data)
                .sum((d) => d.size)
                .sort((a, b) => b.value - a.value),
        );

    let colorsField = Object.assign(JSON.stringify(colorsNames));
    const color = d3
        .scaleOrdinal()
        .domain(props?.data?.children?.map((item) => item?.name) ?? [])
        .range(JSON.parse(colorsField)?.splice(0, props?.data?.children?.length));
    // console.log("AAAAAA", props?.data?.children.map(item => item.name));
    const arc = d3
        .arc()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .padAngle(1 / RADIUS)
        .padRadius(RADIUS)
        .innerRadius((d) => Math.sqrt(d.y0))
        .outerRadius((d) => Math.sqrt(d.y1) - 1);

    const mousearc = d3
        .arc()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .innerRadius((d) => Math.sqrt(d.y0))
        .outerRadius(RADIUS);
    // Update the breadcrumb trail to show the current sequence and percentage.
    function updateBreadcrumbs(nodeArray, percentageString) {
        // Data join; key function combines name and depth (= position in sequence).
        var trail = d3
            .select('#trail')
            .selectAll('li')
            .data(nodeArray, function (d) {
                return (d?.data?.name ?? '') + (d?.depth ?? 0);
            });
        // Remove exiting nodes.
        trail.exit().remove();

        // Add breadcrumb and label for entering nodes.
        const [colorsx, colorsData] = paColorLogic(props?.data);

        // console.log("One check 2:: paColorLogic::", paColorLogic(props?.data));

        var entering = trail
            .enter()
            .append('ul:li')
            .style('background-color', function (d) {
                return colorsx[d?.data?.name];
            });

        entering
            .append('ul:span')
            .attr('points', breadcrumbPoints)
            .style('fill', function (d) {
                return colorsx[d?.data?.name];
            });

        entering
            .append('ul:div')
            .attr('x', (b.w + b.t) / 2)
            .attr('y', b.h / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(function (d) {
                return d?.data?.name ?? '';
            });

        // Merge enter and update selections; set position for all nodes.
        entering.merge(trail).attr('transform', function (d, i) {
            return 'translate(' + i * (b.w + b.s) + ', 0)';
        });

        // Now move and update the percentage at the end.
        d3.select('#trail')
            .select('#endlabel')
            .attr('x', (nodeArray?.length + 0.5) * (b.w + b.s))
            .attr('y', b.h / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(percentageString);

        // Make the breadcrumb trail visible, if it's hidden.
        d3.select('#trail').style('visibility', '');
    }
    function breadcrumbPoints(d, i) {
        const tipWidth = 10;
        const points = [];
        points.push('0,0');
        points.push(`${b.w},0`);
        points.push(`${b.w + tipWidth},${b.h / 2}`);
        points.push(`${b.w},${b.h}`);
        points.push(`0,${b.h}`);
        if (i > 0) {
            // Leftmost breadcrumb; don't include 6th vertex.
            points.push(`${tipWidth},${b.h / 2}`);
        }
        return points.join(' ');
    }
    const getAutoBox = () => {
        if (!svgRef.current) {
            return '';
        }

        const { x, y, width, height } = svgRef.current.getBBox();

        return [x, y, width, height].toString();
    };
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        // const root = partition(ProductData);
        // alert(props?.data)
        const root = partition(props?.data);
        // console.log("DATA:", props?.data);
        // Basic setup of page elements.
        initializeBreadcrumbTrail();
        drawLegend(props?.data);
        d3.select('#togglelegend').on('click', toggleLegend);
        const svg = d3.select(svgRef.current);
        // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
        const element = svg.node();
        element.value = { sequence: [], percentage: 0.0 };

        const label = svg
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', '#888')
            // .style("visibility", "hidden");
            .style('display', 'none');

        label
            .append('tspan')
            .attr('class', 'percentage')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '-0.1em')
            .attr('font-size', '3em')
            .text('');

        label.append('tspan').attr('x', 0).attr('y', 0).attr('dy', '1.5em').text('of visits begin with this sequence');

        svg.attr('viewBox', `${-RADIUS} ${-RADIUS} ${WIDTH} ${WIDTH}`)
            .style('max-width', `${WIDTH}px`)
            .style('font', '12px sans-serif');
        // For efficiency, filter nodes to keep only those large enough to see.
        var nodes = root.descendants().filter(function (d) {
            // console.log("NAME::", d.data.name);
            return d.x1 - d.x0 > 0.005; // 0.005 radians = 0.29 degrees
        });
                const path = svg
            .append('g')
            .selectAll('path')
            .data(nodes)
            .join('path')
            .attr('fill', (d) => {
                // console.log("COLOR:::", {
                //   name: d.data.name,
                //   value: color(d.data.name)
                // });
                return paColorLogic(props?.data)?.[0]?.[d?.data?.name];
                // return color(d.data.name)
            })
            .attr('d', arc);

        svg.append('g')
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseleave', () => {
                // path.attr("fill-opacity", 1);
                // label.style("visibility", "hidden");
                // // Update the value of this view
                // element.value = { sequence: [], percentage: 0.0 };
                // element.dispatchEvent(new CustomEvent("input"));

                // Hide the breadcrumb trail
                d3.select('#trail').style('visibility', 'hidden');

                // Deactivate all segments during transition.
                d3.selectAll('path').on('mouseover', null);

                // Transition each segment to full opacity and then reactivate it.
                d3.selectAll('path')
                    .transition()
                    .duration(1000)
                    .style('opacity', 1)
                    .on('end', function () {
                        // d3.select(this).on("mouseover", mouseover);
                    });

                d3.select('#explanation').style('visibility', 'hidden');
                d3.select('#percentage-list').style('visibility', 'hidden');
            })
            .selectAll('path')
            .data(nodes)
            .join('path')
            .attr('d', mousearc)
            .on('mouseenter', (event, d) => {
                // console.log("FILL::", d);
                // Get the ancestors of the current segment, minus the root
                const sequence = d.ancestors().reverse().slice(1);
                // Highlight the ancestors
                path.attr(
                    'fill-opacity',
                    (node) => (sequence.indexOf(node) >= 0 ? 1.0 : 1.0), // 0.3
                );
                const percentage = ((100 * d.value) / root.value).toPrecision(3);
                label.style('visibility', null).select('.percentage').text(percentage); //  + "%"
                // Update the value of this view with the currently hovered sequence and percentage
                element.value = { sequence, percentage };
                element.dispatchEvent(new CustomEvent('input'));

                var forLegendPercentage = ((100 * d.value) / totalSize).toPrecision(3);
                var percentageString = forLegendPercentage; //  + "%"
                if (forLegendPercentage < 0.1) {
                    percentageString = '< 0.1%';
                }

                d3.select('#percentage').text(percentageString);
                d3.select('#percentage2').text(percentageString);
                d3.select('#percentage3').text(d?.data?.name ?? '');
                d3.select('#percentage-list').text(percentageString + '%');

                d3.select('#explanation').style('visibility', null);
                d3.select('#explanation2').style('visibility', null);
                d3.select('#percentage-list').style('visibility', null);

                var sequenceArray = d.ancestors().reverse();
                sequenceArray.shift(); // remove root node from the array
                updateBreadcrumbs(sequenceArray, percentageString);

                // Fade all the segments.
                d3.selectAll('#sunburst-chartview path').style('opacity', 0.3);

                // Then highlight only those that are an ancestor of the current segment.
                svg.selectAll('path')
                    .filter(function (node) {
                        return sequenceArray.indexOf(node) >= 0;
                    })
                    .style('opacity', 1);
            });
        // Get total size of the tree = value of root node from partition.
        totalSize = path.datum().value;
        svg.attr('viewBox', getAutoBox);
        // return element;
    }, []);

    return (
        <div>
            <div id="sunburstChartContainer">
                <div className="explanation-view" id="explanation" style={{ visibility: 'hidden' }}>
                    <span id="percentage"></span>
                    <br />
                    of visits begin with this sequence of pages
                </div>
                <div className="explanation-view" id="explanation2">
                    {/* <small id="percentage3" className="fs13"></small> */}
                    <span id="percentage2" className="font-bold fs24">
                        100
                    </span>
                    <sub className="fs15">%</sub>
                    <br />
                    of visits begin with this sequence of pages
                </div>
            </div>

            <div id="sidebar" className="d-none">
                <input type="checkbox" id="togglelegend" />
                Legend
                <br />
                <div id="legend" style={{ visibility: 'hidden' }}></div>
            </div>

            <div id="sunburst-chartview">
                <svg width={WIDTH} height={Height} ref={svgRef} />
            </div>

            <div id="main" className="sunburst-legend">
                <div id="sequence"></div>
                <span id="percentage-list" style={{ visibility: 'hidden' }}>
                    100%
                </span>
            </div>
        </div>
    );
};

export default SequenceChart;

let colorsNames = [
    ch_color1,
    ch_color2,
    ch_color3,
    ch_color4,
    ch_color5,
    ch_color6,
    ch_color7,
    ch_color8,
    ch_color9,
    ch_linkedIn,
    ch_call_center,
    ch_web_push,
    ch_mobile_push,
    ch_vms,
    ch_rcs,
    ch_sms,
    ch_whatsapp,
    ch_qR_code,
    ch_direct_mail,
    ch_paid_media,
    ch_twitter,
    ch_facebook,
    ch_secondary_green,
    ch_gender,
    ch_male,
    ch_female,
    ch_age,
    ch_country,
    ch_website,
    ch_others,
    ch_notifications,
    ch_pinterest,
    ch_androidColor,
    ch_iosColor,
    ch_email,
    ch_google_plus,
    ch_whatsapp,
];

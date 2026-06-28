import { chartSizing } from 'Constants/Charts/commonFunction';
import { ch_legendtextSize, ch_medium_orange, ch_primary_black } from 'Constants/GlobalConstant/Colors/colorsVariable';
const areaChartOptions = ({ ...args }) => {
  return {
    chart: {
      type: "area",
      height: args?.height ?? chartSizing['area'],
      className: "chart-line-animate",
      reflow: true,
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      area: {
        stacking: "normal",
        lineWidth: 2,
        fillOpacity: 0.4,
        marker: {
          symbol: "circle",
          lineWidth: 2,
          lineColor: (args?.series ?? ch_medium_orange).map((item) => {
            return item.color;
          }),
          fillColor: "white",
          radius: 4,
        },
      },
      series: {
        pointPlacement: "on",
      },
    },
    // xAxis: {
    //     ...(args.xAxis.title && {title: args.xAxis.title}),
    //     categories: args?.xAxis?.categories?.map((item) => {
    //         return item;
    //     })
    // },
    xAxis: {
      title: {
        text: args?.xAxis?.title ?? "",
        y: 4,
      }, // 'Date'
      categories: args?.categories ?? [],
      tickInterval: args?.xAxis?.tickInterval ?? 1,
      // min: 0.5,
      // max: 4.5,
      // categories:
      // args?.xAxis === 'Hours'
      //     ? args?.categories?.map((item) => {
      //           let newDate = new Date(item).toLocaleTimeString();
      //           let splitDate = newDate.split(':');
      //           let hr = splitDate[0];
      //           let min = splitDate[1];
      //           let sec = splitDate[2];
      //           return hr + 'th hr';
      //       })
      //     : args?.categories?.map((item) => {
      //           let newDate = new Date(item).toDateString();
      //           let splitDate = newDate.split(' ');
      //           return splitDate[2] + ' ' + splitDate[1];
      //       }),
      labels: {
        rotation: 0,
      },
    },
    yAxis: {
      title: {
        text: args?.yAxis?.title,
        x: -10,
      },
      labels: {
        format: args?.yAxis?.labelFormat ?? '{value:,.0f}',
        enabled: args?.yAxis?.labels ?? true
      },
      tickInterval: args?.yAxis?.tickInterval,
    },
    tooltip: {
      useHTML: true,
      headerFormat: '<span class="font-xs">{point.key}',
      pointFormat:
        '<br/><span class="font-monospace" style="color:{point.color}">\u25CF</span>&nbsp;<span class="font-xxs">{series.name}: </span>' +
        '<span class="font-xxs">{point.y}</span>',
      footerFormat: "</span>",
    },
    legend: {
      enabled: args?.legend?.enabled ?? true,
      itemMarginTop: args?.legend?.marginTop ?? -7,
      y: 20,
      itemStyle: {
        fontFamily: "MuktaRegular",
        fontWeight: "normal",
        fontSize: ch_legendtextSize,
        color: ch_primary_black,
      },
      marker: { symbol: "square", verticalAlign: "middle", radius: "5" },
      symbolHeight: 9,
      symbolWidth: 8,
      symbolRadius: 2,
    },
    series: (args?.series ?? [])?.map((item) => {
      return {
        name: item.name,
        data: item?.data?.map((item) => item || 0),
        color: item.color,
        legendIndex: 0,
        zoneAxis: "x",
        fillColor: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 2 },
          stops: [
            [0, `${item.color + 30}`],
            [1, "rgb(64 171 175 / 0%)"],
          ],
        },
      };
    }),
  };
};

export default areaChartOptions;

' use strict';

/ !!! PROGRAM BEGINS HERE !!! /

/* In this tutorial, we will demonstrate using NDVI values provided by Astro
Digital's values API, along with precipitation values provided by NOAA, to
create a chart of NDVI response as it relates to rainfall over time. There are
many ways to approach this, but we will use the open source Chart.js library.
Chart.js is very powerful, with many configureable options, and it is worth
browsing its documentation to learn more about its capabilities. This tutorial
will keep things relatively simple by taking advantage of default settings,
whenever possible, but you are encouraged to check out the documentation at
http://www.chartjs.org/docs/

To prepare the data for charting, we will will discard the geometry and
create an array of values representing only the value and date of each NDVI
measurement for each feature. */
const ndviData = adNdviData.results.map((field) => {
  return field.value.properties.ndvi_values;
});

/* Because we are charting multiple features, we will define a starting index of
0 so that the initial chart view will show the first feature in the array. */
let fieldIndex = 0;

/* Chart.js requires a sequentially ordered array of values to set the
y-position of each datapoint on the horizontal axis, along with a matching
list of values to use as labels, so we will break the NDVI date and values
properties into individual arrays. We will then reverse the arrays in order to
account for the fact that the values response product is ordered by descending
dates, whereas we want the chart to show dates ascending from left to right. */
const ndviValues = ndviData[fieldIndex].map((field) => field.value).reverse();
const ndviDates = ndviData[fieldIndex].map((field) => field.date).reverse();

/* In order to demonstrate melding of datasources, we will include an array
of precipitation values provided by NOAA. To match the NDVI values, Chart.js
requires this array to have a one-to-one relationship with the dates in the
NDVI array. */
const precipValues = noaaPrecipData.map((date) => date.value).reverse();

/* Chart.js must be initialized with a data object, which is an array
representing settings for each axis. It is here that we name our axes, define
their datasources, and and describe the style of their lines, data points, and
fill. */
var chartData = {
  labels: ndviDates,
  datasets: [{
    label: 'NDVI',
    yAxisID: 'y-axis-1',
    data: ndviValues,
    borderColor: 'rgba(119, 226, 24, 1)',
    backgroundColor: 'rgba(119, 226, 24, 0.2)',
    pointBackgroundColor: 'rgba(123, 255, 26, .8)',
  }, {
    label: 'Precipitation (in)',
    yAxisID: 'y-axis-2',
    data: precipValues,
    /* Fill is set to false so that only a line is displayed, rather than
    displaying a filled area as is the default. */
    fill: false,
    borderColor: 'rgba(27, 155, 255, 1)',
    pointBackgroundColor: 'rgba(27, 155, 255, .8)',
  }]
};

/* Chart.js also requires a set of options, which define the overall
characteristics of the chart along with those of its individual axes. */
var chartOptions = {
  // Enables dynamic resizing of the chart to fit its container.
  responsive: true,
  /* Setting the maintainAspectRatio option to false means that the chart will
  expand to fill its container regardless of shape, whereas if set to true it
  will maintain the original aspect ratio even if its container only expands
  in one direction. */
  maintainAspectRatio: false,
  // Define the chart's title.
  title: {
    display: true,
    text: `NDVI / Precipitation (Field Index: ${fieldIndex})`,
    fontSize: 15
  },
  /* Make the individual points invisible until mouseover by setting their
  radius to 0, but make the size of the target 6 points so that a mouseover will
  be registered when the pointer is near a datapoint but not touching it. */
  elements: {
    point: {
      radius: 0,
      hitRadius: 6
    }
  },
  scales: {
    xAxes: [{
      ticks: {
        maxTicksLimit: 25
      }
    }],
    yAxes: [{
      id: 'y-axis-1',
      scaleType: 'linear',
      // Set the NDVI value scale labels to the left side of the chart.
      position: 'left',
      /* Ensure that the NDVI values scale begins at 0 and ends at 1, regardless
      of the actual range of the data. */
      ticks: {
        beginAtZero: true,
        max: 1,
      }
    }, {
      id: 'y-axis-2',
      scaleType: 'linear',
      // Set the precipitation scale labels to the right side of the chart.
      position: 'right'
    }]
  }
};

/* Define a new Chart.js chart using the previously-defined options. The
initial datasource is the NDVI values of the field at index 0, which we will
increment through by using the chart's update method. */
var ctx = document.getElementById('chart');
var chart = new Chart(ctx, {
  type: 'line',
  data: chartData,
  options: chartOptions
});

/* Cycle through features, updating the chart's datasource with each field's
NDVI values. */
setInterval(() => {
  // Increment field, or repeat loop after all fields have been cycled through.
  fieldIndex = (fieldIndex < ndviData.length - 1) ? fieldIndex + 1 : 0;
  // Set the chart's title to reference the active field index.
  chart.options.title.text = `NDVI / Precipitation (Field Index: ${fieldIndex})`
  // Set the chart's values to reference the active field index.
  chart.data.datasets[0].data = ndviData[fieldIndex].map((field) => field.value).reverse();
  // Update the chart.
  chart.update();
}, 500);

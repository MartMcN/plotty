//'use strict'

// Tryin to figure out how to read data from a file.
// Very Strange to me, aparently you need a "view" object.

// File Selection
const fileInputEl = document.querySelector("#file-input");
let selectedFile;

// File Reading object
const reader = new FileReader();
let view;

// Text Decoder
const win1251decoder = new TextDecoder("windows-1251");

// Handlers

// File Selection
fileInputEl.addEventListener("change", () => {
  // Choose the first file
  [selectedFile] = fileInputEl.files;

  // Start loading the file
  reader.readAsArrayBuffer(selectedFile);
});

// File Loaded Handler
reader.onloadend = () => {
  //
  console.log("File Loaded", reader.readyState); // readyState will be 2
  //
  view = new Uint8Array(reader.result);
  console.log(view);

  // Parse the Input
  parseLine(view);
};

const HASH = 35; // #
const QMARK = 63; // ?
const CARET = 94; // ^
const COMMA = 44; // ,

// looking for "##?^##,""
// Format of data "##?^##,123456,123456,"
// First number is the tick must be 6 or less characters
// Second number is voltage in mV 6 or less characters

let readings = [];

const parseLine = function (data) {
  // Find a HASH
  data.forEach((el, index) => {
    if (el != HASH) return false;

    index++;

    if (
      data[index++] === HASH &&
      data[index++] === QMARK &&
      data[index++] === CARET &&
      data[index++] === HASH &&
      data[index++] === HASH &&
      data[index] === COMMA
    ) {
      // Header Found

      const arrylen = data.length;

      // Find next Comma
      let indexStart = index + 1;
      let searchDone = false;
      let count = 6;

      while (!searchDone) {
        index++;
        //console.log(`index:${index} Data:${data[index]}`);
        if (index >= arrylen) search = "nofound";
        if (count-- === 0) searchDone = "nofound";
        if (data[index] === COMMA) searchDone = "found";
      }

      if (searchDone != "found") return false;
      const tick = +win1251decoder.decode(data.slice(indexStart, index));

      // Find next Comma
      indexStart = index + 1;
      searchDone = false;
      count = 6;

      while (!searchDone) {
        index++;
        //console.log(`index:${index} Data:${data[index]}`);
        if (index >= arrylen) search = "nofound";
        if (count-- === 0) searchDone = "nofound";
        if (data[index] === COMMA) searchDone = "found";
      }

      if (searchDone != "found") return false;
      const voltage = +win1251decoder.decode(data.slice(indexStart, index));

      const reading = {
        ticks: tick,
        volts: voltage,
      };

      readings.push(reading);
    }
  });

  // Send the data of for plotting
  processData(readings);
};

function processData(allRows) {
  let ticks = [];
  let mVolts = [];
  let row;

  let i = 0;
  while (i < allRows.length) {
    row = allRows[i];
    ticks.push(row["ticks"]);
    mVolts.push(row["volts"]);
    i += 1;
  }

  //console.log("ticks", ticks);
  //console.log("volts", mVolts);

  makePlotly(ticks, mVolts);
}

function makePlotly(xData, yData) {
  let traces = [
    {
      x: xData,
      y: yData,
      //name: "TEST DATA",
      line: {
        color: "#ff0000ff",
        width: 1,
      },
    },
  ];

  let layout = {
    title: "Battery Voltage",
    titlefont: {
      family: "Arial, sans-serif",
      size: 22,
      color: "black",
    },
    //autosize: false,
    //width: 500,
    height: 700,
    margin: {
      b: 60,
      t: 60,
      pad: 16,
    },
    paper_bgcolor: "#eee",
    plot_bgcolor: "#eee",

    //title: "Basic Line Chart",
    showlegend: false,
    yaxis: {
      titlefont: {
        family: "Arial, sans-serif",
        size: 18,
        color: "black",
      },
      title: "Volts mV",
      range: [0, 5000],
    },
    xaxis: {
      //tickmode: "linear", //  If "linear", the placement of the ticks is determined by a starting position `tick0` and a tick step `dtick`
      //tick0: 0,
      //dtick: (60 * 60) / 5,
      //dtick: (60 * 60) / 5,

      tickmode: "array", // If "array", the placement of the ticks is set via `tickvals` and the tick text is `ticktext`.
      tickvals: [
        0,
        720 * 2,
        720 * 4,
        720 * 6,
        720 * 8,
        720 * 10,
        720 * 12,
        720 * 14,
        720 * 16,
        720 * 18,
        720 * 20,
        720 * 22,
        720 * 24,
        720 * 26,
        720 * 28,
        720 * 30,
        720 * 32,
        720 * 34,
        720 * 36,
        720 * 38,
        720 * 40,
        720 * 42,
        720 * 44,
        720 * 46,
        720 * 48,
      ],
      ticktext: [
        "0",
        "2",
        "4",
        "6",
        "8",
        "10",
        "12",
        "14",
        "16",
        "18",
        "20",
        "22",
        "24",
        "26",
        "28",
        "30",
        "32",
        "34",
        "36",
        "38",
        "40",
        "42",
        "44",
        "48",
      ],

      titlefont: {
        family: "Arial, sans-serif",
        size: 18,
        color: "black",
      },
      title: "Ticks",
      // tickformat: "%d/%m/%y"
    },
  };

  //https://plot.ly/javascript/configuration-options/
  let config = {
    responsive: true,
    // staticPlot: true,
    // editable: true
  };

  Plotly.newPlot("plot", traces, layout, config);
}

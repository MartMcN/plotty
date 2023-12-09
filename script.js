//'use strict'

// Tryin to figure out how to read data from a file.
// Very Strange to me, aparently you need a "view" object.

// File Selection
const fileInputEl = document.querySelector(".files__selected");
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

///////////

// const CSV =
//   "https://raw.githubusercontent.com/chris3edwards3/exampledata/master/plotlyJS/line.csv";

const CSV = "test_data.csv";

function plotFromCSV() {
  // Creates an array of of objects, the object has a property for each column named
  // as per the columm header with the vale are per the row.
  Plotly.d3.csv(CSV, function (err, rows) {
    console.dir(rows);
    processData(rows);
  });
}

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

  console.log("ticks", ticks);
  console.log("volts", mVolts);

  makePlotly(ticks, mVolts);
}

function makePlotly(xData, yData) {
  let traces = [
    {
      x: xData,
      y: yData,
      //name: "TEST DATA",
      line: {
        color: "#387fba",
        width: 1,
      },
    },
  ];

  let layout = {
    //autosize: false,
    //width: 500,
    //height: 800,
    margin: {
      l: 50,
      r: 50,
      b: 50,
      t: 50,
      pad: 4,
    },
    paper_bgcolor: "#7f7f7f",
    plot_bgcolor: "#c7c7c7",

    //title: "Basic Line Chart",
    showlegend: false,
    yaxis: {
      range: [0, 5000],
    },
    xaxis: {
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

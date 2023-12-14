//'use strict'

// Select the #file-input element
const fileInputEl = document.querySelector("#file-input");

fileInputEl.addEventListener("change", () => {
  // Take the first file
  [selectedFile] = fileInputEl.files;

  startSequence(selectedFile);
});

// File loaded
const fileLoaded = function (reader) {
  return new Promise(function (resolve, err) {
    // File Loaded Handler
    reader.onloadend = () => {
      console.log("File Loaded", reader.readyState); // readyState will be 2
      resolve(true);
    };
  });
};

const startSequence = async function (selectedFile) {
  try {
    // Create a reader object
    const reader = new FileReader();

    // Start reading the file
    reader.readAsArrayBuffer(selectedFile);
    console.log(`File Reading started`);

    // Wait for the file to be Loaded
    const file_ready = await fileLoaded(reader);
    console.log(`File load Success`);

    // File data is read as a array of bytes
    const data = new Uint8Array(reader.result);
    if (data.length === 0) throw new Error("File Empty");

    // Parse the data looking  for the battery voltages
    const parsedData = parseFileData(data);
    if (parsedData.length === 0) throw new Error("No Battery Data in File");
    console.log(parsedData);

    // Process further and plot it
    processDataPloty(parsedData);
  } catch (err) {
    // Clear the plot if there is one
    console.log(`Error: ${err}`);
    alert(`Error: ${err}`);
    const plotEl = document.querySelector("#plot");
    if (typeof plotEl.data.length === "number" && plotEl.data.length >= 1) {
      Plotly.deleteTraces("plot", 0);
    }
  }
};

// looking for "##?^##,""
// Format of data "##?^##,123456,123456,"
// First number is the tick must be 6 or less characters
// Second number is voltage in mV 6 or less characters
//
// Returns an array of objects
// { ticks: 123, volts: 3203 }
const parseFileData = function (data) {
  const HASH = 35; // #
  const QMARK = 63; // ?
  const CARET = 94; // ^
  const COMMA = 44; // ,

  const win1251decoder = new TextDecoder("windows-1251");
  const readings = [];

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

      readings.push({ tick, voltage });
    }
  });

  return readings;
};

function processDataPloty(allRows) {
  let ticks = [];
  let mVolts = [];
  let row;

  let i = 0;
  while (i < allRows.length) {
    row = allRows[i];
    ticks.push(row["tick"]);
    mVolts.push(row["voltage"]);
    i += 1;
  }

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
      title: "Hours",
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

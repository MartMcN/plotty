//'use strict'

// Tryin to figure out how to read data from a file.

// Very Strance to me, aparently you need a "view" object.

console.log("Started..");

// File Selection
const fileInput = document.querySelector(".files__selected");
const output = document.querySelector(".output");
let selectedFile;

// File Reading object
const reader = new FileReader();

// ArrayBuffer View Object
let view = new Uint8Array(reader.result); // treat buffer as a sequence of 32-bit integers

// Text Decoder
const win1251decoder = new TextDecoder("windows-1251");

// File Selection Handler
fileInput.addEventListener("change", () => {
  // Echo File Selected
  [selectedFile] = fileInput.files;
  output.innerText += `\n${selectedFile.name}`;

  reader.readAsArrayBuffer(selectedFile);
});

// On File Loaded
reader.onloadend = () => {
  console.log("DONE", reader.readyState); // readyState will be 2

  // using a decoder
  //console.log(win1251decoder.decode(reader.result));

  let view = new Uint8Array(reader.result);
  console.log(view);
};

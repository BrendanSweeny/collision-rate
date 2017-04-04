'use strict';

module.exports = formatSuperscript;

function formatSuperscript (labelStr, type) {
  let labelArray = labelStr.match(/([^\^\d-]+)|([\-*\d]+)/g);

  if (type === "svg") {
    let outputStr = "<tspan>";

    labelArray.forEach((entry) => {
      if (Number(entry)) {
        outputStr += "<tspan baseline-shift='super'>" + entry + "</tspan>";
      } else {
        outputStr += entry;
      }
    });

    outputStr += "</tspan>";
    return outputStr;

  } else if (type === "html") {
    let outputStr = "";

    labelArray.forEach((entry) => {
      if (Number(entry)) {
        outputStr += "<sup>" + entry + "</sup>";
      } else {
        outputStr += entry;
      }
    });

    return outputStr;
  }
}

'use strict';

let React = require('react');

let AxisLabel = React.createClass({
  propTypes: {
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    textAnchor: React.PropTypes.string,
    labelText: React.PropTypes.string,
    transform: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      textAnchor: "middle",
      transform: "rotate(0)"
    };
  },

  formatSuperscript: function (labelStr) {
    let labelArray = labelStr.match(/([^\^\d-]+)|([\-*\d]+)/g);

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
  },

  render: function () {
    let { x, y, textAnchor, labelText, transform } = this.props;
    let formattedLabelText = this.formatSuperscript(labelText);

    return (
      <text textAnchor={textAnchor} x={x} y={y} transform={transform} dangerouslySetInnerHTML={{__html: formattedLabelText}}>
      </text>
    )
  }
});

module.exports = AxisLabel;

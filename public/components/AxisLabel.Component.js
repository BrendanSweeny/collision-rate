'use strict';

let React = require('react');
let formatSuperscript = require('../utils/formatSuperscript.js')

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

  render: function () {
    let { x, y, textAnchor, labelText, transform } = this.props;
    let formattedLabelText = formatSuperscript(labelText, "svg");

    return (
      <text textAnchor={textAnchor} x={x} y={y} transform={transform} dangerouslySetInnerHTML={{__html: formattedLabelText}}>
      </text>
    )
  }
});

module.exports = AxisLabel;

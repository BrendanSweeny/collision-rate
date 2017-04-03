'use strict';

let React = require('react');

// Cosmetic Border for Dataseries plot area
let Border = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    stroke: React.PropTypes.string,
    strokeWidth: React.PropTypes.string,
    fill: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      stroke: "black",
      strokeWidth: "0.1em",
      fill: "none"
    };
  },

  render: function () {
    let { width, height, stroke, strokeWidth, fill } = this.props;

    return (
      <rect
        width={width}
        height={height}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    )
  }
});

module.exports = Border;

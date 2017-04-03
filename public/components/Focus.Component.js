'use strict';

let React = require('react');

// Focus is rendered by D3.js in <DataSeries /> componentDidMount()
// to avoid conflicts with React
let Focus = React.createClass({
  propTypes: {
    fill: React.PropTypes.string,
    stroke: React.PropTypes.string,
    strokeWidth: React.PropTypes.number,
    display: React.PropTypes.string,
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    dy: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      fill: 'none',
      stroke: 'blue',
      strokeWidth: 2,
      display: "none",
      x: 20,
      y: -40,
      dy: "1.2em"
    }
  },

  render: function () {
    let { fill, stroke, strokeWidth, display, x, y, dy } = this.props;
    return (
      <g className="focus" style={{display: display}} >
        <circle
          className="y"
          r="4"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <line className="h-line" style={{stroke: "blue", strokeDasharray: "5,5"}} />
        <line className="v-line" style={{stroke: "blue", strokeDasharray: "5,5"}} />
        <text className="text" x={x} y={y}>
          <tspan className="text-temp" x="10" />
          <tspan className="text-rate" x="10" dy={dy} />
        </text>
      </g>
    )
  }
});

module.exports = Focus;

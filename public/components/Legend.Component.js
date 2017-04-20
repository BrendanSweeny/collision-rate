'use strict';

let React = require('react');
let generateKey = require('../utils/basicKeyGenerator.js');

// Renders a legend in the plot area with values passed as an array of objects
// each with a name and value property
// Called by DataSeries
let Legend = React.createClass({
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    valueObj: React.PropTypes.array
  },

  render: function () {
    let { width, height, margin, valueObj } = this.props;
    let x = (width + margin.left) * 3/5;
    let y = margin.top + height / 20;
    return (
      <text className="text legend">
        {valueObj.map((obj, index) => {
          return <tspan key={generateKey()} className="legend-entry" x={x} y={y} dy={(1.2 * index).toString() + "em"}>{obj.name + ": " + obj.value}</tspan>
        })}
      </text>
    )
  }
});

module.exports = Legend;

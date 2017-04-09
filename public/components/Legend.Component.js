'use strict';

let React = require('react');

let Legend = React.createClass({
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    valueObj: React.PropTypes.array
  },

  render: function () {
    let { width, height, margin, valueObj } = this.props;
    let x = (width + margin.left) * 3/4;
    let y = margin.top + height / 20;
    return (
      <text className="text legend">
        {valueObj.map((obj, index) => {
          console.log(obj, index, x, y);
          return <tspan className="legend-entry" x={x} y={y} dy={(1.2 * index).toString() + "em"}>{obj.name + ": " + obj.value}</tspan>
        })}
      </text>
    )
  }
});

module.exports = Legend;

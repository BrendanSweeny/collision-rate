'use strict';

let React = require('react');

let RateAxis = React.createClass({
  propTypes: {
    y: React.PropTypes.func
  },

  componentDidMount: function () {
    this.renderAxis();
  },

  componentDidUpdate: function () {
    this.renderAxis();
  },

  // D3.js is used to render axis on component mount and following component update
  renderAxis: function () {

    function reformatSciNotation (d, i) {
      d = d.toExponential(2);
      d = d.toString().replace(/(\d+.?\d*)e\+?(-?\d+)/, "$1x10");
      return d;
    }

    function addExponent (d, i) {
      d = d.toExponential(4);
      d = d.toString().replace(/(\d+.?\d*)e\+?(-?\d+)/, "$2");
      return d;
    }
    // Old format that renders "1.23e-9"
    let customFormat = d3.format(".3g");

    this.yAxis = d3.axisLeft()
                    .scale(this.props.y);

    d3.select(this.refs.rateAxis)
      .call(this.yAxis)
      // Grabs all the ticks
      .selectAll(".tick text")
      // Removes the text
      .text(null)
      // Replaces with new format
      .text(reformatSciNotation)
      .append("tspan")
      .attr("dy", "-.7em")
      .text(addExponent);
  },

  render: function () {
    return <g ref="rateAxis" />;
  },
});

module.exports = RateAxis;

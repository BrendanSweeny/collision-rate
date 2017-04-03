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
    this.yAxis = d3.axisLeft()
                    .scale(this.props.y);

    d3.select(this.refs.rateAxis).call(this.yAxis.tickFormat(d3.format(".2g")));
  },

  render: function () {
    return <g ref="rateAxis" />;
  },
});

module.exports = RateAxis;

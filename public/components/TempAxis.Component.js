'use strict';

let React = require('react');

let TempAxis = React.createClass({
  propTypes: {
    margin: React.PropTypes.object,
    x: React.PropTypes.func,
    height: React.PropTypes.number
  },

  componentDidMount: function () {
    this.renderAxis();
  },

  componentDidUpdate: function () {
    this.renderAxis();
  },

  // D3.js is used to render axis on component mount and following component update
  renderAxis: function () {
    this.xAxis = d3.axisBottom()
                    .scale(this.props.x);

    d3.select(this.refs.timeAxis).call(this.xAxis);
  },

  render: function () {
    let { marginTop, height } = this.props;
    return (
      <g ref="timeAxis" transform={"translate(0, " + height + ")"}></g>
    );
  },
});

module.exports = TempAxis;

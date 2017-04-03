'use strict';

let React = require('react');
let Border = require('./Border.Component.js');

let ChartPlaceHolder = React.createClass({
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    textAnchor: React.PropTypes.string,
    message: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      textAnchor: "middle"
    }
  },

  render: function () {
    let { width, height, margin, textAnchor, x, y, message } = this.props;
    return (
      <svg id="chart" width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
        <g id="plot-area" transform={"translate(" + margin.left + "," + margin.top + ")"} >
          <Border
            width={width}
            height={height}
          />
          <text textAnchor={textAnchor} x={width / 2} y={height / 2} dangerouslySetInnerHTML={{__html: message}} />
        </g>
      </svg>
    )
  }
});

module.exports = ChartPlaceHolder;

'use strict';

let React = require('react');

let Line = React.createClass({
  propTypes: {
    path: React.PropTypes.string,
    stroke: React.PropTypes.string,
    fill: React.PropTypes.string,
    strokeWidth: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      stroke: 'green',
      fill: 'none',
      strokeWidth: 3
    };
  },

  render: function () {
    let { path, stroke, fill, strokeWidth } = this.props;
    //console.log("<Line />: render", path);

    return (
      <path
        d={path}
        className="line"
        stroke={stroke}
        fill={fill}
        strokeWidth={strokeWidth}
      />
    )
  }
});

module.exports = Line;


let React = require('react');

let DataSeries = require('./DataSeries.Component.js');

// Component containing the svg element and determining the x and y scales
// Renders <DataSeries /> based on props from <RatePlotContainer />
let SvgContainer = React.createClass({
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    neutralMass: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string
    ]),
    ionMass: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string
    ]),
    dipoleMoment: React.PropTypes.number,
    polarizability: React.PropTypes.number,
    margin: React.PropTypes.object,
    data: React.PropTypes.array.isRequired,
    xDomain: React.PropTypes.array,
    yDomain: React.PropTypes.array
  },

  getDefaultProps: function () {
    return {
      width: 960,
      height: 500,
    };
  },

  render: function () {
    let { width, height, margin, data, xDomain, yDomain, ionMass, neutralMass, dipoleMoment, polarizability } = this.props;

    let x = d3.scaleLinear()
              .domain(xDomain)
              .range([0, width]);

    let y = d3.scaleLinear()
              .domain(yDomain)
              .range([height, 0]);
              //console.log("<LineChart />: render", width, height);
              //console.log("<LineChart />: render", x(data[0].temp), y(data[0].rate));

    return (
      <svg id="chart" width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
        <DataSeries
          x={x}
          y={y}
          data={data}
          width={width}
          height={height}
          margin={margin}
          ionMass={ionMass}
          neutralMass={neutralMass}
          dipoleMoment={dipoleMoment}
          polarizability={polarizability}
        />
      </svg>
    );
  }
});

module.exports = SvgContainer;

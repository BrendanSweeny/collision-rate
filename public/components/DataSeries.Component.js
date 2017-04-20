
let React = require('react');

// React Components
let TempAxis = require('./TempAxis.Component.js');
let RateAxis = require('./RateAxis.Component.js');
let Focus = require('./Focus.Component.js');
let Line = require('./Line.Component.js');
let Border = require('./Border.Component.js');
let Legend = require('./Legend.Component.js');
let AxisLabel = require('./AxisLabel.Component.js');

// Component containing the plot area
// Renders D3 elements using a combination of DOM manipulation
// by React and D3.js
let DataSeries = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    margin: React.PropTypes.object,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    interpolationType: React.PropTypes.string,
    x: React.PropTypes.func,
    xDomain: React.PropTypes.array,
    y: React.PropTypes.func,
    yDomain: React.PropTypes.array,
    neutralMass: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string
    ]),
    ionMass: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string
    ]),
    dipoleMoment: React.PropTypes.number,
    polarizability: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      data: [],
      interpolationType: 'cardinal'
    };
  },

  componentDidMount: function () {
    d3.select(".overlay").on("mousemove", this.handleMouseMove);
  },

  handleMouseMove: function () {

    function reformatSciNotation (d, i) {
      d = d.toExponential(2);
      d = d.replace(/(\d+.?\d*)e\+?(-?\d+)/, "$1x10");
      return d;
    }

    function addExponent (d, i) {
      d = d.toExponential(2);
      d = d.replace(/(\d+.?\d*)e\+?(-?\d+)/, "$2");
      return d;
    }

    let { data, x, y } = this.props;
    let focus = d3.select(".focus");
    let overlay = d3.select(".overlay").node();
    // Returns index of value in array that corresponds to pointer x-position
    let bisectTemp = d3.bisector((d) => { return d.temp; }).left;
    // temp at the x-value of the cursor:
    let x0 = x.invert(d3.mouse(overlay)[0]),
        // index of temp value in data array:
        i = bisectTemp(data, x0, 1),
        // index to left of cursor:
        d0 = data[i - 1],
        // index to right of cursor:
        d1 = data[i],
        // If the cursor is closer "in temp" to next point to the left, assign that to d,
        // otherwise, assign right point to d
        d = x0 - d0.data > d1.data - x0 ? d1 : d0;

        // Focus component is rendered using D3.js when updated, not React
        focus.attr("transform", "translate(" + x(d.temp) + "," + y(d.rate) + ")");
        focus.select(".v-line").attr("y2", this.props.height - y(d.rate));
        focus.select(".h-line").attr("x2", 0 - x(d.temp));
        focus.select(".text-temp").text("T: " + d.temp);
        focus.select(".text-rate").text("Rate: " + reformatSciNotation(d.rate)).append("tspan").attr("dy", "-.5em").text(addExponent(d.rate));
  },

  handleMouseOver: function () {
    d3.select(".focus").style("display", null);
  },

  handleMouseOut: function () {
    d3.select(".focus").style("display", "none");
  },

  // Focus is initially rendered with 'display: none' by React
  // Updates to Focus (on mousemove) are handled by D3.js
  render: function () {
    let { data, margin, interpolationType, x, y, height, width, ionMass, neutralMass, dipoleMoment, polarizability } = this.props;

    let line = d3.line()
                 .x((d) => { return x(d.temp); })
                 .y((d) => { return y(d.rate); });

    let yLabelText = "Rate / cm^3 molecules^-1 s^-1";
    let xLabelText = "Temperature / K";

    //console.log("<DataSeries />: render", line(data));
    return (
      <g id="plot-area" transform={"translate(" + margin.left + "," + margin.top + ")"} >
        <Line
          path={line(data)}
        />
        <TempAxis x={x} height={height} />
        <RateAxis y={y} />
        <Focus />
        <Border
          width={width}
          height={height}
        />
        <AxisLabel className="x-label" x={width / 2} y={height + margin.top + margin.bottom * 0.7} labelText={xLabelText} />
        <AxisLabel className="y-label" x={0 - height / 2} y={0 - margin.left * 3/4} transform="rotate(-90)" labelText={yLabelText} />
        <Legend
          width={width}
          height={height}
          margin={margin}
          valueObj={[
            {
              "name": "Ion Mass",
              "value": ionMass
            },
            {
              "name": "Neutral Mass",
              "value": neutralMass
            },
            {
              "name": "Dipole Moment",
              "value": dipoleMoment
            },
            {
              "name": "Polarizability",
              "value": polarizability
            }
          ]}
        />
        <rect
          className="overlay"
          width={width}
          height={height}
          style={{fill: "none", pointerEvents: "all"}}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
        />
      </g>
    );
  }
});

module.exports = DataSeries;

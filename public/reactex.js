// TODO: Add legend with parameters that created displayed data
// TODO: style chart better, e.g. bold axis tick marks
// TODO: Reformat tooltip rate

// Packages
let React = require('react');
let ReactDOM = require('react-dom');

// React Components
let AxisLabel = require('./components/AxisLabel.Component.js');
let SliderContainer = require('./components/SliderContainer.Component.js');
let ChartPlaceHolder = require('./components/ChartPlaceHolder.Component.js');
let Border = require('./components/Border.Component.js');
let TempAxis = require('./components/TempAxis.Component.js');
let RateAxis = require('./components/RateAxis.Component.js');
let Focus = require('./components/Focus.Component.js');
let Line = require('./components/Line.Component.js');


// Container Class responsible for maintaining state of chart and inputs
let RatePlotContainer = React.createClass({
  // State is used to construct API call when params/neutral/ion are updated
  // State values are also passed to the parameter sliders
  getInitialState: function () {

    const margin = {top: 10, right: 150, bottom: 50, left: 150},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    return {
      width: width,
      height: height,
      margin: margin,
      neutralString: "N2O",
      ionMass: 48,
      neutralMass: 17,
      dipoleMoment: 1.47,
      polarizability: 2.2,
      xDomain: [],
      yDomain: [],
      data: [],
      errorState: false
    }
  },

  // Internal function that handles API call
  // Called in findParamsApiCall() and findNeutralApiCall()
  // link: string
  getRates: function (link) {
    var RateRequest = new Request(link);
    return fetch(RateRequest, {method: 'get'})
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network error was encountered.");
        } else if (res.status === 404) {
          //console.log(404);
        }
        return res.json();
      })
  },

  // Internal function that handles the API response and updates component state
  // data: JSON object received from server
  // newState: object
  handleAPIResponse: function (data, newState) {
    if (!newState) {
      newState = {};
    }

    if (!data) {
      //console.log(data);
      newState.errorState = true;
      this.setState(newState);
    } else {
      //console.log(data);
      let xExtent = d3.extent(data.rates, (d) => { return d.temp; })
      let yExtent = d3.extent(data.rates, (d) => { return d.rate; })

      // Expand the y extent
      yExtent[0] = yExtent[0] - (yExtent[0] * 0.05);
      yExtent[1] = yExtent[1] + (yExtent[1] * 0.05);
      newState.data = data.rates;
      newState.xDomain = xExtent;
      newState.yDomain = yExtent;
      newState.errorState = false;
      newState.ionMass = data.ionMass;
      newState.neutralMass = data.neutralMass;
      newState.dipoleMoment = data.dipoleMoment;
      newState.polarizability = data.polarizability;
      this.setState(newState);
    }
  },

  // Function that creates URL and calls getRates based on updated
  // chemical parameters and RatePlotContainer state
  // Called by handleUpdateParam()
  //  ionMass: Number
  //  neutralMass: Number
  //  d (dipole moment): Number
  //  pol (polarizability): Number
  findParamsApiCall: function (ionMass, neutralMass, d, pol) {
    let newState = {};
    let url = window.location.origin + '/api/rate/?ionmass=' + ionMass + '&neutralmass=' + neutralMass + '&d=' + d + '&pol=' + pol + '&temp=range';

    this.getRates(url)
        .then((data) => this.handleAPIResponse(data, newState))
        .catch((error) => {
          console.log("There was an issue with the fetch operation: " + error.message);
          // State is still updated in the event of a '404', otherwise inputs
          // causing the error are not updated with empty string values,
          // preventing user from entering values < 1
          newState.errorState = true;
          newState.ionMass = ionMass;
          newState.neutralMass = neutralMass;
          newState.dipoleMoment = d;
          newState.polarizability = pol;
          this.setState(newState);
        });
  },

  // Function that creates URL and calls getRates based on either a known neutral
  // or ion mass update
  //  val: Number or String
  //  valType: specific String
  findNeutralApiCall: function (val, valType) {
    let newState = {};
    if (valType === "ion") {
      url = window.location.origin + '/api/rate/findneutral?neutral=' + this.state.neutralString + '&temp=range&ionmass=' + val;
      newState.ionMass = val;
    } else if (valType === "neutral") {
      url = window.location.origin + '/api/rate/findneutral?neutral=' + val + '&temp=range&ionmass=' + this.state.ionMass;
      newState.neutralString = val;
    }

    this.getRates(url)
        .then((data) => this.handleAPIResponse(data, newState))
        .catch((error) => {
          console.log("There was an issue with the fetch operation: " + error.message);
          newState.errorState = true;
          this.setState(newState);
        });
  },

  // Function passed as props to neutral and ion text inputs
  // Calls API handlers based on targeted input
  handleUpdateIonNeutral: function (e) {
    if (e.target.id === "ion-input") {
      let ionMass = e.target.value;
      this.findNeutralApiCall(ionMass, "ion");
    } else if (e.target.id === "neutral-input") {
      let neutralString = e.target.value;
      this.findNeutralApiCall(neutralString, "neutral")
    }
  },

  // Function passed as props to the sliders, handles value change
  // Calls API handlers based on targeted input
  handleUpdateParam: function (e) {
    //console.log(e.target.className);
    if (e.target.className === "neutralMass") {
      let neutralMass = e.target.value;
      this.findParamsApiCall(this.state.ionMass, neutralMass, this.state.dipoleMoment, this.state.polarizability);
    } else if (e.target.className === "ionMass") {
      let ionMass = e.target.value;
      this.findParamsApiCall(ionMass, this.state.neutralMass, this.state.dipoleMoment, this.state.polarizability);
    } else if (e.target.className === "polarizability") {
      let polarizability = e.target.value;
      this.findParamsApiCall(this.state.ionMass, this.state.neutralMass, this.state.dipoleMoment, polarizability);
    } else if (e.target.className === "dipoleMoment") {
      let dipoleMoment = e.target.value;
      this.findParamsApiCall(this.state.ionMass, this.state.neutralMass, dipoleMoment, this.state.polarizability);
    }
  },

  // Plot and values for Ti+ and N2O are retrieved prior to mounting
  componentWillMount: function () {
    this.getRates(window.location.origin + '/api/rate/findneutral/?neutral=N2O&temp=range&ionmass=48')
      .then((data) => this.handleAPIResponse(data));
  },

  // Renders chart or placeholder with error message based on state of 'errorState'
  render: function () {
    let { ionMass, neutralMass, neutralString, width, height, margin, data, xDomain, yDomain, dipoleMoment, polarizability } = this.state;
    //console.log("<RatePlotContainer />: render", ionMass);
    return (
      <div>
        <div className="chem-input-container">
          <ChemicalInput
            idName="ion-input"
            title="Ion"
            defaultValue={ionMass}
            handleUpdateIonNeutral={this.handleUpdateIonNeutral}
          />
          <ChemicalInput
            idName="neutral-input"
            title="Neutral"
            defaultValue={neutralString}
            handleUpdateIonNeutral={this.handleUpdateIonNeutral}
          />
        </div>

        {this.state.errorState ? (
          <ChartPlaceHolder
            width={width}
            height={height}
            margin={margin}
            message="Enter Valid Ion and Neutral"
          />
        ) : (
          <LineChart
            width={width}
            height={height}
            margin={margin}
            data={data}
            xDomain={xDomain}
            yDomain={yDomain}
          />
        )}
        <SliderContainer
          neutralMass={neutralMass}
          ionMass={ionMass}
          dipoleMoment={dipoleMoment}
          polarizability={polarizability}
          handleUpdateParam={this.handleUpdateParam}
        />
      </div>
    )
  }
});

// Component containing the svg element
// Renders <DataSeries /> based on props from <RatePlotContainer />
let LineChart = React.createClass({
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
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
    let { width, height, margin, data, xDomain, yDomain } = this.props;

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
        />
      </svg>
    );
  }
});

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
    yDomain: React.PropTypes.array
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
        focus.select(".text-rate").text("Rate: " + d.rate.toPrecision(3));
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
    let { data, margin, interpolationType, x, y, height, width } = this.props;

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
        <AxisLabel className="x-label" x={width / 2} y={height + margin.top + margin.bottom * 0.5} labelText={xLabelText} />
        <AxisLabel className="y-label" x={0 - height / 2} y={0 - margin.left / 2} transform="rotate(-90)" labelText={yLabelText} />
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

// Input components for ion and neutral
let ChemicalInput = React.createClass({
  propTypes: {
    idName: React.PropTypes.string,
    title: React.PropTypes.string,
    handleUpdateIonNeutral: React.PropTypes.func,
    defaultValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ])
  },

  getInitialState: function () {
    return {
      value: this.props.defaultValue
    }
  },

  handleUpdateIon: function (e) {
      this.props.handleUpdateIonNeutral(e);
      this.setState({
        value: e.target.value
      })
  },

  // Allows input value to update when value of HorizontalSlider is changed
  componentWillReceiveProps: function (nextProps) {

    // nextProps.defaultValue of null throws React controlled/uncontrolled error
    // Allows for some'invalid' inputs e.g. '1.'
    // Will not update state (string) when props = 1 and state.value = '1.'
    // if component is allowed to update when props.value === '.' => React uncontrolled/controlled component error
    if (nextProps.defaultValue && nextProps.defaultValue !== Number(this.state.value)) {
      this.setState({
        value: nextProps.defaultValue
      })
    }
  },

  render: function () {
    return (
      <div className="chem-input">
        <h4>{this.props.title}</h4>
        <input
          id={this.props.idName}
          value={this.state.value}
          onChange={this.handleUpdateIon}
        />
      </div>
    )
  }
});

ReactDOM.render(
  <RatePlotContainer />,
  document.getElementById("root")
);

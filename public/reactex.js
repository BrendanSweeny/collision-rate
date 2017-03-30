let React = require('react');
let ReactDOM = require('react-dom');

function httpGetRequest(neutral, ion) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      return xmlHttp.responseText;
    }
  }
  xmlHttp.open("GET", "http://localhost:8080/api/rate/?neutral="+ neutral +"&temp=range&ionmass=" + ion, true);
  xmlHttp.send(null);
}

let RatePlotContainer = React.createClass({
  getInitialState: function () {

    const margin = {top: 50, right: 200, bottom: 50, left: 100},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    return {
      width: width,
      height: height,
      margin: margin,
      ionString: "48",
      neutralString: "N2O",
      xDomain: [],
      yDomain: [],
      data: [],
      errorState: false
    }
  },

  getRates: function (link) {
    var RateRequest = new Request(link);
    return fetch(RateRequest, {method: 'get'})
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network error was encountered.");
        } else if (res.status === 404) {
          console.log(404);
        }
        return res.json();
      })
      .catch((error) => {
        console.log("There was an issue with the fetch operation: " + error.message);
      })
  },

  apiCall: function (val, valType) {
    let newState = {};
    if (valType === "ion") {
      url = 'http://localhost:8080/api/rate/?neutral=' + this.state.neutralString + '&temp=range&ionmass=' + val;
      newState.ionString = val;
    } else if (valType === "neutral") {
      url = 'http://localhost:8080/api/rate/?neutral=' + val + '&temp=range&ionmass=' + this.state.ionString;
      newState.neutralString = val;
    }

    this.getRates(url)
        .then(function(data) {
          if (data === undefined) {
            console.log(data);
            newState.errorState = true;
            this.setState(newState);
          } else {
            console.log(data);
            let xExtent = d3.extent(data, (d) => { return d.temp; })
            let yExtent = d3.extent(data, (d) => { return d.rate; })

            // Expand the y extent
            yExtent[0] = yExtent[0] - (yExtent[0] * 0.05);
            yExtent[1] = yExtent[1] + (yExtent[1] * 0.05);
            newState.data = data;
            newState.xDomain = xExtent;
            newState.yDomain = yExtent;
            newState.errorState = false;
            this.setState(newState);
          }
        }.bind(this));
  },

  handleUpdateValue: function (e) {
    if (e.target.id === "ion-input") {
      let ionMass = e.target.value;
      this.apiCall(ionMass, "ion");
    } else if (e.target.id === "neutral-input") {
      let neutralString = e.target.value;
      this.apiCall(neutralString, "neutral")
    }
  },

  componentWillMount: function () {
    this.getRates('http://localhost:8080/api/rate/?neutral=N2O&temp=range&ionmass=48')
      .then(function(data) {
        //console.log("<RatePlotContainer />: componentWillMount", data);
        let xExtent = d3.extent(data, (d) => { return d.temp; })
        let yExtent = d3.extent(data, (d) => { return d.rate; })
        //console.log("<RatePlotContainer />: componentWillMount", xExtent, yExtent);
        // Expand the y extent
        yExtent[0] = yExtent[0] - (yExtent[0] * 0.05);
        yExtent[1] = yExtent[1] + (yExtent[1] * 0.05);

        this.setState({
          data: data,
          xDomain: xExtent,
          yDomain: yExtent
        });
      }.bind(this));
  },

  render: function () {
    let { ionString, neutralString, width, height, margin, data, xDomain, yDomain } = this.state;
    //console.log("<RatePlotContainer />: render", this.state.data);
    return (
      <div>
        <IonInput
          ionString={ionString}
          handleUpdateValue={this.handleUpdateValue}
        />
        <NeutralInput
          neutralString={neutralString}
          handleUpdateValue={this.handleUpdateValue}
        />
        {this.state.errorState ? (
          <p>Error</p>
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
        <SliderContainer />
      </div>
    )
  }
});

let SliderContainer = React.createClass({
  render: function () {
    return (
      <div>
        <Slider title="Neutral Mass (amu)" />
        <Slider title="Polarizability (A^3)"/>
        <Slider title="Dipole Moment (D)"/>
        <Slider title="Ion Mass (amu)"/>
      </div>
    )
  }
});

let Slider = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
  },

  render: function () {
    let { title } = this.props
    return (
      <div>
        <p>{title}</p>
        <input />
        <input type="range" name="mass" min="0" max="100" value="80" />
      </div>
    )
  }
});

// Component containing the svg element
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
        //<AxisLabel className="x-label" x={width / 2} y={height + margin.top * 2/3} labelText={xLabelText} />
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

let AxisLabel = React.createClass({
  propTypes: {
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    textAnchor: React.PropTypes.string,
    labelText: React.PropTypes.string,
    transform: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      textAnchor: "middle",
      transform: "rotate(0)"
    };
  },

  formatSuperscript: function (labelStr) {
    let labelArray = labelStr.match(/([^\^\d-]+)|([\-*\d]+)/g);

    let outputStr = "<tspan>";
    labelArray.forEach((entry) => {
      if (Number(entry)) {
        outputStr += "<tspan baseline-shift='super'>" + entry + "</tspan>";
      } else {
        outputStr += entry;
      }
    });
    outputStr += "</tspan>";
    return outputStr;
  },

  render: function () {
    let { x, y, textAnchor, labelText, transform } = this.props;
    let formattedLabelText = this.formatSuperscript(labelText);

    return (
      <text textAnchor={textAnchor} x={x} y={y} transform={transform} dangerouslySetInnerHTML={{__html: formattedLabelText}}>
      </text>
    )
  }
});

let Border = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    stroke: React.PropTypes.string,
    strokeWidth: React.PropTypes.string,
    fill: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      stroke: "black",
      strokeWidth: "0.1em",
      fill: "none"
    };
  },

  render: function () {
    let { width, height, stroke, strokeWidth, fill } = this.props;

    return (
      <rect
        width={width}
        height={height}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    )
  }
});

// Focus is rendered by D3.js in <DataSeries /> componentDidMount()
let Focus = React.createClass({
  propTypes: {
    fill: React.PropTypes.string,
    stroke: React.PropTypes.string,
    strokeWidth: React.PropTypes.number,
    display: React.PropTypes.string,
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    dy: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      fill: 'none',
      stroke: 'blue',
      strokeWidth: 2,
      display: "none",
      x: 20,
      y: -40,
      dy: "1.2em"
    }
  },

  render: function () {
    let { fill, stroke, strokeWidth, display, x, y, dy } = this.props;
    return (
      <g className="focus" style={{display: display}} >
        <circle
          className="y"
          r="4"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <line className="h-line" style={{stroke: "blue", strokeDasharray: "5,5"}} />
        <line className="v-line" style={{stroke: "blue", strokeDasharray: "5,5"}} />
        <text className="text" x={x} y={y}>
          <tspan className="text-temp" x="10" />
          <tspan className="text-rate" x="10" dy={dy} />
        </text>
      </g>
    )
  }
});

let TempAxis = React.createClass({
  propTypes: {
    margin: React.PropTypes.object,
    x: React.PropTypes.func,
    height: React.PropTypes.number
  },

  render: function () {
    let { marginTop, height } = this.props;
    return (
      <g ref="timeAxis" transform={"translate(0, " + height + ")"}></g>
    );
  },

  componentDidMount: function () {
    this.renderAxis();
  },

  componentDidUpdate: function () {
    this.renderAxis();
  },

  renderAxis: function () {
    this.xAxis = d3.axisBottom()
                    .scale(this.props.x);

    d3.select(this.refs.timeAxis).call(this.xAxis);
  }
});

let RateAxis = React.createClass({
  propTypes: {
    y: React.PropTypes.func
  },

  render: function () {
    return <g ref="rateAxis" />;
  },

  componentDidMount: function () {
    this.renderAxis();
  },

  componentDidUpdate: function () {
    this.renderAxis();
  },

  renderAxis: function () {
    this.yAxis = d3.axisLeft()
                    .scale(this.props.y);

    d3.select(this.refs.rateAxis).call(this.yAxis.tickFormat(d3.format(".2g")));
  }
});

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

let IonInput = React.createClass({
  getInitialState: function () {
    return {
      ionString: "Ti"
    }
  },

  handleUpdateIon: function (e) {
    if (e.target.id === "ion-input") {
      this.setState({
        ionString: e.target.value
      })
    }
  },

  render: function () {
    return (
      <div>
        <h4>Ion:</h4>
        <input
          id="ion-input"
          value={this.props.ionString}
          onChange={this.props.handleUpdateValue}
        />
      </div>
    )
  }
});

let NeutralInput = React.createClass({
  getInitialState: function () {
    return {
      neutralString: "N2O"
    }
  },

  handleUpdateNeutral: function (e) {
    if (e.target.id === "neutral-input") {
      this.setState({
        neutralString: e.target.value
      })
    }
  },

  render: function () {
    return (
      <div>
        <h4>Neutral:</h4>
        <input
          id="neutral-input"
          value={this.props.neutralString}
          onChange={this.props.handleUpdateValue}
        />
      </div>
    )
  }
});

ReactDOM.render(
  <RatePlotContainer />,
  document.getElementById("root")
);

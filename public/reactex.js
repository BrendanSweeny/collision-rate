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
      defaultUrl: "http://localhost:8080/api/rate/?neutral=N2O&temp=range&ionmass=48",
      data: []
    }
  },

  getRates: function (link) {
    var RateRequest = new Request(link);
    return fetch(RateRequest, {method: 'get'})
      .then(function(res) {
        //console.log(res);
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
  },

  handleUpdateValue: function (e) {
    if (e.target.id === "ion-input") {
      let ionMass = e.target.value;
      this.getRates('http://localhost:8080/api/rate/?neutral=' + this.state.neutralString + '&temp=range&ionmass=' + ionMass)
          .then(function(data) {
            let xExtent = d3.extent(data, (d) => { return d.temp; })
            let yExtent = d3.extent(data, (d) => { return d.rate; })

            // Expand the y extent
            yExtent[0] = yExtent[0] - (yExtent[0] * 0.05);
            yExtent[1] = yExtent[1] + (yExtent[1] * 0.05);

            this.setState({
              data: data,
              xDomain: xExtent,
              yDomain: yExtent,
              ionString: ionMass
            });
          }.bind(this));
    } else if (e.target.id === "neutral-input") {
      let neutralString = e.target.value;
      this.getRates('http://localhost:8080/api/rate/?neutral=' + neutralString + '&temp=range&ionmass=' + this.state.ionString)
          .then(function(data) {
            //console.log(data);
            if (data !== null) {
              let xExtent = d3.extent(data, (d) => { return d.temp; })
              let yExtent = d3.extent(data, (d) => { return d.rate; })

              // Expand the y extent
              yExtent[0] = yExtent[0] - (yExtent[0] * 0.05);
              yExtent[1] = yExtent[1] + (yExtent[1] * 0.05);

              this.setState({
                data: data,
                xDomain: xExtent,
                yDomain: yExtent,
                neutralString: neutralString
              });
            }
          }.bind(this));
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
        <div>Hello World!</div>
        <IonInput
          ionString={ionString}
          handleUpdateValue={this.handleUpdateValue}
        />
        <NeutralInput
          neutralString={neutralString}
          handleUpdateValue={this.handleUpdateValue}
        />
        <LineChart
          width={width}
          height={height}
          margin={margin}
          data={data}
          xDomain={xDomain}
          yDomain={yDomain}
        />
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

    //console.log("<DataSeries />: render", line(data));
    return (
      <g id="plot-area" transform={"translate(" + margin.left + "," + margin.top + ")"} >
        <Line
          path={line(data)}
        />
        <TempAxis x={x} height={height} />
        <RateAxis y={y} />
        <rect
          className="overlay"
          width={width}
          height={height}
          style={{fill: "none", pointerEvents: "all"}}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
        />
        <Focus />
      </g>
    );
  }
});

let Focus = React.createClass({
  propTypes: {
    fill: React.PropTypes.string,
    stroke: React.PropTypes.string,
    strokeWidth: React.PropTypes.number,
    display: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      fill: 'none',
      stroke: 'blue',
      strokeWidth: 2,
      display: "none"
    }
  },

  render: function () {
    let { fill, stroke, strokeWidth, display } = this.props;
    return (
      <g className="focus" style={{display: display}} >
        <circle
          className="y"
          r="4"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
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
    let { marginTop } = this.props;
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

const margin = {top: 50, right: 200, bottom: 50, left: 100},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

let x = d3.scaleLinear()
          .range([0, width]);

let y = d3.scaleLinear()
          .range([height, 0]);

let line = d3.line()
             .x((d) => { return x(d.temp); })
             .y((d) => { return y(d.rate); });

let RatePlot = React.createClass({
  propTypes: {
    ionString: React.PropTypes.string.isRequired,
    neutralString: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      width: "960",
      height: "500"
    }
  },

  renderChart: function (neutral, ion) {
    const url = "http://localhost:8080/api/rate/?neutral="+ neutral +"&temp=range&ionmass=" + ion;
    let xAxis = d3.axisBottom()
                  .scale(x);

    let yAxis = d3.axisLeft()
                  .scale(y);

    let chart = d3.select("#chart")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let toolTip = d3.select("body")
                    .append("div")
                    .attr("id", "toolTip");

    // Returns index of value in array that corresponds to pointer x-position
    let bisectTemp = d3.bisector((d) => { return d.temp; }).left;

    function formatToolTipText (d) {
      let text = "<p>T: " + d.temp + " K</p>" +
                 "<p>Rate: " + d.rate + "</p>";
      return text;
    }

    d3.json(url, (err, data) => {
      if (err)  throw err;

      //console.log(data[0]);
      let xExtent = d3.extent(data, (d) => { return d.temp; })
      let yExtent = d3.extent(data, (d) => { return d.rate; })

      // Expand the y extent
      yExtent[0] = yExtent[0] - (yExtent[0] * 0.05);
      yExtent[1] = yExtent[1] + (yExtent[1] * 0.05);


      //console.log(xExtent);
      //console.log(yExtent);
      x.domain(xExtent);
      y.domain(yExtent);

      // x-Axis
      chart.append("g")
           .attr("class", "x-axis axis")
           .attr("transform", "translate(0, " + height + ")")
           .call(xAxis);

      // x-Axis Label
      chart.append("text")
           .attr("text-anchor", "middle")
           .attr("x", width / 2)
           .attr("y", height + margin.top * 2/3)
           .text("Temperature / K");

      // y-Axis
      chart.append("g")
           .attr("class", "y-axis axis")
           .call(yAxis.tickFormat(d3.format(".2g")));

      // y-Axis Label
      chart.append("text")
           .attr("y", 0 - margin.left / 2)
           .attr("x", 0 - height / 2)
           .attr("text-anchor", "middle")
           .attr("transform", "rotate(-90)")
           .text("Rate / cm^3 molecules^-1 s^-1");

      // Data line
      chart.append("path")
           .data([data])
           .attr("class", "line")
           .attr("d", line)
           .style("fill", "none")
           .style("stroke-width", "2px")
           .style("stroke", "green");

  /*
      chart.selectAll("dot")
           .data(data)
           .enter()
           .append("circle")
           .attr("r", 2)
           .attr("cx", (d) => { return x(d.temp); })
           .attr("cy", (d) => { return y(d.rate); })
           .on("mouseover", (d) => {
             toolTip
              .style("display", "block")
              .html(formatToolTipText(d));
           })
  */
      // Border
      chart.append("rect")
           .attr("width", width)
           .attr("height", height)
           .style("stroke", "black")
           .style("stroke-width", "0.1em")
           .style("fill", "none");

      let focus = chart.append("g")
                      .attr("id", "focus")
                      .style("display", "none");

      // Focus circle
      focus.append("circle")
           .attr("class", "y")
           .attr("r", 4)
           .style("fill", "none")
           .style("stroke", "blue")
           .style("stroke-width", 2);

      // Horizontal Guide Line
      focus.append("line")
           .attr("id", "h-line")
           .attr("stroke", "blue")
           .attr("stroke-dasharray", "5, 5")
           .attr("x1", 0)
           .attr("x2", 0 - width);

      // Vertical Guide Line
      focus.append("line")
           .attr("id", "v-line")
           .attr("stroke", "blue")
           .attr("stroke-dasharray", "5, 5")
           .attr("y1", 0)
           .attr("y2", height);

      let focusText = focus.append("text")
           .attr("id", "text")
           .attr("x", 20)
           .attr("y", -40)
           .attr("font-family", "sans-serif")
           .attr("font-size", 20);

      focusText.append("tspan").attr("id", "text-temp").attr("x", 10);
      focusText.append("tspan").attr("id", "text-rate").attr("x", 10).attr("dy", "1.2em");


      // Rect that will inform the toolTip
      chart.append("rect")
           .attr("width", width)
           .attr("height", height)
           .style("fill", "none")
           // Capture all of the mouse events inside the rect
           .style("pointer-events", "all")
           // 'null' defaults dispaly to inline
           .on("mouseover", () => { focus.style("display", null); })
           .on("mouseout", () => { focus.style("display", "none"); })
           .on("mousemove", mousemove );

      function mousemove () {
        // temp at the x-value of the cursor:
        let x0 = x.invert(d3.mouse(this)[0]),
            // index of temp value in data array:
            i = bisectTemp(data, x0, 1),
            // index to left of cursor:
            d0 = data[i - 1],
            // index to right of cursor:
            d1 = data[i],
            // If the cursor is closer "in temp" to next point to the left, assign that to d,
            // otherwise, assign right point to d
            d = x0 - d0.data > d1.data - x0 ? d1 : d0;

            // Translation of focus g element based on new d value:
            focus.attr("transform", "translate(" + x(d.temp) + "," + y(d.rate) + ")")
            focus.select("#v-line").attr("y2", height - y(d.rate));
            focus.select("#h-line").attr("x2", 0 - x(d.temp));
            focus.select("#text-temp").text("T: " + d.temp);
            focus.select("#text-rate").text("Rate: " + d.rate.toPrecision(3));

      }
    })

  },

  componentDidMount: function () {
    this.renderChart(this.props.neutralString, this.props.ionString);
  },

  componentDidUpdate: function () {
    d3.selectAll("svg > *").remove();
    d3.select("#toolTip").remove();
    this.renderChart(this.props.neutralString, this.props.ionString);
  },

  render: function () {
    return (
      <div>
        <p>React Plot</p>
      </div>
    )
  }
})

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

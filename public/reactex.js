let React = require('react');
let ReactDOM = require('react-dom');

function httpGetRequest(neutral, ion) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      console.log(typeof xmlHttp.responseText);
    }
  }
  xmlHttp.open("GET", "http://localhost:8080/api/rate/?neutral="+ neutral +"&temp=range&ionmass=" + ion, true);
  xmlHttp.send(null);
}

let Line = React.createClass({
  propTypes: {
    path: React.PropTypes.string.isRequired,
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
  }

  render: function () {
    let { path, stroke, fill, strokeWidth} = this.props;
    return (
      <path
        d={path}
        stroke={stroke}
        fill={fill}
        strokeWidth={strokeWidth}
      />
    )
  }
});

let RatePlotContainer = React.createClass({
  getInitialState: function () {
    return {
      ionString: "48",
      neutralString: "N2O",
      defaultUrl: "http://localhost:8080/api/rate/?neutral=N2O&temp=range&ionmass=48",
      data: []
    }
  },

  handleUpdateValue: function (e) {
    if (e.target.id === "ion-input") {
      this.setState({
        ionString: e.target.value
      })
    } else if (e.target.id === "neutral-input") {
      this.setState({
        neutralString: e.target.value
      })
    }
  },

  componentDidUpdate: function () {
    //httpGetRequest(this.state.neutralString, this.state.ionString);
  },

  render: function () {
    //console.log(this.state.ionString, this.state.neutralString);
    return (
      <div>
        <div>Hello World!</div>
        <IonInput
          ionString={this.state.ionString}
          handleUpdateValue={this.handleUpdateValue}
        />
        <NeutralInput
          neutralString={this.state.neutralString}
          handleUpdateValue={this.handleUpdateValue}
        />
        <RatePlot
          neutralString={this.state.neutralString}
          ionString={this.state.ionString}
        />
      </div>
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

      console.log(url);

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
        <svg id="new-chart" width={this.state.width} height={this.state.height}>
          <path className="line" d={line}></path>
        </svg>
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

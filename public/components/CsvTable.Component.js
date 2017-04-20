'use strict';

let React = require('react');
let Border = require('./Border.Component.js');


// RateCSV Renders a text area with text formatted in CSV
// When textarea is clicked, all text is highlighted
// for easy copy/paste in excel
let RateCSV = React.createClass({
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    textAnchor: React.PropTypes.string,
    data: React.PropTypes.array
  },

  getDefaultProps: function () {
    return {
      textAnchor: "middle"
    }
  },

  // Takes an array of objects with 'temp' and 'rate' values and returns
  // a CSV formatted string
  // Used to set textarea's value
  formatInCSV: function (data) {
    let rateList = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].temp % 100 === 0) {
        rateList.push(data[i].rate.toPrecision(3).toString());
      }
    }
    let csvString = "Temp,Coll Rate\n" +
                    "100," + rateList[0] + "\n" +
                    "200," + rateList[1] + "\n" +
                    "300," + rateList[2] + "\n" +
                    "400," + rateList[3] + "\n" +
                    "500," + rateList[4] + "\n" +
                    "600," + rateList[5] + "\n" +
                    "700," + rateList[6];

    //console.log(csvString);
    return csvString;
  },

  // Selects text when textarea is clicked
  selectText: function () {
    this.refs.csv.select();
  },

  render: function () {
    let { width, height, margin, textAnchor, data } = this.props;

    return (
      <svg id="chart" width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
        <g id="plot-area" transform={"translate(" + margin.left + "," + margin.top + ")"} >
          <Border
            width={width}
            height={height}
          />
          <foreignObject x={0} y={0} width={width} height={height}>
            <div className="csv-output-container">
              <h4>{"Click then Ctrl + C to Copy"}</h4>
              <div>
                <textArea className="csv-output" ref="csv" onClick={this.selectText} readOnly="True" rows="8" cols="14" value={this.formatInCSV(data)} style={{"width": width / 6}} />
              </div>
            </div>
          </foreignObject>
        </g>
      </svg>
    )
  }
});

module.exports = RateCSV;

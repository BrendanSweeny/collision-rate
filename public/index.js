// TODO: Make chart placeholder more instructive
// TODO: Handle empty parameter values

// Styles
import mainStyles from './styles/main.css';
import sliderStyles from './styles/slider.css';

// Packages
let React = require('react');
let ReactDOM = require('react-dom');

// Nuetral Molecule Data
let neutralsJSON = require("../neutrals.json");

// Collision Rate Calculator Utility
let CollisionRate = require("./utils/CollisionRate")

// React Components
let SliderContainer = require('./components/SliderContainer.Component.js');
let ChartPlaceHolder = require('./components/ChartPlaceHolder.Component.js');
let CsvTable = require('./components/CsvTable.Component.js');
let ChemicalInput = require('./components/ChemicalInput.Component.js');
let SvgContainer = require('./components/SvgContainer.Component.js');


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
      errorState: false,
      tabulate: false
    }
  },

  // Clickhandler function for tabulate button
  // Changing state changes whether plot or table is displayed
  toggleTabulate: function () {
    if (this.state.tabulate) {
      this.setState({
        tabulate: false
      });
    } else {
      this.setState({
        tabulate: true
      });
    }
  },

  newNeutralRates: function (ionMass, neutralQuery) {
    let initialTemp = 100;
    let finalTemp = 700;
    ionMass = Number(ionMass);
    let neutral = neutralsJSON[neutralQuery];
    //console.log(ionMass, neutralQuery, neutral);
    if (neutral === undefined || !ionMass) {
      return [{"rates": null}];
    }

    let neutralMass = neutral.mass;
    let pol = neutral.polarizability;
    let d = neutral.dipoleMoment;

    let outputJSON = CollisionRate.calculateRate(neutralMass, ionMass, pol, d);

    return outputJSON;
  },

  newParamRates: function (ionMass, neutralMass, d, pol) {
    let initialTemp = 100;
    let finalTemp = 700;
    ionMass = Number(ionMass);
    neutralMass = Number(neutralMass);
    d = Number(d);
    pol = Number(pol);

    let outputJSON = CollisionRate.calculateRate(neutralMass, ionMass, pol, d);

    return outputJSON;
  },

  // Internal function that handles the API response and updates component state
  // data: JSON object received from server
  // newState: object
  handleAPIResponse: function (data, newState) {
    if (!newState) {
      newState = {};
    }

    if (!data.rates) {
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

  // Function passed as props to neutral and ion text inputs
  // Calls API handlers based on targeted input
  handleUpdateIonNeutral: function (e) {
    let data;
    let newState = {};
    if (e.target.id === "ion-input") {
      let ionMass = e.target.value;
      //this.findNeutralApiCall(ionMass, "ion");
      data = this.newNeutralRates(ionMass, this.state.neutralString);
    } else if (e.target.id === "neutral-input") {
      let neutralString = e.target.value;
      newState.neutralString = neutralString;
      //this.findNeutralApiCall(neutralString, "neutral");
      data = this.newNeutralRates(this.state.ionMass, neutralString);
    }
    this.handleAPIResponse(data, newState);
  },

  // Function passed as props to the sliders, handles value change
  // Calls API handlers based on targeted input
  handleUpdateParam: function (e) {
    //console.log(e.target.className);
    let data;
    if (e.target.className === "neutralMass") {
      let neutralMass = e.target.value;
      data = this.newParamRates(this.state.ionMass, neutralMass, this.state.dipoleMoment, this.state.polarizability);
    } else if (e.target.className === "ionMass") {
      let ionMass = e.target.value;
      data = this.newParamRates(ionMass, this.state.neutralMass, this.state.dipoleMoment, this.state.polarizability);
    } else if (e.target.className === "polarizability") {
      let polarizability = e.target.value;
      data = this.newParamRates(this.state.ionMass, this.state.neutralMass, this.state.dipoleMoment, polarizability);
    } else if (e.target.className === "dipoleMoment") {
      let dipoleMoment = e.target.value;
      data = this.newParamRates(this.state.ionMass, this.state.neutralMass, dipoleMoment, this.state.polarizability);
    }

    this.handleAPIResponse(data);
  },

  // Plot and values for Ti+ and N2O are retrieved prior to mounting
  componentWillMount: function () {
    //this.getRates(window.location.origin + '/api/rate/findneutral/?neutral=N2O&temp=range&ionmass=48')
      //.then((data) => this.handleAPIResponse(data));

      let data = this.newNeutralRates(48, "N2O")
      this.handleAPIResponse(data);
  },

  // Renders chart or placeholder with error message based on state of 'errorState'
  render: function () {
    let { ionMass, neutralMass, neutralString, width, height, margin,
        data, xDomain, yDomain, dipoleMoment, polarizability,
        tabulate } = this.state;
    //console.log("<RatePlotContainer />: render", ionMass);

    // Displays data in SvgContainer or CsvTable (toggled using 'tabulate' button)
    let display;
    if (tabulate === false) {
      display = <SvgContainer
                  width={width}
                  height={height}
                  margin={margin}
                  data={data}
                  xDomain={xDomain}
                  yDomain={yDomain}
                  ionMass={ionMass}
                  neutralMass={neutralMass}
                  dipoleMoment={dipoleMoment}
                  polarizability={polarizability}
                />
    } else {
      display = <CsvTable
                  width={width}
                  height={height}
                  margin={margin}
                  data={data}
                />
    }

    return (
      <div>

        <div className="chem-input-container">
          <ChemicalInput
            idName="ion-input"
            title="Ion Mass"
            defaultValue={ionMass}
            handleUpdateIonNeutral={this.handleUpdateIonNeutral}
          />
          <ChemicalInput
            idName="neutral-input"
            title="Neutral"
            defaultValue={neutralString}
            handleUpdateIonNeutral={this.handleUpdateIonNeutral}
          />
          <div style={{'position': 'relative'}}>
            <button className="tabulate-btn" onClick={this.toggleTabulate}>Tabulate</button>
          </div>
        </div>

        {this.state.errorState ? (
          <ChartPlaceHolder
            width={width}
            height={height}
            margin={margin}
            message={["Empty ion/neutral input or neutral not found.", "", "You might try some of these neutral molecules:", "", "H2O", "N2O", "O2", "CO2", "H2", "etc..."]}
            textAnchor="left"
          />
        ) : (
          display
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

ReactDOM.render(
  <RatePlotContainer />,
  document.getElementById("root")
);

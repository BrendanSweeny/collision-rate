// TODO: Make chart placeholder more instructive

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
      chemicalParams: {
        neutralString: "N2O",
        ionMass: 48,
        neutralMass: 17,
        dipoleMoment: 1.47,
        polarizability: 2.2
      },
      xDomain: [],
      yDomain: [],
      data: [],
      errorState: false,
      tabulate: false
    }
  },

  // Clickhandler function for tabulate button.
  // Toggling state changes whether plot or table is displayed
  toggleTabulateData: function () {
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

  // Function that handles data generation for changes to the ion and neutral inputs
  getNeutralRates: function (ionMass, neutralQuery) {
    let initialTemp = 100;
    let finalTemp = 700;
    ionMass = Number(ionMass);
    let neutral = neutralsJSON[neutralQuery];
    //console.log(ionMass, neutralQuery, neutral);
    if (neutral === undefined || !ionMass) {
      return null;
    }

    let neutralMass = neutral.mass;
    let pol = neutral.polarizability;
    let d = neutral.dipoleMoment;

    let outputJSON = CollisionRate.calculateRate(neutralMass, ionMass, pol, d);
    outputJSON.neutralString = neutralQuery;

    return outputJSON;
  },

  // Function that prepares the data generation call when individual parametes
  // are changed
  getParamRates: function (chemicalParams) {
    let ionMass = chemicalParams.ionMass;
    let neutralMass = chemicalParams.neutralMass;
    let pol = chemicalParams.polarizability;
    let d = chemicalParams.dipoleMoment;

    if (!ionMass || !neutralMass || !pol) {
      return null;
    }

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
  handleNewData: function (data, newState) {
    if (!newState) {
      newState = {
        chemicalParams: this.state.chemicalParams
      };
    }

    if (data) {
      // Determine the axes range
      let xExtent = d3.extent(data.rates, (d) => { return d.temp; })
      let yExtent = d3.extent(data.rates, (d) => { return d.rate; })

      // Expand the y extent
      yExtent[0] = yExtent[0] - (yExtent[0] * 0.05);
      yExtent[1] = yExtent[1] + (yExtent[1] * 0.05);

      newState.data = data.rates;
      newState.xDomain = xExtent;
      newState.yDomain = yExtent;
      newState.chemicalParams.ionMass = data.ionMass;
      newState.chemicalParams.neutralMass = data.neutralMass;
      newState.chemicalParams.dipoleMoment = data.dipoleMoment;
      newState.chemicalParams.polarizability = data.polarizability;
    } else {
      newState.errorState = true;
    }

    this.setState(newState);
  },

  // Function passed as props to neutral and ion text inputs
  // Calls data handlers based on targeted input
  // Changes errorState when input fields are empty
  handleUpdateIonNeutral: function (e) {
    let data;
    let newState = {
      chemicalParams: this.state.chemicalParams
    };
    if (e.target.id === "ion-input") {
      let ionMass = e.target.value;
      if (!ionMass || !this.state.chemicalParams.neutralString) {
        newState.errorState = true;
        newState.chemicalParams.ionMass = ionMass;
        this.setState(newState);
      } else {
        newState.chemicalParams.ionMass = ionMass;
        newState.errorState = false;
        data = this.getNeutralRates(ionMass, this.state.chemicalParams.neutralString);
        //console.log(data);
        this.handleNewData(data, newState);
      }
    } else if (e.target.id === "neutral-input") {
      let neutralString = e.target.value;
      if (!neutralString || !this.state.chemicalParams.ionMass) {
        newState.errorState = true;
        newState.chemicalParams.neutralString = neutralString;
        this.setState(newState);
      } else {
        newState.chemicalParams.neutralString = neutralString;
        newState.errorState = false;
        //this.findNeutralApiCall(neutralString, "neutral");
        data = this.getNeutralRates(this.state.chemicalParams.ionMass, neutralString);
        //console.log(data);
        this.handleNewData(data, newState);
      }
    }
  },

  // Function passed as props to the sliders, handles value change
  // Calls data handlers based on targeted input and changes errorState if
  // input field is blank
  newHandleUpdateParam: function (e) {
    let value = e.target.value;
    let data;
    // Default false error state
    let newState = {
      errorState: false,
      chemicalParams: this.state.chemicalParams
    };
    // Check that there is a non-empty value (if it's not dipoleMoment)
    if (!value && e.target.className !== "dipoleMoment") {
      newState.errorState = true;
      newState.chemicalParams[e.target.className] = value;
    }
    // Check for non-empty params in current state
    for (let param in this.state.className) {
      if (!param && param !== "dipoleMoment") {
        newState.errorState = true;
      }
    }
    // Update the newState parameter value with the input value and the other
    // current state values
    if (!newState.errorState) {
      newState.chemicalParams = {};
      for (let param in this.state.chemicalParams) {
        if (param === e.target.className) {
          newState.chemicalParams[param] = value;
        } else {
          newState.chemicalParams[param] = this.state.chemicalParams[param];
        }
      }
      // Generate new data and handle it or set errorState
      data = this.getParamRates(newState.chemicalParams)
      this.handleNewData(data, newState);
    } else {
      this.setState(newState);
    }
  },

  // Plot and values for Ti+ and N2O are retrieved prior to mounting
  componentWillMount: function () {

      let data = this.getNeutralRates(48, "N2O")
      this.handleNewData(data);
  },

  // Renders chart or placeholder with error message based on state of 'errorState'
  render: function () {
    let { width, height, margin, data, xDomain, yDomain,
        tabulate, errorState, chemicalParams } = this.state;

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
                  ionMass={chemicalParams.ionMass}
                  neutralMass={chemicalParams.neutralMass}
                  dipoleMoment={chemicalParams.dipoleMoment}
                  polarizability={chemicalParams.polarizability}
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
            defaultValue={chemicalParams.ionMass}
            handleUpdateIonNeutral={this.handleUpdateIonNeutral}
          />
          <ChemicalInput
            idName="neutral-input"
            title="Neutral"
            defaultValue={chemicalParams.neutralString}
            handleUpdateIonNeutral={this.handleUpdateIonNeutral}
          />
          <div style={{'position': 'relative'}}>
            <button className="tabulate-btn" onClick={this.toggleTabulateData}>Tabulate</button>
          </div>
        </div>

        {errorState ? (
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
          neutralMass={chemicalParams.neutralMass}
          ionMass={chemicalParams.ionMass}
          dipoleMoment={chemicalParams.dipoleMoment}
          polarizability={chemicalParams.polarizability}
          handleUpdateParam={this.newHandleUpdateParam}
        />

      </div>
    )
  }
});

ReactDOM.render(
  <RatePlotContainer />,
  document.getElementById("root")
);

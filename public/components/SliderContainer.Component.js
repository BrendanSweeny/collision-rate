// TODO: dipole moment slider will not go to zero or allow empty strings for some reason
// TODO: cannot input floats < 1 in text boxes

'use strict';

let React = require('react');
let formatSuperscript = require('../utils/formatSuperscript');
let validateNumber = require('../utils/validateNumber')

let SliderContainer = React.createClass({
  propTypes: {
    neutralMass: React.PropTypes.number,
    ionMass: React.PropTypes.number,
    polarizability: React.PropTypes.number,
    dipoleMoment: React.PropTypes.number,
    handleUpdateParam: React.PropTypes.func
  },

  render: function () {
    let { neutralMass, ionMass, polarizability, dipoleMoment, handleUpdateParam } = this.props;

    console.log("<SliderContainer /> render: ", neutralMass);

    return (
      <div className="slider-container">
        <HorizontalSlider name="neutralMass" title="Neutral Mass (amu)" min={10} max={200} step={10} defaultValue={neutralMass} handleUpdateParam={handleUpdateParam} />
        <HorizontalSlider name="polarizability" title={"Polarizability (A^3)"} min={0.1} max={4} step={0.1} defaultValue={polarizability} handleUpdateParam={handleUpdateParam} />
        <HorizontalSlider name="dipoleMoment" title="Dipole Moment (D)" min={0.1} max={2} step={0.1} defaultValue={dipoleMoment} handleUpdateParam={handleUpdateParam} />
        <HorizontalSlider name="ionMass" title="Ion Mass (amu)" min={1} max={300} step={5} defaultValue={ionMass} handleUpdateParam={handleUpdateParam} />
      </div>
    )
  }
});


// The HorizontalSlider allows for precise (text box) or general (range input)
// manipulation of the T-dependent collision rate
let HorizontalSlider = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    handleUpdateParam: React.PropTypes.func,
    max: React.PropTypes.number,
    min: React.PropTypes.number,
    step: React.PropTypes.number,
    defaultValue: React.PropTypes.number,
    name: React.PropTypes.string
  },

  // Uses first props as state
  getInitialState: function () {
    console.log("<Slider /> getInitialState", this.props.defaultValue);
    return {
      value: this.props.defaultValue ? this.props.defaultValue : 50
    }
  },

  getDefaultProps: function () {
    return {
      max: 100,
      min: 0,
      step: 1
    }
  },

  // Input values need to be handled in state in order to display 'invalid' inputs
  // such as: "1." Hence, handleUpdateParam(), which updates parent state/API call, and
  // setState for the Slider class are wrapped together in this function
  handleUpdateValue: function (e) {
    let value = e.target.value;

    // Will not update if invalid number is input
    if (validateNumber(value)) {
      this.setState({
        value: value
      })
      this.props.handleUpdateParam(e);

    }
  },

  componentWillReceiveProps: function (nextProps) {
    console.log("<Slider /> componentWillReceiveProps", this.props.defaultValue);

    // Allows for some'invalid' inputs e.g. '1.'
    // Will not update state (string) when props = 1 and state.value = '1.'
    // Will not update state if state.value is an empty string to allow for input of floats < 1
    // if component is allowed to update when props.value === '.' => React uncontrolled/controlled component error
    if (nextProps.defaultValue !== Number(this.state.value) && this.state.value !== '' && this.state.value !== '.') {
      console.log("<Slider /> componentWillReceiveProps UPDATED");
      this.setState({
        value: nextProps.defaultValue
      })
    }
  },

  render: function () {
    console.log("<Slider /> render", " state.value: ", this.state.value, this.props.defaultValue);
    let { title, max, min, step, defaultValue, name, handleUpdateParam } = this.props
    title = formatSuperscript(title, "html");
    //console.log(defaultValue, this.state.value);

    // slider (range input) displays value of props because displaying state causes a stutter in the slider
    // when dragged rapidly due to many API calls and subsequent state updates causing performance issues.
    // Also because inputs using slider do not have to handle unusual values e.g. '1.'
    return (
      <div className="slider">
        <p dangerouslySetInnerHTML={{__html: title}}></p>
        <input className={name} value={this.state.value} onChange={this.handleUpdateValue} />
        <input className={name} type="range" min={min} max={max} step={step} value={Number(defaultValue)} onChange={this.handleUpdateValue} />
      </div>
    )
  }
});

module.exports = SliderContainer;

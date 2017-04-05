'use strict';

let React = require('react');
let formatSuperscript = require('../utils/formatSuperscript');

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

    //console.log("<SliderContainer /> render: ", neutralMass);

    return (
      <div className="slider-container">
        <HorizontalSlider name="neutralMass" title="Neutral Mass (amu)" min={10} max={200} step={5} defaultValue={neutralMass} handleUpdateParam={handleUpdateParam} />
        <HorizontalSlider name="polarizability" title={"Polarizability (A^3)"} min={0.1} max={4} step={0.1} defaultValue={polarizability} handleUpdateParam={handleUpdateParam} />
        <HorizontalSlider name="dipoleMoment" title="Dipole Moment (D)" min={0} max={2} step={0.1} defaultValue={dipoleMoment} handleUpdateParam={handleUpdateParam} />
        <HorizontalSlider name="ionMass" title="Ion Mass (amu)" min={1} max={300} step={5} defaultValue={ionMass} handleUpdateParam={handleUpdateParam} />
      </div>
    )
  }
});

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

  getInitialState: function () {
    return {
      value: this.props.defaultValue ? this.props.defaultValue : 50
    }
  },

  getDefaultProps: function () {
    return {
      title: "Slider",
      max: 100,
      min: 0,
      step: 1
    }
  },

  handleMoveSlider: function (e) {
    this.setState({
      value: e.target.value
    })
  },

  render: function () {
    let { title, max, min, step, defaultValue, name, handleUpdateParam } = this.props
    title = formatSuperscript(title, "html");
    //console.log(defaultValue, this.state.value);

    return (
      <div className="slider">
        <p dangerouslySetInnerHTML={{__html: title}}></p>
        <input className={name} value={defaultValue} onChange={handleUpdateParam} />
        <input className={name} type="range" min={min} max={max} step={step} value={defaultValue} onChange={handleUpdateParam} />
      </div>
    )
  }
});

module.exports = SliderContainer;


let React = require('react');

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

module.exports = ChemicalInput;

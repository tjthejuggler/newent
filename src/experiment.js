import React, { Component } from 'react';
import Knob from './modifiedKnob';//make this like experiment with the modified react-canvas-knob


class Experiment extends Component {

    render(){
    	return(
	      <div style={this.props.expStyle}>
	        <label>Particle state: {this.props.particle}</label><br></br>
	        <label>myMeasurementResult: {this.props.measurement}</label><br></br>
	        <button onClick={()=>this.props.doMeasurement(0)}>measureA</button>
	        <button onClick={()=>this.props.doMeasurement(1)}>measureB</button>
	        <button onClick={this.props.createEntanglement}>entanglement</button>
            <Knob min='0'
		            max='360'
		            value={this.props.knobValue}
		            onChange={this.props.onKnobChange}/><br></br>
      <label> knob: {this.props.knobCorrelation} </label>
	      </div>
      )
    }
}
export default Experiment
import React, { Component } from 'react';

class Experiment extends Component {

    render(){
    	return(
	      <div style={this.props.expStyle}>
	        <label>Particle state: {this.props.particle}</label><br></br>
	        <label>myMeasurementResult: {this.props.measurement}</label><br></br>
	        <button onClick={()=>this.props.doMeasurement(0)}>measureA</button>
	        <button onClick={()=>this.props.doMeasurement(1)}>measureB</button>
	        <button onClick={this.props.createEntanglement}>entanglement</button>
	      </div>
      )
    }
}
export default Experiment
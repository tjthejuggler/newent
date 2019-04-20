import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Knob from './modifiedKnob';//make this like experiment with the modified react-canvas-knob
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

class Experiment extends Component {

    render(){
    	return(
	      <div style={this.props.expStyle}>
	        <label>Particle state: {this.props.particle}</label><br></br>
	        <label>myMeasurementResult: {this.props.measurement}</label><br></br>
	        <button onClick={()=>this.props.doMeasurement(0)}>measureA</button>
	        <button onClick={()=>this.props.doMeasurement(1)}>measureB</button>
	        <button onClick={this.props.createEntanglement}>entanglement</button>
	        <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
	        <br></br><br></br><br></br><br></br><br></br>
    <div>
      <p>Slider with custom handle</p>
      <Slider min={0} max={20} defaultValue={3}/>
    </div>
    <div>
      <p>Slider with fixed values</p>
      <Slider min={20} defaultValue={[20,40]} dotStyle={{borderColor: 'orange'}}
       activeDotStyle={{trackColor: 'yellow'}} marks={{ 20: 20, 40: 40, 100: 100 }} step={null} tipFormatter={value => `${value}%`} />
    </div>
    <div>
      <p>Range with custom handle</p>
      <Range min={0} max={20} defaultValue={[3, 10]} 
       marks={{ 20: 20, 40: 40, 100: 100 }} tipFormatter={value => `${value}%`} />
    </div>
	        
	        
            <div style={{position: 'absolute', top: '340px', left: '60px'}}>
            <Knob fgColor = 'red'
            		min='0'
		            max='360'
		            value={this.props.aliceAKnobValue}
		            onChange={this.props.onKnobChange}/><br></br>
		    </div>
		    <div style={{position: 'absolute', top: '340px', left: '60px'}}>
		      <Knob fgColor = 'orange'
		            min='0'
		            max='360'
		            value={this.props.aliceBKnobValue}
		            onChange={this.props.onKnobChange}/><br></br>
		    </div>
            <div style={{position: 'absolute', top: '340px', left: '60px'}}>
            <Knob fgColor = 'blue'
            		min='0'
		            max='360'
		            value={this.props.bobAKnobValue}
		            onChange={this.props.onKnobChange}/><br></br>
		    </div>
		    <div style={{position: 'absolute', top: '340px', left: '60px'}}>
		    <Knob fgColor = 'green'
		           min='0'
		            max='360'
		            value={this.props.bobBKnobValue}
		            onChange={this.props.onKnobChange}/><br></br>
		    </div>         
      <label> knob: {this.props.knobCorrelation} </label>
	      </div>
      )
    }
}
export default Experiment
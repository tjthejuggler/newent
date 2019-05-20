import React, { Component } from 'react';
import './App.css';
import Knob from './modifiedKnob';//make this like experiment with the modified react-canvas-knob
import Slider, { Range } from './rc-slider-modified';
import './rc-slider-modified/assets/index.css';

class QuantumAuto extends Component {

	emptyFunctionToAvoidError(){
		console.log('...')
	}


    render(){
    	return(
	      <div style={this.props.expStyle}>
	      <br></br>
	      	<label style={{color:'red', float: 'left'}}>Alice A: {this.props.aliceAAngle}</label><br></br>
	      	<label style={{color:'orange', float: 'left'}}>Alice B: {this.props.aliceBAngle}</label><br></br>
	      	<label style={{color:'blue', float: 'left'}}>Bob A: {this.props.bobAAngle}</label><br></br>
	      	<label style={{color:'green', float: 'left'}}>Bob B: {this.props.bobBAngle}</label><br></br>
	      	<br></br>

    <div style={{position: 'relative', zIndex:10}}>
      <Slider min={0} 
      	onChange={(e)=>this.props.onSliderChangeA(e)}
      	defaultValue={10} 
      	railStyle={{ backgroundColor: this.props.colorPrimaryA, height: 4 }}
        trackStyle={{ backgroundColor: this.props.colorPrimaryA, height: 4 }}
        dotStyle={{backgroundColor: this.props.colorPrimaryA, borderColor: this.props.colorPrimaryA}}
        activeDotStyle={{backgroundColor: this.props.colorPrimaryA, borderColor: this.props.colorPrimaryA}}
        handleStyle={{
          borderColor: this.props.colorSecondaryA,
          height: 28,
          width: 28,
          marginLeft: -14,
          marginTop: -9,
          backgroundColor: this.props.colorSecondaryA}} 
        marks={{ 10: '', 30: '', 50: '', 70: '', 90: ''}} 
        step={null} />
    </div>
    <br></br><br></br>
    <div style={{position: 'relative', zIndex:1}}>
   	<div className = 'styleKnob'>
	    <Knob //onChange = {this.emptyFunctionToAvoidError()}
	    		fgColor = 'red'
	    		min={0}
	            max={360}
	            value={this.props.aliceAKnobValue}/><br></br>
	    </div>
	    <div className = 'styleKnob'>
	      <Knob //onChange = {this.emptyFunctionToAvoidError()}
	      		fgColor = 'orange'
	            min={0}
	            max={360}
	            value={this.props.aliceBKnobValue}/><br></br>
	    </div>
	    <div className = 'styleKnob'>
	    <Knob 	//onChange = {this.emptyFunctionToAvoidError()}
	    		fgColor = 'blue'
	    		min={0}
	            max={360}
	            value={parseInt(this.props.bobAKnobValue)}/><br></br>
	    </div>
	    <div className = 'styleKnob'>
	    <Knob //onChange = {this.emptyFunctionToAvoidError()}
	    		fgColor = 'green'
	           min={0}
	            max={360}
	            value={parseInt(this.props.bobBKnobValue)}/><br></br>
	    </div> 
	    <div style={{position: 'relative', zIndex:11}}> 
       <Slider min={0} 
       	onChange={(e)=>this.props.onSliderChangeB(e)}
       	defaultValue={10} 
      	railStyle={{ backgroundColor: this.props.colorPrimaryB, height: 4 }}
        trackStyle={{ backgroundColor: this.props.colorPrimaryB, height: 4 }}
        dotStyle={{backgroundColor: this.props.colorPrimaryB, borderColor: this.props.colorPrimaryB}}
        activeDotStyle={{backgroundColor: this.props.colorPrimaryB, borderColor: this.props.colorPrimaryB}}
        handleStyle={{
          borderColor: this.props.colorSecondaryB,
          height: 28,
          width: 28,
          marginLeft: -14,
          marginTop: -9,
          backgroundColor: this.props.colorSecondaryB}} 
        marks={{ 10: '', 30: '', 50: '', 70: '', 90: ''}}  
        step={null} />
        </div>
    </div>
    	        <label>Particle state: {this.props.particle}</label><br></br>
	        <label>myMeasurementResult: {this.props.measurement}</label><br></br>
	        <label>{this.props.correlationReadout}</label>
	        <br></br><br></br>
      
       

	  </div>
      )
    }
}
export default QuantumAuto
import React, { Component } from 'react';
import Knob from './modifiedKnob';//make this like experiment with the modified react-canvas-knob
import Slider, { Range } from './rc-slider-modified';
import './rc-slider-modified/assets/index.css';

class Experiment extends Component {



    render(){

	const styleKnob = {position: 'absolute', top: '380px', left: '80px', zIndex:0}

    	return(
	      <div style={this.props.expStyle}>
	        <label>Particle state: {this.props.particle}</label><br></br>
	        <label>myMeasurementResult: {this.props.measurement}</label><br></br>
	        <label>{this.props.correlationReadout}</label>
	        <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
	        <br></br><br></br>
    <div style={{position: 'relative', zIndex:1}}>
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
        marks={{ 10: '0', 30: 'Pi/8', 50: 'Pi/4', 70: '3Pi/8', 90: 'Pi/2'}} 
        step={null} />
    </div>
    <br></br><br></br>
    <div style={{position: 'relative', zIndex:1}}>
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
    <br></br><br></br>	        
	    <div style={styleKnob}>
	    <Knob fgColor = 'red'
	    		min='0'
	            max='360'
	            value={this.props.aliceAKnobValue}/><br></br>
	    </div>
	    <div style={styleKnob}>
	      <Knob fgColor = 'orange'
	            min='0'
	            max='360'
	            value={this.props.aliceBKnobValue}/><br></br>
	    </div>
	    <div style={styleKnob}>
	    <Knob fgColor = 'blue'
	    		min='0'
	            max='360'
	            value={parseInt(this.props.bobAKnobValue)}/><br></br>
	    </div>
	    <div style={styleKnob}>
	    <Knob fgColor = 'green'
	           min='0'
	            max='360'
	            value={parseInt(this.props.bobBKnobValue)}/><br></br>
	    </div>         

	  </div>
      )
    }
}
export default Experiment
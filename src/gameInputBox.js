import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { AgGridReact } from 'ag-grid-react';
import QuantumAuto from './quantumAuto.js'
import './App.css';

class GameInputBox extends Component {

    render(){
      return(
            <div>
              {this.props.displayManual?
                <div className='styleSelectedGameType'>
                  <br></br>       
                  <label>Question: {this.props.currentQuestion}</label><br></br>
                  <label className='styleInfoBarNewGame'>Question #: {this.props.currentQuestionIndex} / {this.props.numberOfQuestions}</label><br></br>          
                  <button onClick={()=>this.props.manualGameAnswer(0)}>first answer</button>
                  <button onClick={()=>this.props.manualGameAnswer(1)}>second answer</button><br></br><br></br>
                </div> :''}
              {this.props.displayAutoClassic ? 
                <div className='styleSelectedGameType'>
                  <br></br> 
                  <label>Always answer Q0 with:</label>
                  <br></br>                     
                  <div className='autoClassicQuestionRadioButtonStyle'>
                    <input type="radio" 
                            value="0" 
                            name="question0"
                            defaultChecked                
                            disabled={this.props.radioButtonsDisabled}
                            onClick={()=>this.props.autoClassicRadioButtonClicked('0','0')}/> 0 
                    <input type="radio" 
                            value="1" 
                            name="question0"
                            disabled={this.props.radioButtonsDisabled}
                            onClick={()=>this.props.autoClassicRadioButtonClicked('0','1')}/> 1            
                  </div>
                  <br></br>
                  <label>Always answer Q1 with:</label><br></br>                     
                  <div className='autoClassicQuestionRadioButtonStyle'>
                    <input type="radio" 
                          value="0"
                          name="question1"
                          defaultChecked                
                          disabled={this.props.radioButtonsDisabled}
                          onClick={()=>this.props.autoClassicRadioButtonClicked('1','0')}/> 0
                    <input type="radio" 
                          value="1" 
                          name="question1"
                          disabled={this.props.radioButtonsDisabled}
                          onClick={()=>this.props.autoClassicRadioButtonClicked('1','1')}/> 1             
                  </div>
                  <br></br> 
                </div> : ''}              
              Correct: {this.props.correctCounter}
              <div className="ag-theme-balham"
                    style={{ height: '400px', width: '250px', display: this.props.displayResults }}>
                <AgGridReact
                    columnDefs={this.props.columnDefs}
                    rowData={this.props.resultsGridRowData}>
                </AgGridReact>
              </div>
              <div className='styleSelectedGameType'>
                {this.props.dispAutoQuantum ? 
                  <QuantumAuto 
                  particle={this.props.particle}
                  measurement={this.props.measurement}
                  doMeasurement={this.doMeasurement}
                  aliceAKnobValue = {this.props.aliceAKnobValue}
                  aliceBKnobValue = {this.props.aliceBKnobValue}
                  bobAKnobValue = {this.props.bobAKnobValue}
                  bobBKnobValue = {this.props.bobBKnobValue}
                  knobCorrelation = {this.props.knobCorrelation}
                  colorPrimaryA = {this.props.colorPrimaryA}
                  colorSecondaryA = {this.props.colorSecondaryA}
                  colorPrimaryB = {this.props.colorPrimaryB}
                  colorSecondaryB = {this.props.colorSecondaryB}
                  onSliderChangeA = {(e)=>this.props.onSliderChangeA(e)}
                  onSliderChangeB = {(e)=>this.props.onSliderChangeB(e)}
                  correlationReadout = {this.props.correlationReadout}
                  aliceAAngle = {this.props.aliceAAngle}
                  aliceBAngle = {this.props.aliceBAngle}
                  bobAAngle = {this.props.bobAAngle}
                  bobBAngle = {this.props.bobBAngle}
                />: ''}        
        



              </div>
            </div>

      )

  }

}

export default GameInputBox




import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import './App.css';

class GameTypeBox extends Component {

    render(){



      return(

<div className='gameTypeStyle'>
            <div className='gameTypeRadioButtonStyle'>
              <input type="radio" 
                    value="autoClassic" 
                    name="gameType"
                    defaultChecked                
                    disabled={this.props.radioButtonsDisabled}
                    onClick={()=>this.props.gameTypeRadioButtonClicked('autoClassic')}/> Auto (Classic) 
                    <br></br>
              <input type="radio" 
                    value="autoQuantum" 
                    name="gameType"
                    disabled={this.props.radioButtonsDisabled}
                    onClick={()=>this.props.gameTypeRadioButtonClicked('autoQuantum')}/> Auto (Quantum) 
                    <br></br>
            <input type="radio" 
                    value="manual" 
                    name="gameType"
                    disabled={this.props.radioButtonsDisabled}
                    onClick={()=>this.props.gameTypeRadioButtonClicked('manual')}/> Manual 
                    <br></br>
              
            </div>
          
          <button className='styleBeginButton'
                  onClick={()=>this.props.beginButtonClicked()}>{this.props.beginButtonText}</button>
          </div>

      )

  }

}

export default GameTypeBox
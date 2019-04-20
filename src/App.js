import React, { Component, View } from 'react';
//import { StyleSheet, View, Text, Platform} from 'react-native';
//import * as functions from "firebase-functions"
//import Tooltip from 'react-bootstrap';
//import logo from './logo.svg';
import './App.css';
import firebase from 'firebase' 
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import Experiment from './experiment'
import Knob from './modifiedKnob';//make this like experiment with the modified react-canvas-knob
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

//to run this on local host, use 'npm start' in cmd
const fbConfig = 
  {//testing get stuff again
    apiKey: "AIzaSyAz2p24gxOMDp-89VNh1pfkmOUy5mPxf9A",
    authDomain: "newent-a686e.firebaseapp.com",
    databaseURL: "https://newent-a686e.firebaseio.com",
    projectId: "newent-a686e",
    storageBucket: "newent-a686e.appspot.com",
    messagingSenderId: "904946277128"
  }
const app = firebase.initializeApp(fbConfig)
const myObj = firebase.database().ref('Labs')

const highestQuestionIndex = 10

var listOfAnswers = []
var currentQuestionIndex = 0 //this can be either X or O
var rightCounter = 0

//var myGameNameRef
var myParticle = '-1'
var myGameName = 'none'
var myGameRefNum = -1
var myNumber = -1
var myName = 'none'
var myMeasurementResult = -1
var iHaveMeasured = false
var scientistCount = 0

var current_mode = 'intro'
var current_status = 'welcome'

var displayResults = 'none'

class App extends Component {
  constructor(){
    super();
    this.state = {
      knobCorrelation: 0,
      myKnobValue: 0,
      style_intro: false,
      styleParticle: true,
      styleAliceNameMarker: false,
      styleBobNameMarker:true,
      styleHelpContainerVisibility:true,
      showIntroDialog: true,
      displayDialogButtons: true,
      displayGameInput: true,
      gameMessage: '',
      displayGameMessage: false,
      dialogHeader: 'Create or Join',
      dialogText: 'This game requires two players with two devices.'+ 
                  'The first player creates a game, and the second joins.',
      myStateLab: 'rrr',
      listOfQuestions: [],
      showHideParticleText: 'Show Particle',
      aliceAKnobValue: '20',
      aliceBKnobValue: '40',
      bobAKnobValue: '60',
      bobBKnobValue: '80',
      columnDefs: [{headerName: 'AQ', field: 'aliceQ', width:45},
                    {headerName: 'BQ', field: 'bobQ', width:45},
                    {headerName: 'AA', field: 'aliceA', width:45},
                    {headerName: 'BA', field: 'bobA', width:45},
                    {headerName: 'Result', field: 'result', width:70}],
      resultsGridRowData: []
    };
    this.handleIntroSubmit = this.handleIntroSubmit.bind(this);
    this.showHideHelpBox = this.showHideHelpBox.bind(this);
    this.startNewClassicGame = this.startNewClassicGame.bind(this);
    this.classicGameAnswer = this.classicGameAnswer.bind(this);
    this.createEntanglement = this.createEntanglement.bind(this);
    this.showHideParticle = this.showHideParticle.bind(this);
    this.doMeasurement = this.doMeasurement.bind(this);
    this.handleIntroChange = this.handleIntroChange.bind(this);
  }
    doSomethingBeforeUnload = () => {
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      updatedLabList[myGameRefNum].labClosed = 'true'
      myObj.set(updatedLabList)
    })
}

    setupBeforeUnloadListener = () => {
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            this.doSomethingBeforeUnload();
        });
    };

//make knobs between users interactive so either can see the others move
//  make a myKnob and a otherPlayerKnob
//  send myKnob position to the db
//  get the otherPlayerKnob angle from db
//have a simple % coorelated reading by default, but allow a togglable more detailed
//  readout that has: angles, pi, %, maybe radians as well

  handleKnobChange = (newValue) => {
    this.setState({myKnobValue: newValue});
    this.setState({knobCorrelation: this.determineKnobCorrelation()});//Math.abs(360-newValue)});
    myObj.transaction(function(currentValue){
      console.log('currentValue',currentValue)
      var updatedLabList = currentValue
      if (myName === 'Alice'){
        updatedLabList[myGameRefNum].aliceKnobAngle = newValue
      }
      else if (myName === 'Bob'){
        updatedLabList[myGameRefNum].bobKnobAngle = newValue
      }
      myObj.set(updatedLabList)
      //iHaveMeasured = false
    })


  };

  determineKnobCorrelation(e) {
    console.log((Math.abs(360-this.state.myKnobValue)))
    return (Math.abs(360-this.state.myKnobValue))//this.state.myKnobValue
  }

  handleIntroSubmit(e) {
    //console.log('ffff',e.target.value)
    myGameName = this.state.myStateLab
    e.preventDefault();
    this.joinOrCreateLab()
    this.startNewClassicGame()
    if (scientistCount === 2){
      this.setState({showIntroDialog: false})
    }else{
      this.setState({dialogText: 'Waiting for the other player to join.'})//this
      this.setState({dialogHeader: 'Waiting...'})      
      this.setState({displayDialogButtons: false})
    }    
  }

      handleIntroChange(event, newValue) {
        console.log('handleIntroChange', event.target.value)
        event.persist(); // allow native event access (see: https://facebook.github.io/react/docs/events.html)
        // give react a function to set the state asynchronously.
        // here it's using the "name" value set on the TextField
        // to set state.person.[firstname|lastname].            
        //this.setState((state) => state.myStateLab = newValue);
        this.setState({myStateLab: event.target.value})

    }



  startNewClassicGame(e) {
    current_mode = 'Classic Game'
    displayResults = 'none'
    this.setState({displayGameInput:true})
    currentQuestionIndex = 0
    rightCounter = 0
    var i;
    var oneCount = 0
    var showAnswerButtons = false

    var tempListOfQuestions = this.state.listOfQuestions    
    for (i = 0; i < highestQuestionIndex; i++) { 
      tempListOfQuestions[i] = (Math.floor(Math.random() * Math.floor(2)))
      this.setState({listOfQuestions : tempListOfQuestions})
      if (tempListOfQuestions[i] === 1){oneCount = oneCount+1}
    }
    console.log('this.state.listOfQuestions',this.state.listOfQuestions)
    console.log(oneCount)
    iHaveMeasured = false
    
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      if (updatedLabList[myGameRefNum].playerOne === 'Bob'){
        updatedLabList[myGameRefNum].aliceGameQuestions = []
        updatedLabList[myGameRefNum].aliceGameAnswers = []
        updatedLabList[myGameRefNum].bobGameQuestions = []
        updatedLabList[myGameRefNum].bobGameAnswers = []
        current_status = 'Begin playing game'
        showAnswerButtons = true
      }
      myObj.set(updatedLabList)
    })

  }

  showHideHelpBox(e) {
    if (this.state.styleHelpContainerVisibility){
      this.setState({styleHelpContainerVisibility: false})
    }else{
      this.setState({styleHelpContainerVisibility: true})
    }
  }

  showHideParticle(e) {
      e.preventDefault();
    if(this.state.styleParticle){
      console.log("experiment")
      current_mode = "Experiment"
      this.setState({showHideParticleText: 'Hide Particle'})
      this.setState({styleParticle: false})
    }else{
      this.setState({showHideParticleText: 'Show Particle'})
      this.setState({styleParticle: true})
    }
  }

  createEntanglement(){
    myObj.transaction(function(currentValue){
      console.log('currentValue',currentValue)
      var updatedLabList = currentValue
      updatedLabList[myGameRefNum].particle = '-1'
      myParticle = '-1'
      myObj.set(updatedLabList)
      //iHaveMeasured = false
    })
    this.setState({styleParticle: false})
  }

  classicGameAnswer(myAnswer){
    console.log('myAnswer',myAnswer)
    //todo: dont let the user click the answer buttons if they have already answered all the questions
    //    this could be done by making the buttons be gone or by making an alert when a button is clicked
    //    -look through the notes scattered around and clean them up
    
    if (currentQuestionIndex < highestQuestionIndex){
    var listOfQuestions = this.state.listOfQuestions
    this.setState({displayGameInput:true})
    myObj.transaction(function(currentValue){
    var updatedLabList = currentValue
    listOfAnswers[currentQuestionIndex] = myAnswer
    currentQuestionIndex++
    if (currentQuestionIndex === highestQuestionIndex){
      console.log('listOfQuestions',listOfQuestions)
        if (myNumber === 0){
          updatedLabList[myGameRefNum].aliceGameQuestions = listOfQuestions
          updatedLabList[myGameRefNum].aliceGameAnswers = listOfAnswers
        }
        if (myNumber === 1){
          updatedLabList[myGameRefNum].bobGameQuestions = listOfQuestions
          updatedLabList[myGameRefNum].bobGameAnswers = listOfAnswers
        }
        myObj.set(updatedLabList)
        }
      })
    }

  }
    //once all the questions have been answered, it tells the user who completes first
    //  that the other is still answering. once both done, they get to see their report
    //  -once all questions have been answered, set a variable in the db with the questions
    //    and the answers. before then the variable should be none or null.
    //  -when new game is started, set the question/answer to none/null
    //after game is complete, the complete results should be shown, every decision that both
    //  players made, whether they were right or wrong, percent win
    //there need not be player to player connection until both players have answered all their questions,
    //  the player should keep track of all their questions and answers locally, once all questions
    //  are answered, they can be sent to the server where they are shared with the other player,
    //  and then both players see the results

    doMeasurement(myMeasurementType){
    //e.preventDefault();
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      var particleStateNumber = updatedLabList[myGameRefNum].particle
      var do_cos_squared_pi_over_8_measurement = false
      var do_cos_squared_3_pi_over_8_measurement = false
      if (!iHaveMeasured){
        iHaveMeasured = true
      if (particleStateNumber === '-1'){
        myMeasurementResult = (Math.floor(Math.random() * Math.floor(2))).toString()
        particleStateNumber = myMeasurementResult+myNumber.toString()+myMeasurementType.toString()
      }else if (particleStateNumber.charAt(2) === '0'){
              do_cos_squared_pi_over_8_measurement = true
      }else if (particleStateNumber.charAt(2) === '1'){
          if (myMeasurementType === '0'){
              do_cos_squared_pi_over_8_measurement = true
          }else if (myMeasurementType === '1'){
            do_cos_squared_3_pi_over_8_measurement = true
          }        
        }
        var randomNum=Math.random()
        if (do_cos_squared_pi_over_8_measurement){
              console.log('randomNum1',randomNum)
              if(randomNum < 0.8536) {myMeasurementResult = particleStateNumber.charAt(0)}
              else {myMeasurementResult = (particleStateNumber.charAt(0)+1)%2}
        }else if(do_cos_squared_3_pi_over_8_measurement){
              console.log('randomNum2',randomNum)
              if(randomNum < 0.1464) {myMeasurementResult = particleStateNumber.charAt(0)}
              else {myMeasurementResult = (particleStateNumber.charAt(0)+1)%2}
        }
      console.log('myMeasurementResult',myMeasurementResult)
      updatedLabList[myGameRefNum].particle = particleStateNumber
      myParticle = particleStateNumber
      console.log('myParticle',myParticle)      
      myObj.set(updatedLabList)
      }
    })
    this.setState({styleParticle: false})
  }

    deleteLab = () => {
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      delete updatedLabList[myGameRefNum];
      myObj.set(updatedLabList)
    })
  }

  componentDidMount(){
    this.setupBeforeUnloadListener()
    myObj.on("value",(snapshot)=>{
      const labs = snapshot.val()
      if (labs){
        console.log('labs',labs)
        if (labs[myGameRefNum]){
          if (labs[myGameRefNum].labClosed === 'true'){
              console.log('lab is being deleted')
              this.deleteLab()
              this.setState({style_intro: false})
              this.setState({styleParticle: true})
          }else{
            console.log('labs[myGameRefNum]')
            console.log('myGameRefNum',myGameRefNum)
            myParticle = labs[myGameRefNum].particle
            if (myParticle === '-1'){
              iHaveMeasured = false
              myMeasurementResult = '-1'
            }
            if (labs[myGameRefNum].playerOne === 'Bob'){
              if (this.state.showIntroDialog === true){
                this.setState({showIntroDialog: false})
                //console.log('showIntroDialog',this.state.showIntroDialog)
              }
              scientistCount = '2'
            if (current_mode === 'Classic Game'){
              if (!listOfAnswers){
                current_status = 'Begin playing game'
                } 
                console.log('myName',myName)
                if (myName === 'Alice' && labs[myGameRefNum].aliceGameAnswers
                   && !labs[myGameRefNum].bobGameAnswers){
                        this.setState({displayGameInput:false})
                        this.setState({gameMessage:'Waiting for Bob to finish'})
                        this.setState({displayGameMessage:true})
                        console.log('this.state.displayGameMessageAlice',this.state.displayGameMessage)
                }
                if (myName === 'Bob' && labs[myGameRefNum].bobGameAnswers
                   && !labs[myGameRefNum].aliceGameAnswers){
                  console.log('this is true')
                        this.setState({displayGameInput:false});
                        this.setState({gameMessage:'Waiting for Alice to finish'});
                        this.setState({displayGameMessage:true});
                        //this.setState({styleAliceNameMarker: true});
                        console.log('this.state.displayGameMessageBob',this.state.displayGameMessage)
                }
              if (labs[myGameRefNum].aliceGameAnswers && labs[myGameRefNum].bobGameAnswers){
                  current_status = 'show the results'
                  displayResults = null
                  this.setState({displayGameInput:false})
                  const aliceAnswers = labs[myGameRefNum].aliceGameAnswers
                  const aliceQuestions = labs[myGameRefNum].aliceGameQuestions
                  const bobAnswers = labs[myGameRefNum].bobGameAnswers
                  const bobQuestions = labs[myGameRefNum].bobGameQuestions
                  var gridData = []
                  var i
                  for (i = 0; i < highestQuestionIndex; i++) { 
                      var currentResult = 'wrong'
                      if (aliceQuestions[i]*bobQuestions[i]===(aliceAnswers[i]+bobAnswers[i])%2){
                      currentResult = 'right'
                      rightCounter++
                    }
                        gridData.push({ aliceQ: aliceQuestions[i], 
                                        bobQ: bobQuestions[i], 
                                        aliceA: aliceAnswers[i], 
                                        bobA: bobAnswers[i],
                                        result: currentResult   })
                      }
                  // console.log('in this2')
                  // var gridData=[  {aliceA: 'Toyota'},
                  //           {aliceA: 'Ford'},
                  //           {aliceA: 'Porsche'}]
                  this.setState({resultsGridRowData: gridData}) 
                }
              }           
            }else{
              scientistCount = '1'
            }
          }
        }
      }
    })
  }

  joinOrCreateLab=()=>{
    var labIsFull = false
    myObj.transaction(function(currentValue){
      var currentLabsList = []
      var createNewLab = true
      if (currentValue) {
         currentLabsList = currentValue
         var lab
         for (lab in currentValue){
          if (currentValue[lab].name === myGameName){
            if (currentValue[lab].playerOne === 'Bob'){
            console.log("Lab is full")
            labIsFull = true
            }else{
            console.log("You Joined Lab:",myGameName)
            myNumber = 1
            currentValue[lab].playerOne = 'Bob'
            myName = 'Bob'
            createNewLab = false
            }
          }
        }
      }
      console.log('myGameName',this.myGameName)
        //console.log('myStateLab',this.state.myStateLab)
    if (createNewLab){
      var listObjList = { name: myGameName, 
                          playerZero: 'Alice',
                          playerOne: 'None',
                          particle: '-1',
                          labClosed: 'false',
                          aliceGameQuestions: [],
                          aliceGameAnswers: [],
                          bobGameQuestions: [],
                          bobGameAnswers: [],
                          aliceKnobAngle: 0,
                          bobKnobAngle: 0};
      myNumber = 0
      myName = 'Alice'
      currentLabsList.push(listObjList)
    }
      myGameRefNum = currentLabsList.length-1
      console.log("myGameRefNum", myGameRefNum)
      myObj.set(currentLabsList)
      console.log("Labs updated")
    })
    if (myName === 'Bob'){
                    this.setState({styleAliceNameMarker: true});
            this.setState({styleBobNameMarker: false});
      }
  }



//new experiment mode:
//  user has two entangled particles in two measurement devices
//  the measurement devices can be adjusted, 
//      showing a live update of % coorelation based on the angles
//  measurements can be made

//experiment mode: 
//  Elements
//    -measurement tools
//    -chatbox no delay
//    -beginGame button
//game mode:
//  Elements
//    -measurement tools
//    -chatbox with delay
//    -nextQuestion button
//    -question answer buttons
//measurement tools:
//    -createEntangledParticles
//    -buttons that check either of the two measurements
//    -readout that says measurement results, once both sets of entangled particles have been tested,
//        readout also gives %coorelation and shows them what would have happened if they had measured
//        exactly the same 10,000 times (instead of letting them choose a number of particles)
//TO THINK ABOUT:
//  -make the experiment section be set up so that either player has their own entangled pair
//    and they can slide the dials around with a live update on % coorelation so they can each see how
//    measuring differently effects things

//next:
//  make a restart button
//  things that can be clicked should be white
//  when 'show particle' is clicked it should add color to lots of stuff, like
//    the names of the players, the colors of the answer buttons, the knob colors as well
//  make it so when you create a game it tells you the waiting message in that dialog,
//    once the other player joins it, the dialog closes and the game begins. we will need
//    to put that in the 'component did mount' function
//  CHSH game label at top of screen
//  number of questions in lower dark area


//a checkbox that is 'automatically submit answer' determined from question result
  render() {
    const style_intro = this.state.style_intro ? {display: 'none'} : {};
    const styleParticle = this.state.styleParticle ? {display: 'none'} : {};
    const style_game_results = this.state.style_game_results ? {display: 'none'} : {};
    const styleAliceName = {color:'#404040',fontSize:'12px'};
    const styleBobName = {color:'#404040',fontSize:'12px'};
    const styleAliceNameMarker = this.state.styleAliceNameMarker ? 
      {display: 'none'} : {color:'#404040',fontSize:'12px'};
    const styleBobNameMarker = this.state.styleBobNameMarker ? 
      {display: 'none'} : {color:'#404040',fontSize:'12px'};
    const styleHelpContainerVisibility = this.state.styleHelpContainerVisibility ? 
      {display: 'none'} : {};
    const displayDialogButtons = this.state.displayDialogButtons ? {} : {display: 'none'} ;
    const displayGameInput = this.state.displayGameInput ? {} : {display: 'none'} ;
    const displayGameMessage = this.state.displayGameMessage ? 
      {fontFamily:'Consolas',color:'black'} : {display: 'none'} ;
    const MainContainer = {padding: "20px",
                            marginLeft: '-21px',
                            marginTop: '-21px',
                            marginRight: '-21px',
                            backgroundColor: '#bfbfbf',
                            maxWidth: 300}

    const HelpContainer ={padding: "20px",
                          marginLeft: '-21px',
                          marginTop: '-21px',
                          marginRight: '-21px',
                          backgroundColor: '#bfbfbf',
                          maxWidth: 300
  }
  const InfoBar={ padding: "10px",
                  paddingRight: '40px',
                   margin: "40px",
                   backgroundColor: "#8c8c8c",
                   maxWidth: 300}

  const styleInfoBarHelp={color:'white',
                          float:'right',
                          textAlign:'right',
                          fontSize:'32px',
                          marginRight: "-20px"}

  const styleInfoBarNewGame={fontSize:'12px',
                             marginLeft:'90px',
                             justifyContent: 'center',
                             alignItems: 'center'}

  const styleMainHeader={color:'#8c8c8c',
                          fontFamily:'Consolas',
                          fontSize:'50px',
                          fontWeight: "bold",
                          float:'top',
                          textAlign:'top'}
    return (
    <div>
      <Dialog open={this.state.showIntroDialog}
              onClose={this.handleClose}
              aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{this.state.dialogHeader}</DialogTitle>
        <DialogContent>
          <DialogContentText>{this.state.dialogText}</DialogContentText>
            <TextField
              style = {displayDialogButtons}
              autoFocus
              ref="myField"
              margin="dense"
              id="name"
              label="Game name:"
              onChange={this.handleIntroChange}
              fullWidth/>
        </DialogContent>
          <DialogActions>
            <Button style={displayDialogButtons} onClick={this.handleIntroSubmit} 
              color="primary">Create</Button>
            <Button style={displayDialogButtons} onClick={this.handleIntroSubmit} 
              color="primary">Join</Button>
          </DialogActions>
      </Dialog>
    <div style={InfoBar}>
      <div style={MainContainer}>
        <div className="App">
          <label style={styleMainHeader}>CHSH game</label><br></br>
          <label style={displayGameMessage}>{this.state.gameMessage}</label><br></br><br></br><br></br>
        <div style={displayGameInput}>        
          <label>Question: {this.state.listOfQuestions[currentQuestionIndex]}</label><br></br><br></br>
          <button onClick={()=>this.classicGameAnswer(0)}>first answer</button>
          <button onClick={()=>this.classicGameAnswer(1)}>second answer</button><br></br><br></br>
        </div>
          <div className="ag-theme-balham"
              style={{ height: '400px', width: '250px', display: displayResults }}>
              <AgGridReact
                  columnDefs={this.state.columnDefs}
                  rowData={this.state.resultsGridRowData}>
              </AgGridReact>
          </div>
        
          <Experiment 
            expStyle={styleParticle}
            particle={myParticle}
            measurement={myMeasurementResult}
            doMeasurement={this.doMeasurement}
            createEntanglement={this.createEntanglement}
            knobValue = {this.state.myKnobValue}
            aliceAKnobValue = {this.state.aliceAKnobValue}
            aliceBKnobValue = {this.state.aliceBKnobValue}
            bobAKnobValue = {this.state.bobAKnobValue}
            bobBKnobValue = {this.state.bobBKnobValue}
            onKnobChange = {this.handleKnobChange}
            knobCorrelation = {this.state.knobCorrelation}
          />
            <div>
              <label style={{color:'white',textAlign:'Left', fontSize:'14px', position: 'relative'}}
              onClick={this.showHideParticle}>{this.state.showHideParticleText}</label>
              <br></br>
            </div>
          </div>
        </div>
      <div>
        <label style={styleAliceName}>Alice</label><label style={styleAliceNameMarker}>*</label>
        <label style={styleInfoBarNewGame}>Question #: {currentQuestionIndex} / {highestQuestionIndex}</label>
        <label style={styleInfoBarHelp} onClick={this.showHideHelpBox}>?</label><br></br>       
        <label style={styleBobName}>Bob</label><label style={styleBobNameMarker}>*</label>
        <button style={styleInfoBarNewGame} onClick={this.startNewClassicGame}>Start new game</button>        
      </div>
        

      </div>
        <div style={styleHelpContainerVisibility}>
          <div style={HelpContainer}>
            <label>Game Name: {myGameName} ------My Name: {myName} ------Scientist count: {scientistCount}</label><br></br>   
            </div>
        </div>
      </div>
    );
  }
}



export default App;




//color status
//join/create
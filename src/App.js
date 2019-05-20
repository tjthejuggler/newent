import React, { Component } from 'react';
import './App.css';
import firebase from 'firebase' 
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css'; 
import GameTypeBox from './gameType.js'
import GameInputBox from './gameInputBox.js'
import IntroDialog from './introDialog.js'
import QuestionNumDialog from './questionNumDialog.js'
//import Knob from './modifiedKnob';//make this like experiment with the modified react-canvas-knob
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

//var myGameNameRef
var myParticle = '-1'
var myGameName = ''
var myGameRefNum = -1
var myNumber = -1
var myName = 'none'
const quantumColors = {
  primaryA: {Alice: 'red', Bob: 'blue'},
  secondaryA: {Alice: 'lightcoral', Bob: 'lightblue'},
  primaryB: {Alice: 'orange', Bob: 'green'},
  secondaryB: {Alice: 'lightsalmon', Bob: 'lightgreen'}
 }
var myMeasurementResult = -1
var iHaveMeasured = false
var scientistCount = 0
var myAutoClassicAnswers = ['0','0']
var numberOfQuestions = 0
var current_mode = 'intro'
var displayResults = 'none'
class App extends Component {
  constructor(){
    super();
    this.state = {
      knobCorrelation: 0,
      style_intro: false,
      displayAutoQuantum: false,
      displayAutoClassic: true,
      displayManual: false,
      displayAliceNameMarker: false,
      displayBobNameMarker:true,
      displayHelpContainerVisibility:false,
      showIntroDialog: true,
      showQuestionNumDialog: false,
      displayIntroDialogButtons: true,
      gameMessage: '',
      introDialogHeader: 'Create or Join',
      introDialogText: 'This game requires two players each with their own device.'+ 
                  'The first player creates a game, and the second joins.',
      questionNumDialogHeader: 'QuestionNumHeader',
      questionNumDialogText: 'QuestionNumText',
      selectedGameType: 'autoClassic',
      radioButtonsDisabled: false,
      beginButtonText: 'GO',
      myStateLab: '',
      listOfQuestions: [],
      //showHideParticleText: 'Show Particle',
      aliceAKnobValue: 360,
      aliceBKnobValue: 360,
      bobAKnobValue: 360,
      bobBKnobValue: 360,
      correlationReadout: 'A: 100,100B: 100,100',
      aliceAAngle: '0',
      aliceBAngle: '0',
      bobAAngle: '0',
      bobBAngle: '0',
      correctCounter: 0,
      columnDefs: [{headerName: 'AQ', field: 'aliceQ', width:45},
                    {headerName: 'BQ', field: 'bobQ', width:45},
                    {headerName: 'AA', field: 'aliceA', width:45},
                    {headerName: 'BA', field: 'bobA', width:45},
                    {headerName: 'Result', field: 'result', width:70}],
      resultsGridRowData: []
    };
    this.handleIntroSubmit = this.handleIntroSubmit.bind(this);
    this.handleIntroKeyPress = this.handleIntroKeyPress.bind(this);
    this.handleQuestionNumKeyPress = this.handleQuestionNumKeyPress.bind(this);    
    this.showHideHelpBox = this.showHideHelpBox.bind(this);
    this.handleQuestionNumSubmit = this.handleQuestionNumSubmit.bind(this);
    this.handleQuestionNumChange = this.handleQuestionNumChange.bind(this);
    this.restartClicked = this.restartClicked.bind(this);
    this.setShouldRestartDBVariable = this.setShouldRestartDBVariable.bind(this);
    this.manualGameAnswer = this.manualGameAnswer.bind(this);
    this.doMeasurement = this.doMeasurement.bind(this);
    this.handleIntroChange = this.handleIntroChange.bind(this);
    this.submitQuestionsAndAnswersToFirebase = this.submitQuestionsAndAnswersToFirebase.bind(this);
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

    handleQuestionNumChange(event, newValue) {
        numberOfQuestions = event.target.value
    }

  handleQuestionNumKeyPress(target) {
    if(target.charCode==13){  
      this.handleQuestionNumSubmit()  
    } 
  }

  handleQuestionNumSubmit(event, newValue){
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      updatedLabList[myGameRefNum].numberOfQuestions = numberOfQuestions
      myObj.set(updatedLabList)
    })
      this.startGame()
  }

  handleIntroKeyPress(target) {
    if(target.charCode==13){  
      this.handleIntroSubmit()  
    } 
  }

  handleIntroSubmit() {
    var shouldJoinGame = false
    var shouldCreateGame = false
    myObj.transaction(function(currentValue){
      var currentLabsList = []
      if (currentValue) {
         currentLabsList = currentValue
         var lab
         for (lab in currentLabsList){
            if (currentValue[lab].name === myGameName){
              if (currentValue[lab].playerOne === 'Bob'){
                alert('Game is full')
              }else{
                shouldJoinGame = true //turn this into 2 dif functions maybe     
              }
            }else{
              shouldCreateGame = true                
            }
         }
      }else{    
        shouldCreateGame = true
      }
    })
      if (shouldJoinGame){
          this.joinGame()
      }
      if (shouldCreateGame){
          this.createGame()
      } 
    }
    handleIntroChange(event, newValue) {
      myGameName = event.target.value
      event.persist(); 
      this.setState({myStateLab: event.target.value})
  }
  restartClicked(e) {
    this.setState({radioButtonsDisabled: false})
    if (this.state.selectedGameType === 'manual'){
      this.setState({displayManual: false})
    }
    this.setState({correctCounter:0})
    current_mode = 'Classic Game'
    displayResults = 'none'
    currentQuestionIndex = 0
    iHaveMeasured = false    
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      if (updatedLabList[myGameRefNum].playerOne === 'Bob'){
        updatedLabList[myGameRefNum].aliceGameQuestions = []
        updatedLabList[myGameRefNum].aliceGameAnswers = []
        updatedLabList[myGameRefNum].bobGameQuestions = []
        updatedLabList[myGameRefNum].bobGameAnswers = []
        updatedLabList[myGameRefNum].numberOfQuestions = 0
        updatedLabList[myGameRefNum].quantumUsedThisGame = 'false'
      }
      if (updatedLabList[myGameRefNum].shouldRestart == 'false'){
        updatedLabList[myGameRefNum].shouldRestart = 'true'
      }else{
        updatedLabList[myGameRefNum].shouldRestart = 'false'
      }
      myObj.set(updatedLabList)    
    })
  }

  setShouldRestartDBVariable(toSetTo){
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      updatedLabList[myGameRefNum].shouldRestart = toSetTo
      myObj.set(updatedLabList)
    })
  }

  showHideHelpBox(e) {
    if (this.state.displayHelpContainerVisibility){
      this.setState({displayHelpContainerVisibility: false})
    }else{
      this.setState({displayHelpContainerVisibility: true})
    }
  }

  gameTypeRadioButtonClicked(gameType){
    this.setState({selectedGameType:gameType})  
    if (gameType === 'manual'){
      this.setState({displayAutoQuantum:false})
      this.setState({displayAutoClassic:false})
      this.setState({beginButtonText:'BEGIN'})
    }else if(gameType === 'autoClassic'){
      this.setState({displayAutoQuantum:false})
      this.setState({displayAutoClassic:true})
      this.setState({beginButtonText:'GO'})
    }else if(gameType === 'autoQuantum'){
      this.setState({displayAutoQuantum:true})
      this.setState({displayAutoClassic:false})  
      this.setState({beginButtonText:'GO'})    
    }
  }
  beginButtonClicked(){
    this.setState({radioButtonsDisabled: true})
    if (numberOfQuestions == 0){
      this.setState({showQuestionNumDialog: true})
    }else{
      this.startGame()
    }
  }

  startGame(){
    this.setState({listOfQuestions : this.createListOfQuestions()}, function () {  
      this.setState({showQuestionNumDialog: false})
      if (this.state.selectedGameType === 'manual'){
        this.setState({displayManual: true})
      }else if(this.state.selectedGameType === 'autoClassic'){
        var i
        for (i=0; i<numberOfQuestions; i++){
          if (this.state.listOfQuestions[i] == '0'){
              listOfAnswers[i] = myAutoClassicAnswers['0']
          }else if (this.state.listOfQuestions[i] == '1'){
              listOfAnswers[i] = myAutoClassicAnswers['1']
          }
        }
        this.submitQuestionsAndAnswersToFirebase()
      }else if(this.state.selectedGameType === 'autoQuantum'){
        var i
        for (i=0; i<numberOfQuestions; i++){
          if (this.state.listOfQuestions[i] == '0'){
              listOfAnswers[i] = this.getQuantumAnswer('0',i)
          }else if (this.state.listOfQuestions[i] == '1'){
              listOfAnswers[i] = this.getQuantumAnswer('1',i)
          }
        }
        this.submitQuestionsAndAnswersToFirebase()
        
      }

    })
  }

  getQuantumAnswer(question,questionNumber){
    var answerToReturn = 0
    const aliceAKnobValue = this.state.aliceAKnobValue
    const aliceBKnobValue = this.state.aliceBKnobValue
    const bobAKnobValue = this.state.bobAKnobValue
    const bobBKnobValue = this.state.bobBKnobValue
    myObj.transaction(function(currentValue){
      var updatedValue = currentValue
          if (currentValue[myGameRefNum].quantumUsedThisGame == 'false' ||
              currentValue[myGameRefNum].quantumUsedThisGame == myName){
            updatedValue[myGameRefNum].quantumUsedThisGame = myName
            answerToReturn = (Math.floor(Math.random() * Math.floor(2)))
          }else{
            var myMeasurementAngle = 0
            var otherUserMeasurementAngle = 0
            var otherPlayersAnswer = 0
            if (myName === 'Alice'){
              if (question == '0'){
                myMeasurementAngle = aliceAKnobValue
              }else if (question == '1'){
                myMeasurementAngle = aliceBKnobValue
              }
              if (currentValue[myGameRefNum].bobGameQuestions[questionNumber] == '0'){
                otherUserMeasurementAngle = bobAKnobValue
              }else{
                otherUserMeasurementAngle = bobBKnobValue
              }
              otherPlayersAnswer = currentValue[myGameRefNum].bobGameAnswers[questionNumber]
            }else if (myName === 'Bob'){
              if (question == '0'){
                myMeasurementAngle = bobAKnobValue
              }else if (question == '1'){
                myMeasurementAngle = bobBKnobValue
              }
              if (currentValue[myGameRefNum].aliceGameQuestions[questionNumber] == '0'){
                otherUserMeasurementAngle = aliceAKnobValue
              }else{
                otherUserMeasurementAngle = aliceBKnobValue
              }
              otherPlayersAnswer = currentValue[myGameRefNum].aliceGameAnswers[questionNumber]
            }
            var aliceBobCorrelation = Math.abs(parseFloat(myMeasurementAngle)-parseFloat(otherUserMeasurementAngle))
            if (aliceBobCorrelation === 0){aliceBobCorrelation = 100}
            if (aliceBobCorrelation === 22.5){aliceBobCorrelation = 85.3}
            if (aliceBobCorrelation === 45){aliceBobCorrelation = 50}
            if (aliceBobCorrelation === 67.5){aliceBobCorrelation = 14.6}
            if (aliceBobCorrelation === 90){aliceBobCorrelation = 0}  
            var randomNum=Math.random()
            if(randomNum < aliceBobCorrelation/100) {answerToReturn = otherPlayersAnswer}
            else {answerToReturn = (otherPlayersAnswer+1)%2}
          } 
          myObj.set(updatedValue)       
    })  
    return answerToReturn
  }

  createListOfQuestions(){
    var i;
    var oneCount = 0
    var tempListOfQuestions = []    
    for (i = 0; i < numberOfQuestions; i++) { 
      tempListOfQuestions[i] = (Math.floor(Math.random() * Math.floor(2)))      
      if (tempListOfQuestions[i] === 1){oneCount = oneCount+1}
    }
    return tempListOfQuestions
  }

  autoClassicRadioButtonClicked(questionNum, answer){
    myAutoClassicAnswers[questionNum]=answer
  }

  manualGameAnswer(myAnswer){
    if (currentQuestionIndex < numberOfQuestions){
      this.setState({displayManual:true})
      listOfAnswers[currentQuestionIndex] = myAnswer
      currentQuestionIndex++
      if (currentQuestionIndex == numberOfQuestions){
        this.submitQuestionsAndAnswersToFirebase()
      }
    }
  }

  submitQuestionsAndAnswersToFirebase(){
    var listOfQuestions = this.state.listOfQuestions
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
          if (myNumber === 0){
            updatedLabList[myGameRefNum].aliceGameQuestions = listOfQuestions
            updatedLabList[myGameRefNum].aliceGameAnswers = listOfAnswers
          }else if (myNumber === 1){
            updatedLabList[myGameRefNum].bobGameQuestions = listOfQuestions
            updatedLabList[myGameRefNum].bobGameAnswers = listOfAnswers
          }
          myObj.set(updatedLabList)          
    })
  }

  onSliderChangeA (value)  {
    this.onSliderChange('A',value)
  }

  onSliderChangeB (value)  {
    this.onSliderChange('B',value)
  }
    onSliderChange (slider, value)  {
    var angle = '0'
    if (value == '10'){angle='360'}
    if (value == '30'){angle='337.5'}
    if (value == '50'){angle='315'}
    if (value == '70'){angle='292.5'}
    if (value == '90'){angle='270'}
    if (myName === 'Alice'){
      if (slider === 'A'){
          this.setState({aliceAKnobValue: angle}, function () {
              this.setCorrelationReadout()
              this.setState({aliceAAngle: 360-parseFloat(angle)})
          });
          myObj.transaction(function(currentValue){
              var updatedLabList = currentValue
              updatedLabList[myGameRefNum].aliceAKnobValue = angle;
              myObj.set(updatedLabList)
          })
      }else if (slider === 'B'){
          this.setState({aliceBKnobValue: angle}, function () {
              this.setCorrelationReadout()
              this.setState({aliceBAngle: 360-parseFloat(angle)})
          });
          myObj.transaction(function(currentValue){
              var updatedLabList = currentValue
              updatedLabList[myGameRefNum].aliceBKnobValue = angle;
              myObj.set(updatedLabList)
          })
      }
    }else if (myName === 'Bob'){
        if (slider === 'A'){
          this.setState({bobAKnobValue: angle}, function () {
                this.setCorrelationReadout()
                this.setState({bobAAngle: 360-parseFloat(angle)})
            });
          myObj.transaction(function(currentValue){
            var updatedLabList = currentValue
            updatedLabList[myGameRefNum].bobAKnobValue = angle;
            myObj.set(updatedLabList)
          })
        }else if (slider === 'B'){
          this.setState({bobBKnobValue: angle}, function () {
                this.setCorrelationReadout()
                this.setState({bobBAngle: 360-parseFloat(angle)})
            });
          myObj.transaction(function(currentValue){
              var updatedLabList = currentValue
              updatedLabList[myGameRefNum].bobBKnobValue = angle;
              myObj.set(updatedLabList)
          })
       }
    }
  } 
    setCorrelationReadout(){
      var aliceBobCorrelation = []
      aliceBobCorrelation[0]=Math.abs(parseFloat(this.state.aliceAKnobValue)-parseFloat(this.state.bobAKnobValue ))
      aliceBobCorrelation[1] =Math.abs(parseFloat(this.state.aliceAKnobValue)-parseFloat(this.state.bobBKnobValue ))
      aliceBobCorrelation[2] =Math.abs(parseFloat(this.state.aliceBKnobValue)-parseFloat(this.state.bobAKnobValue ))
      aliceBobCorrelation[3] =Math.abs(parseFloat(this.state.aliceBKnobValue)-parseFloat(this.state.bobBKnobValue ))
      var i
      for (i = 0; i < 4; i++) { 
        if (aliceBobCorrelation[i] === 0){aliceBobCorrelation[i] = 100}
        if (aliceBobCorrelation[i] === 22.5){aliceBobCorrelation[i] = 85.3}
        if (aliceBobCorrelation[i] === 45){aliceBobCorrelation[i] = 50}
        if (aliceBobCorrelation[i] === 67.5){aliceBobCorrelation[i] = 14.6}
        if (aliceBobCorrelation[i] === 90){aliceBobCorrelation[i] = 0}  
      }
      if (myName === 'Alice'){
        this.setState({correlationReadout: 'A: ' + aliceBobCorrelation[0] +','+ aliceBobCorrelation[1] +
          'B: ' + aliceBobCorrelation[2] +','+ aliceBobCorrelation[3]})

      }else{
        this.setState({correlationReadout: 'A: ' + aliceBobCorrelation[0] +','+ aliceBobCorrelation[2] +
          'B: ' + aliceBobCorrelation[1] +','+ aliceBobCorrelation[3]})
      }
    }

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
              if(randomNum < 0.8536) {myMeasurementResult = particleStateNumber.charAt(0)}
              else {myMeasurementResult = (particleStateNumber.charAt(0)+1)%2}
        }else if(do_cos_squared_3_pi_over_8_measurement){
              if(randomNum < 0.1464) {myMeasurementResult = particleStateNumber.charAt(0)}
              else {myMeasurementResult = (particleStateNumber.charAt(0)+1)%2}
        }
      updatedLabList[myGameRefNum].particle = particleStateNumber
      myParticle = particleStateNumber
      myObj.set(updatedLabList)
      }
    })
    this.setState({displayAutoQuantum: false})
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
        if (labs[myGameRefNum]){
          if (labs[myGameRefNum].labClosed === 'true'){
              this.deleteLab()
              this.setState({style_intro: false})
          }else{
              if (labs[myGameRefNum].shouldRestart == 'true'){
                this.restartClicked()
              }
              if (myName === 'Alice'){
              this.setState({bobAKnobValue: labs[myGameRefNum].bobAKnobValue})
              this.setState({bobBKnobValue: labs[myGameRefNum].bobBKnobValue})
              this.setState({bobAAngle: 360-labs[myGameRefNum].bobAKnobValue})
              this.setState({bobBAngle: 360-labs[myGameRefNum].bobBKnobValue})
              this.setCorrelationReadout()
            }else if (myName === 'Bob'){
              this.setState({aliceAKnobValue: labs[myGameRefNum].aliceAKnobValue})
              this.setState({aliceBKnobValue: labs[myGameRefNum].aliceBKnobValue})
              this.setState({aliceAAngle: 360-labs[myGameRefNum].aliceAKnobValue})
              this.setState({aliceBAngle: 360-labs[myGameRefNum].aliceBKnobValue})
              this.setCorrelationReadout()
            }            
            numberOfQuestions = labs[myGameRefNum].numberOfQuestions         
            myParticle = labs[myGameRefNum].particle
            if (myParticle === '-1'){
              iHaveMeasured = false
              myMeasurementResult = '-1'
            }
            if (labs[myGameRefNum].playerOne === 'Bob'){
              if (this.state.showIntroDialog === true){
                this.setState({showIntroDialog: false})
              }
              scientistCount = '2'
            if (current_mode === 'Classic Game'){
                if (myName === 'Alice' && labs[myGameRefNum].aliceGameAnswers
                   && !labs[myGameRefNum].bobGameAnswers){
                        this.setState({displayManual:false})
                }
                if (myName === 'Bob' && labs[myGameRefNum].bobGameAnswers
                   && !labs[myGameRefNum].aliceGameAnswers){
                        this.setState({displayManual:false});
                }
              if (labs[myGameRefNum].aliceGameAnswers && labs[myGameRefNum].bobGameAnswers){
                  displayResults = null
                  this.setState({displayManual:false})
                  const aliceAnswers = labs[myGameRefNum].aliceGameAnswers
                  const aliceQuestions = labs[myGameRefNum].aliceGameQuestions
                  const bobAnswers = labs[myGameRefNum].bobGameAnswers
                  const bobQuestions = labs[myGameRefNum].bobGameQuestions
                  var gridData = []
                  var i
                  var correctCounter = 0
                  for (i = 0; i < numberOfQuestions; i++) { 
                      var currentResult = 'wrong'
                      if (parseInt(aliceQuestions[i])*parseInt(bobQuestions[i])===
                          (parseInt(aliceAnswers[i])+parseInt(bobAnswers[i]))%2){
                      currentResult = 'right'
                      correctCounter++
                    }
                        gridData.push({ aliceQ: aliceQuestions[i], 
                                        bobQ: bobQuestions[i], 
                                        aliceA: aliceAnswers[i], 
                                        bobA: bobAnswers[i],
                                        result: currentResult   })
                      }
                  console.log('correctCounter',correctCounter)
                  this.setState({correctCounter:correctCounter})
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

  createGame=()=>{
    myObj.transaction(function(currentValue){
      var currentLabsList = []
      var listObjList = { name: myGameName, 
                          playerZero: 'Alice',
                          playerOne: 'None',
                          particle: '-1',
                          labClosed: 'false',
                          shouldRestart: 'false',
                          quantumUsedThisGame: 'false',
                          aliceGameQuestions: [],
                          aliceGameAnswers: [],
                          bobGameQuestions: [],
                          bobGameAnswers: [],
                          aliceAKnobValue: 360,
                          aliceBKnobValue: 360,
                          bobAKnobValue: 360,
                          bobBKnobValue: 360,
                          numberOfQuestions: 0};
      myNumber = 0
      myName = 'Alice'

      currentLabsList.push(listObjList)      
      myObj.set(currentLabsList)
      myGameRefNum = currentLabsList.length-1
    })

      this.restartClicked()
      this.setState({introDialogText: '..for the other player to join.'})//this
      this.setState({introDialogHeader: 'Waiting..'})      
      this.setState({displayIntroDialogButtons: false})
     

  }

  joinGame=()=>{
    myObj.transaction(function(currentValue){
      var currentLabsList = []
         currentLabsList = currentValue
         var lab
         for (lab in currentValue){
          if (currentValue[lab].name === myGameName){
            myNumber = 1
            currentValue[lab].playerOne = 'Bob'
            myName = 'Bob'        
          }
        }      
      myObj.set(currentLabsList)
      myGameRefNum = currentLabsList.length-1
    })
      this.restartClicked()
      this.setState({showIntroDialog: false})
      this.setState({displayAliceNameMarker: true});
      this.setState({displayBobNameMarker: false});
  }  

  render() { 
    return (  
      <div>
        <IntroDialog  
            showIntroDialog = {this.state.showIntroDialog}
            introDialogHeader = {this.state.introDialogHeader}
            introDialogText = {this.state.introDialogText}
            displayIntroDialogButtons = {this.state.displayIntroDialogButtons}
            handleIntroChange = {(e,f)=>this.handleIntroChange(e,f)}
            handleIntroKeyPress = {(e)=>this.handleIntroKeyPress(e)}
            handleIntroSubmit = {()=>this.handleIntroSubmit()}
        />
        <QuestionNumDialog  
            showQuestionNumDialog = {this.state.showQuestionNumDialog}
            questionNumDialogHeader = {this.state.questionNumDialogHeader}
            questionNumDialogText = {this.state.questionNumDialogText}
            handleQuestionNumChange = {(e,f)=>this.handleQuestionNumChange(e,f)}
            handleQuestionNumKeyPress = {(e)=>this.handleQuestionNumKeyPress(e)}
            handleQuestionNumSubmit = {()=>this.handleQuestionNumSubmit()}
        />
        {this.state.displayHelpContainerVisibility?
          <div className='HelpContainer'>
            <label>This will be the help section I am ranting to see how the text wrap situation works
            if i just keep tpfjd hdiufh udhfsiuahf uisdufh uhsd fuihiusdhfu o uhfu haih usdhf iuh h sdiufuh ah</label>
            <br></br><br></br>
          </div>
        : ''}
        <div className='InfoBar'>
          <div className='MainContainer'>
            <div className='App'>
              <label className='styleMainHeader'>CHSH</label>
              <br></br><br></br>
              <div className = 'gameTypeHeader'>
                Answer input method:
              </div>
              <GameTypeBox
                radioButtonsDisabled = {this.state.radioButtonsDisabled}
                gameTypeRadioButtonClicked = {(e)=>this.gameTypeRadioButtonClicked(e)}
                beginButtonText = {this.state.beginButtonText}
                beginButtonClicked = {()=>this.beginButtonClicked()}
              />
              <br></br><br></br><br></br>
              <div className = 'gameTypeHeader'>
                {this.state.selectedGameType == 'autoClassic' ? 'Auto (classic)' : ''}
                {this.state.selectedGameType == 'autoQuantum' ? 'Auto (quantum)' : ''}
                {this.state.selectedGameType == 'manual' ? 'Manual' : ''}
              </div>
              <GameInputBox 
                displayManual = {this.state.displayManual}
                currentQuestion = {this.state.listOfQuestions[currentQuestionIndex]}
                manualGameAnswer = {(e)=>this.manualGameAnswer(e)}
                currentQuestionIndex = {currentQuestionIndex} 
                numberOfQuestions = {numberOfQuestions}
                displayAutoClassic = {this.state.displayAutoClassic}
                radioButtonsDisabled = {this.state.radioButtonsDisabled}
                autoClassicRadioButtonClicked = {(e,f)=>this.autoClassicRadioButtonClicked(e,f)}
                displayResults = {displayResults}
                correctCounter = {this.state.correctCounter}
                columnDefs = {this.state.columnDefs}
                resultsGridRowData = {this.state.resultsGridRowData}
                dispAutoQuantum = {this.state.displayAutoQuantum}
                particle={myParticle}
                measurement={myMeasurementResult}
                doMeasurement={this.doMeasurement}
                aliceAKnobValue = {this.state.aliceAKnobValue}
                aliceBKnobValue = {this.state.aliceBKnobValue}
                bobAKnobValue = {this.state.bobAKnobValue}
                bobBKnobValue = {this.state.bobBKnobValue}
                knobCorrelation = {this.state.knobCorrelation}
                colorPrimaryA = {quantumColors.primaryA[myName]}
                colorSecondaryA = {quantumColors.secondaryA[myName]}
                colorPrimaryB = {quantumColors.primaryB[myName]}
                colorSecondaryB = {quantumColors.secondaryB[myName]}
                onSliderChangeA = {(e)=>this.onSliderChangeA(e)}
                onSliderChangeB = {(e)=>this.onSliderChangeB(e)}
                correlationReadout = {this.state.correlationReadout}
                aliceAAngle = {this.state.aliceAAngle}
                aliceBAngle = {this.state.aliceBAngle}
                bobAAngle = {this.state.bobAAngle}
                bobBAngle = {this.state.bobBAngle}
              />
            </div>
          </div>
          <div>
            <label className = 
              {this.state.displayHelpContainerVisibility ? 'styleInfoBarHelpWithHelpShown':'styleInfoBarHelp'} 
              onClick={this.showHideHelpBox}>?</label><br></br>
            <label className =
            {this.state.displayHelpContainerVisibility ? 'styleInfoBarRestartWithHelpShown':'styleInfoBarRestart'} 
            onClick={this.restartClicked}>⟲</label><br></br>
            <label className =
            {this.state.displayHelpContainerVisibility ? 'styleAliceNameWithHelpShown':'styleAliceName'}>Alice</label>
            {this.state.displayAliceNameMarker ? <label className =
            {this.state.displayHelpContainerVisibility ? 'styleAliceNameMarkerWithHelpShown':'styleAliceNameMarker'}>
            *</label> : ''}     
            <label className =
            {this.state.displayHelpContainerVisibility ? 'styleBobNameWithHelpShown':'styleBobName'}>Bob</label>
            {this.state.displayBobNameMarker ? <label className =
            {this.state.displayHelpContainerVisibility ? 'styleBobNameMarkerWithHelpShown':'styleBobNameMarker'}>
            *</label> : ''}
            <div className='styleGameNameWrapper'/>
            <span>
              <label className='styleGameName'>Game name: {myGameName}</label>
            </span>
          </div>
        </div>

       
      </div>
    );
  }
}

export default App;




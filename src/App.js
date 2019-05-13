import React, { Component } from 'react';
import './App.css';
import firebase from 'firebase' 
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import QuantumAuto from './quantumAuto.js'
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
var myColorPrimaryA = ''
var myColorSecondaryA = ''
var myColorPrimaryB = ''
var myColorSecondaryB = ''
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
      styleAliceNameMarker: false,
      styleBobNameMarker:true,
      styleHelpContainerVisibility:true,
      showIntroDialog: true,
      showQuestionNumDialog: false,
      displayIntroDialogButtons: true,
      gameMessage: '',
      displayGameMessage: false,
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
    this.createEntanglement = this.createEntanglement.bind(this);
    //this.showHideParticle = this.showHideParticle.bind(this);
    this.doMeasurement = this.doMeasurement.bind(this);
    //this.getQuantumAnswer = this.getQuantumAnswer.bind(this);
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
        console.log('handleQuestionNumChange', event.target.value)
        numberOfQuestions = event.target.value
    }

  handleQuestionNumKeyPress(target) {
    if(target.charCode==13){  
      this.handleQuestionNumSubmit()  
    } 
  }

  handleQuestionNumSubmit(event, newValue){
    //console.log('QuestionNumSubmitted', event.target.value)
    myObj.transaction(function(currentValue){
      //console.log('currentValue',currentValue)
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
    console.log('handleIntroSubmit')
    //e.preventDefault();
    var shouldJoinOrCreate = false
    myObj.transaction(function(currentValue){
      console.log('currentValue',currentValue)
      var currentLabsList = []
      if (currentValue) {
        console.log('currentValue2',currentValue)
         currentLabsList = currentValue
         var lab
         for (lab in currentLabsList){
            if (currentValue[lab].name === myGameName){
              console.log('currentValue[lab].name === myGameName')
              if (currentValue[lab].playerOne === 'Bob'){
                console.log('Lab is full, currentValue[lab].playerOne === Bob')
                alert('Game is full')
              }else{
                shouldJoinOrCreate = true //turn this into 2 dif functions maybe     
              }
          }else{
            shouldJoinOrCreate = true                
          }
        }
      }else{    
        shouldJoinOrCreate = true
      }
    }
    
    )
      if (shouldJoinOrCreate){
        this.joinOrCreateLab()
      } 
    }
   

      handleIntroChange(event, newValue) {
        console.log('handleIntroChange', event.target.value)
        myGameName = event.target.value
        event.persist(); 
        this.setState({myStateLab: event.target.value})
    }



  restartClicked(e) {
    this.setState({radioButtonsDisabled: false})
    if (this.state.selectedGameType === 'manual'){
      this.setState({displayManual: false})
    }
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
    console.log('showHideHelpBox')
    if (this.state.styleHelpContainerVisibility){
      this.setState({styleHelpContainerVisibility: false})
    }else{
      this.setState({styleHelpContainerVisibility: true})
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
    this.setState({displayAutoQuantum: false})
  }

  gameTypeRadioButtonClicked(gameType){
    console.log('gameType',gameType)
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

    console.log('gameBegan', numberOfQuestions)
    this.setState({radioButtonsDisabled: true})
    if (numberOfQuestions == 0){
      this.setState({showQuestionNumDialog: true})
    }else{
      this.startGame()
    }
  }

  startGame(){
    console.log('startgame')
    console.log('listOfQuestionsPRE',this.state.listOfQuestions)
    this.setState({listOfQuestions : this.createListOfQuestions()}, function () {  
      console.log('listOfQuestionsPOST',this.state.listOfQuestions)
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
    console.log('numberOfQuestions',numberOfQuestions)
    for (i = 0; i < numberOfQuestions; i++) { 
      tempListOfQuestions[i] = (Math.floor(Math.random() * Math.floor(2)))      
      if (tempListOfQuestions[i] === 1){oneCount = oneCount+1}
    }
    return tempListOfQuestions
  }

  autoClassicRadioButtonClicked(questionNum, answer){
    console.log('questionNum',questionNum)    
    myAutoClassicAnswers[questionNum]=answer
    console.log('myAutoClassicAnswers[questionNum]',myAutoClassicAnswers[questionNum])
  }

  manualGameAnswer(myAnswer){
    console.log('myAnswer',myAnswer)
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
    console.log('submitQuestionsAndAnswersToFirebase')
    var listOfQuestions = this.state.listOfQuestions
    console.log('listOfAnswers',listOfAnswers)
    console.log('listOfQuestions',listOfQuestions)
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

  onSliderChangeB (value)  {
    console.log('sliderChangeB',value)
    var angle = '0'
    if (value == '10'){angle='360'}
    if (value == '30'){angle='337.5'}
    if (value == '50'){angle='315'}
    if (value == '70'){angle='292.5'}
    if (value == '90'){angle='270'}

    if (myName === 'Alice'){
      this.setState({aliceBKnobValue: angle}, function () {
            this.setCorrelationReadout()
            this.setState({aliceBAngle: 360-parseFloat(angle)})
        });
      myObj.transaction(function(currentValue){
        var updatedLabList = currentValue
        updatedLabList[myGameRefNum].aliceBKnobValue = angle;
        myObj.set(updatedLabList)
      })
    }else{
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
    onSliderChangeA (value)  {
    console.log('sliderChangeA',value)
    var angle = '0'
    if (value == '10'){angle='360'}
    if (value == '30'){angle='337.5'}
    if (value == '50'){angle='315'}
    if (value == '70'){angle='292.5'}
    if (value == '90'){angle='270'}

    if (myName === 'Alice'){
      this.setState({aliceAKnobValue: angle}, function () {
            this.setCorrelationReadout()
            this.setState({aliceAAngle: 360-parseFloat(angle)})
        });
      myObj.transaction(function(currentValue){
        var updatedLabList = currentValue
        updatedLabList[myGameRefNum].aliceAKnobValue = angle;
        myObj.set(updatedLabList)
      })
    }else{
      this.setState({bobAKnobValue: angle}, function () {
            this.setCorrelationReadout()
            this.setState({bobAAngle: 360-parseFloat(angle)})
        });
      myObj.transaction(function(currentValue){
        var updatedLabList = currentValue
        updatedLabList[myGameRefNum].bobAKnobValue = angle;
        myObj.set(updatedLabList)
      })
    }
  } 
    setCorrelationReadout(){
      console.log('this.state.aliceAKnobValue',this.state.aliceAKnobValue)
      console.log('this.state.aliceBKnobValue',this.state.aliceBKnobValue)
      console.log('this.state.bobAKnobValue',this.state.bobAKnobValue)
      console.log('this.state.bobBKnobValue',this.state.bobBKnobValue)    
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
        console.log('labs',labs)
        if (labs[myGameRefNum]){
          if (labs[myGameRefNum].labClosed === 'true'){
              console.log('lab is being deleted')
              this.deleteLab()
              this.setState({style_intro: false})
              //this.setState({displayAutoQuantum: true})
          }else{
              if (labs[myGameRefNum].shouldRestart == 'true'){
                this.restartClicked()
                //this.setShouldRestartDBVariable('false')
              }
              if (myName === 'Alice'){
              this.setState({bobAKnobValue: labs[myGameRefNum].bobAKnobValue})
              this.setState({bobBKnobValue: labs[myGameRefNum].bobBKnobValue})
              this.setState({bobAAngle: 360-labs[myGameRefNum].bobAKnobValue})
              this.setState({bobBAngle: 360-labs[myGameRefNum].bobBKnobValue})
              this.setCorrelationReadout()
              //this.forceUpdate()
            }else if (myName === 'Bob'){
              this.setState({aliceAKnobValue: labs[myGameRefNum].aliceAKnobValue})
              this.setState({aliceBKnobValue: labs[myGameRefNum].aliceBKnobValue})
              this.setState({aliceAAngle: 360-labs[myGameRefNum].aliceAKnobValue})
              this.setState({aliceBAngle: 360-labs[myGameRefNum].aliceBKnobValue})
              //console.log('this.state.aliceBKnobValue!!!!',this.state.aliceBKnobValue)
              this.setCorrelationReadout()
              //this.forceUpdate()
            }
            
            numberOfQuestions = labs[myGameRefNum].numberOfQuestions
            
            
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
              }
              scientistCount = '2'
            if (current_mode === 'Classic Game'){
                console.log('myName',myName)
                if (myName === 'Alice' && labs[myGameRefNum].aliceGameAnswers
                   && !labs[myGameRefNum].bobGameAnswers){
                        this.setState({displayManual:false})
                        this.setState({gameMessage:'Waiting for Bob to finish'})
                        this.setState({displayGameMessage:true})
                        console.log('this.state.displayGameMessageAlice',this.state.displayGameMessage)
                }
                if (myName === 'Bob' && labs[myGameRefNum].bobGameAnswers
                   && !labs[myGameRefNum].aliceGameAnswers){
                  console.log('this is true')
                        this.setState({displayManual:false});
                        this.setState({gameMessage:'Waiting for Alice to finish'});
                        this.setState({displayGameMessage:true});
                        //this.setState({styleAliceNameMarker: true});
                        console.log('this.state.displayGameMessageBob',this.state.displayGameMessage)
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
                        console.log('currentResult',currentResult)
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
    myObj.transaction(function(currentValue){
      var currentLabsList = []
      var createNewLab = true
      if (currentValue) {
         currentLabsList = currentValue
         var lab
         for (lab in currentValue){
          if (currentValue[lab].name === myGameName){
            console.log("currentValue[lab].name === myGameName")
            console.log("You Joined Lab:",myGameName)
            myNumber = 1
            currentValue[lab].playerOne = 'Bob'
            myName = 'Bob'
            myColorPrimaryA = 'blue'
            myColorSecondaryA = 'lightblue'
            myColorPrimaryB = 'green'
            myColorSecondaryB = 'lightgreen'
            createNewLab = false            
          }
        }
      }
      console.log('myGameName',myGameName)
        //console.log('myStateLab',this.state.myStateLab)
    if (createNewLab){
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
      myColorPrimaryA = 'red'
      myColorSecondaryA = 'lightcoral'
      myColorPrimaryB = 'orange'
      myColorSecondaryB = 'lightsalmon'
      currentLabsList.push(listObjList)
    }
        myObj.set(currentLabsList)
          myGameRefNum = currentLabsList.length-1
      })        
      console.log("myGameRefNum", myGameRefNum)
      console.log("this.state.myStateLab",this.state.myStateLab)
      myGameName = this.state.myStateLab
      this.restartClicked()
      if (myName === 'Bob'){
        this.setState({showIntroDialog: false})
      }else{
        this.setState({introDialogText: '..for the other player to join.'})//this
        this.setState({introDialogHeader: 'Waiting..'})      
        this.setState({displayIntroDialogButtons: false})
      }       
    if (myName === 'Bob'){
            this.setState({styleAliceNameMarker: true});
            this.setState({styleBobNameMarker: false});
      }
  }

  render() { 
    const displayAutoQuantum = this.state.displayAutoQuantum ? {} : {display: 'none'};
    const displayAutoClassic = this.state.displayAutoClassic ? {} : {display: 'none'};
    const displayManual = this.state.displayManual ? {} : {display: 'none'} ;
    const styleAliceNameMarker = this.state.styleAliceNameMarker ? 
      {display: 'none'} : {color:'#404040',
                          fontSize:'12px',
                          position: 'fixed',
                           top: 140, left: 325};
    const styleBobNameMarker = this.state.styleBobNameMarker ? 
      {display: 'none'} : {color:'#404040',
                            fontSize:'12px',
                            position: 'fixed', 
                            top: 160, 
                            left: 325};
    const styleHelpContainerVisibility = this.state.styleHelpContainerVisibility ? 
      {display: 'none'} : {};
    const displayIntroDialogButtons = this.state.displayIntroDialogButtons ? 
    {} : {display: 'none'} ;
    const displayGameMessage = this.state.displayGameMessage ? 
      {fontFamily:'Consolas',color:'black'} : {display: 'none'} ;

    return (  
    <div>
      <IntroDialog  
          showIntroDialog = {this.state.showIntroDialog}
          introDialogHeader = {this.state.introDialogHeader}
          introDialogText = {this.state.introDialogText}
          displayIntroDialogButtons = {displayIntroDialogButtons}
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
    <div className='InfoBar'>
      <div className='MainContainer'>
        <div className='App'>
          <label className='styleMainHeader'>CHSH</label><br></br><br></br>
          <div className='gameTypeStyle'>
            <div className='gameTypeRadioButtonStyle'>
              <input type="radio" 
                    value="autoClassic" 
                    name="gameType"
                    defaultChecked                
                    disabled={this.state.radioButtonsDisabled}
                    onClick={()=>this.gameTypeRadioButtonClicked('autoClassic')}/> Auto (Classic) 
                    <br></br>
              <input type="radio" 
                    value="autoQuantum" 
                    name="gameType"
                    disabled={this.state.radioButtonsDisabled}
                    onClick={()=>this.gameTypeRadioButtonClicked('autoQuantum')}/> Auto (Quantum) 
                    <br></br>
            <input type="radio" 
                    value="manual" 
                    name="gameType"
                    disabled={this.state.radioButtonsDisabled}
                    onClick={()=>this.gameTypeRadioButtonClicked('manual')}/> Manual 
                    <br></br>
              
            </div>
          
          <button className='styleBeginButton'
                  onClick={()=>this.beginButtonClicked()}>{this.state.beginButtonText}</button>
          </div>
          <br></br><br></br><br></br>
        <div style={displayManual}>  
          <div className='styleSelectedGameType'>
            <br></br>       
            <label>Question: {this.state.listOfQuestions[currentQuestionIndex]}</label><br></br>
            <label className='styleInfoBarNewGame'>Question #: {currentQuestionIndex} / {numberOfQuestions}</label><br></br>          
            <button onClick={()=>this.manualGameAnswer(0)}>first answer</button>
            <button onClick={()=>this.manualGameAnswer(1)}>second answer</button><br></br><br></br>
          </div>
        </div>
        <div style={displayAutoClassic}>  
          <div className='styleSelectedGameType'>
            <br></br> 
              <label>Always answer Q0 with:</label><br></br>                     
              <div className='autoClassicQuestionRadioButtonStyle'>
                <input type="radio" 
                      value="0" 
                      name="question0"
                      defaultChecked                
                      disabled={this.state.radioButtonsDisabled}
                      onClick={()=>this.autoClassicRadioButtonClicked('0','0')}/> 0 
                <input type="radio" 
                      value="1" 
                      name="question0"
                      disabled={this.state.radioButtonsDisabled}
                      onClick={()=>this.autoClassicRadioButtonClicked('0','1')}/> 1            
              </div>
              <br></br>
              <label>Always answer Q1 with:</label><br></br>                     
              <div className='autoClassicQuestionRadioButtonStyle'>
                <input type="radio" 
                      value="0"
                      name="question1"
                      defaultChecked                
                      disabled={this.state.radioButtonsDisabled}
                      onClick={()=>this.autoClassicRadioButtonClicked('1','0')}/> 0
                <input type="radio" 
                      value="1" 
                      name="question1"
                      disabled={this.state.radioButtonsDisabled}
                      onClick={()=>this.autoClassicRadioButtonClicked('1','1')}/> 1             
              </div>
              <br></br> 
          </div>
        </div>
          <div className="ag-theme-balham"
              style={{ height: '400px', width: '250px', display: displayResults }}>
              <AgGridReact
                  columnDefs={this.state.columnDefs}
                  rowData={this.state.resultsGridRowData}>
              </AgGridReact>
          </div>


        <div className='styleSelectedGameType'>

          <QuantumAuto 
            expStyle={displayAutoQuantum}
            particle={myParticle}
            measurement={myMeasurementResult}
            doMeasurement={this.doMeasurement}
            createEntanglement={this.createEntanglement}
            aliceAKnobValue = {this.state.aliceAKnobValue}
            aliceBKnobValue = {this.state.aliceBKnobValue}
            bobAKnobValue = {this.state.bobAKnobValue}
            bobBKnobValue = {this.state.bobBKnobValue}
            knobCorrelation = {this.state.knobCorrelation}
            colorPrimaryA = {myColorPrimaryA}
            colorSecondaryA = {myColorSecondaryA}
            colorPrimaryB = {myColorPrimaryB}
            colorSecondaryB = {myColorSecondaryB}
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

              </div>
            <div>
              <label className='styleInfoBarHelp' onClick={this.showHideHelpBox}>?</label><br></br>
              <label className='styleInfoBarRestart' onClick={this.restartClicked}>⟲</label><br></br>
              <label className='styleAliceName'>Alice</label><label style={styleAliceNameMarker}>*</label>       
              <label className='styleBobName'>Bob</label><label style={styleBobNameMarker}>*</label>
              <label className='styleGameName'>{myGameName}</label>
            </div>
            
          </div>

        <div style = {styleHelpContainerVisibility}>
          <div className='HelpContainer'>
            <label>Game Name: {myGameName} ------My Name: {myName} ------Scientist count: {scientistCount}</label><br></br>   
          </div>
        </div>
      </div>
    );
  }
}



export default App;




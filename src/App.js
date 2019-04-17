import React, { Component } from 'react';
//import Tooltip from 'react-bootstrap';
import logo from './logo.svg';
import './App.css';
import firebase from 'firebase' 

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
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
var listOfQuestions = []
var listOfAnswers = []
var currentQuestionIndex = 0 //this can be either X or O

var myLabRef
var myParticle = '-1'
var myLab = 'none'
var myLabRefNum = -1
var myNumber = -1
var myName = 'none'
var myMeasurementResult = -1
var iHaveMeasured = false
var scientistCount = 0

var current_mode = 'intro'
var current_status = 'welcome'

class App extends Component {
  constructor(){
    super();
    this.state = {
      style_intro: false,
      style_experiment: true,
      style_classic_game: true,
      style_quantum_game: true,
      style_navigation_bar: true,
      columnDefs: [
                {headerName: 'Alice Q', field: 'aliceQ', width:75},
                {headerName: 'Bob Q', field: 'bobQ', width:75},
                {headerName: 'Alice A', field: 'aliceA', width:75},
                {headerName: 'Bob A', field: 'bobA', width:75},
                {headerName: 'Result', field: 'result', width:75}
                //{headerName: 'Price2', field: 'price2'}

            ],
            resultsGridRowData: []
    };
    this.handleIntroSubmit = this.handleIntroSubmit.bind(this);
    this.showClassicGame = this.showClassicGame.bind(this);
    this.startNewClassicGame = this.startNewClassicGame.bind(this);
    this.classicGameAnswer = this.classicGameAnswer.bind(this);
    this.showQuantumGame = this.showQuantumGame.bind(this);
    this.createEntanglement = this.createEntanglement.bind(this);
    this.showExperiment = this.showExperiment.bind(this);
    this.doMeasurement = this.doMeasurement.bind(this);
  }
    doSomethingBeforeUnload = () => {
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      updatedLabList[myLabRefNum].labClosed = 'true'
      myObj.set(updatedLabList)
    })
}

    setupBeforeUnloadListener = () => {
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            this.doSomethingBeforeUnload();
        });
    };

  handleIntroSubmit(e) {
    myLab = this.input.value
    e.preventDefault();
    this.joinOrCreateLab()
    this.startNewClassicGame()
  }



  startNewClassicGame(e) {
    current_mode = 'Classic Game'
    currentQuestionIndex = 0
    var i;
    var oneCount = 0
    var showAnswerButtons = false
    for (i = 0; i < highestQuestionIndex; i++) { 
      listOfQuestions[i] = (Math.floor(Math.random() * Math.floor(2)))
      if (listOfQuestions[i] == 1){oneCount = oneCount+1}
    }
    console.log(listOfQuestions)
    console.log(oneCount)
    iHaveMeasured = false
    
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      if (updatedLabList[myLabRefNum].playerOne == 'Bob'){
        updatedLabList[myLabRefNum].aliceGameQuestions = []
        updatedLabList[myLabRefNum].aliceGameAnswers = []
        updatedLabList[myLabRefNum].bobGameQuestions = []
        updatedLabList[myLabRefNum].bobGameAnswers = []
        current_status = 'Begin playing game'
        showAnswerButtons = true
      }else{
          if (current_mode === 'Classic Game'){
          current_status = 'Waiting for other player to join'
        }
      }
      myObj.set(updatedLabList)
    })
    if (showAnswerButtons){
      this.setState({style_classic_game: false})
    }
  }

  showClassicGame(e) {
    if (current_mode != 'Classic Game'){
        e.preventDefault();
        console.log("showClassicGame")
        
        if (scientistCount == 2){
          this.setState({style_classic_game: false})
        }
        this.setState({style_experiment: true})
        this.setState({style_quantum_game: true})
        this.setState({style_navigation_bar: false})
    }
  }

  showQuantumGame(e) {
    if (current_mode != 'Quantum Game'){
      e.preventDefault();
      console.log("showClassicGame")
      current_mode = 'Quantum Game'
      this.setState({style_experiment: true})
      this.setState({style_classic_game: true})
      this.setState({style_quantum_game: false})
      this.setState({style_navigation_bar: false})
    }
  }

  showExperiment(e) {
      e.preventDefault();
      console.log("experiment")
      current_mode = "Experiment"
      this.setState({style_experiment: false})
      this.setState({style_classic_game: true})
      this.setState({style_quantum_game: true})
      this.setState({style_navigation_bar: false})
  }

  createEntanglement(){
    myObj.transaction(function(currentValue){
      console.log('currentValue',currentValue)
      var updatedLabList = currentValue
      updatedLabList[myLabRefNum].particle = '-1'
      myParticle = '-1'
      myObj.set(updatedLabList)
      //iHaveMeasured = false
    })
    this.setState({style_experiment: false})
  }

  classicGameAnswer(myAnswer){
    //todo: dont let the user click the answer buttons if they have already answered all the questions
    //    this could be done by making the buttons be gone or by making an alert when a button is clicked
    //    -look through the notes scattered around and clean them up
    
    if (currentQuestionIndex < highestQuestionIndex){
    myObj.transaction(function(currentValue){
    var updatedLabList = currentValue
    listOfAnswers[currentQuestionIndex] = myAnswer
    currentQuestionIndex++
    if (currentQuestionIndex === highestQuestionIndex){
      //once enough questions are answered, add them to the db
        console.log('currentValue',currentValue)
        var updatedLabList = currentValue
        if (myNumber == 0){
          updatedLabList[myLabRefNum].aliceGameQuestions = listOfQuestions
          updatedLabList[myLabRefNum].aliceGameAnswers = listOfAnswers
          if (updatedLabList[myLabRefNum].bobGameAnswers){
            current_status = 'show results'
          }else{
            current_status = 'waiting for other player to finish'
          }
        }
        if (myNumber == 1){
          updatedLabList[myLabRefNum].bobGameQuestions = listOfQuestions
          updatedLabList[myLabRefNum].bobGameAnswers = listOfAnswers
          if (updatedLabList[myLabRefNum].aliceGameAnswers){
            current_status = 'show results'
            console.log('show results')
          }else{
            current_status = 'waiting for other player to finish'
            console.log('waiting for other player to join')
          }
        }
        myObj.set(updatedLabList)
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
        })
    this.setState({style_classic_game: false})
    }
  }

    doMeasurement(myMeasurementType){
    //e.preventDefault();
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      var particleStateNumber = updatedLabList[myLabRefNum].particle
      var do_cos_squared_pi_over_8_measurement = false
      var do_cos_squared_3_pi_over_8_measurement = false
      if (!iHaveMeasured){
        iHaveMeasured = true
      if (particleStateNumber == '-1'){
        myMeasurementResult = (Math.floor(Math.random() * Math.floor(2))).toString()
        particleStateNumber = myMeasurementResult+myNumber.toString()+myMeasurementType.toString()
      }else if (particleStateNumber.charAt(2) == '0'){
              do_cos_squared_pi_over_8_measurement = true
      }else if (particleStateNumber.charAt(2) == '1'){
          if (myMeasurementType == '0'){
              do_cos_squared_pi_over_8_measurement = true
          }else if (myMeasurementType == '1'){
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
      updatedLabList[myLabRefNum].particle = particleStateNumber
      myParticle = particleStateNumber
      console.log('myParticle',myParticle)      
      myObj.set(updatedLabList)
      }
    })
    this.setState({style_experiment: false})
  }

    deleteLab = () => {
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      delete updatedLabList[myLabRefNum];
      myObj.set(updatedLabList)
    })
  }

  componentDidMount(){
    this.setupBeforeUnloadListener()
    myObj.on("value",(snapshot)=>{
      const labs = snapshot.val()
      if (labs){
        console.log('labs',labs)
        if (labs[myLabRefNum]){
          if (labs[myLabRefNum].labClosed == 'true'){
              console.log('lab is being deleted')
              this.deleteLab()
              this.setState({style_intro: false})
              this.setState({style_experiment: true})
              this.setState({style_classic_game: true})
              this.setState({style_quantum_game: true})
              this.setState({style_navigation_bar: true})
          }else{
            console.log('labs[myLabRefNum]')
            console.log('myLabRefNum',myLabRefNum)
            myParticle = labs[myLabRefNum].particle
            if (myParticle == '-1'){
              iHaveMeasured = false
              myMeasurementResult = '-1'
            }
            if (labs[myLabRefNum].playerOne == 'Bob'){
              scientistCount = '2'
            if (current_mode === 'Classic Game'){
              if (!listOfAnswers){
                current_status = 'Begin playing game'
                } 
              if (labs[myLabRefNum].aliceGameAnswers && labs[myLabRefNum].bobGameAnswers){
                  current_status = 'show the results'
                  const aliceAnswers = labs[myLabRefNum].aliceGameAnswers
                  const aliceQuestions = labs[myLabRefNum].aliceGameQuestions
                  const bobAnswers = labs[myLabRefNum].bobGameAnswers
                  const bobQuestions = labs[myLabRefNum].bobGameQuestions
                  var gridData = []
                  var i
                  for (i = 0; i < highestQuestionIndex; i++) { 
                      var currentResult = 'wrong'
                      if (aliceQuestions[i]*bobQuestions[i]==(aliceAnswers[i]+bobAnswers[i])%2){
                      currentResult = 'right'
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
                  this.setState({style_navigation_bar: false})
                }
              }           
              this.setState({style_classic_game: false})
            }else{
              scientistCount = '1'
              this.setState({style_classic_game: true})
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
          if (currentValue[lab].name == myLab){
            if (currentValue[lab].playerOne == 'Bob'){
            console.log("Lab is full")
            labIsFull = true
            }else{
            console.log("You Joined Lab:",myLab)
            myNumber = 1
            currentValue[lab].playerOne = 'Bob'
            myName = 'Bob'
            createNewLab = false
            }
          }
        }
      }
    if (createNewLab){
      var listObjList = { name: myLab, 
                          playerZero: 'Alice',
                          playerOne: 'None',
                          particle: '-1',
                          labClosed: 'false',
                          aliceGameQuestions: [],
                          aliceGameAnswers: [],
                          bobGameQuestions: [],
                          bobGameAnswers: []};
      myNumber = 0
      myName = 'Alice'
      currentLabsList.push(listObjList)
    }
      myLabRefNum = currentLabsList.length-1
      console.log("myLabRefNum", myLabRefNum)
      myObj.set(currentLabsList)
      console.log("Labs updated")
    })
      if (!labIsFull){
      this.setState({style_intro: true})
      console.log('lab not full')
      this.setState({style_navigation_bar: false})
      if (scientistCount == 2){
        this.setState({style_classic_game: false})           
      }  
    }
  }
//it could be a walk-through, 
//first showing the players the game, and allowing them to play it
//  in the same room, or in different rooms, showing them how that change stheir score from 100 to 75
//then, remove the game and give them entangled particles for them to experiment with in the same
//  room, showing them the coorelations like described earlier
//finally, allow them to play the game with the use of particles

//intro mode: asks use for lab name
//  Elements
//    -textfield, submit button
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
  render() {
    const style = this.state.hideToolTip ? {display: 'none'} : {};
    const style_intro = this.state.style_intro ? {display: 'none'} : {};
    const style_experiment = this.state.style_experiment ? {display: 'none'} : {};
    const style_classic_game = this.state.style_classic_game ? {display: 'none'} : {};
    const style_quantum_game = this.state.style_quantum_game ? {display: 'none'} : {};
    const style_navigation_bar = this.state.style_navigation_bar ? {display: 'none'} : {};
    const multiline = 'first \n third'
    return (
      <div className="App">
      <navigation_bar style={style_navigation_bar}>
        Current mode: {current_mode}<br></br><br></br></navigation_bar>
      <mode_intro style={style_intro}>
        <form onSubmit={this.handleIntroSubmit}>
          <label>Lab Name:<input type="text" ref={(input) => this.input = input} /></label>
          <input type="submit" value="Submit" />
        </form>
      </mode_intro>
      <mode_experiment style={style_experiment}>
        <label>Particle state: {myParticle}</label><br></br>
        <label>myMeasurementResult: {myMeasurementResult}</label><br></br>
        <button onClick={()=>this.doMeasurement(0)}>measureA</button>
        <button onClick={()=>this.doMeasurement(1)}>measureB</button>
        <button onClick={this.createEntanglement}>entanglement</button>
      </mode_experiment>
      <mode_classic_game style={style_classic_game}>
        <button onClick={this.startNewClassicGame}>Start new game</button><br></br><br></br>
        <label>Question number: {currentQuestionIndex} / {highestQuestionIndex}</label><br></br>
        <label>Question: {listOfQuestions[currentQuestionIndex]}</label><br></br>
        <button onClick={()=>this.classicGameAnswer(0)}>first answer</button>
        <button onClick={()=>this.classicGameAnswer(1)}>second answer</button><br></br><br></br>

            <div
                className="ag-theme-balham"
                style={{ height: '200px', width: '400px' }}>
                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.resultsGridRowData}>
                </AgGridReact>
            </div>

      </mode_classic_game>
      <mode_quantum_game style={style_quantum_game}>
      </mode_quantum_game>
      <game_results style={style_navigation_bar}>
      </game_results>
      <navigation_bar style={style_navigation_bar}>
        <br></br><br></br><br></br><br></br><br></br><br></br>
        <label>Status: {current_status}</label><br></br>
        <label>Lab Name: {myLab} ------My Name: {myName} ------Scientist count: {scientistCount}</label><br></br>   
        <button onClick={this.showClassicGame}>classic game</button>
        <button onClick={this.showExperiment}>experiment</button>
        <button onClick={this.showQuantumGame}>quantum game</button>
        <br></br><br></br><br></br><br></br>
        <label>{multiline.split("\n").map((i,key) => {
            return <div key={key}>{i}</div>;
        })}</label>
      </navigation_bar>


      </div>
    );
  }
}



export default App;





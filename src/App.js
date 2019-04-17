import React, { Component } from 'react';
//import Tooltip from 'react-bootstrap';
import logo from './logo.svg';
import './App.css';
import firebase from 'firebase' 
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

const totalQuestionNumber = 30
var listOfQuestions = []
var listOfAnswers = []
var currentQuestionIndex = 0 //this can be either X or O

var myLabRef
var myParticle = '-1'
var myLab = "none"
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
      style_navigation_bar: true
    };
    this.handleIntroSubmit = this.handleIntroSubmit.bind(this);
    this.showClassicGame = this.showClassicGame.bind(this);
    this.startNewClassicGame = this.startNewClassicGame.bind(this);
    this.classicGameAnswer = this.classicGameAnswer.bind(this);
    this.showQuantumGame = this.showQuantumGame.bind(this);
    this.createEntanglement = this.createEntanglement.bind(this);
    this.experiment = this.experiment.bind(this);
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

  showClassicGame(e) {
      e.preventDefault();
      console.log("showClassicGame")
      this.setState({style_experiment: true})
      if (scientistCount == 2){
      this.setState({style_classic_game: false})
    }
      this.setState({style_quantum_game: true})
  }

  startNewClassicGame(e) {
    current_mode = 'classicGame'
    var i;
    var oneCount = 0
    for (i = 0; i < totalQuestionNumber; i++) { 
      listOfQuestions[i] = (Math.floor(Math.random() * Math.floor(2)))
      if (listOfQuestions[i] == 1){oneCount = oneCount+1}
    }
    console.log(listOfQuestions)
    console.log(oneCount)
    iHaveMeasured = false
    if (scientistCount == 2){
      this.setState({style_classic_game: false})
    }
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      if (updatedLabList[myLabRefNum].playerTwo == 'Bob'){
        updatedLabList[myLabRefNum].gameQuestions = []
        updatedLabList[myLabRefNum].gameAnswers = []
        current_status = 'Begin playing game'
      }else{
          if (current_mode === 'classicGame'){
          current_status = 'Waiting for other player to join'
        }
      }
      myObj.set(updatedLabList)
    })
  }

  showQuantumGame(e) {
      e.preventDefault();
      console.log("showClassicGame")
      current_mode = 'quantumGame'
      this.setState({style_experiment: true})
      this.setState({style_classic_game: true})
      this.setState({style_quantum_game: false})
  }

  experiment(e) {
      e.preventDefault();
      console.log("experiment")
      current_mode = 'experiment'
      this.setState({style_experiment: false})
      this.setState({style_classic_game: true})
      this.setState({style_quantum_game: true})
  }

  createEntanglement(){
//e.preventDefault();

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
    listOfAnswers[currentQuestionIndex] = myAnswer
    currentQuestionIndex++
    this.setState({style_classic_game: false})
    console.log(listOfAnswers)

//once enough questions are answered, add them to the db

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
      //updatedLabList[myLabRefNum].labClosed = 'true'
      delete updatedLabList[myLabRefNum];
      myObj.set(updatedLabList)
      //iHaveMeasured = false
    })
}

  componentDidMount(){
    this.setupBeforeUnloadListener()
    myObj.on("value",(snapshot)=>{
      const labs = snapshot.val()
      console.log("ran for bob")
      if (labs){
        console.log('labs',labs)
        if (labs[myLabRefNum]){
          //console.log('labs[myLabRefNum].isClosed',labs[myLabRefNum].isClosed)
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
          //console.log('labs[myLabRefNum].playerTwo',labs[myLabRefNum].playerTwo)
        if (labs[myLabRefNum].playerTwo == 'Bob'){
          scientistCount = '2'
        if (current_mode === 'classicGame'){
          current_status = 'Begin playing game'
        }


          this.setState({style_classic_game: false})

      }else{
        scientistCount = '1'
        this.setState({style_classic_game: true})
      }
    }
    // else{
    //   console.log('labs[myLabRefNum] doesnt exist')
    //   this.setState({style_intro: false})
    //   this.setState({style_experiment: true})
    // }
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
            if (currentValue[lab].playerTwo == 'Bob'){
            console.log("Lab is full")
            labIsFull = true
            }else{
            console.log("You Joined Lab:",myLab)
            myNumber = 1
            currentValue[lab].playerTwo = 'Bob'
            myName = 'Bob'
            createNewLab = false
          }
          }
         }
      }
    if (createNewLab){
      var listObjList = { name: myLab, 
                          playerOne: 'Alice',
                           playerTwo: 'None',
                            particle: '-1',
                             labClosed: 'false',
                              gameQuestions: [],
                                gameAnswers: []};
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
        <label>Question number: {currentQuestionIndex} / {totalQuestionNumber}</label><br></br>
        <label>Question: {listOfQuestions[currentQuestionIndex]}</label><br></br>
        <button onClick={()=>this.classicGameAnswer(0)}>first answer</button>
        <button onClick={()=>this.classicGameAnswer(1)}>second answer</button>
      </mode_classic_game>
      <mode_quantum_game style={style_quantum_game}>
      </mode_quantum_game>
      <navigation_bar style={style_navigation_bar}>
        <br></br><br></br>
        <button onClick={this.showClassicGame}>classic game</button>
        <button onClick={this.experiment}>experiment</button>
        <button onClick={this.showQuantumGame}>quantum game</button><br></br>
        <label>Lab Name: {myLab} My Name: {myName} Scientist count: {scientistCount}</label><br></br>   
        <label>Status: {current_status}</label>
        <label>{multiline.split("\n").map((i,key) => {
            return <div key={key}>{i}</div>;
        })}</label>
      </navigation_bar>
      </div>
    );
  }
}



export default App;





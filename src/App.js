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
const particlesRef = firebase.database().ref('particlesx')
const myObj = firebase.database().ref('Labs')
var myLabRef
var myParticle = '-1'
var myLab = "none"
var myLabRefNum = -1
var myNumber = -1
var myName = 'none'
var myMeasurementResult = -1
var iHaveMeasured = false
var scientistCount = 0

class App extends Component {
  constructor(){
    super();
    this.state = {
      hideToolTip: false,
      style_intro: false,
      style_experiment: true,
      style_game: true
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleIntroSubmit = this.handleIntroSubmit.bind(this);
    this.experimentButtonClicked = this.experimentButtonClicked.bind(this);
    this.createEntanglement = this.createEntanglement.bind(this);
    //this.doMeasurementA = this.doMeasurementA.bind(this);
    this.doMeasurement = this.doMeasurement.bind(this);
    this.tooltipInstance = (
      <div onClick ={this.handleChange}>
        <button placement="bottom" className="in" id="tooltip-bottom">
        Tooltip bottom
        </button>
      </div>
      );
  }

  // Things to do before unloading/closing the tab
    doSomethingBeforeUnload = () => {
    myObj.transaction(function(currentValue){
      var updatedLabList = currentValue
      updatedLabList[myLabRefNum].labClosed = 'true'
      //delete updatedLabList[myLabRefNum];
      myObj.set(updatedLabList)
      //iHaveMeasured = false
    })
}

    // Setup the `beforeunload` event listener
    setupBeforeUnloadListener = () => {




        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            this.doSomethingBeforeUnload();
        });
    };

    componentDidMount() {
        // Activate the event listener
        
    }


  handleIntroSubmit(e) {
    //alert('The value is: ' + this.input.value);
    myLab = this.input.value
    e.preventDefault();
    //check if lab exists,
    //  if it doesnt then make it
    //    to do this i need to be able to make lab objects in my firebase
    //    the lab objects will have a name, a mode(experiment or game), a current
    //    particle state which describes if/how it has been checked


    this.joinOrCreateLab()
  }

  experimentButtonClicked(e) {
      //increment particles current value by one
      e.preventDefault();
      console.log("experimentButtonClicked")
      this.setState({style_experiment: true})
      this.setState({style_game: false})
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
        
        //console.log('spin_direction',spin_direction.toString())
      }else if (particleStateNumber.charAt(2) == '0'){
              do_cos_squared_pi_over_8_measurement = true
      }else if (particleStateNumber.charAt(2) == '1'){
          if (myMeasurementType == '0'){
              do_cos_squared_pi_over_8_measurement = true
          }else if (myMeasurementType == '1'){
            do_cos_squared_3_pi_over_8_measurement = true
          }        
        }
        if (do_cos_squared_pi_over_8_measurement){
              var randomNum=Math.random()
              console.log('randomNum',randomNum)
              if(randomNum < 0.8536) {myMeasurementResult = particleStateNumber.charAt(0)}
              else {myMeasurementResult = (particleStateNumber.charAt(0)+1)%2}
        }else if(do_cos_squared_3_pi_over_8_measurement){
              var randomNum=Math.random()
              console.log('randomNum',randomNum)
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



  handleChange(event){
    this.setState({hideToolTip: true})
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
              this.setState({style_game: true})
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
          this.setState({style_game: false})
      }else{
        scientistCount = '1'
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



  takeTurn=()=>{
    particlesRef.transaction(function(currentValue){
      //increment particles current value by one
      const newValue = (currentValue||0) + 1
      particlesRef.set(newValue)
      console.log("take turn")
      this.setState({style_experiment: true})
      this.setState({style_game: false})
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
      var listObjList = { name: myLab, playerOne: 'Alice', playerTwo: 'None', particle: '-1', labClosed: 'false'};
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
      this.setState({style_experiment: false})     
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
  render() {
    const style = this.state.hideToolTip ? {display: 'none'} : {};
    const style_intro = this.state.style_intro ? {display: 'none'} : {};
    const style_experiment = this.state.style_experiment ? {display: 'none'} : {};
    const style_game = this.state.style_game ? {display: 'none'} : {};
    return (
      <div className="App">
      <mode_intro style={style_intro}>
        <form onSubmit={this.handleIntroSubmit}>
          <label>Lab Name:<input type="text" ref={(input) => this.input = input} /></label>
          <input type="submit" value="Submit" />
        </form>
      </mode_intro>
      <mode_experiment style={style_experiment}>
        <label>Lab Name: {myLab}</label><br></br>
        <label>My Name: {myName}</label><br></br>
        <label>Scientist count: {scientistCount}</label><br></br>
        <label>Particle state: {myParticle}</label><br></br>
        <label>myMeasurementResult: {myMeasurementResult}</label><br></br>
        <button onClick={this.experimentButtonClicked}>experiment</button>
        <button onClick={()=>this.doMeasurement(0)}>measureA</button>
        <button onClick={()=>this.doMeasurement(1)}>measureB</button>
        <button onClick={this.createEntanglement}>entanglement</button>
      </mode_experiment>
      <mode_game style={style_game}>
        <button onClick={this.takeTurn}>game</button>
      </mode_game>
      </div>
    );
  }
}



export default App;





import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from 'firebase' 
const fbConfig = 
  {
    apiKey: "AIzaSyAz2p24gxOMDp-89VNh1pfkmOUy5mPxf9A",
    authDomain: "newent-a686e.firebaseapp.com",
    databaseURL: "https://newent-a686e.firebaseio.com",
    projectId: "newent-a686e",
    storageBucket: "newent-a686e.appspot.com",
    messagingSenderId: "904946277128"
  }
const app = firebase.initializeApp(fbConfig)
const particlesRef = firebase.database().ref('particles')
class App extends Component {
  componentDidMount(){
    particlesRef.on("value",(snapshot)=>{
      console.log("particles changed", snapshot.val())
    })
  }
  takeTurn=()=>{
    particlesRef.transaction(function(currentValue){
      //increment particles current value by one
      const newValue = (currentValue||0) + 1
      particlesRef.set(newValue)
    })       
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.takeTurn}>Take Turn</button>
      </div>
    );
  }
}

export default App;

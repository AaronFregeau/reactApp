import React, { Component } from 'react';
import logo from './teeto.jpg';
import './App.css';
import Customers from './Customers'
import LeagueList from './LeagueList'
import { BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';


class App extends Component {
  render() {
    console.log("Host URL"+process.env.PUBLIC_URL);
    return (

      <Router basename={process.env.PUBLIC_URL}>
        <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Aaron's Champion Organizer</h1>
        </header>
          <Switch>
                <Route exact path= "/" render={() => (
                  <Redirect to="/league"/>
                )}/>
                 <Route exact path='/customerlist' component={Customers} />
                 <Route exact path='/league' component={LeagueList} />
          </Switch>
      </div>
    </Router>
    );
  }
}

export default App;

import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Login from '../containers/Login'
import "bootstrap/dist/css/bootstrap.min.css"
import '../App.css';

class App extends Component {
  constructor(props) {
      super(props);
  
  }

  render() {
      return (
          <div className="App">
              <div className="App-content">
                  <div className="App-container">                       
                      <div id="lexon-app" />
                     <BrowserRouter>
                       <Route exact path="/login" component={Login}></Route>
                     </BrowserRouter>    
                  </div>
              </div>
          </div>
      );
  }
}

export default App;

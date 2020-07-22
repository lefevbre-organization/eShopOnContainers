import React, {Component} from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import lexonLogin from '../containers/Login';
import centinelaLogin from '../containers/CentinelaLogin';
import centinelaContainer from '../containers/CentinelaContainer';
import lexonContainer from '../containers/LexonContainer';
import "bootstrap/dist/css/bootstrap.min.css";
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
                      <BrowserRouter>
                       <Switch>
                        <Route exact path="/oauth_lexon" component={lexonLogin}></Route>
                        <Route exact path="/oauth_centinela" component={centinelaLogin}></Route>
                        <Route exact path="/centinela" component={centinelaContainer}></Route>
                        <Route exact path="/lexon" component={lexonContainer}></Route>
                       </Switch>
                     </BrowserRouter>    
                  </div>
              </div>
          </div>
      );
  }
}

export default App;

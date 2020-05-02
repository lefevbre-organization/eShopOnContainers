import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Login from '../containers/Login'
import "bootstrap/dist/css/bootstrap.min.css"
import queryString from 'query-string';
import { signIn, checkSignInStatus } from '../api/authentication';
import { mountScripts } from '../api/scripts';
import {
    SIGNED_OUT,
    AUTH_SUCCESS,
    AUTH_FAIL,
    AUTH_IN_PROGRESS
  } from '../constants';
import '../App.css';

class App extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          signInStatus: SIGNED_OUT,
          googleUser: undefined,
          openEmail: undefined
        };
    
        this.init = this.init.bind(this);
        this.initClient = this.initClient.bind(this);
        this.onSignout = this.onSignout.bind(this);
        this.onSignoutDisconnect = this.onSignoutDisconnect.bind(this);
        this.onSignInSuccess = this.onSignInSuccess.bind(this);
        this.onSignIn = this.onSignIn.bind(this);
      }

      componentDidMount() {
        const values = queryString.parse(window.location.search);

        if (values && values.bbdd) {
            const addonData = JSON.parse(values.bbdd)
             mountScripts().then(this.init);
            this.setState({ openEmail: addonData.messageId });
        }  
        
      }

      init() {
        window.gapi.load('client:auth2', this.initClient);
      }

      initClient() {
        checkSignInStatus()
          .then(this.onSignInSuccess)
          .catch(_ => {
            this.setState({
              signInStatus: AUTH_FAIL
            });
          });
      }
    
      onSignout() {
        this.props.signOut();
      }
    
      onSignoutDisconnect() {
        this.props.signOutDisconnect();
      }
    
      onSignIn() {
        signIn().then(this.onSignInSuccess);
      }
    
      onSignInSuccess(googleUser) {
          console.log(googleUser);
        const values = queryString.parse(window.location.search);
        if (values && values.bbdd) {
            const addonData = JSON.parse(values.bbdd)
            this.setState({
                signInStatus: AUTH_SUCCESS,
                googleUser: googleUser,
                openEmail: addonData.messageId
              });
            
        }  
    //    this.props.setAccount(googleUser.getBasicProfile().getEmail());
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

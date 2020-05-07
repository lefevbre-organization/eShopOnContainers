import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import queryString from 'query-string';
import Login from '../containers/Login'
import "bootstrap/dist/css/bootstrap.min.css"
import '../App.css';

class App extends Component {
  constructor(props) {
      super(props);

      this.state = {
        addonData: null,
      };

      this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
        this
      );
  
  }

  componentDidMount() {
    window.addEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
   );
  }


  componentWillUnmount() {
    window.removeEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
   );

  }

  sendMessagePutUser(user, addonData) {
    window.addonData = addonData;
    window.dispatchEvent(
      new CustomEvent('PutUserFromLexonConnector', {
        detail: {
          user,
          selectedMessages: [{
            id: addonData.messageId,
            subject: addonData.subject,
            folder: addonData.folder,
            sentDateTime: addonData.sentDateTime,
            raw: addonData.raw
          }],
          idCaseFile: undefined,
          bbdd: undefined,
          idCompany: undefined,
          provider: addonData.provider,
          account: addonData.account
        }
      })
    );
  }


  handleGetUserFromLexonConnector() {
    console.log('handleGetUserFromLexonConnector');
    const userId = 'E1621396';
    const values = queryString.parse(window.location.search);
    
    if (values && values.bbdd 
      && Object.keys(values).length > 0) {
      const payload = values.bbdd.split('.')[1];
      const addonData = JSON.parse(atob(payload));
      this.setState({ addonData: addonData, bbdd: { idCompany: addonData.idCompany, bbdd: addonData.bbdd }})
      this.sendMessagePutUser(userId, addonData);
    }
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

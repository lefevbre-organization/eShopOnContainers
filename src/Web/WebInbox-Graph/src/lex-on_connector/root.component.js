import React from 'react'
import e from '../event-bus'
import styles from './main.scss';


export default class Root extends React.Component {
  constructor(props) {
      super(props)

    this.state = {
        message: 'Seleccione elemento/s de la lista'      
    }

    this.messageHandler = this.messageHandler.bind(this)
  }

  componentDidMount() {
    e.on('received', this.messageHandler)
  }

  componentDidUnmount() {
    e.off('received', this.messageHandler)
  }

  messageHandler(message) {
    this.setState({
      message: message.text
    })
    } 

  sendMessage() {
        e.emit('message', { text: 'Hello from LEX-ON connector' })
  }
  

  render() {
      return (
          <div id ="main-lexon-connector" className="connector">
              {/* <p>Lex-On - Connector</p>*/}
              <img height="120px" border="0" alt="Lefebvre" src="assets/img/settings-gears.svg"></img>
              <p>
                  <br></br>
                  <button onClick={this.sendMessage}>
                      Send a message to Multi-channel mail box
                   </button>
              </p>
              <p className={styles.messages}>{this.state.message}</p> 
          </div> 
      );
  }
}

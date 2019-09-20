import React, {Component} from 'react'
import {connect} from "react-redux";

import './main.css';
import ACTIONS from "./actions/lex-on_message-list.actions";

class LexonConnector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            running : true,
            date: new Date(),
            message: 'Seleccione elemento/s de la lista',   
        };

        this.handleEnter = this.handleEnter.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleCheckAllclick = this.handleCheckAllclick.bind(this);
    } 

    sendMessage() {  
        window.dispatchEvent(new CustomEvent("toggleClock", {
            detail: { name: "John" }
        }));
    }

    toggleClock = () => {
        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = undefined;
            this.setState(() => ({
                running: false
            }))
        } else {
            this.setState(() => ({
                running: true
            }));
            this.timerID = setInterval(
                () => this.tick(),
                1000
            );
        }
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );

        window.addEventListener("Checkclick", this.handleKeyPress)    
        window.addEventListener("CheckAllclick", this.handleCheckAllclick);        
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
        window.removeEventListener("Checkclick", this.handleKeyPress);
        window.removeEventListener("CheckAllclick", this.handleCheckAllclick);
    }

    tick() {
        this.setState(() => ({
            date: new Date()
        }));
    }

    handleKeyPress(event) {              
        // this.handleEnter(event);

        this.setState({           
            message: event.detail.name + " Selected: " + event.detail.chkselected
        });
        
        event.detail.chkselected ? this.props.addMessage(event.detail.name) : this.props.deleteMessage(event.detail.name);
        this.handleEnter(event);
    }

    handleEnter(event) {
        this.setState({           
            message: event.detail.name + " Selected: " + event.detail.chkselected
        });
    }

    handleCheckAllclick(event) {
        event.detail.chkselected ? this.props.addListMessages(event.detail.listMessages) : this.props.deleteListMessages(event.detail.listMessages);
    }

    render() {
        const clockStateClass = this.state.running ? 'clock--running' : 'clock--paused';
        return (
            <div id="main-lexon-connector" className={`clock ${clockStateClass}`}>
                <h1>LEX-ON Connector!</h1>
                <h2 className='clock__time'>It is {this.state.date.toLocaleTimeString()}</h2> 
                {/*<img height="120px" border="0" alt="gears" src="assets/img/settings-gears.svg"></img>*/}
                <p>
                    {/*<button onClick={this.sendMessage}>
                      Send a message to Multi-channel mail box
                   </button>*/}
                </p>
                <p>{this.state.message}</p> 

                <h1>Lista de Mensajes</h1>
                { 
                    this.props.selectedMessages.map((message) => (
                        <div key={ message }>
                            { message }
                        </div>
                ))}
            </div>
        );
    }    
}

const mapStateToProps = (state) => {
    return {
        selectedMessages: state.selectedMessages
    }    
};

const mapDispatchToProps = dispatch => ({
    addMessage: item => dispatch(ACTIONS.addMessage(item)),
    deleteMessage: id => dispatch(ACTIONS.deleteMessage(id)),
    addListMessages: listMessages => dispatch(ACTIONS.addListMessages(listMessages)),
    deleteListMessages: listMessages => dispatch(ACTIONS.deleteListMessages(listMessages))
});

export default connect(mapStateToProps, mapDispatchToProps)(LexonConnector);




// import React, {Component} from 'react'
// import './main.scss';
// import { bindActionCreators, compose } from "redux";
// import { connect } from "react-redux";
// import { withRouter } from "react-router-dom";

// import { addMessage, deleteMessage, deleteListMessages, addListMessages } from "./actions/lex-on_message-list.actions.jsx";

// export class LexonConnector extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             running : true,
//             date: new Date(),
//             message: 'Seleccione elemento/s de la lista'
//         };

//         this.handleEnter = this.handleEnter.bind(this);
//         this.handleKeyPress = this.handleKeyPress.bind(this);
//         this.handleCheckAllclick = this.handleCheckAllclick.bind(this);
//     } 

//     sendMessage() {  
//         window.dispatchEvent(new CustomEvent("toggleClock", {
//             detail: { name: "John" }
//         }));
//     }

//     toggleClock = () => {
//         if (this.timerID) {
//             clearInterval(this.timerID);
//             this.timerID = undefined;
//             this.setState(() => ({
//                 running: false
//             }))
//         } else {
//             this.setState(() => ({
//                 running: true
//             }));
//             this.timerID = setInterval(
//                 () => this.tick(),
//                 1000
//             );
//         }
//     }

//     componentDidMount() {
//         this.timerID = setInterval(
//             () => this.tick(),
//             1000
//         );

//         window.addEventListener("Checkclick", this.handleKeyPress);
//         window.addEventListener("CheckAllclick", this.handleCheckAllclick);
//     }

//     componentWillUnmount() {
//         clearInterval(this.timerID);
//         window.removeEventListener("Checkclick", this.handleKeyPress);
//         window.removeEventListener("CheckAllclick", this.handleCheckAllclick);
//     }

//     tick() {
//         this.setState(() => ({
//             date: new Date()
//         }));
//     }

//     handleKeyPress(event) {
//         this.setState({           
//             message: event.detail.name + " Selected: " + event.detail.chkselected
//         });
        
//         event.detail.chkselected ? this.props.addMessage(event.detail.name) : this.props.deleteMessage(event.detail.name);
//         this.handleEnter(event);
//     }

//     handleEnter(event) {
//         this.setState({           
//             message: event.detail.name + " Selected: " + event.detail.chkselected
//         });

// //        addMessage(event.detail.name);
//     }

//     handleCheckAllclick(event) {
//         event.detail.chkselected ? this.props.addListMessages(event.detail.listMessages) : this.props.deleteListMessages(event.detail.listMessages);
//     }

//     render() {
//         const clockStateClass = this.state.running ? 'clock--running' : 'clock--paused';
        
//         return (
//             <div id="main-lexon-connector" className={`clock ${clockStateClass}`}>
//                 <h1>LEX-ON Connector DEV mode!!!</h1>
//                 <h2 className='clock__time'>It is {this.state.date.toLocaleTimeString()}</h2> 
//                 {/*<img height="120px" border="0" alt="gears" src="assets/img/settings-gears.svg"></img>*/}
//                 <p>
//                     {/*<button onClick={this.sendMessage}>
//                       Send a message to Multi-channel mail box
//                    </button>*/}
//                 </p>
//                 <p>{this.state.message}</p> 

//                 <h1>Lista de Mensajes</h1>
//                 { 
//                     this.props.selectedMessages.map((message) => (
//                         <div key={ message.id }>
//                             { message.content }
//                         </div>
//                 ))}

//             </div>
//         );
//     }    
// }

// const mapStateToProps = (state) => {
//     return {
//         selectedMessages: state.lexonMessageListReducer.selectedMessages
//     }    
// };  

// const mapDispatchToProps = dispatch =>
//   bindActionCreators(
//     {
//       addMessage,
//       deleteMessage,
//       deleteListMessages,
//       addListMessages
//     },
//     dispatch
// );

// export default compose(
//     withRouter,
//     connect(
//         mapStateToProps,
//         mapDispatchToProps
//     )
// )(LexonConnector);

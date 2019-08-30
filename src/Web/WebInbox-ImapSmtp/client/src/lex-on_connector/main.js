import React, {Component} from 'react'
import styles from './main.scss';


export default class main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            running : true,
            date: new Date(),
            message: 'Seleccione elemento/s de la lista',   
        };

        this.handleEnter = this.handleEnter.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
       
    } 

    sendMessage() {  
        window.dispatchEvent(new CustomEvent("toggleClock", {
            detail: { name: "John" }
        }));
    }

    toggleClock() {
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
        console.log('componentDidMount');
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );

        window.addEventListener("Checkclick", this.handleKeyPress)
            
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
        window.removeEventListener("Checkclick", this.handleKeyPress);
    }

    tick() {
        this.setState(() => ({
            date: new Date()
        }));
    }

    handleKeyPress(event) {      
        this.handleEnter(event);
    }

    handleEnter(event) {
        this.setState({           
            message: event.detail.name + " Selected: " + event.detail.chkselected
        });
    }

    render() {
        const clockStateClass = this.state.running ? 'clock--running' : 'clock--paused';
        return (
            <div id="main-lexon-connector" className={styles['clock']}>
                <h1>LEX-ON Connector DEV mode!</h1>
                <h2 className={styles['clock__time']}>It is {this.state.date.toLocaleTimeString()}</h2> 
                {/*<img height="120px" border="0" alt="gears" src="assets/img/settings-gears.svg"></img>*/}
                <p>
                    {/*<button onClick={this.sendMessage}>
                      Send a message to Multi-channel mail box
                   </button>*/}
                </p>
                <p>{this.state.message}</p> 
            </div>
        );
    }
    
}


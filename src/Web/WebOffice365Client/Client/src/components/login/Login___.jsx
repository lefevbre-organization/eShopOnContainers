import React, { Component } from "react";
import './Login.scss';
import { Button, Jumbotron } from 'reactstrap';


function WelcomeContent(props) {
    // If authenticated, greet the user
    if (props.isAuthenticated) {
        return (
            <div>
                <h4>Welcome {props.user.displayName}!</h4>                
            </div>
        );
    }

    // Not authenticated, present a sign in button
   // return <a href="#" onClick={props.authButtonMethod}><img border="0"  alt="Microsoft" className="w3-btn" src="assets/img/singinms.png"></img></a>;
    
    return <Button color="primary" onClick={props.authButtonMethod}>Click here to sign in</Button>;
}


export class Login extends Component {

    render() {
        return (
            //<div className="d-flex align-content-center align-items-center w-100 h-100 text-center" >
            //    <div className="mx-auto">
            //        <div> 
            //            <WelcomeContent
            //                isAuthenticated={this.props.isAuthenticated}
            //                user={this.props.user}
            //                authButtonMethod={this.props.authButtonMethod} />
            //        </div>
            //    </div>
            //</div>

            <Jumbotron>
                <h1>React Graph SPA</h1>
                <p className="lead">
                    This sample app shows how to use the Microsoft Graph
                    API to access Outlook and OneDrive data from React
                </p>
                <WelcomeContent
                    isAuthenticated={this.props.isAuthenticated}
                    user={this.props.user}
                    authButtonMethod={this.props.authButtonMethod} />
            </Jumbotron>
        );
    }
}

export default Login;

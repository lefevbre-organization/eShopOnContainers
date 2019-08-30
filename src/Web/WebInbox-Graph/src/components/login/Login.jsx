import React from 'react';
import './Login.scss';

function WelcomeContent(props) {    
    console.log('IN ... WelcomeContent');
    return <a href="/#" className="login" onClick={props.authButtonMethod}><img border="0" alt="Microsoft" className="w3-btn" src="assets/img/singinms.png"></img></a>;
}

export default class Login extends React.Component {
    render() {
        console.log('IN ... Login');
        return (
            <div className="d-flex align-content-center align-items-center w-100 h-100 text-center w3-btn">
                <div className="mx-auto">
                    <div>                       
                        <WelcomeContent
                            isAuthenticated={this.props.isAuthenticated}
                            user={this.props.user}
                            authButtonMethod={this.props.authButtonMethod}
                            logout={this.props.logout}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
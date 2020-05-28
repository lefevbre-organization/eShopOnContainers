import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import ACTIONS from "../../actions/lefebvre";
import { clearUserCredentials, setUserCredentials } from "../../actions/application";
import history from "../../routes/history";
import { PROVIDER } from "../../constants";
import { getUser } from '../../services/accounts';
import { removeState } from "../../services/state";
import * as base64 from 'base-64';
import { parseJwt, getUserId, getGuid, getUserName, getApp, getIdEntityType, getIdEntity, getBbdd, getIdUserApp } from "../../services/jwt";
import jwt from "njwt";
import Cookies from 'js-cookie';
import * as uuid from 'uuid/v4';
import { getAvailableSignatures, getUserSignatures, createBranding, createBranding2, getBrandingTemplate, createUser, addOrUpdateBranding } from "../../services/api-signaturit";
import { ActionTypes } from "../../actions/action-types";


class UserLefebvre extends Component {
    constructor(props) {
        super(props);

        this.state = {
            readyToRedirect: false,
            readyToRedirectToLogin: false,
            isNewAccount: false,
            type: ''
        };
    }

    verifyTokenSignature(token){

        var myHeaders = new Headers();
        let res;
        myHeaders.append("Accept", "text/plain");
        myHeaders.append("Content-Type", "application/json-patch+json");
        myHeaders.append("Content-Type", "text/plain");

        var raw = `"${token}"`;

        var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
        };

        fetch("https://lexbox-test-apigwlex.lefebvre.es/api/v1/mysql/LexonMySql/token/validation", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log('Ha entrado por aqui');
            console.log(result);
            res = result.data
        })
        .catch(error => console.log('error', error));

        return res;
    }


    componentDidMount() {
        const payload = (this.props.match.params.token ? parseJwt(this.props.match.params.token) : undefined);
        var user = (this.props.match.params.token ? getUserId(payload) : this.props.match.params.idUser);
        var name = (this.props.match.params.token ? getUserName(payload) : "Anónimo");
        var guid = (this.props.match.params.token ? getGuid(payload) : null);
        var app = (this.props.match.params.token ? getApp(payload) : "lefebvre");
        var idEntityType = (this.props.match.params.token ? getIdEntityType(payload) : null)
        var idEntity = (this.props.match.params.token ? getIdEntity(payload) : null)
        var bbdd = (this.props.match.params.token ? getBbdd(payload): null)
        var idUserApp = (this.props.match.params.token ? getIdUserApp(payload): null)

        this.props.setUser(`IM0${user}`);
        this.props.setGuid(guid);
        this.props.setUserName(name);
        this.props.setUserApp(app);
        this.props.setIdUserApp(idUserApp);
        (idEntityType ? this.props.setIdEntityType(idEntityType) : null);
        (idEntity ? this.props.setIdEntity(idEntity) : null);
        (bbdd ? this.props.setDataBase(bbdd) : null);
       
        

        if (Date.now() >= payload.exp * 1000) {
            this.setState({type: 'expired'});
        } else {
            const roleOk = payload.roles.some( e => e === 'Signaturit')
            if (roleOk){
                const validToken = this.verifyTokenSignature(this.props.match.params.token);
                // Hay que meter aquí la validación con validToken cuando Paco la tenga lista.
                console.log('Resultado - validToken:');
                console.log(validToken);
                const token = Cookies.get(`Lefebvre.Signaturit.${user}`)
                if (token)
                Cookies.remove(`Lefebvre.Signaturit.${user}`)
                //store the new token in cookie
                Cookies.set(`Lefebvre.Signaturit.${user}`, this.props.match.params.token, {
                    expires: 1,
                    domain: (window.REACT_APP_ENVIRONMENT==='LOCAL' ? 'localhost': 'lefebvre.es')
                  });

                this.props.setToken(this.props.match.params.token);

                getUserSignatures(user)
                .then( userInfo => {
                    if (userInfo && userInfo.errors && userInfo.errors.length > 0 && userInfo.errors[0].code && userInfo.errors[0].code === "1003"){
                        getBrandingTemplate(app)
                        .then(template => {
                            var auxTemplate = JSON.stringify(template.data.configuration);
                            auxTemplate = auxTemplate.replace(/{{lef_userName}}/g, name).replace(/{{lef_userLogo}}/g, '');
                            var newTemplate = JSON.parse(auxTemplate);
                            createBranding2(newTemplate)
                            .then( res => {
                                var userBranding = [{app: app, externalId: res.id}];
                                createUser(user, userBranding);
                                this.props.setUserBrandings(userBranding);
                                this.props.setAvailableSignatures(0);
                             })
                        });
                    
                    } else {
                        if (userInfo && userInfo.data && userInfo.data.brandings && (userInfo.data.brandings === null || !userInfo.data.brandings.find(b => b.app === app))){
                            getBrandingTemplate(app)
                            .then(template => {
                                var auxTemplate = JSON.stringify(template.data.configuration);
                                auxTemplate = auxTemplate.replace(/{{lef_userName}}/g, name).replace(/{{lef_userLogo}}/g, '');
                                var newTemplate = JSON.parse(auxTemplate);
                                createBranding2(newTemplate)
                                .then( res => {
                                    var userBranding = [{app: app, externalId: res.id}];
                                    addOrUpdateBranding(user, userBranding[0]);
                                    this.props.setUserBrandings(userBranding);
                                })
                            });
                        } else {
                            this.props.setUserBrandings(userInfo.data.brandings);
                        }

                        getAvailableSignatures(user)
                        .then(response => this.props.setAvailableSignatures(response.data));   
                    }                    

                    console.log("UserLefebvre.ComponentDidMount - userInfo:");
                    console.log(userInfo);
                })
                
                
                
                this.setState({readyToRedirect: true})
            }
            else {
                this.setState({type: 'unauthorized'})
            }
        }
    }

    // componentDidUpdate(prevProps) {
    //     if (prevProps.lefebvre !== this.props.lefebvre) {
    //         if (this.props.lefebvre.isNewAccount) {
    //             removeState();
    //             this.setState({
    //                 readyToRedirect: true
    //             });
    //         } else {
    //             this.isUniqueAccountByProvider();
    //         }
    //     }
    // }

    
    render() {
        const {
            readyToRedirect,
            type,
            readyToRedirectToLogin,
            isNewAccount
        } = this.state;
        if (readyToRedirect) {
            this.props.setUserCredentials(this.props.lefebvre.user, this.props.lefebvre.user, {authenticated: true, encrypted: this.props.lefebvre.token, salt: "1234", name: ""})
            return <Redirect to="/" />;
        } else if (type !== ''){
            switch (type) {
                case 'expired':
                    return <Redirect to ="/expired" />;
                    break;
                case 'unauthorized':
                    return <Redirect to = "/unauthorized" />;
                default:
                    break;
            }
            return <Redirect to="/" />;
        } else {
            return null;
        }

        //if (isNewAccount || readyToRedirectToLogin) {
        //  //this.props.logout();
        //  return <Redirect to="/login" />;
        //}
        //return <Redirect to="/" />;
        //return null;
    }
}

const mapStateToProps = state => ({
    lefebvre: state.lefebvre
});

const mapDispatchToProps = dispatch => ({
    setUser: user => dispatch(ACTIONS.setUser(user)),
    setAccount: account => dispatch(ACTIONS.setAccount(account)),
    // setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile)),
    setDataBase: dataBase => dispatch(ACTIONS.setDataBase(dataBase)),
    //setIdEmail: emailInfo => dispatch(ACTIONS.setIdEmail(emailInfo)),
    setMailContacts: mailContacts => dispatch(ACTIONS.setMailContacts(mailContacts)),
    logout: () => {
        dispatch(clearUserCredentials());
        history.push("/login");
    },
    setToken: token => dispatch(ACTIONS.setToken(token)),
    setUserCredentials: (userId, hash, credentials) => dispatch(setUserCredentials(userId, hash, credentials)),
    setGuid: guid => dispatch(ACTIONS.setGUID(guid)),
    setUserName: name => dispatch(ACTIONS.setUserName(name)),
    setAvailableSignatures: num => dispatch(ACTIONS.setAvailableSignatures(num)),
    setUserBrandings: brandings => dispatch(ACTIONS.setUserBrandings(brandings)),
    setUserApp: app => dispatch(ACTIONS.setUserApp(app)),
    setIdEntityType: id => dispatch(ACTIONS.setIdEntityType(id)),
    setIdEntity: id => dispatch(ACTIONS.setIdEntity(id)),
    setIdUserApp: id => dispatch(ACTIONS.setIdUserApp(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(UserLefebvre);
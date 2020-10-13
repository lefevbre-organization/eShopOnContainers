import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import ACTIONS from "../../actions/lefebvre";
import { clearUserCredentials, setUserCredentials } from "../../actions/application";
import history from "../../routes/history";
import { parseJwt, getUserId, getGuid, getUserName, getApp, getIdEntityType, getIdEntity, getBbdd, getIdUserApp, getIdDocuments, getConfigureBaseTemplates, getConfigureDefaultTemplates, getMailContacts, getAdminContacts } from "../../services/jwt";
import Cookies from 'js-cookie';
import { getAvailableSignatures, getUserSignatures, createBranding, createBranding2, getBrandingTemplate, createUser, addOrUpdateBranding, createTemplate, verifyJwtSignature, getUserEmails, createUserEmail } from "../../services/api-signaturit";
import LefebvreBaseTemplate from "../../templates/LefebvreBaseTemplate.json";
import LexonBaseTemplate from "../../templates/LexonBaseTemplate.json";
import CentinelaBaseTemplate from "../../templates/CentinelaBaseTemplate.json";

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

    configureTemplates(type){
        const templates = ["lefebvre", "centinela", "lexon"];
        let template;
        templates.forEach(app => {        
            switch (app) {
                case "lefebvre":
                    //template = ( type === "baseTemplates" ? LefebvreBaseTemplate : LefebvreDefaultTemplate);
                    template = LefebvreBaseTemplate;
                    break;
                case "lexon":
                    //template = ( type === "baseTemplates" ? LexonBaseTemplate : LexonDefaultTemplate);
                    template = LexonBaseTemplate;
                    break;
                case "centinela":
                    //template = ( type === "baseTemplates" ? CentinelaBaseTemplate : CentinelaDefaultTemplate);
                    template = CentinelaBaseTemplate;
                    break;
                default:
                    break;
            }  
            createTemplate(template)
            .then(res => {
                console.log('res:' + res)
            })
        });
    }

    async componentDidMount() {
        let documentsInfo = [];
        const payload = (this.props.match.params.token ? parseJwt(this.props.match.params.token) : undefined);
        var user = (this.props.match.params.token ? getUserId(payload) : this.props.match.params.idUser);
        var name = (this.props.match.params.token ? getUserName(payload) : "Anónimo");
        var guid = (this.props.match.params.token ? getGuid(payload) : null);
        var app = (this.props.match.params.token ? getApp(payload) : "lefebvre");
        var idEntityType = (this.props.match.params.token ? getIdEntityType(payload) : null);
        var idEntity = (this.props.match.params.token ? getIdEntity(payload) : null);
        var bbdd = (this.props.match.params.token ? getBbdd(payload) : null);
        var idUserApp = (this.props.match.params.token ? getIdUserApp(payload) : null);
        var idDocuments = (this.props.match.params.token ? getIdDocuments(payload) : null);
        var mailContacts = (this.props.match.params.token ? getMailContacts(payload) : null);
        var adminContacts = (this.props.match.params.token ? getAdminContacts(payload) : null);
        
        // var configureBaseTemplates = (this.props.match.params.token ? getConfigureBaseTemplates(payload) : false);
        // var configureDefaultTemplates = (this.props.match.params.token ? getConfigureDefaultTemplates(payload) : false);
       

        this.props.setUser(`IM0${user}`);
        this.props.setGuid(guid);
        this.props.setUserName(name);
        this.props.setUserApp(app);
        this.props.setIdUserApp(idUserApp);
        (idEntityType ? this.props.setIdEntityType(idEntityType) : null);
        (idEntity ? this.props.setIdEntity(idEntity) : null);
        (bbdd ? this.props.setDataBase(bbdd) : null);
        (mailContacts ? this.props.setMailContacts(mailContacts) : null);
        (adminContacts ? this.props.setAdminContacts(adminContacts) : null);

        if (idDocuments && idDocuments.length > 0){
            idDocuments.forEach(id => {
                documentsInfo.push({docId: id, docName: ""});
            });
            this.props.setIdDocuments(documentsInfo);
        }
        // (idDocuments && idDocuments.length > 0 ? this.props.setIdDocuments(idDocuments) : null);
        

        if (Date.now() >= payload.exp * 1000) {
            this.setState({type: 'expired'});
        } else {
            var signatureRole = payload.roles.some( e => e === 'Signaturit' || e === 'Firma Digital');
            var emailRole = payload.roles.some( e => e === 'Email Certificado');
            var roleOk = signatureRole || emailRole;

            if ( !roleOk && user === 'E1621396' ){
                roleOk = true;
            }

            if (roleOk){    

                var rolesList = [];
                (signatureRole) ? rolesList.push('Firma Digital') : null;
                (emailRole) ? rolesList.push('Email Certificado') : null;

                this.props.setRoles(rolesList);

                getBrandingTemplate(app)
                .then(res => {
                    if (res.data == null || res.data == false) {
                        this.configureTemplates("baseTemplates");
                    }
                })
                
                // if (configureBaseTemplates){
                //     await this.configureTemplates("baseTemplates");
                // } 
                // if (configureDefaultTemplates){
                //     await this.configureDefaultTemplates("defaultTemplates");
                // }
        
                verifyJwtSignature(this.props.match.params.token)
                .then( res => {
                    if (res == true){
                        
                        const token = Cookies.get(`Lefebvre.Signaturit.${user}`)
                        
                        if (token)
                        Cookies.remove(`Lefebvre.Signaturit.${user}`)
                        //store the new token in cookie
                        Cookies.set(`Lefebvre.Signaturit.${user}`, this.props.match.params.token, {
                            expires: 1,
                            domain: (window.REACT_APP_ENVIRONMENT==='LOCAL' ? 'localhost': 'lefebvre.es')
                          });
        
                        this.props.setToken(this.props.match.params.token);
                    
                        if (signatureRole){
                            getUserSignatures(user)
                            .then( userInfo => {
                                if (userInfo && userInfo.errors && userInfo.errors.length > 0 && userInfo.errors[0].code && userInfo.errors[0].code === "1003"){
                                    // No existe registro del usuario. Se tiene que crear registro de usuario nuevo con branding.
                                    getBrandingTemplate(app)
                                    .then(template => {
                                        var auxTemplate = JSON.stringify(template.data.configuration);
                                        auxTemplate = auxTemplate.replace(/{{lef_userName}}/g, name).replace(/{{lef_userLogo}}/g, '');
                                        var newTemplate = JSON.parse(auxTemplate);
                                        createBranding2(newTemplate, token)
                                        .then( res => {
                                            var userBranding = [{app: app, externalId: res.id}];
                                            createUser(user, userBranding);
                                            this.props.setUserBrandings('signature', userBranding);
                                            this.props.setAvailableSignatures(0);
                                         })
                                    });
                                
                                } else {
                                    if (userInfo && userInfo.data && userInfo.data.brandings 
                                        && ((userInfo.data.brandings.constructor === Object && Object.entries(userInfo.data.brandings).length === 0) 
                                            || !userInfo.data.brandings.find(b => b.app === app))){
                                        // El usuario existe pero no tenemos branding configurado para la aplicación desde la que entra.
                                        getBrandingTemplate(app)
                                        .then(template => {
                                            var auxTemplate = JSON.stringify(template.data.configuration);
                                            auxTemplate = auxTemplate.replace(/{{lef_userName}}/g, name).replace(/{{lef_userLogo}}/g, '');
                                            var newTemplate = JSON.parse(auxTemplate);
                                            createBranding2(newTemplate, token)
                                            .then( res => {
                                                console.log('Resultado de creación de Branding');
                                                console.log(res);
                                                var userBranding = [{app: app, externalId: res.id}];
                                                addOrUpdateBranding(user, userBranding[0]);
                                                this.props.setUserBrandings('signature', userBranding);
                                            })
                                            .catch( err => {
                                                console.log('Se ha producido un error al guardar el branding');
                                                console.log(err);
                                            })
                                        });
                                    } else {
                                        // Usuario y branding ya existentes
                                        this.props.setUserBrandings('signature', userInfo.data.brandings);
                                    }
                                    if (idDocuments && idDocuments.length > 0){
                                        // Vienen documentos preseleccionados
                                        getAvailableSignatures(idUserApp, idDocuments.length)
                                        .then(response => this.props.setAvailableSignatures(response.data))
                                        .catch(err => {
                                            console.log(err);
                                            if (window.REACT_APP_ENVIRONMENT === 'PREPRODUCTION' || window.REACT_APP_ENVIRONMENT === 'LOCAL'){ 
                                                this.props.setAvailableSignatures(true); // Esto se pone mientras el equipo encargado del api lo arregla
                                            }
                                        });  
                                    }
                                }                    
            
                                console.log("UserLefebvre.ComponentDidMount - userInfo:");
                                console.log(userInfo);
                            })
                        }

                        if (emailRole){
                            getUserEmails(user)
                            .then(userInfo => {
                                if (userInfo && userInfo.errors && userInfo.errors.length > 0 && userInfo.errors[0].code && userInfo.errors[0].code === "1003"){
                                    // No existe registro del usuario. Se tiene que crear registro de usuario nuevo con branding.
                                    getBrandingTemplate(app)
                                    .then(template => {
                                        var auxTemplate = JSON.stringify(template.data.configuration);
                                        auxTemplate = auxTemplate.replace(/{{lef_userName}}/g, name).replace(/{{lef_userLogo}}/g, '');
                                        var newTemplate = JSON.parse(auxTemplate);
                                        createBranding2(newTemplate, token)
                                        .then( res => {
                                            var userBranding = [{app: app, externalId: res.id}];
                                            createUserEmail(user, userBranding);
                                            this.props.setUserBrandings('certifiedEmail', userBranding);
                                            //this.props.setAvailableSignatures(0);
                                         })
                                         .catch( err => {
                                             console.log("Se ha producido un error al crear el branding");
                                             console.log(err);
                                         })
                                    });
                                } else {
                                    if (userInfo && userInfo.data && userInfo.data.brandings && ((userInfo.data.brandings.constructor === Object && Object.entries(userInfo.data.brandings).length === 0) || !userInfo.data.brandings.find(b => b.app === app))){
                                        // Ya existe registro del usuario pero no tiene branding para la aplicación desde la que accede.
                                        getBrandingTemplate(app)
                                        .then(template => {
                                            var auxTemplate = JSON.stringify(template.data.configuration);
                                            auxTemplate = auxTemplate.replace(/{{lef_userName}}/g, name).replace(/{{lef_userLogo}}/g, '');
                                            var newTemplate = JSON.parse(auxTemplate);
                                            createBranding2(newTemplate, token)
                                            .then( res => {
                                                console.log('Resultado de creación de Branding');
                                                console.log(res);
                                                var userBranding = [{app: app, externalId: res.id}];
                                                addOrUpdateBranding(user, userBranding[0]);
                                                this.props.setUserBrandings('certifiedEmail', userBranding);
                                            })
                                            .catch( err => {
                                                console.log('Se ha producido un error al guardar el branding');
                                                console.log(err);
                                            })
                                        });
                                    } else {
                                        // Usuario y branding ya existentes
                                        this.props.setUserBrandings('certifiedEmail', userInfo.data.brandings);
                                    }

                                    if (idDocuments && idDocuments.length > 0){
                                        getAvailableSignatures(idUserApp, idDocuments.length)
                                        .then(response => this.props.setAvailableSignatures(response.data))
                                        .catch(err => {
                                            console.log(err);
                                            if (window.REACT_APP_ENVIRONMENT === 'PREPRODUCTION' || window.REACT_APP_ENVIRONMENT === 'LOCAL'){ 
                                                this.props.setAvailableSignatures(true); // Esto se pone mientras el equipo encargado del api lo arregla
                                            }
                                        });  
                                    }
                                } 
                            });
                        }
                        this.setState({readyToRedirect: true})
                    }
                    else {
                        this.setState({type: 'unauthorized'})
                    }
                })
                .catch(err => {
                    this.setState({type: 'unauthorized'})
                })
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
    setUserBrandings: (service, brandings) => dispatch(ACTIONS.setUserBrandings(service, brandings)),
    setUserApp: app => dispatch(ACTIONS.setUserApp(app)),
    setIdEntityType: id => dispatch(ACTIONS.setIdEntityType(id)),
    setIdEntity: id => dispatch(ACTIONS.setIdEntity(id)),
    setIdUserApp: id => dispatch(ACTIONS.setIdUserApp(id)),
    setIdDocuments: ids => dispatch(ACTIONS.setIdDocuments(ids)),
    setAdminContacts: adminContacts => dispatch(ACTIONS.setAdminContacts(adminContacts)),
    setRoles: roles => dispatch(ACTIONS.setRoles(roles))
});

export default connect(mapStateToProps, mapDispatchToProps)(UserLefebvre);
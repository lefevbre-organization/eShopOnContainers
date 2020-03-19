import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import ACTIONS from "../../actions/lexon";
import { clearUserCredentials } from "../../actions/application";
import history from "../../routes/history";
import { PROVIDER } from "../../constants";
import { getUser } from '../../services/accounts';
import { removeState } from "../../services/state";
import * as base64 from 'base-64';
import { parseJwt, getUserId, getIdCasefile, getBbdd, getIdCompany, getMailContacts, getIdMail, getImapFolder } from "../../services/jwt";
import jwt from "njwt";

class UserLexon extends Component {
    constructor(props) {
        super(props);

        this.state = {
            readyToRedirect: false,
            readyToRedirectToLogin: false,
            isNewAccount: false
        };

        this.isUniqueAccountByProvider = this.isUniqueAccountByProvider.bind(this);
    }

    async componentDidMount() {
        const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        var parametros = undefined;

        if (this.props.location.search.indexOf("account=") > -1 || this.props.location.search.indexOf("prov=") > -1) {
            //const account64 = this.props.location.search.split("account=")[1];
            parametros = new URLSearchParams(this.props.location.search);
            if (parametros.get('account')) {
                // Get user account
                const account = base64.decode(parametros.get('account'));

                if (account) {
                    this.props.setAccount(account);
                }
            }
        }

        const payload = (this.props.match.params.token ? parseJwt(this.props.match.params.token) : undefined);
        //const user = (this.props.match.params.token ? `IM0${getUserId(payload)}` : this.props.match.params.idUser); 
        var user = (this.props.match.params.token ? getUserId(payload) : this.props.match.params.idUser);
        const casefile = (this.props.match.params.token ? getIdCasefile(payload) : this.props.match.params.idCaseFile);
        const bbdd = (this.props.match.params.token ? getBbdd(payload) : this.props.match.params.bbdd);
        const company = (this.props.match.params.token ? getIdCompany(payload) : this.props.match.params.idCompany);
        //const mailContacts = (this.props.match.params.token ? getMailContacts(payload) : this.props.match.params.mailContacts );
        var idMessage = (this.props.match.params.token ? getIdMail(payload) : this.props.match.params.idMessage);
        var idFolder = (this.props.match.params.token ? getImapFolder(payload) : this.props.match.params.idFolder);
        const mailContacts = (this.props.match.params.token ? getMailContacts(payload) : this.props.match.params.mailContacts);

        const claims = (this.props.match.params.token) ? { idClienteNavision: getUserId(payload) } : {}
        const portalToken = jwt.create(claims, 'top-secret-phrase');
        console.log("TOKEN: " + portalToken);

        if (this.props.location.search.indexOf("prov=") > -1) {
            console.log("Usuario antes ¿¿¿¿¿¿¿¿¿????????: " + user);
            user = `${parametros.get('prov')}${user}`;
            console.log("Usuario después ¿¿¿¿¿¿¿¿¿????????: " + user);
        }

        this.props.setUser(user);


        if (idMessage && base64regex.test(idMessage)) { idMessage = base64.decode(idMessage); }
        if (idFolder && base64regex.test(idFolder)) { idFolder = base64.decode(idFolder); }
        if (idFolder === null || idFolder === undefined || idFolder === "NULL") { idFolder = "INBOX"; }

        if (casefile) {
            this.props.setCaseFile({
                casefile: casefile,
                bbdd: bbdd,
                company: company
            });
        } else if (bbdd) {
            this.props.setDataBase({
                bbdd: bbdd
            });
        }
        if (idMessage) {
            this.props.setIdEmail({
                idEmail: idMessage,
                idFolder: idFolder,
                emailShown: false
            });
        }
        if (mailContacts) {
            console.log('Contactos recibidos');
            if (base64regex.test(mailContacts)) {
                this.props.setMailContacts(base64.decode(mailContacts));
            }
            else {
                this.props.setMailContacts(mailContacts);
            }
        }
        if (this.props.match.params.token) {
            this.props.setToken(portalToken.toString());
        }

        this.setState({ isNewAccount: user.slice(2, 3) === "1" ? true : false });

        // const isNewAccount = user.slice(2, 3) === "1" ? true : false;
        // if (!isNewAccount) {
        //   this.setState({
        //     readyToRedirect: true
        //   });
        // } else {
        //   this.setState({
        //     isNewAccount: true
        //   });
        // }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.lexon !== this.props.lexon) {
            if (this.props.lexon.isNewAccount) {
                removeState();
                this.setState({
                    readyToRedirect: true
                });
            } else {
                this.isUniqueAccountByProvider();
            }
        }
    }

    async isUniqueAccountByProvider() {
        const { lexon } = this.props;
        try {
            const result = getUser(lexon.userId)
            console.log("LEXON USER**************: " + lexon.userId)

            if (result.errors.length === 0) {
                const accountsByProvider = result.data.accounts.filter(
                    account => account.provider === PROVIDER
                );
                if (accountsByProvider.length > 1) {
                    this.setState({
                        readyToRedirectToLogin: true
                    });
                } else {
                    this.setState({
                        readyToRedirect: true
                    });
                }
            }
        } catch (err) {
            throw err
        }
    }

    render() {
        const {
            readyToRedirect,
            readyToRedirectToLogin,
            isNewAccount
        } = this.state;
        if (readyToRedirect) {
            return <Redirect to="/" />;
        }

        //if (isNewAccount || readyToRedirectToLogin) {
        //  //this.props.logout();
        //  return <Redirect to="/login" />;
        //}
        return <Redirect to="/" />;
        //return null;
    }
}

const mapStateToProps = state => ({
    lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
    setUser: user => dispatch(ACTIONS.setUser(user)),
    setAccount: account => dispatch(ACTIONS.setAccount(account)),
    setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile)),
    setDataBase: dataBase => dispatch(ACTIONS.setDataBase(dataBase)),
    setIdEmail: emailInfo => dispatch(ACTIONS.setIdEmail(emailInfo)),
    setMailContacts: mailContacts => dispatch(ACTIONS.setMailContacts(mailContacts)),
    logout: () => {
        dispatch(clearUserCredentials());
        history.push("/login");
    },
    setToken: token => dispatch(ACTIONS.setToken(token))
});

export default connect(mapStateToProps, mapDispatchToProps)(UserLexon);
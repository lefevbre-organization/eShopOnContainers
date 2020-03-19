import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import ACTIONS from "../../actions/lexon";
import { signOut } from "../../api_graph/authentication";
import { PROVIDER } from "../../constants";
import { getUserApplication } from '../../api_graph';
import { getUser } from "../../api_graph/accounts";
import * as base64 from 'base-64';
import { parseJwt, getUserId, getIdCasefile, getBbdd, getIdCompany, getMailContacts, getIdMail } from "../../utils/jwt";
import jwt from "njwt";

class UserLexon extends Component {
    constructor(props) {
        super(props);

        this.state = {
            readyToRedirect: false,
            redirectToEmail: this.props.match.params.idMail,
        };

        this.isUniqueAccountByProvider = this.isUniqueAccountByProvider.bind(this);
    }

    componentDidMount() {
        let parametros;
        const payload = (this.props.match.params.token ? parseJwt(this.props.match.params.token) : undefined);
        var user = (this.props.match.params.token ? getUserId(payload) : this.props.match.params.idUser);
        const casefile = (this.props.match.params.token ? getIdCasefile(payload) : this.props.match.params.idCaseFile);
        const bbdd = (this.props.match.params.token ? getBbdd(payload) : this.props.match.params.bbdd);
        const company = (this.props.match.params.token ? getIdCompany(payload) : this.props.match.params.idCompany);
        const mailContacts = (this.props.match.params.token ? getMailContacts(payload) : this.props.match.params.mailContacts);
        const idMail = (this.props.match.params.token ? getIdMail(payload) : this.props.match.params.idMail);

        const claims = (this.props.match.params.token) ? { idClienteNavision: getUserId(payload) } : user
        const portalToken = jwt.create(claims, 'top-secret-phrase');
        console.log("TOKEN: " + portalToken);

        if (this.props.location.search.indexOf("prov=") > -1) {
            parametros = new URLSearchParams(this.props.location.search);
            if (parametros.get('prov')) {
                user = `${parametros.get('prov')}${user}`;
            }
        }

        this.props.setUser(user);

        this.props.setCaseFile({
            casefile: casefile,
            bbdd: bbdd,
            company: company
        });

        if (mailContacts) {
            console.log('Contactos recibidos');
            const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
            if (base64regex.test(mailContacts)) {
                this.props.setMailContacts(base64.decode(mailContacts));
            }
            else {
                this.props.setMailContacts(mailContacts);
            }
        }

        if (idMail) {
            this.props.setIdMail(idMail);
        }

        if (this.props.match.params.token) {
            this.props.setToken(portalToken.toString());
        }
        // const isNewAccount = user.slice(2, 3) === "1" ? true : false;
        // this.checkIsAuthenticated();
        // if (isNewAccount) {
        //   this.setState({
        //     readyToRedirect: true
        //   });

        //   if (this.checkIsAuthenticated()) {
        //     this.onSignout();
        //   }
        // } else {
        //   this.setState({
        //     readyToRedirect: true
        //   });
        // }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.lexon !== this.props.lexon) {
            if (this.props.lexon.isNewAccount) {
                this.setState({
                    readyToRedirect: true
                });

                if (this.checkIsAuthenticated()) {
                    this.onSignout();
                }
            } else {
                this.isUniqueAccountByProvider();
            }
        }
    }

    checkIsAuthenticated() {
        this.userAgentApplication = getUserApplication();
        const user = this.userAgentApplication.getAccount();
        return user === null ? false : true;
    }

    isUniqueAccountByProvider = async () => {
        const { lexon } = this.props;

        try {
            const result = await getUser(lexon.userId);

            if (result.errors.length === 0) {
                const accountsByProvider = result.data.accounts.filter(
                    account => account.provider === PROVIDER
                );
                if (accountsByProvider.length > 1) {
                    if (this.checkIsAuthenticated()) {
                        // this.onSignout();
                    }
                }
                this.setState({
                    readyToRedirect: true
                });
            }
        } catch (err) {
            throw err;
        }
    };

    onSignout() {
        const user = this.props.match.params.idUser;
        const { token } = this.props.lexon;
        let urlBase = window.URL_MF_OUTLOOK.replace("/user", "");
        const urlRedirect = (token) ? `${urlBase}/access/${token}/?prov=OU0` : `${window.URL_MF_OUTLOOK}/${user}`;
        signOut(urlRedirect);
    }

    render() {
        const { readyToRedirect } = this.state;
        if (readyToRedirect) {
            if (this.props.lexon.idMail === undefined || this.props.lexon.idMail === null) {
                return <Redirect to="/" />;
            } else {
                return <Redirect to={`/message/${this.props.lexon.idMail}`} />;
            }
        }

        return null;
    }
}

const mapStateToProps = state => ({
    lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
    setUser: user => dispatch(ACTIONS.setUser(user)),
    setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile)),
    setMailContacts: mailContacts => dispatch(ACTIONS.setMailContacts(mailContacts)),
    setIdMail: idMail => dispatch(ACTIONS.setIdMail(idMail)),
    setToken: token => dispatch(ACTIONS.setToken(token))
});

export default connect(mapStateToProps, mapDispatchToProps)(UserLexon);

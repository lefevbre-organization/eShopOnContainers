import React, { Component } from "react";
import Spinner from "../components/spinner/spinner";
import ReactNotification, { store } from 'react-notifications-component';
import { getAccounts, deleteAccountByUserAndEmail } from "../services/user-accounts";
import SignaturitClient from 'signaturit-sdk';

//export const client = new SignaturitClient('dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy');

export class Signaturit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            accounts: [],
            userId: null,
            redirect: false,
            showConfirmRemoveAccount: false,
            emailRemoved: null,
            providedRemoved: null,
            token: props.match.params.token,
            signatures: ''
        };
        
    }

    componentDidMount() {
        const option = this.props.match.params.option;
        switch (option) {
            case 'getSignatures':
                this.getSignatures();
                break;
            case 'getSignature':
                this.getSignature(this.props.match.params.idSignature);
            case 'countSignatures':
                this.countSignatures();
            default:
                break;
        }
    }

    async getSignatures(){
        const client = new SignaturitClient('dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy');
        debugger;
        client.getSignatures()
        .then( response => {
            console.log(response);
            this.setState({signatures: response}); 
        });
    }

    async getSignature(id){
        const client = new SignaturitClient('dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy');
        debugger;
        client.getSignature(id)
        .then( response => {
            console.log(response);
            this.setState({signatures: response}); 
        });       
    }

    async getSignature(id){
        const client = new SignaturitClient('dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy');
        debugger;
        client.getSignature(id)
        .then( response => {
            console.log(response);
            this.setState({signatures: response}); 
        });       
    }

    async countSignatures(){
        const client = new SignaturitClient('dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy');
        debugger;
        client.countSignatures()
        .then( response => {
            console.log(response);
            this.setState({signatures: response}); 
        });       
    }


    renderSpinner() {
        const { loading } = this.state;

        if (loading) {
            return <Spinner />;
        }
    }

    render() {
        const { redirect, showConfirmRemoveAccount, emailRemoved, providerRemoved } = this.state;

        return (
            <React.Fragment>
                <ReactNotification />
                
                <div>
                    <pre>
                    {JSON.stringify(this.state.signatures, null, 2)}
                    </pre>
                    <div className="container-fluid d-flex h-100 flex-column" id="borrar">
                        
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Signaturit;

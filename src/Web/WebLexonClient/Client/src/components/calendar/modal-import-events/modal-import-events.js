import React, {Component, createRef, Fragment} from 'react';
import i18n from 'i18next';
import {Button, Modal} from 'react-bootstrap';
import {connect} from 'react-redux';

import {Step1} from './step1';
import {Step2} from './step2';
import {Step3} from './step3';
import {Step4} from './step4';
import ACTIONS from '../../../actions/documentsAction';
import 'react-perfect-scrollbar/dist/css/styles.css';
import Spinner from '../../spinner/spinner';
import {getCompanies} from "../../../services/services-lexon";

class ModalImportEvents extends Component {
    constructor() {
        super();

        this.state = {
            showSpinner: false,
            companies: [],
            progress: -1,
            step: 0,
            contacts: [],
            errors: [],
            numContacts: 0
        };

        this.progresRef = createRef();
        this.itv = null;

        this.setLoading = this.setLoading.bind(this);
        this.setProgress = this.setProgress.bind(this);
        this.onContacts = this.onContacts.bind(this);
        this.showErrors = this.showErrors.bind(this);
        this.uploadCompleted = this.uploadCompleted.bind(this);
    }

    componentDidMount() {
        this.setState({step: 1})

        this.getUserCompanies()
    }

    getUserCompanies() {
        const {user} = this.props;
        getCompanies({idUser: user}).then(({companies, errors}) => {
            if (errors.length === 0 && companies.length > 0) {
                this.setState({companies});
            }
        })
    }

    showErrors() {
        this.setState({step: 3});
    }

    closeDialog() {
        if (this.state.step === 2) {
            this.setState({step: 1})
            return;
        }
        this.props.toggleImportContacts && this.props.toggleImportContacts();
    }

    nextStep() {
    }

    prevStep() {
    }

    setLoading(loading) {
        this.setState({showSpinner: loading});
    }

    setProgress(progress) {
        this.setState({progress});
    }

    onContacts(contacts, errors) {
        this.setState({contacts: [...contacts], errors: [...errors], numContacts: contacts.length});
    }

    uploadCompleted() {
        if (this.state.errors.length > 0) {
            this.setState({step: 4})
        } else {
            this.setState({step: 1}, () => {
                this.closeDialog();
                this.props.toggleNotification(i18n.t('modal-import-contacts.ok'), false);
            });
        }
    }

    startImportProcess() {
        this.itv = setInterval( ()=> {
            this.setState( (state) => {
                if (state.progress >= 100) {
                    clearInterval(this.itv);
                    return {...state, progress: 100}
                } else {
                    return {...state, progress: state.progress + 10}
                }
            });
        }, 500);
    }

    renderButtons() {
        const {step, progress} = this.state;

        if (step === 1) {
            return (
                <div className="ie-buttonwrapper">
                    <Button
                        bsPrefix='btn btn-outline-primary'
                        onClick={() => {
                            this.setState({step: 1}, () => {
                                this.closeDialog();
                            });
                        }}>
                        {i18n.t('classify-emails.cancel')}
                    </Button>
                    <Button
                        disabled={this.state.showSpinner === true}
                        bsPrefix='btn btn-primary'
                        onClick={() => {
                            this.setState({step: 2, progress: 0}, ()=>{
                                this.startImportProcess();
                            });
                        }}>
                        {i18n.t('modal-import-contacts.import')}
                    </Button>
                </div>
            );
        }
        if (step === 2) {
            return (
                <div className="ie-buttonwrapper">
                    <Button
                        bsPrefix='btn btn-outline-primary'
                        onClick={() => {
                            this.setState({step: 1}, () => {
                                this.closeDialog();
                            });
                        }}>
                        {i18n.t('classify-emails.cancel')}
                    </Button>
                    <Button
                        disabled={progress < 100}
                        bsPrefix='btn btn-primary'
                        onClick={() => {
                            this.setState({step: 2});
                        }}>
                        FINALIZAR
                    </Button>
                </div>
            );
        }
    }

    renderContent() {
        const {step, companies, progress} = this.state;

        switch (step) {
            case 1:
                return <Step1 companies={companies}></Step1>;
            case 2:
                return <Step2 progress={progress}></Step2>;
            default:
                return null
        }
    }

    render() {
        return (
            <Fragment>
                <div className='modal-import-contacts'>
                    {this.renderContent()}
                    {this.renderButtons()}
                </div>
                <style jsx>{`
                  .btn-primary.disabled, .btn-primary:disabled {
                        color: #fff;
                        background-color: #d2d2d2;
                        border-color: #d2d2d2;
                    }    
                `}</style>
            </Fragment>
        );
    }
}

ModalImportEvents.propTypes = {};
const mapStateToProps = (state) => {
    return {
        showImportContacts: state.documentsReducer.showImportContacts,
        companySelected: state.selections.companySelected,
        selectedMessages: state.email.selectedMessages,
        user: state.selections.user
    };
};

const mapDispatchToProps = (dispatch) => ({
    toggleImportContacts: () => dispatch(ACTIONS.toggleModalImportContacts()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ModalImportEvents);

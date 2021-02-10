import React, {Component, createRef, Fragment} from 'react';
import i18n from 'i18next';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';

import {Step1} from './step1';
import {Step2} from './step2';
import {Step3} from './step3';
import ACTIONS from '../../../actions/documentsAction';
import 'react-perfect-scrollbar/dist/css/styles.css';
import {getCompanies, getEvents} from "../../../services/services-lexon";
import moment from "moment";

class ModalImportEvents extends Component {
    constructor() {
        super();

        this.state = {
            showSpinner: true,
            companies: [],
            progress: -1,
            step: 0,
            errors: [],
            numEvents: 0,
            selectedDatabase: '',
            selectedCalendar: '',
            selectedType: 0,
            eventsImported: 0,
            events: [],
            startDate: new Date(),
            endDate: new Date()
        };

        this.progresRef = createRef();
        this.step1Ref = createRef();
        this.itv = null;
        this.sended = [];

        this.setLoading = this.setLoading.bind(this);
        this.setProgress = this.setProgress.bind(this);
        this.showErrors = this.showErrors.bind(this);
        this.uploadCompleted = this.uploadCompleted.bind(this);
        this.exportEventsProgress = this.exportEventsProgress.bind(this);
    }

    componentDidMount() {
        this.setState({step: 1})

        this.getUserCompanies()
    }

    getUserCompanies() {
        const {user} = this.props;
        getCompanies({idUser: user}).then(({companies, errors}) => {
            if (errors.length === 0 && companies.length > 0) {
                this.setState({companies, showSpinner: false});
            }
        })
    }

    showErrors() {
        this.setState({step: 3});
    }

    closeDialog() {
        const buttons = document.getElementsByClassName("e-dlg-closeicon-btn");
        if(buttons && buttons.length > 0) {
            for(let i = 0;i < buttons.length; i++) {
                buttons[i].click();
            }
        }

        window.dispatchEvent(new CustomEvent('closeImportEventsDialog'));
    }

    nextStep() {
        if(this.state.step === 2) {
            this.setState({step: 3})
        }
    }

    prevStep() {
    }

    setLoading(loading) {
        this.setState({showSpinner: loading});
    }

    setProgress(progress) {
        this.setState({progress});
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

    async startImportProcess() {
        const { selectedCalendar, selectedDatabase, selectedType, startDate, endDate } = this.state;
        const { user } = this.props;
        let progress = 0;
        this.sended = [];

        let fromDate;
        let toDate;
        if(selectedType === 0) {
            fromDate = moment(startDate).format("YYYY-MM-DD");
            toDate = moment(endDate).format("YYYY-MM-DD");
        } else if(selectedType === 2) {
            toDate = moment().format("YYYY-MM-DD");
        }


        const events = await getEvents(selectedDatabase, user, fromDate, toDate);
        this.setState({ events: events, numEvents: events.length, progress }, async () => {
            window.addEventListener('ExportEventsProgress', this.exportEventsProgress)
            window.dispatchEvent( new CustomEvent('ExportEvents', { detail: { calendar: selectedCalendar, events }}));
        });
    }

    exportEventsProgress(event) {
        if(event.detail.completed) {
            window.removeEventListener('ExportEventsProgress', this.exportEventsProgress);
            this.setState({progress: 100, errors: event.detail.errors, eventsImported: event.detail.eventsImported, selectedDatabase: '', selectedCalendar: ''})
        } else {
            this.setState({progress: event.detail.progress, errors: event.detail.errors, eventsImported: event.detail.eventsImported})
        }
    }

    cancelImportProcess() {
        this.setState({progress: 0, errors: [], eventsImported: 0, selectedDatabase: '', selectedCalendar: ''}, ()=>{
            window.dispatchEvent(new CustomEvent('ExportEventsCancel'));
        })
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
                        disabled={this.state.showSpinner === true  || this.state.selectedCalendar === '' || this.state.selectedDatabase === ''}
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
        if (step > 1) {
            return (
                <div className="ie-buttonwrapper">
                    { progress < 100 &&
                        <Button
                            bsPrefix='btn btn-outline-primary'
                            onClick={() => {
                                this.setState({step: 1}, () => {
                                    this.cancelImportProcess();
                                    //this.closeDialog();
                                });
                            }}>
                            {i18n.t('classify-emails.cancel')}
                        </Button>
                    }
                    <Button
                        disabled={progress < 100}
                        bsPrefix='btn btn-primary'
                        onClick={() => {
                            this.closeDialog();
                        }}>
                        FINALIZAR
                    </Button>
                </div>
            );
        }
    }

    renderContent() {
        const {step, companies, progress, numEvents, errors, eventsImported} = this.state;
        const { calendars } = this.props;

        switch (step) {
            case 1:
                return <Step1 companies={companies} calendars={calendars}
                              onChangeDDBB={(ddbb)=>{
                                  this.setState({selectedDatabase: ddbb})
                              }}
                              onChangeCalendar={(cal)=>{
                                  this.setState({selectedCalendar: cal})
                              }}
                              onChangeType={(type) => {
                                  this.setState({selectedType: type})
                              }}
                              onChangeDates={(startDate, endDate) => {
                                  this.setState({startDate, endDate})
                              }}
                ></Step1>;
            case 2:
                return <Step2 progress={progress} numEvents={numEvents} imported={eventsImported} errors={errors} onViewReport={()=>{ this.nextStep(); } }></Step2>;
            case 3:
                return <Step3 errors={errors} imported={eventsImported}></Step3>;
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
        calendars: state.email.selectedMessages,
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

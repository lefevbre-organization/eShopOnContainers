import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import PropTypes from "prop-types";
import { AutoSizer, List } from "react-virtualized";
import Checkbox from "../form/checkbox/checkbox";
import Spinner from "../spinner/spinner";
import { getCredentials } from "../../selectors/application";
import { getSelectedFolder } from "../../selectors/folders";
import { getSelectedFolderMessageList } from "../../selectors/messages";
import { prettyDate } from "../../services/prettify";
import { selectSignature } from "../../actions/application";
import { readMessageRaw } from "../../services/message-read";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import mainCss from "../../styles/main.scss";
import styles from "./message-list.scss";
import { preloadSignatures, preloadSignatures2 } from "../../services/api-signaturit";
import { backendRequest, backendRequestCompleted } from '../../actions/application';


class MessageList extends Component {
    constructor(props) {
        super(props);
        console.log('Entra en message-list');
        this.state = {
            sign_ready: false,
            rowCount: 0
        }
    }

    getRowsCompleted() {
        let i = 0;
        const signatures = this.props.signatures;
        signatures.map(e => {
            e.documents.some(d => {
                if (d.status !== 'canceled' && d.status !== 'ready' && d.status !== 'declined' && d.status !== 'expired' && d.status === 'completed'){
                    i+=1;
                    return true;
                }
            })
        });
        return i;
    }

    getRowsInProgress(){
        let i = 0;
        const signatures = this.props.signatures;

        signatures.map(e => {
            e.documents.some(d => {
                if (d.status !== 'canceled' && d.status !== 'declined' && d.status !== 'expired' && d.status === 'ready'){
                    console.log('');
                    i+=1;
                    return true;
                }
            })
        });
        return i;
    }

    getCount(){
        var count = 0;
        if (this.props.signatureFilter === "Mostrar todas"){
            if (this.props.signatures && this.props.signatures !== null){
                return this.props.signatures.length;
            } else {
                return 0;
            }
            
        } else {
            if (this.props.signatures && this.props.signatures !== null){
                for (var i=0; i< this.props.signatures.length; i++){
                    if (this.props.signatures[i].status === 'completed' && this.props.signatureFilter === "Completadas") {
                        count++;
                    } else if (this.props.signatures[i].status === 'ready' && this.props.signatureFilter === "En progreso"){
                        count++;
                    } else if (this.props.signatures[i].status === 'completed' && this.signatureFilter === 'Completadas'){
                        count++;
                    } else if ((this.props.signatures[i].status === 'canceled' || this.props.signatures[i].status === 'declined' || this.props.signatures[i].status === 'expired') && this.props.signatureFilter === 'Canceladas'){
                        count++;
                    }
                }
            }
            
            console.log('Contador de filas:' + count);
            return count;    
        }
    }

    render() {
        console.log('Entra en message-list: render');
        console.log('State rowCount(): ' + this.state.rowCount);
        console.log('ActiveRequests:' + this.props.activeRequests);

        return (
            <div className={`${styles.messageList} ${this.props.className}`}>
                <Spinner
                    visible={
                        this.props.activeRequests > 0 //|| this.state.rowCount === 0
                    }
                />
                {(this.state.rowCount === 0) ? <center><h3>No tiene firmas que mostrar</h3></center> : null }
                
                { !(this.state.sign_ready) ? null : (
                    <Fragment>
                        <PerfectScrollbar>
                            <ul className={`${mainCss["mdc-list"]} ${styles.list}`}>
                                <AutoSizer defaultHeight={100}>
                                    {({ height, width }) => (
                                        <List
                                            className={styles.virtualList}
                                            height={height}
                                            width={width}
                                            rowRenderer={this.renderItem.bind(this)}
                                            //rowCount={this.props.messages.length}
                                            //rowCount={(this.props.signatureFilter === "Mostrar todas") ? this.props.signatures.length : ((this.props.signatureFilter === "Completadas") ? this.getRowsCompleted() : ((this.props.signatureFilter==='En Progreso') ? this.getRowsInProgress() : this.props.signatures.length)) }
                                            //rowCount = { this.state.rowCount}
                                            //rowCount = {this.props.signatures.length}
                                            rowCount = {this.getCount()}
                                            rowHeight={52}
                                        />
                                    )}
                                </AutoSizer>
                            </ul>
                        </PerfectScrollbar>
                    </Fragment>
                )}
                {this.props.activeRequests > 0 && this.props.messages.length > 0 
                    ? (
                        <Spinner
                            className={styles.listSpinner}
                            canvasClassName={styles.listSpinnerCanvas}
                        />
                        ) 
                    : null
                }
            </div>
        );
    }

    componentDidMount() {
        const { lefebvre } = this.props;
        console.log('******************************');
        console.log('******************************');
        console.log('******************************');
        console.log('');
        console.log('Message-list.ComponentDidMount: Llamando a preloadSignatures(lefebvre.userId)');
        console.log('******************************');
        console.log('******************************');
        console.log('******************************');
        console.log('');
    
        this.props.preloadSignatures(lefebvre.userId);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.sign_ready === false){
            if (this.props.signatures && this.props.signatures.length){
                this.setState({sign_ready: true, rowCount: this.getCount()});
            }
        }
    }


    renderItem({ index, key, style }) {
        let status;
        let coloredStatus;
        let filteredSignatures = [];
        var signatures = this.props.signatures.map( sig => {
            if ((sig.status === 'En progreso' || sig.status === 'ready') && (this.props.signatureFilter === "En progreso")){
                filteredSignatures.push(sig);
            } else if ((sig.status === 'Completadas' || sig.status === 'completed') && (this.props.signatureFilter === "Completadas")){
                filteredSignatures.push(sig);
            } else if ((sig.status === 'Canceladas' || sig.status === 'canceled' || sig.status === 'expired' || sig.status ==='declined') && (this.props.signatureFilter === 'Canceladas')) {
                filteredSignatures.push(sig);    
            } else if (this.props.signatureFilter === "Mostrar todas") {
                filteredSignatures.push(sig);
            }
        });
        const signature = filteredSignatures[index];
       
        
        switch (signature.status) {
            case 'canceled':
                coloredStatus = <font color="#c43333">Cancelado</font>
                status = 'Cancelado';
                break;
            case 'declined':
                coloredStatus = <font color="#c43333">Declinado</font>
                status = 'Declinado';
                break;
            case 'expired':
                coloredStatus = <font color="#c43333">Expirado</font>
                status = 'Expirado';
                break;               
            case 'En progreso':
            case 'ready':
                coloredStatus = <font color="#001978">En progreso</font>
                status = 'En progreso';
                break;
            case 'Completadas':
            case 'completed':
                coloredStatus = <font color="#1fb53a">Completada</font>
                status = 'Completadas';
                break;
            default:
                break;
        }
 
        console.log('renderItem State rowCount():' + this.state.rowCount + ' this.props.signatureFilter: ' + this.props.signatureFilter + ' signature.status: ' + status);

        console.log('Index: ' + index + ' Status: '+ status);
        console.log(this.props.signatureFilter === status)
            return (
                <li
                key={key + filteredSignatures[index].id}
                style={style}
                draggable={false}
                //onDragStart={event => this.onDragStart(event, folder, message)}
                className={`${mainCss["mdc-list-item"]}
                ${styles.item}
                ${""}
                ${""}`}
                >
                <Checkbox
                    id={filteredSignatures[index].id}
                    //onChange={event => this.selectSignature(event, signature)}
                    checked={false}
                />
                <span
                    className={styles.itemDetails}
                    onClick={() => this.props.signatureClicked(signature)}
                    draggable={true}
                >                    
                    <span className={styles.from}>
                        Doc: {signature.documents[0].file.name}
                    </span>
                    <span className={styles.subject}> 
                        Asunto: {(signature.data.find(x => x.key === "subject")) ? signature.data.find(x => x.key === "subject").value : null} 
                    </span>
                    <span className={styles.size}>Sent to: {signature.documents.length} recipients</span>
                    <span className={styles.size}>
                        Status: {coloredStatus}
                        </span>
                    <span className={styles.receivedDate}>{prettyDate(signature.created_at)}</span>
                </span>
            </li>
            );
    }

    /**
     * Select/unselects the message for which the checkbox is changed.
     *
     * If the shift key is pressed, and it's a select operation, a range of messages will be selected. The range will be
     * the one consisting in the last selected message and the current message in any direction.
     *
     * @param event
     * @param signature
     */
    selectSignature(event, message) {
        event.stopPropagation();
        const checked = event.target.checked;
        if (
            checked &&
            event.nativeEvent &&
            event.nativeEvent.shiftKey &&
            this.props.selectedMessages.length > 0
        ) {
            // Range selection
            const messagesToSelect = [];
            const lastSelectedMessageUid = this.props.selectedMessages[
                this.props.selectedMessages.length - 1
            ];
            let selecting = false;
            this.props.messages.forEach(m => {
                if (m.messageId === message.messageId || m.messageId === lastSelectedMessageUid) {
                    selecting = !selecting;
                    messagesToSelect.push(m);
                } else if (selecting) {
                    messagesToSelect.push(m);
                }
            });
            this.props.messageSelected(messagesToSelect, checked, this.props.selectedFolder.fullName);

            if (checked === true) {
                window.dispatchEvent(new CustomEvent("LoadingMessage"))
            }

            const prs = [];
            for (let i = 0; i < messagesToSelect.length; i++) {
                const message = messagesToSelect[i];
                if (checked === true) {
                    prs.push(readMessageRaw(null, this.props.credentials, null, this.props.selectedFolder, message))
                } else {
                    window.dispatchEvent(
                        new CustomEvent("Checkclick", {
                            detail: {
                                id: message.messageId,
                                extMessageId: message.messageId,
                                subject: message.subject,
                                sentDateTime: message.receivedDate,
                                chkselected: checked,
                                account: this.props.all.login.formValues.user,
                                folder: this.props.selectedFolder.fullName,
                                provider: "IMAP",
                                raw: null
                            }
                        })
                    )
                }
            }

            if (checked === true) {
                Promise.all(prs).then((msgs) => {
                    for (let i = 0; i < msgs.length; i++) {
                        const msg = msgs[i];
                        window.dispatchEvent(
                            new CustomEvent("Checkclick", {
                                detail: {
                                    id: msg.message.messageId,
                                    extMessageId: msg.message.messageId,
                                    subject: msg.message.subject,
                                    sentDateTime: msg.message.receivedDate,
                                    chkselected: checked,
                                    account: this.props.all.login.formValues.user,
                                    folder: this.props.selectedFolder.fullName,
                                    provider: "IMAP",
                                    raw: msg.raw
                                }
                            })
                        );
                    }
                    window.dispatchEvent(new CustomEvent("LoadedMessage"))
                });
            }
        } else {
            // Single selection
            this.props.messageSelected([message], checked, this.props.selectedFolder.fullName);

            if (checked === true) {
                window.dispatchEvent(new CustomEvent("LoadingMessage"))
                const rm = readMessageRaw(null, this.props.credentials, null, this.props.selectedFolder, message).then((response) => {
                    console.log("IdMessage seleccionado: " + message.messageId + "  Folder: " + this.props.selectedFolder.fullName);
                    // Send message to connectors
                    window.dispatchEvent(
                        new CustomEvent("Checkclick", {
                            detail: {
                                id: message.messageId,
                                extMessageId: message.messageId,
                                subject: message.subject,
                                sentDateTime: message.receivedDate,
                                chkselected: checked,
                                account: this.props.all.login.formValues.user,
                                folder: this.props.selectedFolder.fullName,
                                provider: "IMAP",
                                raw: response
                            }
                        })
                    );
                    window.dispatchEvent(new CustomEvent("LoadedMessage"))
                })
            } else {
                console.log("IdMessage seleccionado: " + message.messageId + "  Folder: " + this.props.selectedFolder.fullName);
                window.dispatchEvent(
                    new CustomEvent("Checkclick", {
                        detail: {
                            id: message.messageId,
                            extMessageId: message.messageId,
                            subject: message.subject,
                            sentDateTime: message.receivedDate,
                            chkselected: checked,
                            account: this.props.all.login.formValues.user,
                            folder: this.props.selectedFolder.fullName,
                            provider: "IMAP",
                            raw: null
                        }
                    })
                );
            }
        }
    }
}

MessageList.propTypes = {
    className: PropTypes.string,
    selectedMessages: PropTypes.array
};

MessageList.defaultProps = {
    className: "",
    selectedMessages: []
};

const mapStateToProps = state => ({
    credentials: getCredentials(state),
    selectedFolder: getSelectedFolder(state) || {},
    activeRequests: state.messages.activeRequests,
    messages: getSelectedFolderMessageList(state),
    selectedMessages: state.messages.selected,
    downloadedMessages: state.application.downloadedMessages,
    signatures: state.application.signatures,
    signatureFilter: state.application.signaturesFilterKey,
    lefebvre: state.lefebvre,
    all: state
});

const mapDispatchToProps = dispatch => ({
    preloadSignatures: (filter, auth) => preloadSignatures2(dispatch, filter, auth),
    signatureClicked: signature => {
        dispatch(selectSignature(signature));
    },
    backendRequest: () => dispatch(backendRequest()),
    backendRequestCompleted: () => dispatch(backendRequestCompleted())
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
    Object.assign({}, stateProps, dispatchProps, ownProps, {
        preloadSignatures: filter => dispatchProps.preloadSignatures(filter, stateProps.credentials.encrypted),
        signatureClicked: signature => dispatchProps.signatureClicked(signature),
        backendRequest: () => dispatchProps.backendRequest(),
        backendRequestCompleted: () => dispatchProps.backendRequestCompleted()
    });

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(translate()(MessageList));
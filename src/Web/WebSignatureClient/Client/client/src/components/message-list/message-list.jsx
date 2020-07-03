import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import PropTypes from "prop-types";
import { AutoSizer, List, Grid } from "react-virtualized";
import Checkbox from "../form/checkbox/checkbox";
import Spinner from "../spinner/spinner";
import { getCredentials } from "../../selectors/application";
import { getSelectedFolder } from "../../selectors/folders";
import { getSelectedFolderMessageList } from "../../selectors/messages";
import { prettyDate } from "../../services/prettify";
import { selectSignature, setTitle } from "../../actions/application";
import { readMessageRaw } from "../../services/message-read";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import mainCss from "../../styles/main.scss";
import styles from "./message-list.scss";
import { preloadSignatures, preloadSignatures2 } from "../../services/api-signaturit";
import { backendRequest, backendRequestCompleted } from '../../actions/application';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Inject, Resize, Filter, DetailRow, Sort, Group, Toolbar, PdfExport, ExcelExport} from '@syncfusion/ej2-react-grids';
import data from './dataSource.json';
import materialize from '../../styles/signature/materialize.scss';
import { L10n } from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';

L10n.load({
    'es-ES': {
      'grid': {
        'EmptyRecord': 'No hay datos que mostrar',
        'StartsWith': 'Empieza por',
        'EndsWith': 'Termina por',
        'Contains': 'Contiene',
        'Equal': 'Es igual a',
        'NotEqual': 'No es igual a',
        'Search': 'Buscar',
        'PdfExport': 'Exportar a pdf'
      }
    }
  });

class MessageList extends Component {
    constructor(props) {
        super(props);
        console.log('Entra en message-list');
        this.state = {
            sign_ready: false,
            rowCount: 0
        }
        this.template = this.gridTemplate;
        this.menuTemplate = this.menuGridTemplate;
        this.statusTemplate = this.statusGridTemplate;
        this.recipientsTable = this.recipientsGridTemplate;
        this.filterType = [
            { text: 'Menu', value: 'Menu' },
            { text: 'Checkbox', value: 'CheckBox' },
            { text: 'Excel', value: 'Excel' },
        ];
        this.filterSettings = { 
            type: 'Menu', 
            ignoreAccent:true, 
            operators: {
                stringOperator: [
                    { value: 'contains', text: 'Contiene' },
                    { value: 'startsWith', text: 'Empieza por' }
                ]
             } 
        };
        this.fields = { text: 'texto', value: 'valor' };
        this.toolbarOptions = ['Search', 'PdfExport'];
        this.grid = null;
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

    getSigners(signature){
        var lookup = {};
        var items = signature.documents;
        var result = [];
    
        for (var item, i = 0; item = items[i++];) {
          var name = item.email;
    
          if (!(name in lookup)) {
            lookup[name] = 1;
            result.push(name);
          }
        }
        return result;
      }

    getSignatures(signatures){
        let filteredSignatures = [];
        signatures.map( sig => {
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
        

        let res = [];
        console.log(signatures);
        filteredSignatures.map(signature => {
            let documentName = '';
            let subject = '';
            let recipients = '';
            let date = '';
            let status = '';

            documentName = signature.documents[0].file.name
            subject = (signature.data.find(x => x.key === "subject")) ? signature.data.find(x => x.key === "subject").value : 'Sin asunto';
            recipients = `${signature.documents[0].email} ${this.getSigners(signature).length}`;
            //date = signature.created_at//.split('T')[0];//prettyDate(signature.created_at);
            date = new Date(signature.created_at).toLocaleString(navigator.language, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
            status = signature.documents[signature.documents.length-1].status;
            res.push({Id: signature.id, Documento: documentName, Asunto: subject, Destinatarios: recipients, Fecha: date, Estado: status});
        });
        return res;
    }

    gridTemplate(props) {
        
        // //var src = 'src/grid/images/' + props.EmployeeID + '.png';
        return (
            <tr className={`templateRow`}>
                <td className="optionMenu">
                    <i className="material-icons">more_vert</i>
                </td>
                <td className={`${styles['resumen-firma']} documentName`}>
                    {props.Documento}
                </td>
                <td className="subject">
                    {props.Asunto}
                </td>
                <td className="recipients">
                    {props.Destinatarios}
                </td>
                <td className="date">
                    {props.Fecha}
                </td>
                <td className="status">
                    {props.Estado}
                </td>
            </tr>
        );

    }

    menuGridTemplate(props){
        return (
            <span>
                {/* <i className="material-icons">more_vert</i> */}
                <span className="lf-icon-filter-1"></span>
            </span>
        );
    }

    recipientsGridTemplate(props){
        var chunks = props.Destinatarios.split(' ');
        let recipientsClass;
        switch (props.Estado) {
            case 'canceled':
            case 'declined':
            case 'expired':
                recipientsClass = 'cancelada';
                break;           
            case 'En progreso':
            case 'ready':
                recipientsClass = 'en-progreso';
                break;
            case 'Completadas':
            case 'completed':
                recipientsClass = 'completada';
                break;
            default:
                break;
        }
        console.log(props);
        return (
            <div>
                <span className='email'>
                    {chunks[0].length > 22 ? chunks[0].substring(0,20)+' . . .' : chunks[0]}
                </span>
                <span className={`bola-firmantes ${recipientsClass}`}>
                    {chunks[1]}
                </span>
            </div>
        )
    }

    statusGridTemplate(props){
        let status;
        let status_style;


        switch (props.Estado) {
        case 'canceled':
            status = 'Cancelado';
            status_style = 'cancelada';
            break;
        case 'declined':
            status = 'Declinado';
            status_style = 'cancelada';
            break;
        case 'expired':
            status = 'Expirado';
            status_style = 'cancelada';
            break;      
        case 'completed':
            status = 'Completado';
            status_style = 'completada'
            break;
        case 'ready':
            status = 'En progreso';
            status_style = 'en-progreso'
            break;
        default:
            break;
        }
        return (
            <span className={`resumen-firma ' ${status_style}`}><b>{status}</b></span>
        )
    }

    onRowSelected(event) {
        console.log(event);
        var signature = this.props.signatures.find(s => s.id === event.data.Id);
        this.props.setTitle('PROGRESO DE FIRMA');
        this.props.signatureClicked(signature);
        // this.setState(
        //   { rowSelected: event.data.idRelated + '_' + event.data.idType },
        //   () => {
        //     this.props.onSelectedEntity &&
        //       this.props.onSelectedEntity({
        //         ...event.data,
        //         id: event.data.idRelated
        //       });
        //     this.gridRef && this.gridRef.refresh();
        //   }
        // );
      }

    toolbarClick(event){
        if (this.grid && event.item.id.includes('pdfexport') ) {
            let pdfdata = [];
            const query = this.grid.renderModule.data.generateQuery(); // get grid corresponding query
            for(let i=0; i<query.queries.length; i++ ){
              if(query.queries[i].fn === 'onPage'){
                query.queries.splice(i,1);// remove page query to get all records
                break;
              }
            }
            new DataManager({ json: this.grid.currentViewData}).executeQuery(query)
              .then((e) => {
                pdfdata = e.result;   // get all filtered records
                const exportProperties= {
                  dataSource: pdfdata,
                  pageOrientation: 'Landscape'
                };
                if (this.grid) {
                  this.grid.pdfExport(exportProperties);
                }
            }).catch((e) => true);
          }
    }

    render() {
        this.toolbarClick = this.toolbarClick.bind(this);
        //var firmas = this.props.signatures;
        var firmas = (this.props.signatures && this.props.signatures.length > 0) ? this.getSignatures(this.props.signatures): [];
        var customAttributes = {class: 'customcss'};
        // console.log('Entra en message-list: render');
        // console.log('State rowCount(): ' + this.state.rowCount);
        // console.log('ActiveRequests:' + this.props.activeRequests);

        // return (
        //     <div className={`${styles.messageList} ${this.props.className}`}>
        //         <Spinner
        //             visible={
        //                 this.props.activeRequests > 0 //|| this.state.rowCount === 0
        //             }
        //         />
        //         {(this.state.rowCount === 0) ? <center><h3>No tiene firmas que mostrar</h3></center> : null }
                
        //         { !(this.state.sign_ready) ? null : (
        //             <Fragment>
        //                 <PerfectScrollbar>
        //                     <ul className={`${mainCss["mdc-list"]} ${styles.list}`}>
        //                         <AutoSizer defaultHeight={100}>
        //                             {({ height, width }) => (
        //                                 <List
        //                                     className={styles.virtualList}
        //                                     height={height}
        //                                     width={width}
        //                                     rowRenderer={this.renderItem.bind(this)}
        //                                     //rowCount={this.props.messages.length}
        //                                     //rowCount={(this.props.signatureFilter === "Mostrar todas") ? this.props.signatures.length : ((this.props.signatureFilter === "Completadas") ? this.getRowsCompleted() : ((this.props.signatureFilter==='En Progreso') ? this.getRowsInProgress() : this.props.signatures.length)) }
        //                                     //rowCount = { this.state.rowCount}
        //                                     //rowCount = {this.props.signatures.length}
        //                                     rowCount = {this.getCount()}
        //                                     rowHeight={52}
        //                                 />
        //                             )}
        //                         </AutoSizer>
        //                     </ul>
        //                 </PerfectScrollbar>
        //             </Fragment>
        //         )}
        //         {this.props.activeRequests > 0 && this.props.messages.length > 0 
        //             ? (
        //                 <Spinner
        //                     className={styles.listSpinner}
        //                     canvasClassName={styles.listSpinnerCanvas}
        //                 />
        //                 ) 
        //             : null
        //         }
        //     </div>
        // );

        return( (firmas && firmas.length > 0) ?
            <div>
            <div>
                <GridComponent 
                    dataSource={firmas}
                    allowSorting={true}
                    allowResizing={true} 
                    allowFiltering={true} 
                    allowGrouping={false}
                    allowPaging={(firmas.length > 10 ? true : false)} 
                    allowPdfExport={true}
                    allowExcelExport={true}
                    allowTextWrap={false}
                    height='auto'
                    pageSettings={{pageCount: 5, pageSize: 10, pageSizeList: [8,12,9,5]}} 
                    rowSelected={event => {
                        this.onRowSelected(event);
                    }}
                    filterSettings={this.filterSettings}
                    toolbar={this.toolbarOptions} 
                    locale ='es-ES'
                    toolbarClick={this.toolbarClick}
                    ref={g => this.grid = g}
                >
                    <ColumnsDirective>
                        <ColumnDirective textAlign='center' headerText='Acciones' template={this.menuTemplate.bind(this)}  width='55' />
                        <ColumnDirective field='Documento' textAlign='Left' headerText='Documento' />
                        <ColumnDirective field='Asunto' textAlign='Left' headerText='Asunto' />
                        <ColumnDirective field='Destinatarios' textAlign='Left' headerText='Destinatarios' width= '147' template={this.recipientsTable.bind(this)}/>
                        <ColumnDirective field='Fecha' textAlign='Left' headerText='Fecha' width='115'/>
                        <ColumnDirective field='Estado' textAlign='Left' headerText='Estado' width='110' allowFiltering={false} template={this.statusTemplate.bind(this)} />
                    </ColumnsDirective>
                    <Inject services={[Filter, Page, Resize, Sort, Toolbar, PdfExport]}/>
                    {/* <Inject services={[Resize]}/> */}
                </GridComponent>
            </div>
            <style jsx global>
                {`
                    .e-headercell{
                        background-color: #001978 !important;
                        color: white;  
                    }
                    .bola-firmantes.en-progreso{
                        border-radius: 20px;
                        color: #FFF;
                        padding: 3px 15px;
                        cursor: pointer;
                        background: #e9a128;
                    }
                    .bola-firmantes.completada{
                        border-radius: 20px;
                        color: #FFF;
                        padding: 3px 15px;
                        cursor: pointer;
                        background: #217e05;
                    }
                    .bola-firmantes.cancelada{
                        border-radius: 20px;
                        color: #FFF;
                        padding: 3px 15px;
                        cursor: pointer;
                        background: #c90223;
                    }
                    .e-pager .e-currentitem, .e-pager .e-currentitem:hover {
                        background: #001970;
                        color: #fff;
                        opacity: 1;
                    }
                    .e-grid .e-gridheader .e-icons:not(.e-icon-hide):not(.e-check):not(.e-stop) {
                        color: #fff;
                    
                    }
                    .resumen-firma.en-progreso {
                        color: #e9a128;
                    }
                    .resumen-firma.completada {
                        color: #217e05;
                    }
                    .resumen-firma.cancelada {
                        color: #c90223;
                    }
                `}
                </style>
            </div>
            : null
        )
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
    preloadSignatures: (filter, auth) => preloadSignatures(dispatch, filter, auth),
    signatureClicked: signature => {
        dispatch(selectSignature(signature));
    },
    backendRequest: () => dispatch(backendRequest()),
    backendRequestCompleted: () => dispatch(backendRequestCompleted()),
    setTitle: (title) => dispatch(setTitle(title))
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
    Object.assign({}, stateProps, dispatchProps, ownProps, {
        preloadSignatures: filter => dispatchProps.preloadSignatures(filter, stateProps.credentials.encrypted),
        signatureClicked: signature => dispatchProps.signatureClicked(signature),
        backendRequest: () => dispatchProps.backendRequest(),
        backendRequestCompleted: () => dispatchProps.backendRequestCompleted(),
        setTitle: title => dispatchProps.setTitle(title)
    });

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(translate()(MessageList));
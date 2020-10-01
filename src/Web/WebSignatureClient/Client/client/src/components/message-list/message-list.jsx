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
import { preloadSignatures, preloadSignatures2, cancelSignature2 } from "../../services/api-signaturit";
import { backendRequest, backendRequestCompleted } from '../../actions/application';
import { 
  GridComponent, 
  ColumnsDirective, 
  ColumnDirective, 
  Page, 
  Inject, 
  Resize, 
  Filter,  
  DetailRow, 
  Sort, 
  Group, 
  Toolbar, 
  PdfExport, 
  ExcelExport 
} from '@syncfusion/ej2-react-grids';
import materialize from '../../styles/signature/materialize.scss';
import { CalendarComponent} from '@syncfusion/ej2-react-calendars';
import { loadCldr, setCulture, L10n } from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';
import { detailedDiff } from 'deep-object-diff';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import i18n from 'i18next';

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
        'Pdfexport': 'Exportar a PDF',
        'Excelexport': 'Exportar a EXCEL',
        'Print': 'Imprimir',
        'FilterButton': 'Filtrar',
        'ClearButton': 'Borrar',
        'EnterValue': 'Introduzca el valor',
        'ChooseDate': 'Introduzca la fecha',
        'SelectAll': 'Seleccionar todo'
      },
      'pager': {
        'pagerDropDown': 'Registros por página',
        'pagerAllDropDown': 'Registros',
        'totalItemsInfo': '({0} registros)',
        'currentPageInfo': 'Página {0} de {1}',
        'All': 'Todo',
        'firstPageTooltip': 'Ir a la primera página',
        'lastPageTooltip': 'Ir a la última página',
        'nextPageTooltip': 'Ir a siguiente página',
        'previousPageTooltip': 'Ir a página previa'
      },
      'datepicker': {
        'today': "Hoy"
      }
    },
    'es': {
        'grid': {
          'EmptyRecord': 'No hay datos que mostrar',
          'StartsWith': 'Empieza por',
          'EndsWith': 'Termina por',
          'Contains': 'Contiene',
          'Equal': 'Es igual a',
          'NotEqual': 'No es igual a',
          'Search': 'Buscar',
          'Pdfexport': 'Exportar a PDF',
          'Excelexport': 'Exportar a EXCEL',
          'Print': 'Imprimir',
          'FilterButton': 'Filtrar',
          'ClearButton': 'Borrar',
          'EnterValue': 'Introduzca el valor',
          'ChooseDate': 'Introduzca la fecha',
          'SelectAll': 'Seleccionar todo'
        },
        'pager': {
          'pagerDropDown': 'Registros por página',
          'pagerAllDropDown': 'Registros',
          'totalItemsInfo': '({0} ítems)',
          'currentPageInfo': 'Página {0} de {1}',
          'All': 'Todo',
          'firstPageTooltip': 'Ir a la primera página',
          'lastPageTooltip': 'Ir a la última página',
          'nextPageTooltip': 'Ir a siguiente página',
          'previousPageTooltip': 'Ir a página previa'
        },
        'datepicker': {
          'today': "Hoy"
        }
      },
    'en': {
        'grid': {
          'EmptyRecord': 'No records to show',
          'StartsWith': 'Starts with',
          'EndsWith': 'Ends with',
          'Contains': 'Contains',
          'Equal': 'Equal to',
          'NotEqual': 'Not equal to',
          'Search': 'Search',
          'Pdfexport': 'PDF',
          'Excelexport': 'EXCEL',
          'Print': 'Print',
          'EnterValue': 'Enter the value',
          'FilterButton': 'Filter',
          'ClearButton': 'Clear',
          'SelectAll': 'Select all'
        },
        'pager': {
          'pagerDropDown': 'Items per page',
          'pagerAllDropDown': 'Items',
          'totalItemsInfo': '({0} total items)',
          'currentPageInfo': 'Page {0} out of {1}',
          'All': 'All',
          'firstPageTooltip': 'Go to first page',
          'lastPageTooltip': 'Go to last page',
          'nextPageTooltip': 'Go to next page',
          'previousPageTooltip': 'Go to previous page'
          },
        'datepicker': {
         'today': "Today"
        }        
    },
    'fr': {
        'grid': {
            'EmptyRecord': 'Pas de registres á montrer',
            'StartsWith': 'Commence par',
            'EndsWith': 'Finit par',
            'Contains': 'Contient',
            'Equal': 'Equal to',
            'NotEqual': 'Not equal to',
            'Search': 'Chercher',
            'Pdfexport': 'PDF',
            'Excelexport': 'EXCEL',
            'Print': 'Printer',
            'EnterValue': 'Entrez la valeur',
            'FilterButton': 'Filtre',
            'ClearButton': 'Emprunter',
            'SelectAll': 'Tout'
          },
          'pager': {
            'pagerDropDown': 'Registres par page',
            'pagerAllDropDown': 'Items',
            'totalItemsInfo': '({0} total items)',
            'currentPageInfo': 'Page {0} out of {1}',
            'All': 'Tout',
            'firstPageTooltip': 'Aller à la première page',
            'lastPageTooltip': 'Aller à la dernière page',
            'nextPageTooltip': 'Aller à la page suivante',
            'previousPageTooltip': 'Aller à la page précédente'
          },
          'datepicker': {
            'today': "Aujourd'hui"
          }     
    }
  });
  
class MessageList extends Component {
    constructor(props) {
        super(props);
        console.log('Entra en message-list');
        this.state = {
            sign_ready: false,
            rowCount: 0,
            hideAlertDialog: false,
            hideConfirmDialog: false,
            //hideGuidNotFoundDialog: (props.guidNotFound !== undefined) ? props.guidNotFound : false,
            signatureId: '',
            auth: ''
        }
        this.template = this.gridTemplate;
        this.menuTemplate = this.menuGridTemplate.bind(this);
        this.statusTemplate = this.statusGridTemplate;
        this.recipientsTable = this.recipientsGridTemplate;
        this.menuOptionSelected = this.dropDownOptionSelected;
        this.recipientRender = this.dropDownRecipientRender;
        this.filterType = [
            { text: 'Menu', value: 'Menu' },
            { text: 'Checkbox', value: 'CheckBox' },
            { text: 'Excel', value: 'Excel' },
        ];
        
        this.fields = { text: 'texto', value: 'valor' };
        this.toolbarOptions = ['Search', 'Print', 'PdfExport', 'ExcelExport' ];
        this.grid = null;
        this.dialogClose = this.dialogClose.bind(this);
        this.dialogOpen = this.dialogOpen.bind(this);
        this.toolbarClick = this.toolbarClick.bind(this);
        //Sin firmas 
        this.animationSettings = { effect: 'None' };
        // this.alertButtonRef = element => {
        //   this.alertButtonEle = element;
        // };
        this.alertButtons = [{
            // Click the footer buttons to hide the Dialog
            click: () => {
                this.setState({ hideAlertDialog: false });
            },
            buttonModel: { content: 'Aceptar', isPrimary: true }
        }];
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
                    } else if ((this.props.signatures[i].status === 'canceled' || this.props.signatures[i].status === 'declined' || this.props.signatures[i].status === 'expired' || this.props.signatures[i].status === 'error') && this.props.signatureFilter === 'Canceladas'){
                        count++;
                    }
                }
            }
            
            console.log('Contador de filas:' + count);
            return count;    
        }
    }

    getSignersInfo(signature){
        var result = []

        signature.documents.map(d => {
            if (result.filter(e => e.name === d.name && e.email === d.email).length === 0){
                result.push({name: d.name, email: d.email})
            }
        });
        return result;
    }

    getSignersEmails(signature){
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

    getSignersNames(signature){
        var lookup = {};
        var items = signature.documents;
        var result = [];
    
        for (var item, i = 0; item = items[i++];) {
          var name = item.name;
    
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
            if ((sig.status === 'En progreso' || sig.status === 'ready' || sig.status === 'pending') && (this.props.signatureFilter === "En progreso")){
                filteredSignatures.push(sig);
            } else if ((sig.status === 'Completadas' || sig.status === 'completed') && (this.props.signatureFilter === "Completadas")){
                filteredSignatures.push(sig);
            } else if ((sig.status === 'Canceladas' || sig.status === 'canceled' || sig.status === 'expired' || sig.status ==='declined' || sig.status === 'error') && (this.props.signatureFilter === 'Canceladas')) {
                filteredSignatures.push(sig);    
            } else if (this.props.signatureFilter === "Mostrar todas") {
                filteredSignatures.push(sig);
            }
        });
        

        let res = [];

        filteredSignatures.map(signature => {
            let documentName = '';
            let subject = '';
            let recipients = '';
            let date = '';
            let status = '';
            let newStatus = '';

            documentName = signature.documents[0].file.name
            subject = (signature.data.find(x => x.key === "subject")) ? signature.data.find(x => x.key === "subject").value : 'Sin asunto';
            signature.documents.map(d => recipients = `${recipients}${d.email}; `);
            // date = new Date(signature.created_at).toLocaleString(navigator.language, {
            //     year: 'numeric', month: '2-digit', day: '2-digit',
            //     hour: '2-digit', minute: '2-digit', second: '2-digit'
            // })
            date = new Date(signature.created_at);
            status = signature.documents[signature.documents.length-1].status;
           
            newStatus = this.getNewStatus(status);
         
            res.push({Id: signature.id, Documento: documentName, Asunto: subject, Destinatarios: recipients, Fecha: date, Estado: newStatus});
        });
        return (res.length === 0 ? [{}] : res);
    }

    getNewStatus = (status) => {
        if(status == "canceled") {
           return i18n.t('signaturesGrid.statusCancelled');
        } else if(status == "declined") {
            return i18n.t('signaturesGrid.statusDeclined');
        } else if(status == "expired") {
            return i18n.t('signaturesGrid.statusExpired');
        } else if(status == "completed") {
            return i18n.t('signaturesGrid.statusCompleted');
        } else if(status == "ready") {
            return i18n.t('signaturesGrid.statusInProgress');
        } else if(status == "error") {
            return i18n.t('signaturesGrid.statusError');
        } else if(status == "in_queue") {
            return i18n.t('signaturesGrid.statusPending');
        }
    }

    gridTemplate(props) {
        debugger;
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
        let items = [];

        if (props.Estado === i18n.t('signaturesGrid.statusInProgress')){
            items = [
                {
                    text: i18n.t('signaturesGrid.menuEdit'),
                    iconCss: 'lf-icon-edit'
                },
                {   
                    separator: true
                },
                {
                    text: i18n.t('signaturesGrid.menuCancel'),
                    iconCss: 'lf-icon-excel-software'
                }
            ];
        } else {
            items = [
                {
                    text: i18n.t('signaturesGrid.menuEdit'),
                    iconCss: 'lf-icon-edit'
                }
            ];
        }
        
        return (
            <div className='control-pane'>
                <div className='control-section'>
                    <div className='dropdownbutton-section'>
                        <div id='dropdownbutton-control'>
                            <div className='row'>
                                <div className="col-xs-12">
                                    <DropDownButtonComponent cssClass='e-caret-hide signature-poppup' items={items} iconCss={`lf-icon-kebab-menu`} select={this.menuOptionSelected.bind(this)}></DropDownButtonComponent>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
       
    }


    recipientsGridTemplate(props){
        let firstEmail = props.Destinatarios.split(';')[0];
        var chunks = props.Destinatarios.split(' ');
        let recipientsClass;

        switch (props.Estado) {
            case i18n.t('signaturesGrid.statusCancelled'):
            case i18n.t('signaturesGrid.statusDeclined'):
            case i18n.t('signaturesGrid.statusExpired'):
            case i18n.t('signaturesGrid.statusError'):
                recipientsClass = 'cancelada';
                break;           
            case 'En progreso':
            case i18n.t('signaturesGrid.statusInProgress'):
            case i18n.t('signaturesGrid.statusPending'):
                recipientsClass = 'en-progreso';
                break;
            case 'Completadas':
            case i18n.t('signaturesGrid.statusCompleted'):
                recipientsClass = 'completada';
                break;
            default:
                break;
        }

        let recipientsList = [];
        let signature = this.props.signatures.find(s => s.id === props.Id)

        if (signature ){
            var signersInfo = this.getSignersInfo(signature);
            signersInfo.forEach((signer, i) => {
                //console.log(signer);
                if (i === signersInfo.length -1 ){
                    recipientsList.push(
                        {
                            text: (signer.name === '') ? signer.email.split('@')[0] : signer.name,
                            cssClass: 'test'
                        },
                        {
                            text: signer.email
                        }
                    )  
                } else {
                    recipientsList.push(
                        {
                            text: (signer.name === '') ? signer.email.split('@')[0] : signer.name,
                            cssClass: 'test'
                        },
                        {
                            text: signer.email
                        },
                        {   
                            separator: true
                        }
                    )
                }
            });
        }
        
        //console.log(props);
        return (
            // <div>
            //     <span className='email'>
            //         {firstEmail.length > 22 ? firstEmail.substring(0,20) : firstEmail}
            //     </span>                
            //     <span className={`bola-firmantes ${recipientsClass}`}>
            //         <DropDownButtonComponent beforeItemRender={this.recipientRender.bind(this)} cssClass='e-caret-hide test' items={recipientsList}>{signersInfo.length}</DropDownButtonComponent>
            //     </span>
            // </div>
            <div id='container' style={{width: '100%', textAlign: 'center'}}>
                <div id='left' className='email' style={{textAlign: 'left', float: 'left', width: '75%', height: '20px', padding: '0px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {/* {firstEmail.length > 22 ? firstEmail.substring(0,20) : firstEmail} */}
                    {firstEmail}
                </div>     
                {/* <div id='center' style={{display: 'block', margin: '0 auto', width: '50px', height: '20px', background: '#00ff00'}}></div>            */}
                <div id='right' className={`bola-firmantes ${recipientsClass}`} style={{float: 'right', width: '25%', height: '20px'}}>
                    <DropDownButtonComponent beforeItemRender={this.recipientRender.bind(this)} cssClass='e-caret-hide test' items={recipientsList}>{signersInfo.length}</DropDownButtonComponent>
                </div>
            </div>
        )
    }

    dropDownRecipientRender(args){
        if (args.item.text.includes('@')){
            args.element.style.color = '#777777';
            args.element.style.fontWeight = '400';
            args.element.style.fontSize = '12px';
            args.element.style.fontStyle = 'italic';
            console.log(args);
        } else if (args.item.separator){
            args.element.style.color = '#001970';
        }
    }

    statusGridTemplate(props){
        let status;
        let status_style;

        switch (props.Estado) {
        case i18n.t('signaturesGrid.statusCancelled'):
            status = i18n.t('signaturesGrid.statusCancelled');
            status_style = 'cancelada';
            break;
        case i18n.t('signaturesGrid.statusDeclined'):
            status = i18n.t('signaturesGrid.statusDeclined');
            status_style = 'cancelada';
            break;
        case i18n.t('signaturesGrid.statusExpired'):
            status = i18n.t('signaturesGrid.statusExpired');
            status_style = 'cancelada';
            break;      
        case i18n.t('signaturesGrid.statusCompleted'):
            status = i18n.t('signaturesGrid.statusCompleted');
            status_style = 'completada'
            break;
        case i18n.t('signaturesGrid.statusInProgress'):
            status = i18n.t('signaturesGrid.statusInProgress');
            status_style = 'en-progreso'
            break;
        case i18n.t('signaturesGrid.statusError'):
            status = i18n.t('signaturesGrid.statusError');
            status_style = 'cancelada';
            break;
        case i18n.t('signaturesGrid.statusPending'):
            status = i18n.t('signaturesGrid.statusPending');
            status_style = 'en-progreso';
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
        if (event.target.className !== "e-btn-icon lf-icon-kebab-menu" //Actions
            && event.target.className !== "e-control e-dropdown-btn e-lib e-btn e-caret-hide test e-active e-focus" // Signers
            ){
            var signature = this.props.signatures.find(s => s.id === event.data.Id);
            this.props.setTitle(i18n.t('signatureViewer.title'));
            this.props.signatureClicked(signature);
        }
        
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
        } else if (this.grid && event.item.id.includes('excel')){
            this.grid.excelExport();
        }
    }

    dropDownOptionSelected (args){
        console.log(args);
        if (args.item.text === i18n.t('signaturesGrid.menuEdit')){
            const id = this.grid.getSelectedRecords()[0].Id;
            const signature = this.props.signatures.find(s => s.id === id);
            this.props.setTitle('PROGRESO DE FIRMA');
            this.props.signatureClicked(signature);
        } else if (args.item.text === i18n.t('signaturesGrid.menuCancel')){
            const id = this.grid.getSelectedRecords()[0].Id;
            const auth = this.props.auth;
            this.setState({ hideConfirmDialog: true, signatureId: id, auth: auth });
        }
    }

    onCancelSignature(signatureId, auth){
        this.setState({ hideConfirmDialog: true, signatureId: signatureId, auth: auth });
        //cancelSignature2(signatureId, auth);
    }

    onCancelSignatureOk(){
        const signatureId = this.state.signatureId;
        const auth = this.state.auth;
    
        cancelSignature2(signatureId, auth)
        .then(() => {
          this.setState({ hideAlertDialog: true, signatureId: '', auth: '' });
        })
        .catch(() => {
          this.setState({ hideAlertDialog: true, signatureId: '', auth: '' });
        });
    }

    dialogClose(){
        //console.log(this.state.hideGuidNotFoundDialog);
        console.log(this.props.guidNotFound);
        //if (this.state.hideGuidNotFoundDialog === true){
        if (this.props.guidNotFound === true){
            this.props.onShowGuidNotFound();
        }
        this.setState({
            hideAlertDialog: false,
            hideConfirmDialog: false//,
            //hideGuidNotFoundDialog: false
        });
    }

    dialogOpen(){
        this.alertDialogInstance.cssClass = 'e-fixed';
    }

    render() {
        console.log('MESSAGELIST.RENDER()');
        //console.log('MESSAGELIST.RENDER().state.hideGuidNotFoundDialog: '+this.state.hideGuidNotFoundDialog);
        console.log('MESSAGELIST.RENDER().props.guidNotFound: '+this.props.guidNotFound);

        const contenido = `
            <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
            <div style='text-align: justify; text-justify: inter-word; align-self: center;
            font-size: 17.5px !important; padding-left: 20px;'>
            ${i18n.t('cancelledSignatureModal.text')}
            </div>`;

        const contenido2 = `
            <span class="lf-icon-question" style="font-size:100px; padding: 15px;"></span>
            <div style='text-align: justify; text-justify: inter-word; align-self: center; 
            font-size: 17.5px !important; padding-left: 20px;'>
            ${i18n.t('cancelConfirmationModal.text')}
            </div>`;
        
        const contenido3 = `
            <span class="lf-icon-information" style="font-size:100px; padding: 15px;"></span>
            <div style='text-align: justify; text-justify: inter-word; align-self: center;
            font-size: 17.5px !important; padding-left: 20px;'>
            ${i18n.t('signatureNotFoundCentinela.text')}
            </div>`;

        const confirmButtons = [
            {
                click: () => {
                this.setState({ hideConfirmDialog: false });
                },
                buttonModel: {  content: i18n.t('confirmationModal.no'), cssClass: 'btn-modal-close' }
            },
            {
                click: () => {
                    this.setState({ hideConfirmDialog: false });
                    this.onCancelSignatureOk();
                },
                buttonModel: { content: i18n.t('confirmationModal.yes'), isPrimary: true }
            }
        ];

        const filterSettings = { 
            type: 'Menu', 
            ignoreAccent:true, 
            operators: {
                stringOperator: [
                    { value: 'contains', text: i18n.t('signaturesGrid.filters.contains')},
                    { value: 'startsWith', text: i18n.t('signaturesGrid.filters.startsWith')}
                ],
                dateOperator: [
                    { value: 'equal', text: i18n.t('signaturesGrid.filters.equal')},
                    { value: 'greaterthan', text: i18n.t('signaturesGrid.filters.greaterthan')},
                    { value: 'greaterthanorequal', text: i18n.t('signaturesGrid.filters.greaterthanorequal')},
                    { value: 'lessthan ', text: i18n.t('signaturesGrid.filters.lessthan')},
                    { value: 'lessthanorequal  ', text: i18n.t('signaturesGrid.filters.lessthanorequal')}
                ],
             } 
        };

        const filterCheckBox = {
            type: 'CheckBox'
        }

        //var firmas = this.props.signatures;
        var firmas = (this.props.signatures && this.props.signatures.length > 0) ? this.getSignatures(this.props.signatures): [{}];
        var customAttributes = {class: 'customcss'};
        document.body.style.background = "white";
        const languageSpit = (navigator.language).split('-');
        const navigatorLanguage = languageSpit[0];
        const position = { X: 160, Y: 240 };
        return( (firmas && firmas.length > 0) ?
            <div className={styles['main-grid']}>
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
                    height='100%'
                    pageSettings={{pageCount: 5, pageSize: 10, pageSizes: [5, 10, 20, 50, 75, 100] }}//pageSizeList: [8,12,9,5]}} 
                    rowSelected={event => {
                        this.onRowSelected(event);
                    }}
                    filterSettings={filterSettings}
                    toolbar={this.toolbarOptions} 
                    // locale={navigator.language}
                    locale={navigatorLanguage}
                    toolbarClick={this.toolbarClick}
                    ref={g => this.grid = g}
                    hierarchyPrintMode={'All'}
                    delayUpdate='true'
                >
                    <ColumnsDirective>
                        <ColumnDirective textAlign='center' headerText={i18n.t('signaturesGrid.columnAction')} template={this.menuTemplate}  width='55' />
                        <ColumnDirective field='Documento' textAlign='Left' headerText={i18n.t('signaturesGrid.columnDocument')}/>
                        <ColumnDirective field='Asunto' textAlign='Left' headerText={i18n.t('signaturesGrid.columnSubject')} />
                        <ColumnDirective field='Destinatarios' textAlign='Left' headerText={i18n.t('signaturesGrid.columnSigners')} width= '151' template={this.recipientsTable.bind(this)}/>
                        <ColumnDirective field='Fecha' textAlign='Left' type="date" format={{ type: 'date', format: 'dd/MM/yyyy' }} headerText={i18n.t('signaturesGrid.columnDate')} width='115'/>
                        <ColumnDirective field='Estado' filter={filterCheckBox} textAlign='Left' headerText={i18n.t('signaturesGrid.columnStatus')} width='110' template={this.statusTemplate.bind(this)} />
                    </ColumnsDirective>
                    <Inject services={[Filter, Page, Resize, Sort, Toolbar, PdfExport, ExcelExport]}/>
                    {/* <Inject services={[Resize]}/> */}
                </GridComponent>
                <DialogComponent 
                    id="infoDialog" 
                    //header=' ' 
                    visible={this.state.hideAlertDialog} 
                    animationSettings={this.animationSettings} 
                    width='60%' 
                    content={contenido}
                    ref={alertdialog => this.alertDialogInstance = alertdialog} 
                    //target='#target' 
                    //buttons={this.alertButtons} 
                    open={this.dialogOpen} 
                    close={this.dialogClose}
                    showCloseIcon={true}
                    //position={ this.position }
                />
                <DialogComponent 
                    id="confirmDialog" 
                    header=' ' 
                    visible={this.state.hideConfirmDialog} 
                    showCloseIcon={true} 
                    animationSettings={this.animationSettings} 
                    width='60%' 
                    content={contenido2} 
                    ref={dialog => this.confirmDialogInstance = dialog} 
                    //target='#target' 
                    buttons={confirmButtons} 
                    open={this.dialogOpen} 
                    close={this.dialogClose}
                />
                <DialogComponent 
                    id="infoDialog" 
                    //header=' ' 
                    visible={this.props.guidNotFound} 
                    animationSettings={this.animationSettings} 
                    width='60%' 
                    content={contenido3}
                    ref={alertdialog => this.alertDialogInstance = alertdialog} 
                    //target='#target' 
                    //buttons={this.alertButtons} 
                    open={this.dialogOpen} 
                    close={this.dialogClose}
                    showCloseIcon={true}
                    //isModal={true}
                    //position={ position }
                />
            </div>
            <style jsx global>
                {`
                    .e-headercell{
                        background-color: #001978 !important;
                        color: white;  
                    }
                    div.e-gridheader.e-lib.e-droppable > div > table > 
                    thead > tr > th.e-headercell.e-defaultcursor {
                        position: static;
                        border-right: 1px solid;
                    }
                    .bola-firmantes.en-progreso .e-dropdown-btn.e-dropdown-btn.e-btn{
                        border-radius: 20px;
                        color: #FFF;
                        padding: 3px 15px;
                        cursor: pointer;
                        background: #e9a128;
                    }
                    .bola-firmantes.completada .e-dropdown-btn.e-dropdown-btn.e-btn{
                        border-radius: 20px;
                        color: #FFF;
                        padding: 3px 15px;
                        cursor: pointer;
                        background: #217e05;
                    }
                    .bola-firmantes.cancelada .e-dropdown-btn.e-dropdown-btn.e-btn{
                        border-radius: 20px;
                        color: #FFF;
                        padding: 3px 15px;
                        cursor: pointer;
                        background: #c90223;
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
                    .e-dropdownbase .e-list-item.e-active.e-hover {
                        color: #001970;
                    }
                    .e-dropdownbase .e-list-item.e-active, .e-dropdownbase 
                    .e-list-item.e-active.e-hover {
                        background-color: #eee;
                        border-color: #fff;
                        color: #001970;
                    }
                    .e-checkboxfilter.e-popup.e-dialog {
                        top: 15% !important;
                    }
                    .e-checkboxfilter .e-footer-content {
                        background: #fff;
                    }
                    .e-dropdownbase .e-list-item.e-active.e-hover {
                        color: #001970;
                    }
                    .e-toolbar .e-toolbar-items .e-toolbar-item 
                    .e-tbar-btn.e-btn.e-tbtn-txt .e-icons.e-btn-icon {
                        padding: 0;
                        color: #001970;
                    }
                    .e-toolbar .e-toolbar-items .e-toolbar-item .e-tbar-btn-text {
                        color: #001970;
                    }
                    .e-toolbar .e-input-group .e-search .e-input{
                        height: 0rem;
                        border-bottom: 0px solid #9e9e9e;
                    }
                    .row{
                        margin-left:auto;
                        margin-right: auto;
                        margin-bottom: 0px;
                        display: inherit;
                    }

                    [type="checkbox"] + span:not(.lever):before {
                        top: 2px;
                        left: -1px;
                        border: none;
                        margin-top: 2px;
                    }
                    
                    .e-dropdown-popup ul .e-item .e-menu-icon {
                        font-weight: bold;
                        color: #001970;
                    }
                    .signature-poppup ul {
                        min-width: 180px;
                        border: 1px solid #001970 !important;
                        padding: 1px 0;
                    }
                    .signature-poppup ul .e-item.e-separator{
                        border-bottom: 1px solid #001970;
                        margin: 6px 4px;
                       
                    }
                    .e-dropdown-popup ul .e-item {
                        font-weight: bold;
                        color: #001970;
                    }
                    .e-input-group:not(.e-float-icon-left):not(.e-float-input)::before, 
                    .e-input-group:not(.e-float-icon-left):not(.e-float-input)::after, 
                    .e-input-group.e-float-icon-left:not(.e-float-input) 
                    .e-input-in-wrap::before, 
                    .e-input-group.e-float-icon-left:not(.e-float-input) 
                    .e-input-in-wrap::after, 
                    .e-input-group.e-control-wrapper:not(.e-float-icon-left):not(.e-float-input)::before, 
                    .e-input-group.e-control-wrapper:not(.e-float-icon-left):not(.e-float-input)::after, 
                    .e-input-group.e-control-wrapper.e-float-icon-left:not(.e-float-input) 
                    .e-input-in-wrap::before, 
                    .e-input-group.e-control-wrapper.e-float-icon-left:not(.e-float-input) 
                    .e-input-in-wrap::after {
                        background: #001970;
                    }
   
                    .test{
                        color: #fff;
                    }
                    input:not([type]), input[type=text]:not(.browser-default___2ZECf), 
                    input[type=password]:not(.browser-default___2ZECf), 
                    input[type=email]:not(.browser-default___2ZECf),
                    input[type=url]:not(.browser-default___2ZECf), 
                    input[type=time]:not(.browser-default___2ZECf), 
                    input[type=date]:not(.browser-default___2ZECf), 
                    input[type=datetime]:not(.browser-default___2ZECf), 
                    input[type=datetime-local]:not(.browser-default___2ZECf), 
                    input[type=tel]:not(.browser-default___2ZECf), 
                    input[type=number]:not(.browser-default___2ZECf), 
                    input[type=search]:not(.browser-default___2ZECf), 
                    textarea.materialize-textarea___2dl8r {
                        background-color: transparent;
                        border: none;
                        border-radius: 0;
                        outline: none;
                        height: 0rem;
                        width: 100%;
                        font-size: 16px;
                        margin: 0 0 8px 0;
                        padding: 0;
                        box-shadow: none;
                        box-sizing: content-box;
                        transition: box-shadow .3s, border .3s;
                        padding-top: 3px;
                    }
                    
                    .e-input-group:not(.e-success):not(.e-warning):not(.e-error) input.e-input:focus {
                      border-bottom: none;
                      box-shadow: none;
                    }

                    .e-toolbar .e-toolbar-items {
                        border-radius: 0 0 0 0;
                        display: inline-block;
                        height: 100%;
                        min-height: 53px;
                        vertical-align: middle;
                    }
                    #confirmDialog { 
                      //top: -10px !important;
                    }
    
                    #infoDialog, #confirmDialog, #infoDialog2 {
                        max-height: 927px;
                        width: 300px;
                        left: 770px;
                        //top: 392.5px;
                        z-index: 1001;
                        //transform: translateY(+150%);
                    }
                    #confirmDialog_dialog-header, 
                    #confirmDialog_title, 
                    #confirmDialog_dialog-content, 
                    .e-footer-content{
                        background: #001970;
                        color: #fff;
                        display:flex;
                        width: auto;
                    }

                    #infoDialog_dialog-header, #infoDialog_title, 
                    #infoDialog_dialog-content, .e-footer-content{
                        background: #001970;
                        color: #fff;
                        display:flex;
                    }
                    #infoDialog2_dialog-header, #infoDialog2_title, 
                    #infoDialog2_dialog-content, .e-footer-content{
                        background: #001970;
                        color: #fff;
                        display:flex;
                    }
                    #confirmDialog_dialog-header, #confirmDialog_title, 
                    #confirmDialog_dialog-content, .e-footer-content{
                        background: #001970;
                        color: #fff;
                        display:flex;
                    }
                    // .e-btn.e-flat.e-primary {
                    //     color: #fff !important;
                    // }
                    .e-btn-icon .e-icon-dlg-close .e-icons{
                        color: #fff;
                    }
                    .e-dialog .e-dlg-header-content 
                    .e-btn.e-dlg-closeicon-btn {
                        margin-right: 0;
                        margin-left: auto;
                        color: #fff;
                        height: 15px;
                        background-color: transparent;
                    }
                    #confirmDialog_dialog-header, .e-dialog 
                    .e-icon-dlg-close::before {
                        content: '\e7fc';
                        position: relative;
                        color: white;
                        font-size: 15px;
                    }

                    #confirmDialog .e-btn.e-flat.e-primary {
                        text-transform: uppercase;
                        font-size: 13px;
                        font-family: MTTMilano-Bold,Lato,Arial,sans-serif;
                        letter-spacing: .7px;
                        color: #001978 !important;
                        padding: 10px;
                        background-color: #fff;
                        border-radius: 0 !important;
                        border: 2px solid #fff !important;
                        min-width: 80px;
                    }
                      
                    #confirmDialog .e-btn.e-flat.e-primary:hover {
                        background-color: #e5e8f1 !important;
                        background: #e5e8f1 !important;
                        color: #001978 !important;
                    }
                      
                    #confirmDialog .e-btn.e-flat.e-primary:active {
                        background-color: #e5e8f1 !important;
                        background: #e5e8f1 !important;
                        color: #001978 !important;
                    }

                    .btn-modal-close {
                        text-transform: uppercase;
                        font-size: 13px;
                        font-family: MTTMilano-Bold,Lato,Arial,sans-serif;
                        letter-spacing: .7px;
                        color: #fff !important;
                        padding: 10px;
                        background-color: #001978 !important;
                        min-width: 80px;
                        border-radius: 0 !important;
                        border: 2px solid #fff !important;
                    }
                      
                    .btn-modal-close:hover {
                     background-color: #e5e8f1 !important;
                     background: #e5e8f1 !important;
                     color: #001978 !important;
                    }
                   
                    .btn-modal-close:active {
                     background-color: #e5e8f1 !important;
                     background: #e5e8f1 !important;
                     color: #001978 !important;
                    }
            
                    .e-toolbar-right {
                      right: 13% !important;
                      display: table-column !important;
                    }
                    .e-toolbar .e-toolbar-items.e-tbar-pos .e-toolbar-left {
                     left: auto;
                     line-height: 47px !important;
                    }
                    .e-toolbar-left {
                     right: 0 !important;
                     background-color: #DDE0DF;
                     height: 95% !important;
                     top: 2px !important;
                     border-top-left-radius: 23px;
                     border-bottom-left-radius: 23px;
                    }
                    .e-tbar-btn-text {
                      display: none !important;
                    } 
                    .e-toolbar .e-toolbar-items .e-toolbar-left 
                    .e-toolbar-item:first-child {
                      margin-left: 15px;
                    }
                    .e-toolbar .e-toolbar-items .e-toolbar-left 
                    .e-toolbar-item:nth-child(3) {
                      margin-right: 15px;
                    }
                    .e-toolbar .e-tbar-btn {
                      background: #001978;
                      border-radius: 15px;
                    }
                    .e-toolbar .e-toolbar-items .e-toolbar-item 
                    .e-tbar-btn.e-btn.e-tbtn-txt 
                    .e-icons.e-btn-icon {
                     color: #fbfbfb;
                    }
                    .e-toolbar .e-toolbar-items .e-toolbar-item .e-tbar-btn.e-btn {
                     height: calc(100% - 15px);
                     padding: 0 3.5px;
                    }
                    .e-grid {
                      border: 1px solid #001970;
                      border-top: 6px solid #001970;
                    }
                    .e-grid .e-toolbar-items .e-toolbar-item.e-search-wrapper 
                    .e-search .e-search-icon {
                     min-width: 29px !important;
                     border-left: 1px solid #001978 !important;
                     font-size: 16px !important;
                    }
                    .e-search   {
                      border: 1px solid #001970 !important;
                      height: 32px;
                      padding: 1px;
                      padding-left: 4px;
                    }
                    .e-grid .e-content {
                      overflow-y: hidden !important;
                    }
                    .e-toolbar .e-tbar-btn:hover {
                      border-radius: 14px;
                    }
                    .e-toolbar .e-tbar-btn:focus {
                      border-radius: 14px;
                    }
                    .e-toolbar .e-tbar-btn:active {
                      border-radius: 14px;
                    }
                    .e-grid.e-default tr td:first-child {
                      background-color: #6C77AF;
                    }
                    .e-btn.e-icon-btn {
                      background-color: transparent !important;
                    }
                    .e-dropdown-btn .e-btn-icon, .e-dropdown-btn.e-btn .e-btn-icon {
                      color: white;
                    }
                    .e-btn:active .e-btn-icon {
                      color: #001978 !important;
                    }
                    .e-btn:focus .e-btn-icon {
                      color: #001978 !important;
                    }
                    .e-btn:hover .e-btn-icon {
                     color: #001978 !important;
                    }
                    .e-grid .e-gridheader tr th:first-child {
                        padding: 0;
                    }
                    .e-grid.e-gridhover tr[role='row']:not(.e-editedrow):hover 
                    .e-rowcell:not(.e-cellselectionbackground):not(.e-active):not(.e-updatedtd):not(.e-indentcell) 
                    .e-btn-icon {
                        color: #001978 !important;
                    }

                    .e-pager .e-currentitem, .e-pager .e-currentitem:hover {
                        background: transparent;
                        color: #001970;
                        opacity: 1;
                        border-bottom: 3px solid #001970;
                        border-radius: 1px;
                    }
                    .e-pager .e-numericitem {
                      line-height: 0.5;
                       min-width: 16px;
                       font-size: 14px;
                    }
                    .e-pager div.e-icons {
                        color: #001970;
                    }

                    .e-input-group.e-control-wrapper.e-alldrop.e-ddl.e-lib.e-keyboard.e-valid-input {
                        color: #001970;
                        border-color: azure !important;
                        width: 70% !important;
                    }
                    
                    .e-input-group .e-input-group-icon:last-child {
                        color: #001970;
                    }
                    .e-pager .e-pagerconstant {
                        color: #001970; 
                        margin: 0 0 8px 10px;
                    }

                    .e-pager div.e-parentmsgbar {
                        color: #001970;
                    }
                    .e-grid .e-icon-filter::before {
                        font-family: 'lf-font' !important;
                        content: '\e95e';
                        color: #fff;
                        font-size: 12px;
                    }
                    .e-grid .e-filtered::before {
                        content: '\eaa3';
                    }
                    .e-pager .e-pagerdropdown {
                     margin-top: 0 !important; 
                     vertical-align: sub !important;
                     height: 35px !important;
                    }
                    input.e-input::selection, textarea.e-input::selection, 
                    .e-input-group input.e-input::selection, 
                    .e-input-group.e-control-wrapper input.e-input::selection, 
                    .e-float-input input::selection, 
                    .e-float-input.e-control-wrapper input::selection, 
                    .e-input-group textarea.e-input::selection, 
                    .e-input-group.e-control-wrapper textarea.e-input::selection, 
                    .e-float-input textarea::selection, 
                    .e-float-input.e-control-wrapper textarea::selection{
                        //background: #6C77AF;
                        //color: #fff;
                        background: #F6CCD1;
                        color: black;
                    }
                    .e-dropdown-btn:focus, .e-dropdown-btn.e-btn:focus{
                        padding: 4px;
                    }
                    .e-grid .e-print::before {
                        content: '\e9b9';
                        font-family: 'lf-font' !important;
                    }
                    .e-grid .e-pdfexport::before {
                        content: '\e94f';
                        font-family: 'lf-font' !important;
                    }
                    .e-grid .e-excelexport::before {
                        content: '\e955';
                        font-family: 'lf-font' !important;
                    }
                    .e-date-wrapper span.e-input-group-icon.e-date-icon.e-icons.e-active{
                        color: #001970 !important;
                    }
                    .e-calendar .e-content td.e-focused-date.e-today span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-focused-date.e-today span.e-day
                    {
                        background: #eee;
                        border: 1px solid #001970;
                        color: #001970;
                    }
                    .e-calendar .e-content td.e-today.e-selected span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-today.e-selected span.e-day 
                    {
                        background-color: #001970;
                        border: 1px solid #001970;
                        box-shadow: inset 0 0 0 2px #fff;
                        color: #fff;
                    }
                    .e-calendar .e-content td.e-selected span.e-day,
                    .e-bigger.e-small .e-calendar .e-content td.e-selected span.e-day
                    {
                        background-color: #001970;
                        border: 1px solid #001970;
                        box-shadow: inset 0 0 0 2px #fff;
                        color: #fff;
                    }
                    .e-calendar .e-content td.e-today span.e-day, 
                    .e-calendar .e-content td.e-focused-date.e-today span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-today span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-focused-date.e-today span.e-day {
                        background: none;
                        border: 1px solid #001970;
                        border-radius: 50%;
                        color: #001970;
                    }
                    .e-calendar .e-content td.e-today.e-selected:hover span.e-day, 
                    .e-calendar .e-content td.e-selected:hover span.e-day, 
                    .e-calendar .e-content td.e-selected.e-focused-date span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-today.e-selected:hover span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-selected:hover span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-selected.e-focused-date span.e-day {
                        background-color: #001970;
                        color: #fff;
                    }
                    .e-calendar .e-content td.e-today:hover span.e-day, 
                    .e-calendar .e-content td.e-focused-date.e-today:hover span.e-day, 
                    .e-calendar .e-content td.e-focused-date.e-today:focus span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-today:hover span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-focused-date.e-today:hover span.e-day, 
                    .e-bigger.e-small .e-calendar .e-content td.e-focused-date.e-today:focus span.e-day {
                        background-color: #eee;
                        border: 1px solid #001970;
                        color: #001970;
                    }
                `}
                </style>
            </div>
            : null
        )
    }

    componentDidMount() {

        const { lefebvre } = this.props;
        console.log('Message-list.ComponentDidMount: Llamando a preloadSignatures(lefebvre.userId)');
    
        this.props.preloadSignatures(lefebvre.userId);

        // window.addEventListener('resize', this.onresize.bind(this));
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.sign_ready === false){
            if (this.props.signatures && this.props.signatures.length){
                this.setState({sign_ready: true, rowCount: this.getCount()});
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        console.log('MESSAGELIST.SHOULDCOMPONENTUPDATE()');
        const difP = detailedDiff(this.props, nextProps);
        const difSt = detailedDiff(this.state, nextState);
        console.log('MESSAGELIST.SHOULDCOMPONENTUPDATE().difP');
        console.log(difP);
        console.log('MESSAGELIST.SHOULDCOMPONENTUPDATE().difSt');
        console.log(difSt);

        if (difP && difP.updated !== undefined){
            if (difP.updated.hasOwnProperty('preloadSignatures') 
                && difP.updated.hasOwnProperty('backendRequest') && difP.updated.hasOwnProperty('backendRequestCompleted')
                && difP.updated.hasOwnProperty('signatureClicked') && difP.updated.hasOwnProperty('setTitle')
                && Object.keys(difP.updated).length === 5
                && Object.keys(difP.added).length === 0
                && Object.keys(difP.deleted).length === 0){
                    console.log('MESSAGELIST.SHOULDCOMPONENTUPDATE().if: ' + false);
                    return false;
            }
        } else {
            if (
                this.isEmpty(difP.updated) &&
                this.isEmpty(difP.added) &&
                this.isEmpty(difP.deleted) &&
                this.isEmpty(difSt.updated) &&
                this.isEmpty(difSt.added) &&
                this.isEmpty(difSt.deleted)
              ) {
                console.log('MESSAGELIST.SHOULDCOMPONENTUPDATE().else: ' + false);
                return false;
              }
        }
    
        // if (difP && difP.updated !== undefined
        //     && difP.updated.hasOwnProperty('preloadSignatures') 
        //     && difP.update.hasOwnProperty('backendRequest') && difP.update.hasOwnProperty('backendRequestCompleted')
        //     && difP.update.hasOwnProperty('signatureClicked') && difP.update.hasOwnProperty('setTitle')
        //     && Object.keys(difP.updated).length === 5){
        //         return false;
        // } else {
        //     if (
        //         this.isEmpty(difP.updated) &&
        //         this.isEmpty(difP.added) &&
        //         this.isEmpty(difP.deleted) &&
        //         this.isEmpty(difSt.updated) &&
        //         this.isEmpty(difSt.added) &&
        //         this.isEmpty(difSt.deleted)
        //       ) {
        //         return false;
        //       }
        // }
        console.log('MESSAGELIST.SHOULDCOMPONENTUPDATE().other: ' + true);
        return true;
    }

    isEmpty(obj) {
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            return false;
          }
        }
      
        return JSON.stringify(obj) === JSON.stringify({});
    }
      

    onresize(e) {     
        
        var rowHeight = this.grid.getRowHeight(); //height of the each row     
        var gridHeight = Number(window.innerHeight - 120); //grid height
        var pageSize = Number(this.grid.pageSettings.pageSize) + 10; //initial page size
        var pageResize = (gridHeight - (pageSize * rowHeight)) / rowHeight;
        this.grid.pageSettings.pageSize = pageSize + Math.round(pageResize);
      }


    renderItem({ index, key, style }) {
        let status;
        let coloredStatus;
        let filteredSignatures = [];
        var signatures = this.props.signatures.map( sig => {
            if ((sig.status === 'En progreso' || sig.status === 'ready' || sig.status === 'pending') && (this.props.signatureFilter === "En progreso")){
                filteredSignatures.push(sig);
            } else if ((sig.status === 'Completadas' || sig.status === 'completed') && (this.props.signatureFilter === "Completadas")){
                filteredSignatures.push(sig);
            } else if ((sig.status === 'Canceladas' || sig.status === 'canceled' || sig.status === 'expired' || sig.status ==='declined' || sig.status === 'error') && (this.props.signatureFilter === 'Canceladas')) {
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
    auth: state.application.user.credentials.encrypted,
    all: state
});

const mapDispatchToProps = dispatch => ({
    preloadSignatures: (filter, auth) => preloadSignatures2(dispatch, filter, auth),
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
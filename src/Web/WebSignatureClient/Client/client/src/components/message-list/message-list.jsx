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
import { selectSignature, selectEmail, selectSms, setTitle, setSelectedService } from "../../actions/application";
import { readMessageRaw } from "../../services/message-read";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import mainCss from "../../styles/main.scss";
import styles from "./message-list.scss";
import { preloadSignatures, preloadSignatures2, cancelSignature2, downloadCertifiedDocumentAudit, downloadCertfiedDocumentCopy } from "../../services/api-signaturit";
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
  ExcelExport ,
  PdfExportProperties
} from '@syncfusion/ej2-react-grids';
import materialize from '../../styles/signature/materialize.scss';
import { CalendarComponent } from '@syncfusion/ej2-react-calendars';
import { loadCldr, setCulture, L10n } from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';
import { detailedDiff } from 'deep-object-diff';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import i18n from 'i18next';
import { CLS_RM_WHITE_SPACE } from "@syncfusion/ej2-react-richtexteditor";

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
        this.filesTable = this.filesGridTemplate;
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
        this.excelExportComplete = this.excelExportComplete.bind(this);
        this.pdfExportComplete = this.pdfExportComplete.bind(this);
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

    getFilesInfo(element){
        var result = []
        element.certificates.map(d => {
            if (d.file && result.filter(e => e.name === d.file.name).length === 0) {
                result.push({name: d.file.name}); 
            }
        });
        
        return result;
    }

    getRecipientsInfo(element){
        console.log('getRecipientsInfo', element);
        var result = []

        if (this.props.selectedService == 'signature'){
            element.documents.map(d => {
                if (result.filter(e => e.name === d.name && e.email === d.email).length === 0) {
                    result.push({name: d.name, email: d.email});
                }
            });
        } else if (this.props.selectedService == 'certifiedEmail') {
            element.certificates.map(d => {
                if (result.filter(e => e.name === d.name && e.email === d.email).length === 0) {
                    result.push({name: d.name, email: d.email});
                }
            });
        } else if (this.props.selectedService == 'certifiedSms'){
            element.certificates.map(d => {
                if (result.filter(e => e.name === d.name && e.phone === d.phone).length === 0) {
                    result.push({name: d.name, phone: d.phone});
                }
            });
        }
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

    /*
          _____      _     _   __  __      _   _               _     
         / ____|    (_)   | | |  \/  |    | | | |             | |    
        | |  __ _ __ _  __| | | \  / | ___| |_| |__   ___   __| |___ 
        | | |_ | '__| |/ _` | | |\/| |/ _ \ __| '_ \ / _ \ / _` / __|
        | |__| | |  | | (_| | | |  | |  __/ |_| | | | (_) | (_| \__ \
         \_____|_|  |_|\__,_| |_|  |_|\___|\__|_| |_|\___/ \__,_|___/
    */

    getSignatures(signatures){
        let filteredSignatures = [];
        signatures.map( sig => {
            if ((sig.status === 'En progreso' || sig.status === 'ready' || sig.status === 'pending' || sig.status === 'signing') && (this.props.signatureFilter === "En progreso")){
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
        return (res.length === 0 ? [] : res);
    }

    getEmails(emails) {
        let filteredEmails = [];
        emails.map( email => {
            if ((email.status === 'En progreso' || email.status === 'ready' || email.status === 'pending') && (this.props.signatureFilter === "En progreso")){
                filteredEmails.push(email);
            } else if ((email.status === 'Completadas' || email.status === 'completed') && (this.props.signatureFilter === "Completadas")){
                filteredEmails.push(email);
            } else if ((email.status === 'Canceladas' || email.status === 'canceled' || email.status === 'expired' || email.status ==='declined' || email.status === 'error') && (this.props.signatureFilter === 'Canceladas')) {
                filteredEmails.push(email);    
            } else if (this.props.signatureFilter === "Mostrar todas") {
                filteredEmails.push(email);
            }
        });
        
      
        let res = [];

        filteredEmails.map(email => {
            let documentName = '';
            let subject = '';
            let recipients = '';
            let files = '';
            let date = '';
            let status = '';
            let newStatus = '';
            subject = (email.data.find(x => x.key === "subject")) ? email.data.find(x => x.key === "subject").value : 'Sin asunto';

            let filterCertificates = [];
            
            email.certificates.map(d => { 
                let index = filterCertificates.findIndex(x => (x.email === d.email));
                if (index === -1){
                    filterCertificates.push(d);
                } 
            });

            filterCertificates.map(d => { 
                recipients = `${recipients}${d.email}; `;
                files = (email.certificates[0].file && email.certificates[0].file.name) 
                ? `${files}${d.file.name}; ` 
                : '';
            });
            
            date = new Date(email.created_at);
            status = email.status;
           
            newStatus = this.getNewStatus(status);
            res.push({Id: email.id, Documento: files, Asunto: subject, Destinatarios: recipients, Fecha: date, Estado: newStatus});
        });
        return (res.length === 0 ? [] : res);
    }

    getSmsList(smsList) {
        let filteredSms = [];
        smsList.map( sms => {
            if ((sms.status === 'En progreso' || sms.status === 'ready' || sms.status === 'pending') && (this.props.signatureFilter === "En progreso")){
                filteredSms.push(sms);
            } else if ((sms.status === 'Completadas' || sms.status === 'completed') && (this.props.signatureFilter === "Completadas")){
                filteredSms.push(sms);
            } else if ((sms.status === 'Canceladas' || sms.status === 'canceled' || sms.status === 'expired' || sms.status ==='declined' || sms.status === 'error') && (this.props.signatureFilter === 'Canceladas')) {
                filteredSms.push(sms);    
            } else if (this.props.signatureFilter === "Mostrar todas") {
                filteredSms.push(sms);
            }
        });
        

        let res = [];

        filteredSms.map(sms => {
            let documentName = '';
            let subject = '';
            let recipients = '';
            let files = '';
            let date = '';
            let status = '';
            let newStatus = '';
            subject = (sms.data.find(x => x.key === "body")) ? sms.data.find(x => x.key === "body").value : 'N/A';
            const additionalInfo = sms.data.find(x => x.key == 'additional_info');

            // ExampleData:
            //i=0:phone=+34600102030:name=Pepito Pérez:email=pepitoperez@hotmail.com|i=1:phone=+34600405060:name=Pepita Ridruejo:email=pepitaridruejo@gmail.com|
            //recipientsInfo-> [[i=0, phone=+34600102030, etc],[i=1, phone=+34600405060, etc]]
            //emails->[email=pepitoperez@hotmail.com, email=pepitaridruejo@gmail.com]
            //phones->[phone=+34600102030, phone=+34600405060]
            
            let recipientsInfo = additionalInfo ? (additionalInfo.value.split('|')).map(v => v.split(':')) : '';
            let phones = additionalInfo ? (additionalInfo.value.split('|')).map(v => v.split(':')).map(e => e[1]) : '';
            let emails2 = additionalInfo ? (additionalInfo.value.split('|')).map(v => v.split(':')).map(e => e[3]) : '';
            const emails = additionalInfo ? additionalInfo.value.split(':')[3].replace('|', '') : '';
            recipientsInfo.pop(); //removes last empty item
            emails2.pop(); //removes last empty item
            phones.pop(); //removes last empty item

            phones = phones.map(p => p.replace('phone=','')).map(p => p.replace('+34',''))
      
            sms.certificates.map((s, i) => {
                recipientsInfo[i] !== [""] && recipientsInfo[i] !== undefined
                    //? recipients = `${recipients}${recipientsInfo[i][1].split('=')[1]} ${recipientsInfo[i][3].split('=')[1].replace('|', '')}; `
                    ? recipients = `${recipients}${phones[i]} ${recipientsInfo[i][3].split('=')[1].replace('|', '')}; `
                    : recipients = recipients;
            });
         
            sms.certificates.map(s => 
                files = (sms.certificates[0].file && sms.certificates[0].file.name) 
                ? `${files}${s.file.name}; ` 
                : '');
 
            date = new Date(sms.created_at);
            status = sms.status;
           
            newStatus = this.getNewStatus(status);
            res.push({
                Id: sms.id, 
                Documento: files, 
                Asunto: subject, 
                Destinatarios: recipients, 
                Fecha: date, 
                Estado: newStatus,
                Emails: emails2.map(e => e.split('=')[1])
            });
        });
        return (res.length === 0 ? [] : res);
    }

    getCertDocuments(documents){
        let res = [];

        documents.map(document => {

            let date = new Date(document.created_at);     
            const hour = new Date(document.created_at).getHours() ;
            const time = new Date(document.created_at).getMinutes(); 
            const second = new Date(document.created_at).getSeconds(); 
            let fullTime = `${hour}:${time}:${second}`;

            res.push({
                Id: document.externalId, 
                Documento: document.name, 
                Fecha: date, 
                Hora: fullTime,
                Origen: document.app.charAt(0).toUpperCase() + document.app.slice(1)
            });
        });
        return (res.length === 0 ? [] : res);
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

        if (this.props.selectedService === 'certifiedDocument'){
            items = [
                { text: i18n.t('signaturesGrid.menuDocument'), iconCss: 'lf-icon-download' },
                { separator: true },
                { text: i18n.t('signaturesGrid.menuAudit'), iconCss: 'lf-icon-audit-products' }
            ]
        } else if (props.Estado === i18n.t('signaturesGrid.statusInProgress') && this.props.selectedService == 'signature') {
            items = [
                { text: i18n.t('signaturesGrid.menuEdit'), iconCss: 'lf-icon-edit' },
                { separator: true },
                { text: i18n.t('signaturesGrid.menuCancel'), iconCss: 'lf-icon-excel-software' }
            ];
        } else {
            items = [
                { text: i18n.t('signaturesGrid.menuEdit'), iconCss: 'lf-icon-edit' }
            ];
        }
        
        return (
            <div className='control-pane'>
                <div className='control-section'>
                    <div className='dropdownbutton-section'>
                        <div id='dropdownbutton-control'>
                            <div className={styles['row']}>
                                <div className="col-xs-12">
                                    <DropDownButtonComponent cssClass={`e-caret-hide ${styles['signature-poppup']}`} items={items} iconCss={`lf-icon-kebab-menu`} select={this.menuOptionSelected.bind(this)}></DropDownButtonComponent>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
    }

    filesGridTemplate(props) {
        if (props.Documento === undefined){
            return null;
        }

        let firstFiles = props.Documento.split(';')[0];
        var chunks = props.Documento.split(' ');
        let emailsInfo;
        let fileList = [];
        let data;

        if (this.props.selectedService == 'certifiedEmail'){
            data = (this.props.emails && this.props.emails.length > 0) ? this.props.emails.find(e => e.id === props.Id) : undefined;
        } else if (this.props.selectedService == 'certifiedSms'){
            data = (this.props.smsList && this.props.smsList.length > 0) ? this.props.smsList.find(e => e.id === props.Id) : undefined;
        }

        if (data){
            emailsInfo = this.getFilesInfo(data);
            emailsInfo.forEach((email, i) => {
                //console.log(signer);
                if (i === emailsInfo.length -1){
                    fileList.push(
                        {
                            text:  email.name,
                            cssClass: 'test'
                        }
                    )  
                } else {
                    fileList.push(
                        {
                            text: email.name,
                            cssClass:'test'
                        },
                        {   
                            separator: true
                        }
                    )
                }
            });
        }

        console.log('filesGridTemplate', fileList);
        
        return ( 

            <div id='container' style={{width: '100%', textAlign: 'center'}}>
                <div id='left' className='email' style={{textAlign: 'left', float: 'left', width: '75%', height: '20px', padding: '0px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {firstFiles != '' ? <span style={{fontSize: '15px'}} className='lf-icon-add'></span> : null }{firstFiles}
                </div>     
                {firstFiles != '' && fileList.length > 2 ? 
                 <div id='right' className={`bola-firmantes gray`} style={{float: 'right', width: '25%', height: '20px'}}>
                 <DropDownButtonComponent beforeItemRender={this.recipientRender.bind(this)} cssClass={`e-caret-hide test`} items={fileList}>{(emailsInfo && emailsInfo.length) ? emailsInfo.length : ''}</DropDownButtonComponent>
                 </div> : null}
            </div>
        )
   
    }

    recipientsGridTemplate(props) {
        if (props.Destinatarios === undefined 
            && props.Emails === undefined){
            return null;
        }

        let firstEmail = props.Destinatarios.split(';')[0];
        var chunks = props.Destinatarios.split(' ');
        let recipientsClass;
        let recipientsInfo;

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
            case i18n.t('signaturesGrid.statusSigning'):
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

        let data;
        if (this.props.selectedService == 'signature'){
            data = this.props.signatures.find(s => s.id === props.Id);
        } else if (this.props.selectedService == 'certifiedEmail'){
            data = this.props.emails.find(e => e.id === props.Id);
        } else if (this.props.selectedService == 'certifiedSms'){
            data = this.props.smsList.find(s => s.id === props.Id);
        }
        // styles['test']
        if (data){
            recipientsInfo = this.getRecipientsInfo(data);
            recipientsInfo.forEach((signer, i) => {
                //console.log(signer);
                if (i === recipientsInfo.length -1 ){
                    var name = (signer.name !== undefined && signer.name !== null && signer.name.trim() === "") ? 'Desconocido' : signer.name;
                    var phone = (signer.phone && signer.phone.substring(0,3) === '+34') ? signer.phone.substring(3,12) : (signer.phone !== '' && signer.phone !== undefined && signer.phone !== null) ? signer.phone : 'Desconocido';
                    var email = props.Emails && props.Emails[i] && props.Emails !== '|' ? props.Emails[i] : (signer.email !== undefined) ? signer.email : 'Desconocido';

                    (name !== 'Desconocido') ? recipientsList.push({text: name, cssClass: 'test'}) : null;
                    (phone !== 'Desconocido') ? recipientsList.push({text: phone}) : null;
                    (email !== 'Desconocido') ? recipientsList.push({text: email}) : null;
                } else {
                    var name = (signer.name !== undefined && signer.name !== null && signer.name.trim() === "") ? 'Desconocido' : signer.name;
                    var phone = (signer.phone && signer.phone.substring(0,3) === '+34') ? signer.phone.substring(3,12) : (signer.phone !== '' && signer.phone !== undefined && signer.phone !== null) ? signer.phone : 'Desconocido';
                    var email = props.Emails && props.Emails[i] && props.Emails !== '|' ? props.Emails[i] : (signer.email !== undefined) ? signer.email : 'Desconocido';

                    (name !== 'Desconocido') ? recipientsList.push({text: name, cssClass: 'test'}) : null;
                    (phone !== 'Desconocido') ? recipientsList.push({text: phone}) : null;
                    (email !== 'Desconocido') ? recipientsList.push({text: email}) : null;
                    recipientsList.push({ separator: true })
                }
            });
        }

        return ( 

            <div id='container' style={{width: '100%', textAlign: 'center'}}>
                <div id='left' className='email' style={{textAlign: 'left', float: 'left', width: '75%', padding: '0px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {/* {firstEmail.length > 22 ? firstEmail.substring(0,20) : firstEmail} */}
                   {this.props.selectedService === 'certifiedSms' ? 
                   <>
                    <span style={{color: '#001970', fontWeight: '500'}}>{firstEmail.split(' ')[0]}</span> 
                    <br />
                    <span style={{color: '#666666'}}>
                        {
                        firstEmail.split(' ')[1] !== '|' 
                        && firstEmail.split(' ')[1] !== 'undefined' ? 
                        firstEmail.split(' ')[1] : null
                        }
                    </span> 
                   </>
                   :
                   <span>{firstEmail}</span> } 
                </div>     
                {/* <div id='center' style={{display: 'block', margin: '0 auto', width: '50px', height: '20px', background: '#00ff00'}}></div>            */}
                <div id='right' className={`bola-firmantes ${recipientsClass}`} style={{float: 'right', width: '25%', height: '20px'}}>
                    <DropDownButtonComponent beforeItemRender={this.recipientRender.bind(this)} cssClass='e-caret-hide test' items={recipientsList}>{(recipientsInfo && recipientsInfo.length) ? recipientsInfo.length : ''}</DropDownButtonComponent>
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
        case i18n.t('signaturesGrid.statusSigning'):
            status = i18n.t('signaturesGrid.statusSigning');
            status_style = 'en-progreso';
            break;
        default:
            break;
        }
        return (
            <span className={`${styles['resumen-firma']} ${styles[status_style]}`}><b>{status}</b></span>
        )
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
        } else if(status == 'signing') {
            return i18n.t('signaturesGrid.statusSigning');
        } 
    }

    /*
          _____      _     _                       _   _                 
         / ____|    (_)   | |                     | | (_)                
        | |  __ _ __ _  __| |  ______    __ _  ___| |_ _  ___  _ __  ___ 
        | | |_ | '__| |/ _` | |______|  / _` |/ __| __| |/ _ \| '_ \/ __|
        | |__| | |  | | (_| |          | (_| | (__| |_| | (_) | | | \__ \
         \_____|_|  |_|\__,_|           \__,_|\___|\__|_|\___/|_| |_|___/
    */
   
    onRowSelected(event) {
        console.log(event);
        if (event.target.className !== "e-btn-icon lf-icon-kebab-menu" //Actions
            && event.target.className !== `e-control e-dropdown-btn e-lib e-btn e-caret-hide signature-poppup e-icon-btn e-active` // Actions menu
            && event.target.className !== `e-control e-dropdown-btn e-lib e-btn e-caret-hide signature-poppup e-icon-btn e-active e-focus` // Actions menu
            && event.target.className !== `e-control e-dropdown-btn e-lib e-btn e-caret-hide test e-focus` // Signers bubble
            && event.target.className !== `e-control e-dropdown-btn e-lib e-btn e-caret-hide test e-active e-focus` // documents bubble
            ){
            if (this.props.selectedService === 'signature'){
                var signature = this.props.signatures.find(s => s.id === event.data.Id);
                this.props.signatureClicked(signature);
                this.props.setTitle(i18n.t('signatureViewer.title'));
            } else if (this.props.selectedService === 'certifiedEmail'){
                var email = this.props.emails.find(s => s.id === event.data.Id);
                this.props.emailClicked(email);
                this.props.setTitle(i18n.t('emailViewer.title'));
            } else if (this.props.selectedService === 'certifiedSms'){
                var sms = this.props.smsList.find(s => s.id === event.data.Id);
                this.props.smsClicked(sms);
                this.props.setTitle(i18n.t('smsViewer.title'));
            } 
        }
    }

    toolbarClick(event){
        if (this.grid && event.item.id.includes('pdfexport') ) {
            let exportProperties = {
                exportType: 'CurrentPage',
                pageOrientation: 'Landscape' 
            };
            this.grid.columns[0].visible = false;
            this.grid.pdfExport(exportProperties);
        } else if (this.grid && event.item.id.includes('excel')){
            this.grid.columns[0].visible = false;
            this.grid.excelExport();   
        } else if (this.grid && event.item.id.includes('print')) {
            this.grid.print();
            const cols = this.grid.getColumns();
          for (const col of cols) {
            if (col.field === "Estado" || col.field === "Destinatarios") {
               col.template = null;
            }
          }
        }
    }

    pdfExportComplete() {
        if(this.grid) {
            /* show columns after pdfExport */
           this.grid.columns[0].visible = true; 
       }
    }

    excelExportComplete() {
        if(this.grid) {
             /* show columns after excelExport */
            this.grid.columns[0].visible = true; 
        }
    }

    dropDownOptionSelected (args){
        console.log(args);
        if (args.item.text === i18n.t('signaturesGrid.menuEdit') 
            && this.props.selectedService == 'signature') {
            const id = this.grid.getSelectedRecords()[0].Id;
            const signature = this.props.signatures.find(s => s.id === id);
            this.props.signatureClicked(signature);
            this.props.setTitle('PROGRESO DE FIRMA');
        } else if (args.item.text === i18n.t('signaturesGrid.menuEdit')
            && this.props.selectedService == 'certifiedEmail') {
            const id = this.grid.getSelectedRecords()[0].Id;
            const email = this.props.emails.find(s => s.id === id);
            this.props.emailClicked(email);
            this.props.setTitle('PROGRESO DE EMAIL CERTIFICADO');
        } else if (args.item.text === i18n.t('signaturesGrid.menuEdit') 
            && this.props.selectedService == 'certifiedSms') {
            const id = this.grid.getSelectedRecords()[0].Id;
            const sms = this.props.smsList.find(s => s.id === id);
            this.props.setTitle('PROGRESO DE SMS CERTIFICADO');
            this.props.smsClicked(sms);
        } else if (args.item.text === i18n.t('signaturesGrid.menuCancel')){
            const id = this.grid.getSelectedRecords()[0].Id;
            const auth = this.props.auth;
            this.setState({ hideConfirmDialog: true, signatureId: id, auth: auth });
        } else if (args.item.text === i18n.t('signaturesGrid.menuAudit')){
            const id = this.grid.getSelectedRecords()[0].Id;
            const fileName = this.grid.getSelectedRecords()[0].Documento;
            const auth = this.props.auth;
            downloadCertifiedDocumentAudit(id, fileName, auth );
        } else if (args.item.text === i18n.t('signaturesGrid.menuDocument')){
            const id = this.grid.getSelectedRecords()[0].Id;
            const fileName = this.grid.getSelectedRecords()[0].Documento;
            const auth = this.props.auth;
            downloadCertfiedDocumentCopy(id, fileName, auth );
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

    dialogOpen(instance){
        switch (instance) {
            case "alertDialog":
                (this.alertDialogInstance && this.alertDialogInstance.cssClass) ? this.alertDialogInstance.cssClass = 'e-fixed' : null;
                break;
            default:
                break;
        }
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
                                                                      
    /*
         _      _  __      _____           _        __  __      _   _               _     
        | |    (_)/ _|    / ____|         | |      |  \/  |    | | | |             | |    
        | |     _| |_ ___| |    _   _  ___| | ___  | \  / | ___| |_| |__   ___   __| |___ 
        | |    | |  _/ _ \ |   | | | |/ __| |/ _ \ | |\/| |/ _ \ __| '_ \ / _ \ / _` / __|
        | |____| | ||  __/ |___| |_| | (__| |  __/ | |  | |  __/ |_| | | | (_) | (_| \__ \
        |______|_|_| \___|\_____\__, |\___|_|\___| |_|  |_|\___|\__|_| |_|\___/ \__,_|___/
                                __/ |                                                    
                                |___/                                                     
    */

    componentDidMount() {
        const { lefebvre, selectedService } = this.props;
        console.log('Message-list.ComponentDidMount: Llamando a preloadSignatures(lefebvre.userId)');

        if (selectedService === null || selectedService === ''){
            if (lefebvre.roles && lefebvre.roles.length == 1){
                if (lefebvre.roles[0] === 'Email Certificado'){
                    this.props.setSelectedService('certifiedEmail');
                    //this.props.preloadEmails()
                } else if (lefebvre.roles[0] === "Firma Digital" || lefebvre.roles[0] === "Signaturit"){
                    this.props.setSelectedService('signature');
                    //this.props.preloadSignatures(lefebvre.userId);
                } else if (lefebvre.roles[0] === 'SMS Certificado' ) {
                    this.props.setSelectedService('certifiedSms');
                }else {
                    // De momento por defecto signature, después hay que añadir control de qué aplicación llama y para qué llama
                    this.props.setSelectedService('signature'); 
                    //this.props.preloadSignatures(lefebvre.userId);
                }
            } else {
                // De momento por defecto signature, después hay que añadir control de qué aplicación llama y para qué llama
                this.props.setSelectedService('signature'); 
                //this.props.preloadSignatures(lefebvre.userId);
            }
        }
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
            if (difP.updated.hasOwnProperty('preloadSignatures') && difP.updated.hasOwnProperty('emailClicked') 
                && difP.updated.hasOwnProperty('backendRequest') && difP.updated.hasOwnProperty('backendRequestCompleted')
                && difP.updated.hasOwnProperty('signatureClicked') && difP.updated.hasOwnProperty('setTitle')
                && difP.updated.hasOwnProperty('smsClicked')
                && Object.keys(difP.updated).length === 7
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


    /*
         _____                _             __  __      _   _               _     
        |  __ \              | |           |  \/  |    | | | |             | |    
        | |__) |___ _ __   __| | ___ _ __  | \  / | ___| |_| |__   ___   __| |___ 
        |  _  // _ \ '_ \ / _` |/ _ \ '__| | |\/| |/ _ \ __| '_ \ / _ \ / _` / __|
        | | \ \  __/ | | | (_| |  __/ |    | |  | |  __/ |_| | | | (_) | (_| \__ \
        |_|  \_\___|_| |_|\__,_|\___|_|    |_|  |_|\___|\__|_| |_|\___/ \__,_|___/
    */
    render() {
        console.log('MESSAGELIST.RENDER()');
        //console.log('MESSAGELIST.RENDER().state.hideGuidNotFoundDialog: '+this.state.hideGuidNotFoundDialog);
        console.log('MESSAGELIST.RENDER().props.guidNotFound: '+this.props.guidNotFound);

        const contenido = `
            <span class="lf-icon-check-round modal-icon-content"></span>
            <div class="modal-text-content">
                ${i18n.t('cancelledSignatureModal.text')}
            </div>`;

        const contenido2 = `
            <span class="lf-icon-question modal-icon-content"></span>
            <div class="modal-text-content">
            ${i18n.t('cancelConfirmationModal.text')}
            </div>`;
        
        const contenido3 = `
            <span class="lf-icon-information modal-icon-content"></span>
            <div class="modal-text-content>
            ${i18n.t('signatureNotFoundCentinela.text')}
            </div>`;

        const confirmButtons = [
            {
                click: () => {
                this.setState({ hideConfirmDialog: false });
                },
                buttonModel: {  content: i18n.t('confirmationModal.no'), cssClass: styles['btn-modal-close'] }
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
                    { value: 'contains', text: i18n.t('signaturesGrid.filters.contains') },
                    { value: 'startsWith', text: i18n.t('signaturesGrid.filters.startsWith') }
                ],
                dateOperator: [
                    { value: 'equal', text: i18n.t('signaturesGrid.filters.equal') },
                    { value: 'greaterthan', text: i18n.t('signaturesGrid.filters.greaterthan') },
                    { value: 'greaterthanorequal', text: i18n.t('signaturesGrid.filters.greaterthanorequal') },
                    { value: 'lessthan ', text: i18n.t('signaturesGrid.filters.lessthan') },
                    { value: 'lessthanorequal  ', text: i18n.t('signaturesGrid.filters.lessthanorequal') }
                ],
            } 
        };

        const filterCheckBox = {
            type: 'CheckBox'
        }
    
        var firmas = ( this.props.signatures && this.props.signatures.length > 0 ) ? this.getSignatures(this.props.signatures): [];
        var emails = ( this.props.emails && this.props.emails.length > 0 ) ? this.getEmails(this.props.emails) : [];
        var smsList = ( this.props.smsList && this.props.smsList.length > 0 ) ? this.getSmsList(this.props.smsList) : [];
        var documents = ( this.props.documents && this.props.documents.length > 0 ) ? this.getCertDocuments(this.props.documents) : [];
        
        var selectedServices = 
            (this.props.selectedService && this.props.selectedService == 'signature') 
                ? firmas 
                : (this.props.selectedService && this.props.selectedService == 'certifiedEmail') 
                    ? emails
                    : (this.props.selectedService && this.props.selectedService == 'certifiedSms')
                        ? smsList
                        : documents  

        var customAttributes = {class: 'customcss'};
        document.body.style.background = "white";
        const languageSpit = (navigator.language).split('-');
        const navigatorLanguage = languageSpit[0];
        const position = { X: 160, Y: 240 };
        
        return( 
            <div className={styles['main-grid']} id="message-list">
            <div>
                <GridComponent 
                    dataSource={selectedServices}
                    allowSorting={true}
                    allowResizing={true} 
                    allowFiltering={true} 
                    allowGrouping={false}
                    allowPaging={(selectedServices.length > 10 ? true : false)} 
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
                    locale={navigatorLanguage}
                    toolbarClick={this.toolbarClick}
                    excelExportComplete={this.excelExportComplete}
                    pdfExportComplete={this.pdfExportComplete}
                    ref={g => this.grid = g}
                    hierarchyPrintMode={'All'}
                    delayUpdate='true'
                >
                    {(this.props.selectedService && this.props.selectedService === 'certifiedDocument') 
                        ?
                            <ColumnsDirective>
                                <ColumnDirective headerTextAlign='Center' textAlign='Center' headerText={i18n.t('signaturesGrid.columnAction')}  template={this.menuTemplate} maxWidth='44' />
                                <ColumnDirective field='Documento' textAlign='Left' headerText={i18n.t('signaturesGrid.columnDocument')} template={this.filesTable.bind(this)} /> 
                                <ColumnDirective field='Fecha' textAlign='Left' type="date" format={{ type: 'date', format: 'dd/MM/yyyy' }} headerText={i18n.t('signaturesGrid.columnDate')} />
                                <ColumnDirective field='Hora' textAlign='Left'  headerText={i18n.t('signaturesGrid.columnHour')} width= '151' />
                                <ColumnDirective field='Origen' textAlign='Left' headerText={i18n.t('signaturesGrid.columnOrigin')} width='115'/>
                            </ColumnsDirective>
                        : 
                            <ColumnsDirective>
                                <ColumnDirective headerTextAlign='Center' textAlign='Center' headerText={i18n.t('signaturesGrid.columnAction')}  template={this.menuTemplate} maxWidth='44' />
                                <ColumnDirective field='Documento' textAlign='Left' headerText={i18n.t('signaturesGrid.columnDocument')} template={this.filesTable.bind(this)} /> 
                                <ColumnDirective field='Asunto' textAlign='Left' headerText={i18n.t('signaturesGrid.columnSubject')} />
                                <ColumnDirective field='Destinatarios' textAlign='Left' headerText={i18n.t('signaturesGrid.columnSigners')} width= '151' template={this.recipientsTable.bind(this)}/>
                                <ColumnDirective field='Fecha' textAlign='Left' type="date" format={{ type: 'date', format: 'dd/MM/yyyy' }} headerText={i18n.t('signaturesGrid.columnDate')} width='115'/>
                                <ColumnDirective field='Estado' filter={filterCheckBox} textAlign='Left' headerText={i18n.t('signaturesGrid.columnStatus')} width='110' template={this.statusTemplate.bind(this)} />
                            </ColumnsDirective>
                    }
                    <Inject services={[Filter, Page, Resize, Sort, Toolbar, PdfExport, ExcelExport]}/>
                </GridComponent>
                <DialogComponent 
                    id="infoDialog" 
                    visible={this.state.hideAlertDialog} 
                    animationSettings={this.animationSettings} 
                    width='60%' 
                    content={contenido}
                    ref={alertdialog => this.alertDialogInstance = alertdialog} 
                    open={this.dialogOpen("infoDialog")} 
                    close={this.dialogClose}
                    showCloseIcon={true}
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
                    buttons={confirmButtons} 
                    open={this.dialogOpen("confirmDialog")} 
                    close={this.dialogClose}
                />
                <DialogComponent 
                    id="infoDialog" 
                    visible={this.props.guidNotFound} 
                    animationSettings={this.animationSettings} 
                    width='60%' 
                    content={contenido3}
                    ref={alertdialog => this.alertDialogInstance = alertdialog} 
                    open={this.dialogOpen("alertDialog")} 
                    close={this.dialogClose}
                    showCloseIcon={true}
                />
            </div>
            </div>
        )
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
            if ((sig.status === 'En progreso' || sig.status === 'ready' || sig.status === 'pending' || sig.status === 'signing') && (this.props.signatureFilter === "En progreso")){
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
            case 'signing':
                coloredStatus = <font color="#001978">Firmando</font>
                status = 'Firmando';
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
    emails: state.application.emails,
    smsList: state.application.smsList,
    documents: state.application.documents,
    selectedService: state.application.selectedService,
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
    emailClicked: email => {
        dispatch(selectEmail(email));
    },
    smsClicked: sms => dispatch(selectSms(sms)),
    backendRequest: () => dispatch(backendRequest()),
    backendRequestCompleted: () => dispatch(backendRequestCompleted()),
    setTitle: (title) => dispatch(setTitle(title)),
    setSelectedService: selectService  => dispatch(setSelectedService(selectService))
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
    Object.assign({}, stateProps, dispatchProps, ownProps, {
        preloadSignatures: filter => dispatchProps.preloadSignatures(filter, stateProps.credentials.encrypted),
        signatureClicked: signature => dispatchProps.signatureClicked(signature),
        emailClicked: email => dispatchProps.emailClicked(email),
        smsClicked: sms => dispatchProps.smsClicked(sms),
        backendRequest: () => dispatchProps.backendRequest(),
        backendRequestCompleted: () => dispatchProps.backendRequestCompleted(),
        setTitle: title => dispatchProps.setTitle(title)
    });

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(translate()(MessageList));
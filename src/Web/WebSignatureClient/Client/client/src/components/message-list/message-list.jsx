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
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Inject, Resize, Filter, DetailRow, Sort, Group, Toolbar, PdfExport, ExcelExport } from '@syncfusion/ej2-react-grids';
import materialize from '../../styles/signature/materialize.scss';
import { L10n } from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';
import { detailedDiff } from 'deep-object-diff';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import i18n from '../../services/i18n';


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
        'Pdfexport': 'PDF',
        'Excelexport': 'EXCEL',
        'Print': 'Imprimir'
      },
      'pager': {
        'pagerDropDown': 'Registros por página',
        'pagerAllDropDown': 'Registros',
        'totalItemsInfo': '({0} ítems)',
        'currentPageInfo': 'Página {0} de {1}',
        'All': 'Todo'
      }
    },
    'en-GB': {
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
          'Print': 'Print'
        },
        'pager': {
          'pagerDropDown': 'Items per page',
          'pagerAllDropDown': 'Items',
          'totalItemsInfo': '({0} total items)',
          'currentPageInfo': 'Page {0} out of {1}',
          'All': 'All'
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
            'Print': 'Printer'
          },
          'pager': {
            'pagerDropDown': 'Registres par page',
            'pagerAllDropDown': 'Items',
            'totalItemsInfo': '({0} total items)',
            'currentPageInfo': 'Page {0} out of {1}',
            'All': 'Tout'
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
            signatureId: '',
            auth: ''
        }
        this.template = this.gridTemplate;
        this.menuTemplate = this.menuGridTemplate;
        this.statusTemplate = this.statusGridTemplate;
        this.recipientsTable = this.recipientsGridTemplate;
        this.menuOptionSelected = this.dropDownOptionSelected;
        this.recipientRender = this.dropDownRecipientRender;
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
        this.toolbarOptions = ['Search', 'PdfExport', 'ExcelExport', 'Print'];
        this.grid = null;
        this.dialogClose = this.dialogClose;
        this.dialogOpen = this.dialogOpen;

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

        this.confirmButtons = [
            {
                click: () => {
                    this.setState({ hideConfirmDialog: false });
                    this.onCancelSignatureOk();
                },
                buttonModel: { content: 'Si', isPrimary: true }
            },
            {
                click: () => {
                this.setState({ hideConfirmDialog: false });
                },
                buttonModel: { content: 'No', isPrimary: true }
            }
        ];
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
        console.log(signatures);
        filteredSignatures.map(signature => {
            let documentName = '';
            let subject = '';
            let recipients = '';
            let date = '';
            let status = '';

            documentName = signature.documents[0].file.name
            subject = (signature.data.find(x => x.key === "subject")) ? signature.data.find(x => x.key === "subject").value : 'Sin asunto';
            signature.documents.map(d => recipients = `${recipients}${d.email}; `);
            date = new Date(signature.created_at).toLocaleString(navigator.language, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
            status = signature.documents[signature.documents.length-1].status;
            res.push({Id: signature.id, Documento: documentName, Asunto: subject, Destinatarios: recipients, Fecha: date, Estado: status});
        });
        return (res.length === 0 ? [{}] : res);
    }

    gridTemplate(props) {
        debugger;
        // //var src = 'src/grid/images/' + props.EmployeeID + '.png';
        return (
            <tr className={`templateRow`}>
                <td className="optionMenu" style={`width: 50%;`}>
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

        if (props.Estado === "ready"){
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
                                    <DropDownButtonComponent cssClass='e-caret-hide' items={items} iconCss={`lf-icon-kebab-menu`} select={this.menuOptionSelected.bind(this)}></DropDownButtonComponent>
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
            case 'canceled':
            case 'declined':
            case 'expired':
            case 'error':
                recipientsClass = 'cancelada';
                break;           
            case 'En progreso':
            case 'ready':
            case 'in_queue':
                recipientsClass = 'en-progreso';
                break;
            case 'Completadas':
            case 'completed':
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
                console.log(signer);
                if (i === signersInfo.length -1 ){
                    recipientsList.push(
                        {
                            text: signer.name,
                            cssClass: 'test'
                        },
                        {
                            text: signer.email
                        }
                    )  
                } else {
                    recipientsList.push(
                        {
                            text: signer.name,
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
        
        console.log(props);
        return (
            <div>
                <span className='email'>
                    {firstEmail.length > 22 ? firstEmail.substring(0,20) : firstEmail}
                </span>
                
                <span className={`bola-firmantes ${recipientsClass}`}>
                    <DropDownButtonComponent beforeItemRender={this.recipientRender.bind(this)} cssClass='e-caret-hide test' items={recipientsList}>{signersInfo.length}</DropDownButtonComponent>
                </span>
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
        case 'canceled':
            status = i18n.t('signaturesGrid.statusCancelled');
            status_style = 'cancelada';
            break;
        case 'declined':
            status = i18n.t('signaturesGrid.statusDeclined');
            status_style = 'cancelada';
            break;
        case 'expired':
            status = i18n.t('signaturesGrid.statusExpired');
            status_style = 'cancelada';
            break;      
        case 'completed':
            status = i18n.t('signaturesGrid.statusCompleted');
            status_style = 'completada'
            break;
        case 'ready':
            status = i18n.t('signaturesGrid.statusInProgress');
            status_style = 'en-progreso'
            break;
        case 'error':
            status = i18n.t('signaturesGrid.statusError');
            status_style = 'cancelada';
            break;
        case 'in_queue':
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
        var signature = this.props.signatures.find(s => s.id === event.data.Id);
        this.props.setTitle(i18n.t('signatureViewer.title'));
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
        this.setState({
            hideAlertDialog: false,
            hideConfirmDialog: false
        });
    }

    dialogOpen(){
        this.alertDialogInstance.cssClass = 'e-fixed';
    }

    render() {
        const contenido = `
            <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
            <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
            ${i18n.t('cancelledSignatureModal.text')}
            </div>`;

        const contenido2 = `
            <span class="lf-icon-question" style="font-size:100px; padding: 15px;"></span>
            <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
            ${i18n.t('cancelConfirmationModal.text')}
            </div>`;

        const confirmButtons = [
            {
                click: () => {
                    this.setState({ hideConfirmDialog: false });
                    this.onCancelSignatureOk();
                },
                buttonModel: { content: i18n.t('confirmationModal.yes'), isPrimary: true }
            },
            {
                click: () => {
                this.setState({ hideConfirmDialog: false });
                },
                buttonModel: { content: i18n.t('confirmationModal.no'), isPrimary: true }
            }
        ];

        this.toolbarClick = this.toolbarClick.bind(this);
        //var firmas = this.props.signatures;
        var firmas = (this.props.signatures && this.props.signatures.length > 0) ? this.getSignatures(this.props.signatures): [{}];
        var customAttributes = {class: 'customcss'};

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
                    height='400'
                    pageSettings={{pageCount: 5, pageSize: 10, pageSizes: true, pagesSizeList: []}}//pageSizeList: [8,12,9,5]}} 
                    // rowSelected={event => {
                    //     this.onRowSelected(event);
                    // }}
                    filterSettings={this.filterSettings}
                    toolbar={this.toolbarOptions} 
                    locale ={navigator.language}
                    toolbarClick={this.toolbarClick}
                    ref={g => this.grid = g}
                    hierarchyPrintMode={'All'}
                >
                    <ColumnsDirective>
                        <ColumnDirective textAlign='center' headerText={i18n.t('signaturesGrid.columnAction')} template={this.menuTemplate.bind(this)}  width='55' />
                        <ColumnDirective field='Documento' textAlign='Left' headerText={i18n.t('signaturesGrid.columnDocument')}/>
                        <ColumnDirective field='Asunto' textAlign='Left' headerText={i18n.t('signaturesGrid.columnSubject')} />
                        <ColumnDirective field='Destinatarios' textAlign='Left' headerText={i18n.t('signaturesGrid.columnSigners')} width= '151' template={this.recipientsTable.bind(this)}/>
                        <ColumnDirective field='Fecha' textAlign='Left' headerText={i18n.t('signaturesGrid.columnDate')} width='115'/>
                        <ColumnDirective field='Estado' textAlign='Left' headerText={i18n.t('signaturesGrid.columnStatus')} width='110' allowFiltering={false} template={this.statusTemplate.bind(this)} />
                    </ColumnsDirective>
                    <Inject services={[Filter, Page, Resize, Sort, Toolbar, PdfExport, ExcelExport]}/>
                    {/* <Inject services={[Resize]}/> */}
                </GridComponent>
                <DialogComponent 
                    id="infoDialog" 
                    //header=' ' 
                    visible={this.state.hideAlertDialog} 
                    animationSettings={this.animationSettings} 
                    width='500px' 
                    content={contenido}
                    ref={alertdialog => this.alertDialogInstance = alertdialog} 
                    //target='#target' 
                    //buttons={this.alertButtons} 
                    open={this.dialogOpen.bind(this)} 
                    close={this.dialogClose.bind(this)}
                    showCloseIcon={true}
                    //position={ this.position }
                />
                <DialogComponent 
                    id="confirmDialog" 
                    header=' ' 
                    visible={this.state.hideConfirmDialog} 
                    //showCloseIcon={true} 
                    animationSettings={this.animationSettings} 
                    width='400px' 
                    content={contenido2} 
                    ref={dialog => this.confirmDialogInstance = dialog} 
                    //target='#target' 
                    buttons={confirmButtons} 
                    open={() => this.dialogOpen} 
                    close={() => this.dialogClose}
                />
            </div>
            <style jsx global>
                {`
                    .e-headercell{
                        background-color: #001978 !important;
                        color: white;  
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
                    .e-dropdownbase .e-list-item.e-active.e-hover {
                        color: #001970;
                    }
                    .e-dropdownbase .e-list-item.e-active, .e-dropdownbase .e-list-item.e-active.e-hover {
                        background-color: #eee;
                        border-color: #fff;
                        color: #001970;
                    }
                    .e-dropdownbase .e-list-item.e-active.e-hover {
                        color: #001970;
                    }
                    .e-toolbar .e-toolbar-items .e-toolbar-item .e-tbar-btn.e-btn.e-tbtn-txt .e-icons.e-btn-icon {
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
                    .e-dropdown-popup ul .e-item .e-menu-icon {
                        font-weight: bold;
                        color: #001970;
                    }
                    .e-dropdown-popup ul .e-item {
                        font-weight: bold;
                        color: #001970;
                    }
                    
                    .e-input-group:not(.e-success):not(.e-warning):not(.e-error):not(.e-float-icon-left), .e-input-group.e-float-icon-left:not(.e-success):not(.e-warning):not(.e-error) .e-input-in-wrap, .e-input-group.e-control-wrapper:not(.e-success):not(.e-warning):not(.e-error):not(.e-float-icon-left), .e-input-group.e-control-wrapper.e-float-icon-left:not(.e-success):not(.e-warning):not(.e-error) .e-input-in-wrap, .e-float-input.e-float-icon-left:not(.e-success):not(.e-warning):not(.e-error) .e-input-in-wrap, .e-float-input.e-control-wrapper.e-float-icon-left:not(.e-success):not(.e-warning):not(.e-error) .e-input-in-wrap {
                        border-color: #001970;
                    }
                    .e-input-group:not(.e-float-icon-left):not(.e-float-input)::before, .e-input-group:not(.e-float-icon-left):not(.e-float-input)::after, .e-input-group.e-float-icon-left:not(.e-float-input) .e-input-in-wrap::before, .e-input-group.e-float-icon-left:not(.e-float-input) .e-input-in-wrap::after, .e-input-group.e-control-wrapper:not(.e-float-icon-left):not(.e-float-input)::before, .e-input-group.e-control-wrapper:not(.e-float-icon-left):not(.e-float-input)::after, .e-input-group.e-control-wrapper.e-float-icon-left:not(.e-float-input) .e-input-in-wrap::before, .e-input-group.e-control-wrapper.e-float-icon-left:not(.e-float-input) .e-input-in-wrap::after {
                        background: #001970;
                    }
                    .test{
                        color: #fff;
                    }
                    input:not([type]), input[type=text]:not(.browser-default___2ZECf), input[type=password]:not(.browser-default___2ZECf), input[type=email]:not(.browser-default___2ZECf), input[type=url]:not(.browser-default___2ZECf), input[type=time]:not(.browser-default___2ZECf), input[type=date]:not(.browser-default___2ZECf), input[type=datetime]:not(.browser-default___2ZECf), input[type=datetime-local]:not(.browser-default___2ZECf), input[type=tel]:not(.browser-default___2ZECf), input[type=number]:not(.browser-default___2ZECf), input[type=search]:not(.browser-default___2ZECf), textarea.materialize-textarea___2dl8r {
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
                    }
                    .e-toolbar .e-toolbar-items {
                        border-radius: 0 0 0 0;
                        display: inline-block;
                        height: 100%;
                        min-height: 53px;
                        vertical-align: middle;
                    }


                    
                    #infoDialog, #confirmDialog{
                        max-height: 927px;
                        width: 300px;
                        left: 770px;
                        top: 392.5px;
                        z-index: 1001;
                        transform: translateY(+150%);
                    }
                    #confirmDialog_dialog-header, #confirmDialog_title, #onfirmDialog_dialog-content, .e-footer-content{
                        background: #001970;
                        color: #fff;
                        display:flex;
                    }
                    #infoDialog_dialog-header, #infoDialog_title, #infoDialog_dialog-content, .e-footer-content{
                        background: #001970;
                        color: #fff;
                        display:flex;
                    }
                    #confirmDialog_dialog-header, #confirmDialog_title, #confirmDialog_dialog-content, .e-footer-content{
                        background: #001970;
                        color: #fff;
                        display:flex;
                    }
                    .e-btn.e-flat.e-primary {
                        color: #fff !important;
                    }
                    .e-btn-icon .e-icon-dlg-close .e-icons{
                        color: #fff;
                    }
                    .e-dialog .e-dlg-header-content .e-btn.e-dlg-closeicon-btn{
                        margin-right: 0;
                        margin-left: auto;
                        color: #fff
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
        const difP = detailedDiff(this.props, nextProps);
        const difSt = detailedDiff(this.state, nextState);

        if (difP && difP.updated !== undefined){
            if (difP.updated.hasOwnProperty('preloadSignatures') 
                && difP.updated.hasOwnProperty('backendRequest') && difP.updated.hasOwnProperty('backendRequestCompleted')
                && difP.updated.hasOwnProperty('signatureClicked') && difP.updated.hasOwnProperty('setTitle')
                && Object.keys(difP.updated).length === 5
                && Object.keys(difP.added).length === 0
                && Object.keys(difP.deleted).length === 0){
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
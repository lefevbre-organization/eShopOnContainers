import React, { Component, Fragment } from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton } from 'office-ui-fabric-react';
import { 
 base64Decode,
 removeClassification
} from '../../services/services';
import i18n from 'i18next';
import '../classification/classification.css';

class Classification extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
          data: null,
          isOpen: true, 
        };
    }

    componentDidMount() {
      this.getClassificationData();
    }

    async getClassificationData() {
        const user = base64Decode();
        const url = `${window.API_GATEWAY}/lex/Lexon/entities/getbyid`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            idType: this.props.classification.entityIdType,
            idEntity: this.props.classification.idRelated,
            bbdd: this.props.selectCompany.bbdd,
            idUser: user.idUserApp
          })
        });
        const data = await response.json();
        this.setState({ data: data.data });
    }

    open = () => {
      this.setState({isOpen: false}); 
    } 

    close = () => {
      this.setState({isOpen: true});
    } 

    render() {
      const dialogContentProps = {
        type: DialogType.normal,
        closeButtonAriaLabel: "Close",
      };
      const modalProps = {
        isBlocking: false
      }
      return (
        <Fragment>
         {this.state.data ? <li className="lexon-item">
           <p>
             <strong>{i18n.t(`classification.${this.state.data.idType}`)}</strong>
             <span>{this.state.data.name}</span>
           </p>
           <p>{this.state.data.description}</p>
           <p>{this.state.data.intervening}</p>
           <Dialog 
            hidden={this.state.isOpen} 
            dialogContentProps={dialogContentProps}
            onDismiss={this.close} 
            modalProps={modalProps} > 
          <h3>¿Desea eliminar esta clasificación?</h3> 
          <DialogFooter> 
            <PrimaryButton className="btn-modal-close" onClick={this.close} text="No" />
            <PrimaryButton className="btn-modal-save" 
            onClick={() => this.props.removeClassification(
                 this.props.classification, this.props.selectCompany )} 
            text="Si" />
          </DialogFooter> 
        </Dialog> 
          <p className='text-right tools-bar'>
          <a
             href='#/'
             title={i18n.t('classification.remove-document')}
             onClick={this.open} >
             <strong className='sr-only sr-only-focusable'>
               {i18n.t('classification.remove-document')}
             </strong>
             <span className='lf-icon-trash'></span>
           </a>
           {/* <a
             href='#/'
             title={i18n.t('classification.remove-document')}
             onClick={() => this.props.removeClassification(
                 this.props.classification, this.props.selectCompany )} >
             <strong className='sr-only sr-only-focusable'>
               {i18n.t('classification.remove-document')}
             </strong>
             <span className='lf-icon-trash'></span>
           </a> */}
          </p>
          </li> : null }
        </Fragment>
      );
    }
}

export default Classification;
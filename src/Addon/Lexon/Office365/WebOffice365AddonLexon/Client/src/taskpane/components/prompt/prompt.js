import React, { Component } from 'react';
import { 
 Dialog, 
 DialogType, 
 DialogFooter, 
 PrimaryButton 
} from 'office-ui-fabric-react';
import i18n from 'i18next';

class Prompt extends Component {
  constructor(props) {
      super(props);   
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
       <Dialog 
          hidden={this.props.isOpen} 
          dialogContentProps={dialogContentProps}
          onDismiss={this.props.close} 
          modalProps={modalProps} > 
          <h3>{i18n.t('document-attached.alert-message')}</h3> 
         <DialogFooter> 
          <PrimaryButton 
          className="btn-modal-close" 
          onClick={this.props.close} text="No" />
          <PrimaryButton className="btn-modal-save" 
          onClick={() => this.props.removeClassification(
              this.props.classification, 
              this.props.selectCompany )} 
             text="Si" />
         </DialogFooter> 
      </Dialog> 
      )
  }

}

export default Prompt;
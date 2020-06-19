import React, { Component, Fragment } from 'react';
import Classification from '../classification/classification';
import '../list-classifications/list-classifications.css';

class ListClassifications extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
    
        };
      }

    render() {
     const { 
      classifications,
      selectCompany,
      removeClassification
     } = this.props
     console.log(classifications);
      return (
        <Fragment>  
         <h2 className="lexon-title-list">CLASIFICACIONES:</h2>
          <div id="scrl-container">
           <div className="scrollbar-container"> 
            <ul className="lexon-document-list">
            {classifications &&
                classifications.map((classification) => {
           return (
               <Classification 
                classification={classification} 
                selectCompany={selectCompany}
                key={classification.idRelated}
                removeClassification={removeClassification}
               />
             )})}
                
            </ul>
           </div>
          </div>
        </Fragment>
      );
    }
}

export default ListClassifications;
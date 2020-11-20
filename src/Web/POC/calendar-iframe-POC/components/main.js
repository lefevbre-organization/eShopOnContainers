import React from 'react';
import IframeN from '@trendmicro/react-iframe';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import ResizeObserver from 'resize-observer-polyfill';
import Iframe from 'react-iframe'
import Iframe2 from 'react-iframe'
import ReactFullScreenElement from "react-fullscreen-element";
import './App.css';

const customStyles = {
      content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
      }
    };   

class Main extends React.Component {
	
constructor(props) {
    super(props);
		  this.state = {
          value: "Here the selected date",
          hidePromptDialogNew: false, 
          hidePromptDialogEdit: false, 
    }

    //this.handleOpenModal = this.handleOpenModal.bind(this);
    //this.handleCloseModal = this.handleCloseModal.bind(this);
    this.animationSettings = { effect: 'None' };      
    } 
     
    componentDidMount() { 
    
    
    window.addEventListener("message", event => {	  
     var obj = event.data
     var valueJ = JSON.stringify(obj);	 
     console.log('addEventListener', event); 
     this.setState({
              value: valueJ
     });
 })
      
 }

dialogOpenNew(args) {
       
   this.setState(
    {
      hidePromptDialogNew: true
    });
 }
   
dialogCloseNew(args) {
        this.setState({
            hidePromptDialogNew: false
        });        
}

dialogOpenEdit(args) {
       
    this.setState(
     {
       hidePromptDialogEdit: true
     });
  }
    
 dialogCloseEdit(args) {
         this.setState({
             hidePromptDialogEdit: false
         });        
 }

   
    render() {

      
 
     return (<div className='schedule-control-section'>

      

         <div className='message'>
             <span className="but">
                 <button onClick={this.dialogOpenEdit.bind(this)}> Edit Event- 2meu9mm5b5r8udqprajocit7t8</button>
             </span>  
             <span className="but">
                 <button onClick={this.dialogOpenNew.bind(this)}> New Event</button>
             </span>    
             <span >{this.state.value}</span>             
         </div>

         <DialogComponent
             id='dialogNewEvent'
             isModal={true}
             //header="calendar.title"
             visible={this.state.hidePromptDialogNew}
             showCloseIcon={true}
             animationSettings={this.animationSettings}
             width='900px'   
             height= '700px'
             ref={dialog => this.promptDialogInstanceNew = dialog}
             target='#app'
             open={this.dialogOpenNew.bind(this)}
             close={this.dialogCloseNew.bind(this)}
            
         >
             {/* <div className="modalview"> <img src="img.png" alt=""  /> </div>*/}
             <div className="modalview">
                 <Iframe url="
http://localhost:3002/calendar/access/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwiaWRFdmVudCI6bnVsbCwiaWRBY3R1YXRpb24iOiIyMyIsInRpdGxlIjoicmV1bmlvbiBpbXBvcnRhbnRlIn0.zK3w455SefI1Ts2W8mcXXPm87pBgjiTKL8GU5_qt6-g?prov=GO0"
                     width="100%"
                     height="100%"
                     id="myId2"
                     frameBorder="0"
                     className="frame2"
                     display="initial"
                     position="relative" />

             </div>
         </DialogComponent>



         <DialogComponent
             id='dialogEditEvent'
             isModal={true}
             //header="calendar.title"
             visible={this.state.hidePromptDialogEdit}
             showCloseIcon={true}
             animationSettings={this.animationSettings}
             width='900px'   
             height= '700px'
             ref={dialog => this.promptDialogInstanceEdit = dialog}
             target='#app'
             open={this.dialogOpenEdit.bind(this)}
             close={this.dialogCloseEdit.bind(this)}
            
         >
             {/* <div className="modalview"> <img src="img.png" alt=""  /> </div>*/}
             <div className="modalview">
                 <Iframe url="
http://localhost:3002/calendar/access/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwiaWRFdmVudCI6IjJtZXU5bW01YjVyOHVkcXByYWpvY2l0N3Q4IiwiaWRBY3R1YXRpb24iOiIyMyIsInRpdGxlIjoicmV1bmlvbiBpbXBvcnRhbnRlIn0.1LAw6Cl5liiL7NJwtX9CCFYN-M_4XXt3LqJNWV4-yYo?prov=GO0"
                     width="100%"
                     height="100%"
                     id="myId2"
                     frameBorder="0"
                     className="frame2"
                     display="initial"
                     position="relative" />

             </div>
         </DialogComponent>


         <div id="calendar" className='col-lg-6 control-section'>  
            
             <div className='control-wrapper'>
                 <Iframe url="http://localhost:3002/calendar/access/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwidGl0bGUiOiJyZXVuaW9uIGltcG9ydGFudGUifQ.jDez02aqfOhLMW24ZdB9xIPxOE8ijOr43syLbZ3YPqY?prov=GO0
"
                     width="754px"
                     height="425px"
                     id="myId"
                     frameBorder="0"
                     className="frame"
                     allow="fullscreen"
                     //sandbox='allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation'
                     display="initial"
                     //loading = "cargando..."
                     position="relative" />
             </div>
         </div> 
     </div>); 
 }
}

export default Main;
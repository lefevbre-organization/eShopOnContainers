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
          hidePromptDialog: false, 
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

dialogOpen(args) {
       
   this.setState(
    {
      hidePromptDialog: true
    });
 }
   
dialogClose(args) {
        this.setState({
            hidePromptDialog: false
        });        
}
   
    render() {

      
 
     return (<div className='schedule-control-section'>

      

         <div className='message'>
             <span className="but">
                 <button onClick={this.dialogOpen.bind(this)}> New Event</button>
             </span>    
             <span >{this.state.value}</span>             
         </div>

         <DialogComponent
             id='dialogDraggable'
             isModal={true}
             //header="calendar.title"
             visible={this.state.hidePromptDialog}
             showCloseIcon={true}
             animationSettings={this.animationSettings}
             width='900px'   
             height= '700px'
             ref={dialog => this.promptDialogInstance = dialog}
             target='#app'
             open={this.dialogOpen.bind(this)}
             close={this.dialogClose.bind(this)}
            
         >
             {/* <div className="modalview"> <img src="img.png" alt=""  /> </div>*/}
             <div className="modalview">
                 <Iframe url="http://localhost:3002/calendar?newEvent=true&layout=iframe"
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

             {/*  <IframeN
                 src="http://localhost:3002/calendar?layout=iframe"
                 onLoad={({ event, iframe }) => {
                     if (!(iframe && iframe.contentDocument)) {
                         return;
                     }

                     const target = iframe.contentDocument.body;
                     const nextHeight = target.offsetHeight;
                     iframe.style.height = `${nextHeight}px`;

                     const observer = new ResizeObserver(entries => {
                         const target = iframe.contentDocument.body;
                         const nextHeight = target.offsetHeight;
                         iframe.style.height = `${nextHeight}px`;
                     });
                     observer.observe(target);
                 }}
             />*/}


            
             <div className='control-wrapper'>
                 <Iframe url="http://localhost:3002/calendar?layout=iframe"
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
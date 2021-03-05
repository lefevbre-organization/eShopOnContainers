import React from 'react';
import IframeN from '@trendmicro/react-iframe';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import ResizeObserver from 'resize-observer-polyfill';
import Iframe from 'react-iframe'

import ReactFullScreenElement from "react-fullscreen-element";
import './App.css';

    class Main extends React.Component {
	
    constructor(props) {
        super(props);
            this.state = {
                value: "Here the selected date",
                hidePromptDialogNew: false, 
                hidePromptDialogEdit: false, 
            }
    
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
  
            if(event.data && JSON.parse(event.data).actionCancelled){
                console.log('dialogCloseNew', JSON.parse(event.data).actionCancelled)
                this.dialogCloseEdit(); 
                this.dialogCloseNew();    
            }
  
            
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
            this.promptDialogInstanceNew.refresh();     
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
            this.promptDialogInstanceEdit.refresh();       
    }
   
    render() 
    {  
        return (
        
        <div className='schedule-control-section'>   

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
                close={this.dialogCloseNew.bind(this)}>
            
                <div className="modalview">
                    <Iframe 
                        // url="https://lexbox-test-webgoogle.lefebvre.es/calendar/access/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwiaWRBY3R1YXRpb24iOiIyMyIsInRpdGxlIjoicmV1bmlvbiBpbXBvcnRhbnRlIn0.FIEi8dWdsJ-ZZkycmWd9ydkgWMV9kE32myKYpmiPU0c/?prov=GO0"
                        // url="https://lexbox-test-webgraph.lefebvre.es/calendar/access/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwiaWRBY3R1YXRpb24iOiIyMyIsInRpdGxlIjoicmV1bmlvbiBpbXBvcnRhbnRlIn0.FIEi8dWdsJ-ZZkycmWd9ydkgWMV9kE32myKYpmiPU0c/?prov=OU0"
                        url="http://localhost:7000/calendar/access/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwiaWRBY3R1YXRpb24iOiIyMyIsInRpdGxlIjoicmV1bmlvbiBpbXBvcnRhbnRlIn0.FIEi8dWdsJ-ZZkycmWd9ydkgWMV9kE32myKYpmiPU0c/?prov=IM0&account=TEVGREVWVEVTVDJAR01BSUwuQ09N"
                        width="100%"
                        height="100%"
                        id="myId2"
                        frameBorder="0"
                        className="frame2"
                        display="initial"
                        position="relative"                      
                    />
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
                close={this.dialogCloseEdit.bind(this)}>
                
                <div className="modalview">
                    <Iframe 
                        // url="https://lexbox-test-webgoogle.lefebvre.es/calendar/access/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwiaWRBY3R1YXRpb24iOiIyMyIsImlkRXZlbnQiOiJwb2MxMzNicTl1djVjcXRldW4xc2F0Z3Z2byIsInRpdGxlIjoicmV1bmlvbiBpbXBvcnRhbnRlIn0.rVcMUpcYFP13-qh3A8yv4WSRcenxpwzidaBv8mg1GJQ/?prov=GO0&account=am9lbGRldHJpbmlkYWRAZ21haWwuY29t"
                        // url="https://lexbox-test-webgraph.lefebvre.es/calendar/access/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwiaWRBY3R1YXRpb24iOiIyMyIsImlkRXZlbnQiOiJBQU1rQURFd1pqVTJabVZqTFRFellUTXROR0ZsTXkwNVpUSTVMV1EwTkRoak5tWmhPR0l6T0FCR0FBQUFBQUFiWlNrR1hRellRYlpVWkM3ZzBqTk1Cd0JrVWZvQzNycXpTNG9sakZHdUFKZkdBQUFBQUFFTkFBQmtVZm9DM3JxelM0b2xqRkd1QUpmR0FBRGY5eV9lQUFBPSIsInRpdGxlIjoicmV1bmlvbiBpbXBvcnRhbnRlIn0.Us9N7x1EFhtfnhkUkYTpqEom-wLZL6pnWvnuDymlfN8/?prov=OU0"
                        url="http://localhost:7000/calendar/access/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwiaWRBY3R1YXRpb24iOiIyMyIsImlkRXZlbnQiOiJBQU1rQURFd1pqVTJabVZqTFRFellUTXROR0ZsTXkwNVpUSTVMV1EwTkRoak5tWmhPR0l6T0FCR0FBQUFBQUFiWlNrR1hRellRYlpVWkM3ZzBqTk1Cd0JrVWZvQzNycXpTNG9sakZHdUFKZkdBQUFBQUFFTkFBQmtVZm9DM3JxelM0b2xqRkd1QUpmR0FBRGY5eV9lQUFBPSIsInRpdGxlIjoicmV1bmlvbiBpbXBvcnRhbnRlIn0.Us9N7x1EFhtfnhkUkYTpqEom-wLZL6pnWvnuDymlfN8/?prov=IM0&account=TEVGREVWVEVTVDJAR01BSUwuQ09N"
                        width="100%"
                        height="100%"
                        id="myId2"
                        frameBorder="0"
                        className="frame2"
                        display="initial"
                        position="relative"                     
                        />

                </div>
            </DialogComponent>

            <div id="calendar" className='col-lg-6 control-section'> 
                <div className='control-wrapper'>
                    <Iframe 
                        // url="https://lexbox-test-webgoogle.lefebvre.es/calendar/access/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2In0.8f30OHW3KtisOVjUASxjKYSHOIIaRqnvA593aaAfYgM/?prov=GO0"
                        // url="https://lexbox-test-webgraph.lefebvre.es/calendar/access/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2In0.8f30OHW3KtisOVjUASxjKYSHOIIaRqnvA593aaAfYgM/?prov=OU0"
                        url="http://localhost:7000/calendar/access/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2In0.8f30OHW3KtisOVjUASxjKYSHOIIaRqnvA593aaAfYgM/?prov=IM0"
                        width="754px"
                        height="425px"
                        id="myId"
                        frameBorder="0"
                        className="frame"
                        allow="fullscreen"
                       // sandbox='allow-same-origin'
                        display="initial"
                        //loading = "cargando..."
                        position="relative" 
                        />
                </div>
            </div> 
        </div>); 
    }
}
// &account=am9lbGRldHJpbmlkYWRAZ21haWwuY29t
//eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZENsaWVudGVOYXZpc2lvbiI6IkUxNjIxMzk2IiwiaWRFdmVudCI6IkFBTWtBRFl3TjJVNU9XWmxMV1V3WkRrdE5EUTNZaTA1TVRRMkxUTXhZbVV5TUdFeE1qY3dOZ0JHQUFBQUFBQUJHVHJpc3Q2NVI1WGxWZm1ZM0tBcUJ3QWNuQmlLTHdsS1FydmlCOFhrd3hhY0FBQUFBQUVOQUFBY25CaUtMd2xLUXJ2aUI4WGt3eGFjQUFHMDI3dFFBQUE9IiwiaWRBY3R1YXRpb24iOiIyMyIsInRpdGxlIjoicmV1bmlvbiBpbXBvcnRhbnRlIn0.Xfjw1EYSed8YNaYrqp5EzjVB27AumFDeG-_4jE09siw

//http://localhost:7000/calendar/access/?prov=IM0

export default Main;
import React, {Fragment} from 'react';
import {
    Inject,
    ProgressAnnotation, ProgressBarAnnotationDirective,
    ProgressBarAnnotationsDirective,
    ProgressBarComponent
} from "@syncfusion/ej2-react-progressbar";
import _ from 'lodash';

export class Step2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progress: -1,
            validContacts: this.props.contacts.filter( it => it.valid ).length
        };
        this.contacts = [];
        this.contactUploaded = this.contactUploaded.bind(this);
        this.contactListLoaded = this.contactListLoaded.bind(this);

        this.itv = null;
    }

    componentDidMount() {
        this.setState({progress: 0}, ()=>{
            console.log("******* CONTACTS: addEventListener: getContactListResult");
            window.addEventListener('getContactListResult', this.contactListLoaded);

        });
    }

    componentWillUnmount() {
        window.removeEventListener('contactUploaded', this.contactUploaded);

        if(this.itv) {
            clearInterval(this.itv);
            this.itv = null;
        }
    }

    uploadContacts(blackList) {
        window.addEventListener('contactUploaded', this.contactUploaded);

        const {contacts}=this.props;
        const contactList = _.uniqBy(contacts, 'email').filter( itm => (itm.valid && blackList.indexOf(itm.email) === -1) );

        if(contactList.length > 0) {
            this.setState({validContacts: contactList.length}, ()=>{
                this.itv = setInterval(()=> {
                    if(contactList.length === 0) {
                        clearInterval(this.itv);
                        this.itv = null;
                        return;
                    }
                    const c = contactList.shift();
                    this.uploadContact(c);
                }, 1000);
            })
        } else {
         // Proceso completado
            this.setState({validContacts: 0});
        }
    }

    uploadContact(contact) {
        this.contacts.push(contact);
        window.dispatchEvent(new CustomEvent('uploadContact', { detail: { contact }}));
    }

    contactUploaded(data) {
        const { progress } = this.state;
        const index = this.contacts.indexOf(data.detail.contact);
        if(index > -1) {
            this.contacts.splice(index, 1);
        }
        this.setState({progress: progress + 1});
    }

    render() {
        const {progress, validContacts} = this.state;
        let pc = 0;
        if(progress > -1 && validContacts > 0) {
             pc = Math.floor(progress * 100 / validContacts);
        } else if(validContacts === 0) {
            pc = 100;
        }

        return (
            <Fragment>
                <div className='panel-body'>
                    <div className="advice">Importando contactos. Por favor, no cierres la ventana mientras dure el
                        proceso.
                    </div>
                    <div className="advice"><p>Importando {progress} de {validContacts}</p></div>

                    <div className="progress-container">
                        <ProgressBarComponent id="label-container" ref={this.progresRef}
                                              type='Circular'
                                              width='160px'
                                              height='160px'
                                              cornerRadius='Round'
                                              progressColor="#001978"
                                              progressThickness={8}
                                              startAngle={180}
                                              endAngle={180}
                                              value={pc}
                                              animation={{
                                                  enable: false,
                                                  duration: 2000,
                                                  delay: 0,
                                              }}
                        >
                            <Inject services={[ProgressAnnotation]}/>
                            <ProgressBarAnnotationsDirective>
                                <ProgressBarAnnotationDirective className="annotation"
                                                                content={`${pc}%`}>

                                </ProgressBarAnnotationDirective>
                            </ProgressBarAnnotationsDirective>

                        </ProgressBarComponent>
                    </div>
                </div>
                <style jsx>{`
          .panel-body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin-left: auto;
            margin-right: auto;
            margin-top: 20px;
            box-sizing: border-box;
            height: 490px;
            width: 805px;
            border: 1px solid #d2d2d2;
            background-color: #ffffff;
            padding-top: 70px;
          }
          
          .advice {
            flex: 0;
            margin-top: 20px;
            text-align: center;
            width: 100%;
            height: 14px;
            color: #7f8cbb;
            font-family: MTTMilano-Medium;
            font-size: 18px;
            font-weight: 500;
            letter-spacing: 0;
            line-height: 24px;
          }
          
          .progress-container {
            flex: 1;
            width: 100%;
            height: 300px;
            display: flex;
            justify-content: center;
            align-content: flex-end;
            padding-top: 60px;
          }
          
          .e-control.e-progressbar.e-lib div {
            color: #001978;
            font-size: 26px;
          }

          
        `}</style>
            </Fragment>
        );
    }
}

function ValidateEmail(email) {
    if (!email || email === '') return false;

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return (true)
    }
    return (false)
}
import React, { Component } from 'react';
import i18n from 'i18next';
import Header from '../header/header';
import { base64Decode } from '../../services/services';
import { 
  PAGE_LOGIN
} from "../../constants";
import archiveMessageImg from "../../../../public/assets/archive-message.png"
import '../archive-message/archive-message.css';

class ArchiveMessage extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
          user: null
        };
      }

    componentDidMount() {
      this._isMounted = true;
      const user = base64Decode();
      this.setState({ user: user })
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    logout = async () => { 
      localStorage.removeItem('auth-centinela');
      this.props.changePage(PAGE_LOGIN);
    }


    click = async () => {
     
    };

    render() {
     const { 
       user
     } = this.state
      return (
        <div className="">  
            <Header logout={this.logout} user={user} />
            <div className="archive-message-img">
                <img src={archiveMessageImg} alt="Archivar mensajes" />
           </div>
           <p className="add-more-container">
              <a className="add-more" onClick={this.click}> 
                <span className="lf-icon-add-round"></span>
                <strong>{i18n.t('archive-message.button-title')}</strong>
              </a>
           </p>
        </div>
      );
    }
}

export default ArchiveMessage;
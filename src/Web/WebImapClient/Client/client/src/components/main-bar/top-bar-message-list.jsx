import React, {Fragment} from 'react';
import { connect } from "react-redux";
import {translate} from 'react-i18next';
import ButtonModules from './button-modules';
import ButtonUser from './button-user';
import mainCss from '../../styles/main.scss';
import styles from './top-bar-message-list.scss';
import {Link} from "react-router-dom";
import SearchBar from 'material-ui-search-bar'
import { setMessageFilterKey, setMessageFilterKeyword } from "../../actions/application";


const picUrl = 'assets/images/LogoLefebvre.png';

export class TopBarMessageList extends React.Component{
    constructor(props){
        super(props);
        this.state = {searchTerm: ""};
    }
    render() {
      return(
        <div className={mainCss['mdc-top-app-bar__row']}>      
        
            <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}  ${styles['modules-item-custom']}`}>  
                    <div>
                        <Link to="/"><img className={`${styles['main-header-img']}`} border="0" alt="Lefebvre" src={picUrl}></img></Link>
                    </div>

                {/* <div className={`${styles['main-header-imap-div']}`}>
                        <img border="0" alt="Lefebvre" src={picImap}></img>
                    </div>*/}
            </section>
            <section  className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}  ${styles['modules-item-custom']}`}>
            <SearchBar
                value = {this.state.searchTerm}
                onChange={(newSearchTerm) => this.setState({searchTerm: newSearchTerm})}
                onRequestSearch={() => {
                  this.props.setMessageFilter('USER_SEARCH');
                  this.props.setMessageFilterKeyword(this.state.searchTerm);
                }}
                onCancelSearch={() => {
                  this.props.setMessageFilter(null);
                  this.props.setMessageFilterKeyword(null);
                  this.setState({searchTerm: ""});
                }}
                placeholder={this.props.t('topBar.search')}
                style={{
                margin: '0 auto',
                width: '100%',
                maxWidth: 800
                }}
            />
            </section>
            
            <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-end']}  ${styles['modules-item-custom']}`}>
                        <ButtonUser className={`${styles['modules-item-custom']}`} />
                        <div className={`${styles['modules-item-custom-space']}`}></div>
                        <ButtonModules className={`${styles['modules-item-custom']}`} />
            </section>              
        </div>
      )       
    }
}

 
const mapDispatchToProps = dispatch => ({
  setMessageFilter: messageFilter => dispatch(setMessageFilterKey(messageFilter)),
  setMessageFilterKeyword: keyword => dispatch(setMessageFilterKeyword(keyword))
});

export default connect(
  null,
  mapDispatchToProps
)(translate()(TopBarMessageList));
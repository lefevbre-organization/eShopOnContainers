import React from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import TopBarButton from './top-bar-button';
import FilterDialog from './filter-dialog';
import MessageFilters, {getFromKey} from '../../services/message-filters';
import mainCss from '../../styles/main.scss';
import styles from './button-filter.scss';
import { preloadSignatures, preloadSignatures2} from '../../services/api-signaturit';
import { selectMessage, selectSignature } from "../../actions/application";
import { backendRequest, backendRequestCompleted, preDownloadSignatures } from '../../actions/messages';

export class ButtonFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false
    };
    this.handleOnToggleDialog = this.onToggleDialog.bind(this);
    this.handleOnCloseDialog = this.onCloseDialog.bind(this);
    this.handleOnRefresh = this.onRefresh.bind(this);
  }

  render() {
    const {t, activeMessageFilter} = this.props;
    const {dialogVisible} = this.state;
    const active = activeMessageFilter.key !== MessageFilters.ALL.key;
    const {lexon} = this.props;
    return <span
      className={`${styles['button-filter']} ${mainCss['mdc-menu-surface--anchor']}`}
      isotip={t('topBar.quickFilter')} isotip-position='bottom-end' isotip-size='small'
      isotip-hidden={dialogVisible.toString()}>
      <TopBarButton       
        onClick={this.handleOnRefresh}>refresh</TopBarButton>
      {/* <FilterDialog visible={dialogVisible} /> */}
    </span>;
  }

  // shouldComponentUpdate(nextProps, nextState){

  // }

  onRefresh(event){
    event.stopPropagation();
    this.props.backendRequest();
    setTimeout(() => {
      const {lexon} = this.props;
      if (this.props.application.selectedSignature === null){
        console.log('******************************');
        console.log('******************************');
        console.log('******************************');
        console.log('');
        console.log('button-filter.refreshClicked: Llamando a preloadSignatures(lexon.userId)');
        console.log('******************************');
        console.log('******************************');
        console.log('******************************');
        console.log('');
        
  
        this.props.preloadSignatures(lexon.userId);
        this.props.backendRequestCompleted();
  
      } else {
        
        this.props.preloadSignatures(lexon.userId);
        let signature = this.props.application.signatures.find(s => s.id === this.props.application.selectedSignature.id)
        this.props.signatureClicked(signature);
        this.props.backendRequestCompleted();
      }
  
    }, 1000);
  }

  componentDidMount() {
    window.addEventListener('click', this.handleOnCloseDialog);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleOnCloseDialog);
  }

  onToggleDialog(event) {
    this.setState({dialogVisible: !this.state.dialogVisible});
    event.stopPropagation();
  }

  onCloseDialog() {
    this.setState({dialogVisible: false});
  }
}

const mapStateToProps = state => ({
  activeMessageFilter: getFromKey(state.application.messageFilterKey),
  application: state.application,
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  preloadSignatures: (userId, auth) => preloadSignatures2(dispatch, userId, auth),
  signatureClicked: signature => {dispatch(selectSignature(signature));},
  backendRequest: () => dispatch(backendRequest()),
  backendRequestCompleted: () => dispatch(backendRequestCompleted())
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    preloadSignatures: (userId) => dispatchProps.preloadSignatures(userId, stateProps.application.user.credentials.encrypted),
    signatureClicked: signature => dispatchProps.signatureClicked(signature),
    backendRequest: () => dispatchProps.backendRequest(),
    backendRequestCompleted: () => dispatchProps.backendRequestCompleted()
  });
export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(translate()(ButtonFilter));

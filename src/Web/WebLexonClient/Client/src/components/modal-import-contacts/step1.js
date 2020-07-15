import React, { Fragment } from 'react';
import i18n from 'i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';
import _ from 'lodash';

import {getUserContacts} from '../../services/services-lexon';

export class Step1 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
      valid: [],
      errors: [],
      contacts: [],
      counters: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    };

    this.contactListLoaded = this.contactListLoaded.bind(this);
  }

  async componentDidMount() {
    window.addEventListener('getContactListResult', this.contactListLoaded);
    window.dispatchEvent(new CustomEvent('getContactList'));

  }

  componentWillUnmount() {
    window.removeEventListener('getContactListResult', this.contactListLoaded);
  }

  async contactListLoaded(data) {
    const {user, bbdd} = this.props;

    window.removeEventListener('getContactListResult', this.contactListLoaded);

    try {
      this.props.onLoading(true);
      const aux = await getUserContacts(bbdd, user);
      aux.result.data = [ { ...aux.result.data[0], "email":"juandvallero@gmail.com"}];
      const counters = this.validateContacts(aux.result.data);
      const blackList = data.detail.contacts;
      const validContacts = _.uniqBy(aux.result.data, 'email').filter( itm => (itm.valid && blackList.indexOf(itm.email) === -1) )
      const errorContacts = _.difference(aux.result.data, validContacts);

      this.setState({
        contacts: aux.result.data,
        valid: validContacts,
        errors: errorContacts,
        counters
      }, ()=>{
        this.props.onContacts(validContacts, errorContacts)
        this.props.onLoading(false);
      })
    } catch(err) {
      console.log(err);
    }

  }

  validateContacts(contacts) {
    const types = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    for(let i = 0; i < contacts.length; i++) {
      const c = contacts[i];
      c.valid = ValidateEmail(c.email);
      types[c.idType] ++;
    }

    return types;
  }

  render() {
    const { valid, errors, contacts, counters } = this.state;

    return (
      <Fragment>
        <div className='panel-body'>
          <div className='panel-inner'>
            <div className='panel-inner-header'>
              <span className='panel-inner-header-number'>{contacts.length}</span>
              <span className='panel-inner-header-text'>{i18n.t('modal-import-contacts.ntotal')}</span>
            </div>
            <PerfectScrollbar className='panel-inner-body'>
              <span className='lf-icon-contacts'></span>
              <ul>
                { counters[2] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.2')}</span>
                  <span className='entity-number'>({counters[2]})</span>
                </li> }
                { counters[3] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.3')}</span>
                  <span className='entity-number'>({counters[3]})</span>
                </li> }
                { counters[4] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.4')}</span>
                  <span className='entity-number'>({counters[4]})</span>
                </li> }
                { counters[5] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.5')}</span>
                  <span className='entity-number'>({counters[5]})</span>
                </li> }
                { counters[6] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.6')}</span>
                  <span className='entity-number'>({counters[6]})</span>
                </li> }
                { counters[7] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.7')}</span>
                  <span className='entity-number'>({counters[7]})</span>
                </li> }
                { counters[8] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.8')}</span>
                  <span className='entity-number'>({counters[8]})</span>
                </li> }
                { counters[9] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.9')}</span>
                  <span className='entity-number'>({counters[9]})</span>
                </li> }
                { counters[10] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.10')}</span>
                  <span className='entity-number'>({counters[10]})</span>
                </li> }
                { counters[11] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.11')}</span>
                  <span className='entity-number'>({counters[11]})</span>
                </li> }
                { counters[12] > 0 && <li>
                  <span className='entity-name'>{i18n.t('classification.12')}</span>
                  <span className='entity-number'>({counters[12]})</span>
                </li> }
              </ul>
            </PerfectScrollbar>
          </div>
          <div className='panel-inner'>
            <div className='panel-inner-header'>
              <span className='panel-inner-header-number'>{valid.length}</span>
              <span className='panel-inner-header-text'>{i18n.t('modal-import-contacts.validated')}</span>
            </div>
            <div className='panel-inner-body'>
              <span className='lf-icon-check-round'></span>
            </div>
          </div>
          <div className='panel-inner'>
            <div className='panel-inner-header'>
              <span className='panel-inner-header-number'>{errors.length}</span>
              <span className='panel-inner-header-text'>{i18n.t('modal-import-contacts.error')}</span>
            </div>
            <div className='panel-inner-body'>
              <span className='lf-icon-warning'></span>
            </div>
            { errors.length > 0 && <div className='panel-inner-bottom' onClick={ ()=>{ this.props.onShowErrors(); } }>
              <span className='lf-icon-visible' style={{ flex: 0 }}></span>
              <span>{i18n.t('modal-import-contacts.errors-report')}</span>
            </div>}
          </div>
        </div>
        <style jsx>{`
          .panel-inner-body .lf-icon-contacts {
            z-index: 0;
            position: absolute;
            color: #ccd1e4;
            opacity: 0.2;
          }

          .panel-inner-body .lf-icon-warning {
            color: #c43741;
            opacity: 0.2;
          }

          .panel-inner-body .lf-icon-check-round {
            color: green;
            opacity: 0.2;
          }

          .panel-inner-body ul {
            z-index: 1;
            height: 340px;
            width: 100%;
            margin: 0;
            padding: 10px;
          }

          .panel-inner-body ul li {
            font-family: MTTMilano-Medium;
            margin-top: 4px;
            height: 30px;
            border-bottom: 1px solid #ccd1e4;
            display: flex;
            justify-content: space-between;
          }

          .panel-inner-body ul li span {
            font-size: 14px;
          }

          .panel-inner-body ul li span.entity-name {
            color: #001978;
          }

          .panel-inner-body ul li span.entity-number {
            color: #666;
          }

          .panel-body {
            display: flex;
            flex-direction: row;
            margin-left: auto;
            margin-right: auto;
            margin-top: 20px;
            box-sizing: border-box;
            height: 490px;
            width: 805px;
            border: 1px solid #d2d2d2;
            background-color: #ffffff;
          }

          .panel-inner {
            flex: 1;
            padding: 20px 10px;
          }

          .panel-inner-header {
            background-color: #001978;
            height: 75px;
            justify-content: flex-start;
            display: flex;
          }

          .panel-inner-header-number {
            height: 33px;
            width: 147px;
            color: #ffffff;
            font-family: MTTMilano-Medium;
            font-size: 45px;
            font-weight: bold;
            letter-spacing: 0;
            line-height: 24px;
            justify-content: center;
            align-items: center;
            margin-left: 10px;
            margin-top: 30px;
            flex: 0;
          }

          .panel-inner-header-text {
            height: 13px;
            width: 87px;
            color: #ffffff;
            font-family: MTTMilano-Medium;
            font-size: 16px;
            font-weight: bold;
            margin-top: 14px;
            margin-left: 4px;
          }

          .panel-inner-body {
            overflow-y: auto;
            box-sizing: border-box;
            height: 340px;
            width: 248px;
            background-color: #e5e8f1;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 200px;
          }

          .panel-inner-bottom {
            box-sizing: border-box;
            height: 34px;
            width: 248px;
            background-color: #c43741;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .panel-inner-bottom span {
            height: 11px;
            width: 180px;
            color: #ffffff;
            font-family: MTTMilano-Medium;
            font-size: 13px;
            font-weight: bold;
            line-height: 19px;
            text-align: center;
          }

          .panel-inner-bottom span.lf-icon-visible {
            font-size: 20px;
          }

          .panel-i .modal-subtitle {
            margin-top: 20px;
            height: 14px;
            width: 100%;
            color: #7f8cbb;
            font-family: MTTMilano-Medium;
            font-size: 18px;
            font-weight: 500;
            letter-spacing: 0;
            line-height: 24px;
            text-align: center;
          }
        `}</style>
      </Fragment>
    );
  }
}

function ValidateEmail(email)
{
  if(!email || email === '') return false;

  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
  {
    return (true)
  }
  return (false)
}
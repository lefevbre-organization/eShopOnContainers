import React, { Fragment } from 'react';
import i18n from 'i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';

import {getUserContacts} from '../../services/services-lexon';

export class Step4 extends React.Component {
  constructor(props) {
    super(props);

  }
  async componentDidMount() {

  }

  renderItem(item) {
    return <div className='panel-body-row'>
      <div className='panel-body-row-left'>
        <div className="panel-body-row-icon">
        <span style={{color: '#D0021B'}} className='lf-icon lf-icon-user'></span>
        </div>
      </div>
      <div className='panel-body-row-right'>
        <div className='panel-body-row-name'>{item.name}</div>
        {item.valid && <div className='panel-body-row-error'><span>{i18n.t('modal-import-contacts.step4.error1a')}: </span><span style={{color: '#7C868C'}}>{i18n.t('modal-import-contacts.step4.error1b')}</span></div>}
        {!item.valid && <div className='panel-body-row-error'><span>{i18n.t('modal-import-contacts.step4.error2a')}: </span><span style={{color: '#7C868C'}}>{i18n.t('modal-import-contacts.step4.error2b')}</span></div>}
      </div>
    </div>
  }

  render() {
    const {errors, valids} = this.props;
    return (
      <Fragment>
        <div className='panel-body'>
          <div className='panel-body-header'>
            <div>{i18n.t('modal-import-contacts.step4.validationErrors')}</div>
            <div>{i18n.t('modal-import-contacts.step4.total')}: {errors.length}</div>
          </div>
          <PerfectScrollbar>
          <div className="panel-warning">
            <div className="panel-error-icon"><span className="lf-icon lf-icon-warning"></span></div>
            {valids > 0 && <div>{`${i18n.t('modal-import-contacts.step4.report2a')} ${valids} ${i18n.t('modal-import-contacts.step4.report2b')}`}</div>}
            {valids === 0 && <div>{i18n.t('modal-import-contacts.step4.report1')}</div>}
          </div>
            { errors.map( err => this.renderItem(err)) }
          </PerfectScrollbar>
        </div>
        <style jsx>{`

          .panel-error,
         .panel-warning {
            color: #fff;
            display: flex;
            color: #FFFFFF;
            font-family: MTTMilano-Medium;
            font-size: 19px;
            font-weight: 500;
            letter-spacing: 0;
            line-height: 26px;
            align-items: center;
          }
          
          .panel-warning {
            background-color: #001978;
          } 
                             
          .panel-error-icon{
            font-size: 68px;
            padding: 30px;
          } 
          
          .panel-body {
            display: flex;
            flex-direction: column;
            margin-left: auto;
            margin-right: auto;
            margin-top: 20px;
            box-sizing: border-box;
            height: 490px;
            width: 805px;
            border: 1px solid #d2d2d2;
            background-color: #fff;
            padding-left: 15px;
            padding-right: 15px;
          }       
          
          .panel-body-header {
            display: flex;
            width: 100%;
            justify-content: space-between;
            padding: 10px;
            color: #001978;
            font-family: MTTMilano-Medium;
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #001978;
          }   
          
          .panel-body-row {
            display: flex;
            flex-direction: row;
            border-bottom: 1px solid #D0021B;
          }
          
          .panel-body-row-name {
            color: #7C868C;
            font-family: MTTMilano-Medium;
            font-size: 14px;
            font-weight: 500;
            line-height: 0px;
          }
          
          .panel-body-row-error {
            color: #D0021B;
            font-family: MTTMilano-Medium;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0;
          }
          
          .panel-body-row-left {
            flex: 0;
            width: 50px;
          }
          
          .panel-body-row-icon {
            width:50px;
            height: 100%;
            justify-content: center;
            align-items: center; 
            display: flex;
          }
          
          .panel-body-row-right {
            flex: 1;
            margin-bottom: 0px;
            margin-top: 20px;
          }
          
        `}</style>
      </Fragment>
    );
  }
}

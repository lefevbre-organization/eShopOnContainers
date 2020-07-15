import React, { Fragment } from 'react';
import i18n from 'i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';

import {getUserContacts} from '../../services/services-lexon';

export class Step3 extends React.Component {
  constructor(props) {
    super(props);

  }
  async componentDidMount() {

  }

  render() {
    const { valid, errors, contacts, counters } = this.state;

    return (
      <Fragment>
        <div className='panel-body'>
        </div>
        <style jsx>{`
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
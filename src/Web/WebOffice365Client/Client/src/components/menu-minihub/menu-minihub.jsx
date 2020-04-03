import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import i18n from "i18next";
import ACTIONS from '../../actions/lexon';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

import {
    getProducts,
} from '../../api_graph/minihub';

import './menu-minihub.css';

class MenuMinihub extends Component {
  constructor(props) {
    super(props);
    this.state = {
        dropdownOpen: false,
        products: []
    };
    this.wrapperRef = null;
    this.buttonRef = null;
    this.toggle = this.toggle.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    }

   
    componentDidMount() {
        const { lexon } = this.props;
        const _this = this;
        if (lexon.userId) {
            getProducts(lexon.userId)
                .then(result => {
                    if (result.errors.length === 0) {
                        _this.setState({
                           
                            products: result.data.filter(                              
                                product => product.indAcceso !== '1'
                            )
                           
                        });
                    } else {
                        let errors;
                        result.errors.forEach(function (error) {
                            errors = `${error} `;
                        });
                        console.log('error ->', errors);
                    }
                })
                .catch(error => {
                    console.log('error ->', error);
                });
        }

        document.addEventListener('mousedown', this.handleClickOutside);
    }


  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside(event) {
    const { showSign } = this.state;
    if (showSign === true) {
      event.stopPropagation();
      return;
    }
    if (
      this.wrapperRef &&
      this.buttonRef &&
      !this.wrapperRef.contains(event.target) &&
      !this.buttonRef.contains(event.target)
    ) {
      this.setState({
        dropdownOpen: false
      });
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
     
    const { dropdownOpen, products } = this.state;

    return (
      <Fragment>
        <div
          className='menu-minihub'
          onClick={this.toggle}
          ref={ref => (this.buttonRef = ref)}>
          <img
            className='mx-2 profile-pic'
            src='assets/img/icon-products.png'
          />
        </div>
        {dropdownOpen === true && (
          <div>
            <span className='dropdown-menu-arrow dropdown-menu-minihub-arrow'></span>
            <div
              className='menu-minihub-container'
              ref={ref => (this.wrapperRef = ref)}>
              <div className='content'>   
                <div className='header'>
                  <span className='lf-icon-close' onClick={this.toggle}></span>
                  <div className='menu-title'>
                    <span>{i18n.t('menu-minihub.products')}</span>
                  </div>                                
                </div> 
                  <Fragment>
                    <div className='accounts-container menu-main-panel'>
                      <PerfectScrollbar options={{ suppressScrollX: true }}>
                        <div className="menu-header__body-generic">
                          <ul class="menu-header__blocks menu-header__blocks--products">
                          {products.map(product => (
                            <li class="menu-header__block-product ng-scope">                                                   
                              <a className="menu-header__block-icon-product menu-header__block-icon-product--product-1"
                                 href={product.url}
                                 target="_blank"                                     
                               >
                                  <i className={product.icono}></i>
                              </a>
                              <div className="menu-header__block-name-product">
                                      <span className="ng-binding">{product.descHerramienta}</span>
                              </div>
                            </li>                                                   
                          ))}
                          </ul>
                        </div>                     
                      </PerfectScrollbar>
                                </div>
                    <div class="menu-header__blocks">
                      <span class="menu-header__text-products" data-translate="menu-header.paragraph-products">{i18n.t('menu-minihub.footer')}</span>
                    </div>
                  </Fragment>               
              </div>
            </div>
          </div>
        )}
        <style jsx>{`
          .e-rte-content span {
            display: inline !important;
          }

          header h1 {
            color: black;
          }
          .buttons-footer {
            position: absolute;
            bottom: 10px;
            right: 10px;
          }

          .buttons-footer button {
            margin-right: 15px;
          }

          .buttons-footer button:hover {
            margin-right: 15px;
          }

          .menu-minihub {
            cursor: pointer;
          }


          .add-more-accounts > span {
            color: #001978 !important;
          }

          .menu-minihub-container {
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
              0 6px 20px 0 rgba(0, 0, 0, 0.19);
            border: 1px solid #cdd1e0;
            border-radius: 0;
            color: #001978;
          }

          .show-sign.menu-minihub-container {
            width: 800px;
            height: 446px;
          }

          .dropdown-menu-minihub-arrow {
            /* display: inline; */
            top: 25px;
            right: 118px;
            position: absolute;
            left: auto;
            width: 24px;
            height: 24px;
          }

          .dropdown-menu-minihub-arrow:before {
            bottom: -13px;
            right: -100px;
            border-bottom-color: rgba(0, 0, 0, 0.15);
          }

          .dropdown-menu-minihub-arrow:after {
            bottom: -13px;
            right: -100px;
            border-bottom-color: #fff;
          }

          .mu-subheader {
            font-family: MTTMilano, Lato, Arial, sans-serif;
            cursor: default;
            text-align: left !important;
            color: #333333 !important;
            font-size: 14px;
          }
          .menu-minihub-container {
            text-align: center;
          }

          .user-image-and-name {
            padding: 24px;
          }

          .lf-icon-add-round {
            color: #001978;
          }
          .content .header {
            background-color: white;
            text-align: right;
            border: none;
            display: block;
            padding: 24px;
            margin-bottom: 2.5rem;
            font-size: 0.875rem;
            color: #6c757d;
            white-space: nowrap;
          }
          .content .header > span {
            color: #001978;
            font-size: 13px;
            cursor: pointer;
          }

          .user-image-and-name .scrollbar-container {
            width: 100%;
          }

          .menu-minihub-container {
            position: absolute;
            background-color: white;
            top: 60px;
            right: 7px;
            width: 385px;
            z-index: 110;
          }

          .menu-title {
            font-size: 18px;
            font-weight: 500;
            border-bottom: 1px solid;
            padding-bottom: 5px;
            text-align: left;
            color: #001978;
          }
          .menu-title .mb-5 {
            text-decoration: none;
            color: #001978 !important;
          }

          .add-sign {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-family: MTTMilano-Bold, Lato, Arial, sans-serif;
            justify-content: center;
            color: #001978;
            cursor: pointer;
            margin-bottom: 10px;
          }
          .add-sign p {
            text-decoration: underline;
            padding: 0;
            margin: 0;
            margin-left: 5px;
          }
          .add-sign .lf-icon-feather {
            font-size: 20px;
            color: #001978;
          }

          .e-content.e-lib.e-keyboard {
            text-align: left;
          }
        `}</style>
      </Fragment>
    );
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators({ setSign: ACTIONS.setSign }, dispatch);

const mapStateToProps = state => ({
  lexon: state.lexon
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuMinihub);

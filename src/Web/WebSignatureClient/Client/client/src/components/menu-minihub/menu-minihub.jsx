import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import i18n from "i18next";
import ACTIONS from '../../actions/lefebvre';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import {
    getProducts,
} from '../../services/minihub';
import styles from './menu-minihub.scss';

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
        const { lefebvre } = this.props;
        const _this = this;
        if (lefebvre.userId) {
            getProducts(lefebvre.userId)
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
    const { onToggleDialog } = this.props;

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
      this.setState(
        {
          dropdownOpen: false
        },
        () => {
          if (onToggleDialog) {
            onToggleDialog(this.state.dropdownOpen);
          }
        }
      );
    }
  }

  toggle() {
    const { onToggleDialog } = this.props;

    this.setState(
      {
        dropdownOpen: !this.state.dropdownOpen
      },
      () => {
        if (onToggleDialog) {
          onToggleDialog(this.state.dropdownOpen);
        }
      }
    );
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
            src='assets/images/icon-products.png'
          />
        </div>
        {dropdownOpen === true && (
          <div>
            <span className={`dropdown-menu-arrow ${styles['dropdown-menu-minihub-arrow']}`}></span>
            <div
              className={styles['menu-minihub-container']}
              ref={ref => (this.wrapperRef = ref)}>
              <div className={styles['content']}>   
                <div className={styles['header']}>
                  <span className='lf-icon-close' onClick={this.toggle}></span>
                  <div className={styles['menu-title']}>
                    <span>{i18n.t('menu-minihub.products')}</span>
                  </div>                                
                </div> 
                  <Fragment>
                    <div className={`accounts-container ${styles['menu-main-panel']}`}>
                      <PerfectScrollbar options={{ suppressScrollX: true }}>
                        <div className={styles['menu-header__body-generic']}>
                          <ul className={`${styles['menu-header__blocks']} menu-header__blocks--products`}>
                          {products.map(product => (
                            <li className={`${styles['menu-header__block-product']} ng-scope`}>                                                   
                              <a className={`${styles['menu-header__block-icon-product']} menu-header__block-icon-product--product-1`}
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
                    <div className={styles['menu-header__blocks']}>
                      <span className={styles['menu-header__text-products']}>{i18n.t('menu-minihub.footer')}</span>
                    </div>
                  </Fragment>     
                </div>
              </div>
            </div>
         
        )}
      </Fragment>
    );
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators({ setSign: ACTIONS.setSign }, dispatch);

const mapStateToProps = state => ({
  lefebvre: state.lefebvre
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuMinihub);

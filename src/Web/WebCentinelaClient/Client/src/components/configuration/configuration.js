import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import i18n from "i18next";
import { connect } from "react-redux";
import Switch from "react-switch";
import { saveUserConfig } from "../../services/services-lexon";
import ACTIONS from "../../actions/selections";
import APP_ACTIONS from "../../actions/applicationAction";

import { PAGE_SELECT_ACTION } from "../../constants";
class Configuration extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMessage: false,
      config: this.props.user.config
    };

    this.handleOnClick = this.handleOnClick.bind(this);
  }

  componentDidMount() {
    console.log(this.props.user)
  }

  handleOnClick(id) {
    const newConfig = Object.assign({}, this.state.config);
    newConfig[id] = !newConfig[id]
    this.setState({ config: newConfig }, () => {
      this.props.setConfig(this.state.config)
      // Save the configuration on user
      const conf = {
        "getContacts": this.state.config[id],
        "defaultAdjunction": "onlyAttachments",
        "defaultEntity": "contacts"
      };
      saveUserConfig(conf, this.props.user.idNavision)
    })
  }

  renderShowMessageSelectCompany() {
    const { showMessage } = this.state;

    if (showMessage) {
      return (
        <p className="d-flex align-items-center business-alert-warning">
          <span className="lf-icon-close-round-full"></span>
          <strong>{i18n.t("select-company.must-select-company")}</strong>
        </p>
      );
    }
  }

  render() {
    return (
      <Fragment>
        <div className="container">
          <div className="row config-title">
            <a href="#" onClick={() => { this.props.changePage(PAGE_SELECT_ACTION) }}>
              <span
                className="icon lf-icon-arrow-left"></span>
            </a>
            <p>{i18n.t("configuration.configuration")}</p>
          </div>
        </div>
        <ul className="options-list">
          <li className="option-container">
            <div>
              <Switch height={18} width={36} onColor={"#001978"} checkedIcon={false} uncheckedIcon={false} onChange={() => { this.handleOnClick("getContacts") }} checked={this.state.config.getContacts} />
              <span>{i18n.t("configuration.classify-contacts")}</span>
            </div>
          </li>
        </ul>
        <div className="version-container">
          <div disabled className="version">{i18n.t("configuration.version")}: {window.RELEASE}</div>
        </div>
        <style jsx>{`
        .version {
          position: absolute;
          right: 5px;   
          color: #949191 !important;
          font-family: MTTMilano, Lato, Arial, sans-serif;
          font-size: 0.9em !important;
      }

      .version-container {
        bottom: 0;
        right: 0;
        position: absolute;
        width: 100%;
        height: 20px;
      }

        .options-list {
          padding: 15px;
        }

        .option-container>div {
          display: flex;
          line-height: 1.25;
          align-items: center;
        }

        .option-container span {
          font-family: MTTMilano, Lato, Arial, sans-serif;
          font-weight: 600;
          margin-left: 10px;
          color: #001978;
        }

        .config-title {
          border-bottom: 2px solid #001978;
          margin: 10px 0;
        }

        .config-title a:hover {
          background-color: #e5e8f1;
        }

        .config-title a {
          border-radius: 50%;
          width: 34px;        
          height: 34px;
          text-align: center;
          padding-top: 5px;
        }

        .config-title p {
          color: #7f8cbb;
          font-size: 12px;
          font-weight: bold;
          line-height: 32px;
          text-align: center;
          text-transform: uppercase;
          font-family: MTTMilano, Lato, Arial, sans-serif;
          margin-bottom: 0;
          margin-left: 10px;
        }

        .icon {
          font-size: 20px;
          color: #001978;
        }
      `}</style>
      </Fragment>
    );
  }
}

Configuration.propTypes = {
  user: PropTypes.string.isRequired,
  companies: PropTypes.array.isRequired,
  initialBBDD: PropTypes.object.isRequired
};

const mapStateToProps = state => {
  return {
    config: state.applicationReducer.config
  };
};

const mapDispatchToProps = dispatch => ({
  setConfig: item => dispatch(APP_ACTIONS.setConfig(item))
});

export default connect(mapStateToProps, mapDispatchToProps)(Configuration);

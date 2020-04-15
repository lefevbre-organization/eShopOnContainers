import React, { Component } from "react";
import "./classification-list-search.css";
import i18n from "i18next";
import PropTypes from "prop-types";

class ClassificationListSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showSearch: false,
      search: ""
    };

    this._handleOnclick = this._handleOnclick.bind(this);
    this._handleOnclickSearch = this._handleOnclickSearch.bind(this);
    this._handleOnChange = this._handleOnChange.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);

    // Generate random id name

    this.id = generateUUID();

    console.log("MOUNTING LIST SEARCH")
  }

  _handleOnclick() {
    if (this.state.showSearch === true) {
      this.setState({ search: "" }, () => {
        this._handleOnclickSearch();
      })
    }
    this.setState({ showSearch: !this.state.showSearch });
  }

  _handleOnclickSearch(event) {
    const { searchResultsByType } = this.props;

    searchResultsByType(null, this.state.search);
  }

  _handleOnChange(event) {
    this.setState({ search: event.target.value });
  }

  _handleKeyPress(e) {
    const { searchResultsByType } = this.props;

    if (e.keyCode === 13) {
      searchResultsByType(null, e.target.value);
    }
  }

  Search(text) {
    this.setState({ search: text, showSearch: true }, () => {
      this._handleOnclickSearch()
    })
  }

  render() {
    const { countResults, closeClassName = "" } = this.props;
    const { showSearch } = this.state;

    const classListSearcher = showSearch
      ? `lexon-clasification-list-searcher ${closeClassName} opened`
      : `lexon-clasification-list-searcher ${closeClassName}`;
    const classTriggerShow = showSearch
      ? "search-trigger-show invisible"
      : "search-trigger-show";

    return (
      <div className="lexon-clasification-list-search">
        <div className="lexon-clasification-list-results">
          {countResults > -1 &&
            <p>
              {i18n.t("classification-list-search.results-total")}
              <strong>{countResults}</strong>
            </p>
          }
          <span
            className={classTriggerShow}
            title={i18n.t("classification-list-search.show-search")}
            onClick={this._handleOnclick}
          >
            <strong className="sr-only sr-only-focusable">
              {i18n.t("classification-list-search.show-search")}
            </strong>
            <span className="lf-icon-search"></span>
          </span>
        </div>
        <div className={classListSearcher}>
          <label htmlFor="search">
            <span
              className="lf-icon-search"
              onClick={this._handleOnclickSearch}
            ></span>
            <strong className="sr-only sr-only-focusable">
              {i18n.t("classificaction-list-search.assigned-to")}
            </strong>
          </label>
          <input
            type="text"
            className="form-control"
            id={this.id}
            value={this.state.search}
            onChange={this._handleOnChange}
            onKeyDown={this._handleKeyPress}
          />
          <span
            className={`search-trigger-hide ${closeClassName}`}
            title={i18n.t("classification-list-search.hide-search")}
            onClick={this._handleOnclick}
          >
            <strong className="sr-only sr-only-focusable">
              {i18n.t("classification-list-search.hide-search")}
            </strong>
            <span className="lf-icon-close"></span>
          </span>
        </div>
        <style jsx>{`

        .lexon-clasification-list-searcher input:focus {
          outline: none !important;
          box-shadow: none !important;
          background: none !important;
          border: none !important;        
          }

          .search-trigger-show {
            color: #001978;
            cursor: pointer;
            font-size: 16px;
            line-height: 45px;
            margin-right: 5px;
          }

          .search-trigger-hide {
            color: #001978;
            cursor: pointer;
            font-size: 16px;
            line-height: 45px;
          }

          .lexon-clasification-list-search .lexon-clasification-list-results {
            text-align: right;
          }

          
          .lexon-clasification-list-searcher,
          .lexon-clasification-list-searcher.opened {
            color: white !important;
          }
        `}</style>
      </div>
    );
  }
}

ClassificationListSearch.propTypes = {
  searchResultsByType: PropTypes.func.isRequired,
  countResults: PropTypes.number.isRequired
};

export default ClassificationListSearch;


function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

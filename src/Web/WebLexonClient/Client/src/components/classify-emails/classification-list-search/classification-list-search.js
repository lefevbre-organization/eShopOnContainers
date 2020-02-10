import React, { Component } from "react";
import "./classification-list-search.css";
import i18n from "i18next";
import PropTypes from "prop-types";

class ClssificationListSearch extends Component {
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
  }

  _handleOnclick() {
    if(this.state.showSearch === true) {
      this.setState({search: ""}, ()=>{
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

  render() {
    const { countResults } = this.props;
    const { showSearch } = this.state;

    const classListSearcher = showSearch
      ? "lexon-clasification-list-searcher opened"
      : "lexon-clasification-list-searcher";
    const classTriggerShow = showSearch
      ? "search-trigger-show invisible"
      : "search-trigger-show";

    return (
      <div className="lexon-clasification-list-search">
        <div className="lexon-clasification-list-results">
          <p>
            {i18n.t("classification-list-search.results-total")}
            <strong>{countResults}</strong>
          </p>
          <a
            href="#/"
            className={classTriggerShow}
            title={i18n.t("classification-list-search.show-search")}
            onClick={this._handleOnclick}
          >
            <strong className="sr-only sr-only-focusable">
              {i18n.t("classification-list-search.show-search")}
            </strong>
            <span className="lf-icon-search"></span>
          </a>
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
            id="search"
            value={this.state.search}
            onChange={this._handleOnChange}
            onKeyDown={this._handleKeyPress}
          />
          <a
            href="#/"
            className="search-trigger-hide"
            title={i18n.t("classification-list-search.hide-search")}
            onClick={this._handleOnclick}
          >
            <strong className="sr-only sr-only-focusable">
              {i18n.t("classification-list-search.hide-search")}
            </strong>
            <span className="lf-icon-close"></span>
          </a>
        </div>
      </div>
    );
  }
}

ClssificationListSearch.propTypes = {
  searchResultsByType: PropTypes.func.isRequired,
  countResults: PropTypes.number.isRequired
};

export default ClssificationListSearch;

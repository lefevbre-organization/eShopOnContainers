import React, {Component} from 'react';
//import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import {validateEmail} from '../../services/validation';
import mainCss from './composeMessage.scss';
import { getContacts } from "../../api/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";


export class HeaderAddress extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.handleOnSuggestionChange = this.onSuggestionChange.bind(this);
    this.handleOnSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.handleOnSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.handleOnSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.handleOnHeaderKeyDown = this.onHeaderKeyDown.bind(this);
    this.handleOnHeaderBlur = this.onHeaderBlur.bind(this);

    this.state = {
      value: '',
      suggestions: []
    };
  }

  render() {
    const {
      id,
      className, chipClassName, autoSuggestClassName, autoSuggestMenuClassName,
      label, addresses, onAddressRemove
    } = this.props;
    const {suggestions, value} = this.state;
    return (
      <div className={`input-group`} onClick={() => this.fieldClick()}
        onDragOver={e => e.preventDefault()} onDrop={e => this.onDrop(e, id)}>
        <div className={'input-group-prepend'}><span className="input-group-text">{label}</span></div>
        {addresses.map((address, index) => (
          <div key={index} className={`mdc-chip`}
            draggable={true}
            onDragStart={event => HeaderAddress.onAddressDragStart(event, id, address)}>
            <div className={'mdc-chip__text'}>{address}</div>
            <FontAwesomeIcon icon={faTimesCircle} size="1x" onClick={() => onAddressRemove(id, address)} className={'mdc-chip-icon'}/>
          </div>
        ))}
        <Autosuggest
          suggestions={suggestions}
          ref={this.inputRef}
          inputProps={{
            id: id,
            // type: 'email', <- Chrome in combination with autosuggest has bug with backspace, must perform manual validation
            type: 'text',
            value: value,
            onChange: this.handleOnSuggestionChange,
            onKeyDown: this.handleOnHeaderKeyDown,
            onBlur: this.handleOnHeaderBlur
          }}
          getSuggestionValue={HeaderAddress.getSuggestionValue}
          renderSuggestion={HeaderAddress.renderSuggestion}
          onSuggestionsFetchRequested={this.handleOnSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.handleOnSuggestionsClearRequested}
          onSuggestionSelected={this.handleOnSuggestionSelected}
          theme={{
            container: `header-address-container`,
            suggestionsContainer: `header-address-suggestions-container`,
            suggestionsContainerOpen: `header-address-suggestions-containerOpen`,
            suggestionsList: `header-address-suggestions-list`,
            suggestion: 'header-address-suggestion',
            suggestionHighlighted:'header-address-suggestion-highlighted'
          }}
        />
      <style jsx>{`
          .header-address-suggestions-container {
            position: absolute;
            z-index: 2;
            background-color: white;
            box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
          }

          .header-address-container {
            flex: 1;
          }

          .header-address-container > input {
            width: 100%;
            border: none;
            padding-left: 4px;
          }

          .header-address-container > input:focus {
            outline: none;
          }

          .header-address-suggestions-list {
            text-align: left;
            padding: 0px;
            max-height: 300px;
            overflow-y: auto;
          }

          .header-address-suggestion {
            cursor: pointer;
          }

          .header-address-suggestions-list > li {
            padding: 0 20px 0 10px;
          }

          .header-address-suggestion-highlighted {
            background-color: rgba(0, 0, 0, 0.1);
          }

          .mdc-chip {
            will-change: transform, opacity;
            border-radius: 16px;
            color: rgba(0, 0, 0, 0.87);
            font-family: Roboto, sans-serif;
            -moz-osx-font-smoothing: grayscale;
            -webkit-font-smoothing: antialiased;
            font-size: 0.875rem;
            line-height: 1.25rem;
            font-weight: 400;
            letter-spacing: 0.01786em;
            text-decoration: inherit;
            text-transform: inherit;
            display: inline-flex;
            position: relative;
            align-items: center;
            box-sizing: border-box;
            outline: none;
            cursor: pointer;
            overflow: hidden;

            background-color: white;
            padding: 6px 11px;
            border-width: 1px;
            border-style: solid;
            border-color: rgba(51, 51, 51, 0.25);
            height: 21px;
            margin: 6px 6px 2px 0;
          }

          .mdc-chip:hover {
            background-color: rgba(0, 0, 0, 0.1);
          }
          
          .mdc-chip__text {
            white-space: nowrap;
            font-size: 12px;
        }

        .mdc-chip-icon {
          margin: 0 -4px 0 4px;
        }
          
      `}</style>
      </div>
    );
  }

  fieldClick() {
    this.inputRef.current.input.focus();
  }

  /**
   * Clears any HTML 5 validation errors from the provided target.
   *
   * @param target
   */
  static clearValidation(target) {
    target.setCustomValidity('');
  }

  onSuggestionChange(event, {newValue}) {
    this.setState({value: newValue});
  }

  filterItems(ar, query) {
    return ar.filter(function (el) {
          return el.toLowerCase().indexOf(query.toLowerCase()) > -1;
    })
  }
  async onSuggestionsFetchRequested({ value }) {
        var contacts = await getContacts();
        this.setState({ suggestions: this.filterItems(contacts, value) });
  }

  onSuggestionsClearRequested() {
    this.setState({suggestions: []});
  }

  onSuggestionSelected(event, {suggestionValue}) {
    this.setState({value: ''});
    this.props.onAddressAdd(this.props.id, suggestionValue);
    //setTimeout(() => HeaderAddress.clearValidation(this.inputRef.current.input));
  }

  /**
   * Computes the value for the provided suggestion object, as suggestions are an array of strings, no computation is
   * required.
   *
   * @param suggestion object
   * @returns {string} value to render
   */
  static getSuggestionValue(suggestion) {
    return suggestion;
  }

  /**
   * Returns a component to be rendered in the suggestionList container of the Autosuggest component
   *
   * @param suggestionValue
   * @returns {*}
   */
  static renderSuggestion(suggestionValue) {
    return suggestionValue;
  }

  validateEmail(event) {
    const target = event.target;
    const error = validateEmail(target.value);
    if (error) {
      event.preventDefault();
      target.setCustomValidity(error);
      setTimeout(() => target.reportValidity());
      return false;
    }
    return true;
  }

  onHeaderKeyDown(event) {
    const target = event.target;
    HeaderAddress.clearValidation(target);
    if (event.key === 'Enter' || event.key === ';') {
      if (this.validateEmail(event)) {
        const id = target.id;
        const value = target.value.replace(/;/g, '');
        this.props.onAddressAdd(id, value);
        this.setState({value: ''});
        target.focus();
        event.preventDefault();
      }
    }
  }

  onHeaderBlur(event) {
    const target = event.target;
    if (target.value.length > 0) {
      if (this.validateEmail(event)) {
        this.props.onAddressAdd(target.id, target.value);
        this.setState({value: ''});
      }
    }
  }

  static onAddressDragStart(event, id, address) {
    event.stopPropagation();
    const payload = {id, address};
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
  }

  onDrop(event, id) {
    event.preventDefault();
    const types = event.dataTransfer.types;
    if (types && Array.from(types).indexOf('application/json') >= 0) {
      const payload = JSON.parse(event.dataTransfer.getData('application/json'));
      if (id && id !== payload.id) {
        const fromId = payload.id;
        const address = payload.address;
        this.props.onAddressMove(fromId, id, address);
      }
    }
  }
}

HeaderAddress.propTypes = {
  t: PropTypes.func,
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  chipClassName: PropTypes.string,
  autoSuggestClassName: PropTypes.string,
  autoSuggestMenuClassName: PropTypes.string,
  addresses: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string,
  getAddresses: PropTypes.func,
  onAddressAdd: PropTypes.func,
  onAddressRemove: PropTypes.func,
  onAddressMove: PropTypes.func
};

HeaderAddress.defaultProps = {
  className: '',
  chipClassName: '',
  autoSuggestClassName: '',
  autoSuggestMenuClassName: '',
  addresses: [],
  label: '',
  //onAddressAdd: () => {},
  //onAddressRemove: () => {},
  //onAddressMove: () => {}
};

export default (HeaderAddress);

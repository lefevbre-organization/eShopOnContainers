import React, { Fragment } from 'react'
import i18n from "i18next";

export default class SelectedMessage extends React.PureComponent {
    constructor() {
        super();
        this.onClick = this.onClick.bind(this)
    }

    onClick() {
        const { onDeleteMessage, message } = this.props;
        window.dispatchEvent(new CustomEvent("RemoveSelectedEvent", { detail: message }));
    }
    render() {
        const { message } = this.props;
        if(!message) {
            return null;
        }
        
        return (
        <Fragment>
            <div className="selected-message-container">
                <div><button className="close-button" onClick={this.onClick}>X</button></div>
                <div><span className="title">{i18n.t("select-action-header.folder")}: </span><span className="subtitle">{message.folder===''?'-':message.folder}</span></div>
                <div><span className="title">{i18n.t("select-action-header.subject")}: </span><span className="subtitle">{message.subject}</span></div>
            </div>
            <style jsx>{`
                .selected-message-container {
                    border-top: 1px dashed #001978;
                    display: flex;
                    flex-direction: column;
                    margin-top: 5px;
                }

                .title {
                    color: #001978;
                    font-size: 12px;
                    font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
                }
                .subtitle {
                    font-size: 12px;
                    font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
                }

                .close-button {
                    background-color: #001978;
                    color: white;
                    border: none;
                    height: 20px;
                    width: 20px;
                    padding: 0;
                    line-height: 0px;
                    float: right;
                    margin-top: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                }
            `}</style>
        </Fragment>
      )
    }
}

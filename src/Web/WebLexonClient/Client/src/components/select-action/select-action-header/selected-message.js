import React, { Fragment } from 'react'

export default class SelectedMessage extends React.PureComponent {
    constructor() {
        super();
        this.onClick = this.onClick.bind(this)
    }

    onClick() {
        const { onDeleteMessage, message } = this.props;
        // onDeleteMessage && onDeleteMessage(this.props.message.id);
        window.dispatchEvent(new CustomEvent("RemoveSelectedDocument", { detail: message }));
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
                <div><span className="title">Carpeta: </span>{message.folder===''?'-':message.folder}</div>
                <div><span className="title">Asunto: </span>{message.subject}</div>
            </div>
            <style jsx>{`
                .selected-message-container {
                    border-top: 1px dashed #001978;
                    display: flex;
                    flex-direction: column;
                }

                .title {
                    color: #001978;
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

import React, { Fragment } from 'react'

export default class MessageCounter extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            show: true
        }

        this.onClick = this.onClick.bind(this)
    }

    onClick() {
        const st = this.state.show;
        this.setState({show: !st}, ()=>{
            const { onChange } = this.props
            onChange && onChange(this.state.show)            
        })
    }
    render() {
        const { show } = this.state;

        return (
        <Fragment>
            <div className="badge badge-pill badge-light counter">
                <div className="counter-text">{this.props.children}</div>
                <div className={`show-button ${show?'':'show'}`} onClick={this.onClick}>
                    { show === true && <span className="lf-icon-visible"></span>}
                    { show === false && <span className="lf-icon-not-visible"></span>}
                </div>
            </div>
            <style jsx>{`
                .counter {
                    padding: 0;
                    width: 150px;
                    background-color: #e5e8f1;
                    border: 2px solid #001978;
                    color: #001978;
                    font-size: 14px;
                    font-weight: normal;
                    height: 22px;
                    font-family: "MTTMilano-Medium", Lato, Arial, sans-serif;
                }

                .counter-text {
                    display: inline-block;
                    width: 100%;
                    height: 18px;
                    padding-top: 4px;
                }

                .show-button span {
                    background-color: transparent;    
                    padding: 0;
                    font-size: 22px;      
                    display: block;
                    margin-top: -4px;          
                }

                .show-button .lf-icon-not-visible {
                    color: white;
                }

                .show-button .lf-icon-visible {
                    
                }

                .show-button {
                    display: inline-block;
                    float: right;
                    border: 2px solid #001978;
                    margin-top: -20px;
                    height: 22px;
                    border-radius: 12px;
                    margin-right: -2px;
                    width: 44px;
                    position: relative;
                    padding-top: 2px;
                    cursor: pointer;
                    background-color: white;
                }

                .show-button.show {
                    background-color: #001978;
                }
            `}</style>
        </Fragment>
      )
    }
}
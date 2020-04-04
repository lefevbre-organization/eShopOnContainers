import React, { Fragment } from 'react';
import { Downloader } from './downloader';
import PerfectScrollbar from "react-perfect-scrollbar";

import i18n from 'i18next';

export class AttachDocumentsStep5 extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      downloading: false
    }

    this.pendingDownloads = 0;
    this.downloadRefs = []
    this.downloadComplete = this.downloadComplete.bind(this);
  }

  async componentDidUpdate(prevProps, prevState) {
  }

  downloadComplete(index) {
    const { downloadComplete } = this.props;

    this.pendingDownloads--;
    if (this.pendingDownloads === 0) {
      downloadComplete && downloadComplete();
    }
  }

  renderType(props) {
    const icon = props.type === 'dir' ? 'lf-icon-folder' : 'lf-icon-document';
    return <span className={`pager-icon ${icon} new-folder-icon`} />;
  }

  StartDownload() {
    this.pendingDownloads = 0;
    this.setState({ downloading: true }, () => {
      for (let i = 0; i < this.downloadRefs.length; i++) {
        if (this.downloadRefs[i] && this.downloadRefs[i].StartDownload) {
          this.pendingDownloads++;
          this.downloadRefs[i].StartDownload()
        }
      }
    })
  }

  render() {
    const { files, user, bbdd } = this.props;
    return (
      <Fragment>
        <div className='step5-container panel section-border'>
          <div className='section-title-5'>
            <div>DOCUMENTOS SELECCIONADOS</div>
            <div><span className="subtitle-5">TOTAL: </span><strong>{files.length}</strong></div>
          </div>
          <div className="documents-container">
            <PerfectScrollbar style={{ height: 386 }}>
              {
                files.map((item, index) => <Downloader ref={ref => {
                  this.downloadRefs[index] = ref;
                  console.log("DownloadRefs: " + this.downloadRefs.length)
                }
                } doc={item}
                  user={user}
                  bbdd={bbdd}
                  index={index}
                  downloadComplete={this.downloadComplete}
                ></Downloader>)
              }
            </PerfectScrollbar>
          </div>
        </div>
        <style jsx>{`
           

            .document-wrapper {
              border-bottom: 1px solid #7D878D;

            }
            .documents-container {
              padding: 10px;
            }
            .document {
              display: flex;
              height: 60px;
            }

            .document-icon {
              flex: 0 0 50px;
              width: 50px;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .document-icon .lf-icon-document {
              color: #001978;
              font-size: 22px;
            }

            .document-info {
              flex: 1;
              color: #7D878D;
              display: flex;
              flex-direction: column;
              line-height: 18px;
              justify-content: center;
            }
            .document-name {
            }

            .document-size {

            }

            .step5-container {
              margin: 30px;
              flex-direction: column;

            }

            .subtitle-5 {
              font-size: 10px;              
            }

            .section-title-5 strong {
              font-weight: 900;
            }

            .e-selectionbackground {
              background-color: #e5e8f1 !important;
            }

            .e-row:hover {
              background-color: #e5e8f1 !important;
            }

            .e-list-text {
              text-transform: none !important;
            }

            .btn-primary:disabled {
              background-color: #001978 !important;
              border-color: #001978 !important;
              color: white !important;
            }

            .new-folder {
              text-align: right;
              font-size: 14px;
              color: #001978 !important;
              height: 26px;
            }

            .new-folder-container {
              cursor: pointer;
              display: inline-block;
              margin-bottom: 5px;
              padding-bottom: 0;
              box-sizing: border-box;
              -moz-box-sizing: border-box;
              -webkit-box-sizing: border-box;
            }

            a.disabled,
            a.disabled span,
            .new-folder-container.disabled,
            a.disabled .new-folder-text {
              color: #d2d2d2 !important;
              cursor: default !important;
            }

            .new-folder-icon {
              margin-right: 0px;
            }

            .new-folder-text {
              font-family: 'MTTMilano-Medium' !important;
              text-decoration: underline;
              line-height: 19px !important;
              font-size: 14px !important;
              color: #001978 !important;
            }

            .add-more:hover .new-folder-text {
              background: none !important;
            }

            .new-folder-text:hover {
              background: none !important;
            }

            .panel {
              display: flex;
              height: 450px;
            }

            .e-rowcell.e-templatecell {
              width: auto;
              display: table-cell;
            }

            .panel-left {
              flex: 1;
            }

            .panel-right {
              flex: 2;
              border-left: 1px solid #e0e0e0;
            }
            .panel-right-top {
              color: red;
              border-bottom: 1px solid #001978;
              height: 46px;
            }

            .section-border {
              position: sticky;
              border: 1px solid #d2d2d2;
              height: 450px;
            }

            .section-title-5 {
              color: #001978;
              font-family: 'MTTMilano-Medium' !important;
              font-size: 14px;
              font-weight: 900;
              margin: 0 10px;
              margin-top: 10px;
              text-transform: none;
              vertical-align: text-top;

              display: flex;
              justify-content: space-between;
              flex: 0;
              padding: 0 10px;
              height: 40px;
              border-bottom: 1px solid #001978;
            }

            .index-4 span {
              margin-left: 8px;
              height: 20px;
              width: 442px;
              color: #7f8cbb;
              font-family: 'MTTMilano-Medium';
              font-size: 20px;
              font-weight: 500;
              line-height: 24px;
            }

            .e-treeview .e-ul,
            .e-treeview .e-text-content {
              padding: 0 0 0 18px;
            }

            .e-list-text {
              text-transform: uppercase;
              color: #001978;
              margin-left: 5px;
            }
            .e-treeview .e-list-item > .e-text-content .e-list-text,
            .e-treeview .e-list-item.e-active > .e-text-content .e-list-text,
            .e-treeview .e-list-item.e-hover > .e-text-content .e-list-text,
            .e-treeview .e-list-item.e-active,
            .e-treeview .e-list-item.e-hover {
              color: #001978 !important;
            }
            .e-treeview .e-list-icon,
            .e-treeview .e-list-img {
              height: auto;
            }
            .e-treeview .e-icon-collapsible,
            .e-treeview .e-icon-expandable {
              color: #001978;
            }
          `}</style>
      </Fragment>
    );
  }

}
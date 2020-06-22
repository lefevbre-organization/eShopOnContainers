import React from 'react';
import { ProgressBar } from './progressbar';
import { downloadFile } from '../../services/services-lexon';
import i18n from 'i18next';
const prettyBytes = require('../../services/pretty-bytes');

export class Downloader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      downloading: false,
      length: 0,
      progress: 0,
      error: '',
    };
  }

  StartDownload() {
    this.setState({ downloading: true }, () => {
      this.downloadFile();
    });
  }

  async downloadFile() {
    const { doc, user, bbdd, index, downloadComplete } = this.props;
    try {
      const res = await downloadFile(
        doc.idRelated,
        bbdd.bbdd,
        user.idUser,
        ({ length, progress }) => {
          if (length) {
            this.setState({ length });
          }

          if (progress) {
            this.setState({ progress });
          }
        }
      );

      if (res.status === 404) {
        this.setState({ downloading: false, error: i18n.t('file-not-found') });
      } else if (res.status >= 400) {
        this.setState({
          downloading: false,
          error: i18n.t('file-not-found'),
        });
      } else if (res.status === 200) {
        this.setState({ downloading: false, progress: 100, error: '' });
        window.dispatchEvent(
          new CustomEvent('AttachDocument', {
            detail: { document: doc, content: res.data },
          })
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      downloadComplete && downloadComplete(index);
    }
  }

  render() {
    const { doc } = this.props;
    const { length } = this.state;

    return (
      <div className='document-wrapper'>
        <div className='document'>
          <div className='document-icon'>
            <span className={`lf-icon-document`} />
          </div>
          <div className='document-info'>
            <div className='document-name'>{doc.code}</div>
            <div className='document-size'>
              {length ? prettyBytes(length) : '-'}
            </div>
          </div>
        </div>
        <div>
          <ProgressBar
            current={this.state.progress}
            error={this.state.error}></ProgressBar>
        </div>
      </div>
    );
  }
}

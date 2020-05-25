import React from 'react';
import { ProgressBar } from './progressbar';
import { downloadFile, Document } from '../../../services/services-centinela';
const prettyBytes = require('../../../services/pretty-bytes');

interface Props {
  doc: Document;
  user: string;
  index: number;
  downloadComplete: any;
}
interface State {
  downloading: boolean;
  length: number;
  progress: number;
  error: string;
}

export class Downloader extends React.Component<Props, State> {
  constructor(props: Props) {
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
    const { doc, user, index, downloadComplete } = this.props;
    try {
      const res: any = await downloadFile(
        doc.documentObjectId,
        user,
        ({ length, progress }: any) => {
          if (length) {
            this.setState({ length });
          }

          if (progress) {
            this.setState({ progress });
          }
        }
      );

      if (res.status === 404) {
        this.setState({ downloading: false, error: 'Fichero no encontrado' });
      } else if (res.status >= 400) {
        this.setState({
          downloading: false,
          error: 'Error descargando fichero',
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
            <div className='document-name'>{doc.name}</div>
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

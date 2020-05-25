import React from 'react';

export const ProgressBar = ({
  current,
  error,
}: {
  current: number;
  error: string;
}) => {
  const state = !error
    ? current === 0
      ? ''
      : current === 100
      ? 'success'
      : 'progressing'
    : 'error';
  let position = current < 5 ? 5 : current;
  let label = current + '%';

  if (error) {
    position = 100;
    label = error;
  }

  return (
    <div>
      <div className='lx-progress'>
        <div
          className={`lx-progress-bar ${state}`}
          style={{ maxWidth: position + '%' }}>
          <div
            className={`lx-progress-label-percent ${
              error ? 'error' : ''
            }`}>{`${label}`}</div>
          <div className={`lx-progress-dot ${state}`}></div>
        </div>
      </div>

      <style jsx>{`
        .lx-progress {
          height: 0px;
          background-color: transparent;
          border-bottom: 1px solid lightgray;
          align-items: flex-end;
        }

        .lx-progress-bar {
          height: 0px;
          background-color: transparent;
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }

        .lx-progress-bar.progressing {
          border-bottom: 1px solid #d6b53c;
        }
        .lx-progress-bar.success {
          border-bottom: 1px solid #417505;
        }
        .lx-progress-bar.error {
          border-bottom: 1px solid #d0021b;
        }

        .lx-progress-label-percent {
          display: inline-block;
          line-height: 12px;
          color: #001978;
        }

        .lx-progress-label-percent.error {
          color: #d0021b;
        }

        .lx-progress-dot {
          width: 10px;
          height: 7px;
          margin-left: 2px;
        }
        .lx-progress-dot.progressing {
          background-color: #d6b53c;
        }
        .lx-progress-dot.success {
          background-color: #417505;
        }
        .lx-progress-dot.error {
          background-color: #d0021b;
        }
      `}</style>
    </div>
  );
};

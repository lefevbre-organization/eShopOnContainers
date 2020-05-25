import React, { useState } from 'react';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import i18n from 'i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface Props {
  products: string[];
  onFilter: (filter: string) => void;
}

export const ProductFilter = ({ products, onFilter }: Props) => {
  const [isOpen, setOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const toggleContent = () => {
    setOpen(!isOpen);
  };

  const selectItem = (p: string) => {
    setFilter(p);
    setOpen(false);
    onFilter(p);
  };

  const resetFilter = () => {
    setFilter('');
    onFilter('');
  };

  return (
    <>
      <div className={`fpdropdown ${filter !== '' ? 'fpactive' : ''}`}>
        <div className={`fpheader`}>
          <div className="fpheader-left" onClick={toggleContent}>
            <i className="lf-icon-filter-1"></i>
            <span style={{ marginLeft: 10, maxWidth: 280, overflow: 'hidden' }}>
              {filter === '' && i18n.t('modal-archive.filter-by-product')}
              {filter !== '' && filter}
            </span>
          </div>
          <div style={{ display: 'flex' }}>
            {filter !== '' && (
              <div
                style={{ width: 30, textAlign: 'center' }}
                onClick={resetFilter}
              >
                <i className="lf-icon-close"></i>
              </div>
            )}
            <div
              style={{ cursor: 'pointer', width: 30, textAlign: 'center' }}
              onClick={toggleContent}
            >
              <i className={`lf-icon-angle-${isOpen ? 'up' : 'down'}`}></i>
            </div>
          </div>
        </div>
        {isOpen && (
          <div className="fpdropdown-body">
            <PerfectScrollbar options={{ suppressScrollX: true }}>
              <ul>
                {products &&
                  products.map((p: string) => {
                    return (
                      <li
                        onClick={() => {
                          selectItem(p);
                        }}
                      >
                        <span style={{ marginRight: 10 }}>
                          <i className="lf-icon-check"></i>
                        </span>
                        <span
                          style={{
                            width: '100%',
                            whiteSpace: 'nowrap',
                            display: 'inline',
                            overflow: 'hidden'
                          }}
                        >
                          {p}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </PerfectScrollbar>
          </div>
        )}
      </div>
      <style jsx>
        {`
          .fpdropdown {
            display: flex;
            width: 400px;
            height: 40px;
            color: #001978;
            font-size: 14px;
            padding: 7px;
            border: 1px solid #d2d2d2;
          }

          .fpdropdown.fpactive {
            background-color: #001978;
            color: white;
          }

          .fpdropdown .fpheader {
            display: flex;
            justify-content: space-between;
            cursor: pointer;
            width: 100%;
            overflow: hidden;
            margin-left: 10px;
            text-overflow: ellipsis;
            white-space: pre;
          }

          .fpdropdown .fpheader .fpheader-left {
            display: flex;
            flex-direction: row;
            align-items: center;
          }

          .fpdropdown-body {
            background-color: #fff;
            height: 200px;
            width: 300px;
            position: absolute;
            top: 40px;
            left: 0;
            z-index: 9;
            box-shadow: 0 0 5px 2px rgba(0, 19, 123, 0.1);
            border: 1px solid #d2d2d2;
          }

          .fpdropdown-body ul {
            border-bottom: 1px solid #d2d2d2;
            cursor: pointer;
            color: #7c868c;
            padding: 0;
          }

          .fpdropdown-body .lf-icon-check {
            font-size: 20px;
          }
          .fpdropdown-body li {
            border-bottom: 1px solid #d2d2d2;
            cursor: pointer;
            color: #7c868c;
            padding: 10px;
          }

          .fpdropdown-body li:hover {
            background-color: #e5e8f1;
            border-bottom: 1px solid #d2d2d2;
            color: #001978;
          }
        `}
      </style>
    </>
  );
};

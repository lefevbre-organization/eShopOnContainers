import React, {useState} from 'react';

export const MessagesFilter = ({onChangeFilter}) => {
    const [open, setOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('');

    const _onChangeFilter = (filter) => {
        setActiveFilter(filter);
        setOpen(false);

        if(onChangeFilter) {
            onChangeFilter(filter);
        }
    }

    return (
        <div className="btn-group ml-auto">
            <div
                onClick={()=>{setOpen(!open)}}
                className='filter-button'
                title={''}>
                <i style={{}} className={`lf-icon ${activeFilter===''?'lf-icon-filter-1':'lf-icon-filter-applied'}`}></i>
            </div>
            <div className={`filter-body ${open?'visible':''}`}>
                <ul>
                    <li className={`${activeFilter === ''? 'active':''}`} onClick={()=>{_onChangeFilter('')}}><span><i className={`lf-icon lf-icon-check`}></i></span>Todos</li>
                    <li className={`${activeFilter === 'read'? 'active':''}`} onClick={()=>{_onChangeFilter('read')}}><span><i className='lf-icon lf-icon-check'></i></span>Leídos</li>
                    <li className={`${activeFilter === 'unread'? 'active':''}`} onClick={()=>{_onChangeFilter('unread')}}><span><i className='lf-icon lf-icon-check'></i></span>No leídos</li>
                </ul>
            </div>
            <style jsx>{`
              .filter-button {
                cursor:pointer;
                color: #001978;
                font-size: 20px;
              }
              
              .filter-button:hover {
                color: #0056b3
              } 
              
              .filter-body {
                  position: absolute;
                  z-index: 99999;
                  opacity: 0;
                  top: 35px;
                  right: 0;
                  box-sizing: border-box;
                  height: 0;
                  width: 207px;
                  border: 1px solid #001978;
                  background-color: #FFFFFF;
                  box-shadow: 0 0 8px 3px rgba(0,19,123,0.3);
                  transition: all ease-in-out 0.2s;
              }
              
              .filter-body.visible {
                opacity: 1;
                 height: 162px;
              }
              
              .filter-body ul {
                width: 100%;
                text-align: left;
                padding: 0;
                font-size: 16px;
              }
              
              .filter-body ul li {
                height: 47px;
                margin: 5px 0;
                display: flex;
                align-items: center;
                cursor: pointer;
              }
              
              .filter-body ul li.active {
                color: #001978; 
                font-weight: bold;
              }
              
              .filter-body ul li.active i {
                font-weight: bold;
              }
              
              .filter-body ul li i {
                margin-right: 27px;
              }

              .filter-body ul li:hover {
                background-color: #CCD1E4;
              }
            `}</style>
        </div>);
}

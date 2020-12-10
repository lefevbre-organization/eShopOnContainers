import React from "react";

const Spinner = () => {
  return (
    <React.Fragment>
      <div className="bg-white">
       <div className="preloader-holder-blue"></div>
      </div>

      <style jsx>{`
        body.bg-blue {
          background-color: #171C32;
        }

        body.bg-white {
          background-color: transparent;
        }

        .main-holder {
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          z-index: 999;
          background-color: rgba(0, 25, 120, .7);
        }

        .main-holder-white {
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          z-index: 999;
          background-color: rgba(255, 255, 255, .7)
        }

        .preloader-holder {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 46 46' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E\a             %3Cpolygon fill='%23fff' points='17.604 39.498 39.607 39.498 39.607 4.504 44.008 4.504 44.008 44 17.604 44'%3E%3C/polygon%3E\a             %3Cpolygon fill='%23fff' points='13.201 26.475 30.806 26.475 30.806 30.025 13.201 30.025'%3E%3C/polygon%3E\a             %3Cpolygon fill='%23fff' points='13.201 13.473 30.806 13.473 30.806 17.027 13.201 17.027'%3E%3C/polygon%3E\a             %3Cpolygon fill='%23fff' points='4.402 39.498 0 39.498 0 0 26.404 0 26.404 4.504 4.402 4.504'%3E%3C/polygon%3E\a             %3C/svg%3E	");
          width: 46px;
          height: 46px;
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          opacity: 1;
          animation: pulse 2000ms infinite ease-in-out;
        }
        .preloader-holder-blue {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 245.93 246.47'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23001978;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3ERecurso 1%3C/title%3E%3Cg id='Capa_2' data-name='Capa 2'%3E%3Cg id='Capa_1-2' data-name='Capa 1'%3E%3Cpolygon class='cls-1' points='147.26 0 0 0 0 221.26 24.55 221.26 24.55 25.23 147.26 25.23 147.26 0'/%3E%3Cpolygon class='cls-1' points='220.91 25.24 220.91 221.25 98.18 221.25 98.18 246.47 245.46 246.47 245.46 25.24 220.91 25.24'/%3E%3Crect class='cls-1' x='73.63' y='75.48' width='98.2' height='19.9'/%3E%3Crect class='cls-1' x='73.63' y='148.3' width='98.2' height='19.88'/%3E%3Cline class='cls-1' x1='245.93' y1='106.47' x2='245.93' y2='180.31'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          width: 46px;
          height: 46px;
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          opacity: 1;
          animation: pulse 2000ms infinite ease-in-out;
        }


        @keyframes pulse {
          0% {
              transform: translate(-50%, -50%) rotate(-180deg) scale(1)
          }
          10% {
              transform: translate(-50%, -50%) rotate(0deg) scale(0.8)
          }
          40% {
              transform: translate(-50%, -50%) rotate(0deg) scale(0.8)
          }
          80% {
              transform: translate(-50%, -50%) rotate(180deg) scale(1)
          }
          100% {
              transform: translate(-50%, -50%) rotate(180deg) scale(1)
          }
        }
    `}</style>
    </React.Fragment>
    
  );
};

export default Spinner;

import React, { Component } from "react";
import i18n from "i18next";

import "./Footer.css";

class Footer extends Component {
  render() {
    return (
     <footer className="row footer mt-auto">           
        <div className="container">
          <div className="row">           
            <div className="col-xs-12 col-md-6 footer-logo">
              <a 
                rel="noopener noreferrer" 
                href="https://lefebvre.es" 
                target="_blank" 
              >
                <img
                  alt="LEFEBVRE"
                  src="https://assets.lefebvre.es/media/logos/web/comunes/lefebvre-ij-bl-160x57.png"
                />
              </a>
            </div>
            <ul className="col-xs-12 col-md-6 social-squares">
              <li>
                <a
                  rel="noopener noreferrer"
                  href="https://www.facebook.com/lefebvreelderecho"
                  target="_blank"
                  title="Facebook"
                >
                  <span className="lf-icon-facebook-round"></span>
                </a>
              </li>
              <li>
                <a
                  rel="noopener noreferrer"
                  href="https://www.linkedin.com/company/lefebvre-elderecho"
                  target="_blank"
                  title="Linkedin"
                >
                  <span className="lf-icon-linkedin-round"></span>
                </a>
              </li>
              <li>
                <a
                  rel="noopener noreferrer"
                  href="https://www.youtube.com/channel/UCAxbOiNpUotcbZIRL3IxEDg"
                  target="_blank"
                  title="Youtube"
                >
                  <span className="lf-icon-youtube-round"></span>
                </a>
              </li>
              <li>
                <a
                  rel="noopener noreferrer"
                  href="https://twitter.com/edicionesfl"
                  target="_blank"
                  title="Twitter"
                >
                  <span className="lf-icon-twitter-round"></span>
                </a>
              </li>
             </ul>
            
          </div>
          <div className="row">
            <p className="col-xs-12">
              ©2019 Lefebvre. {i18n.t("footer.all-reserved-right")}
              <span>
                <a
                  rel="noopener noreferrer"
                  href="https://lefebvre.es/aviso-legal"
                  target="_blank"
                  title={i18n.t("footer.legal-warning")}
                >
                  {i18n.t("footer.legal-warning")}
                </a>{" "}
                &nbsp;|&nbsp;
                <a
                  rel="noopener noreferrer"
                  href="https://lefebvre.es/politica-privacidad"
                  target="_blank"
                  title={i18n.t("footer.privacy-policy")}
                >
                  {i18n.t("footer.privacy-policy")}
                </a>{" "}
                &nbsp;|&nbsp;
                <a
                  rel="noopener noreferrer"
                  href="https://lefebvre.es/politica-cookies"
                  target="_blank"
                  title={i18n.t("footer.cookies-policy")}
                >
                  {i18n.t("footer.cookies-policy")}
                </a>
              </span>             
            </p>
           
          </div>
                <p className="version">{i18n.t("footer.version")}: {window.RELEASE}</p>    
        </div>
      </footer>
    );
  }
}

export default Footer;

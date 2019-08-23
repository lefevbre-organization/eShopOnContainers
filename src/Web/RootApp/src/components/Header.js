import React, { Component } from 'react';
import { Link } from "react-router-dom";

class Header extends Component {

    render() {
		const userInfo = '';
        const fullName = '';
        const picUrl = "assets/img/user.png";

        return (
            <header className="row">
                <div className="container-fluid">
                    <div className="row">
                        <div className="container">
                            <div className="row">
                                <div className="col-12 col-md-7 order-0 order-md-1 basic-header d-flex align-items-center p-md-0">
                                    <div className="mr-auto">
                                        <h1 className="m-0">
                                            <Link to="https://lefebvre.es" title="Lefebvre">
                                                <img src="https://assets.lefebvre.es/media/logos/web/comunes/lefebvre-bl-120x24.png" alt="Lefebvre" className="d-none d-md-block" />
                                                <img src="https://assets.lefebvre.es/media/logos/web/comunes/lefebvre-120x24.png" alt="Lefebvre" className="d-block d-md-none" />
                                            </Link>
                                        </h1>
                                    </div>
                                    <div className="header-item">
                                        <Link to="#" className="d-flex align-items-center" id="userInfo" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-display="static"><span className="lf-icon-user"></span><span className="pl-2 d-none d-md-block user-name">{fullName}</span></Link>
                                        <div className="dropdown-menu dropdown-menu-right user-info" aria-labelledby="userInfo">
                                            <span className="dropdown-menu-arrow"></span>						
                                            <Link to="#" className="text-right d-block pr-3 pt-3" id="userInfo" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span className="lf-icon-close"></span></Link>
                                            <div className="content">														
                                                <div className="menu-title mb-5">
                                                    <span>Usuario</span>
                                                </div>						
                                                <div className="user-options">
                                                    <ul className="p-0">
                                                        <li><Link to="#" className="d-flex align-items-center" data-toggle="modal" data-target="#basicData"><span className="lf-icon-lead"></span> <span>Editar datos básicos</span></Link></li>
                                                        <li><Link to="#" className="d-flex align-items-center" data-toggle="modal" data-target="#resetPassword"><span className="lf-icon-lock"></span> <span>Resetear contraseña</span></Link></li>
                                                    </ul>
                                                </div>
                                                <div className="user-image-and-name text-center">
                                                    <div className="user-image">
                                                        <Link to="#"><img src={picUrl} /></Link>
                                                    </div>
                                                    <span className="user-name">{fullName}</span>
                                                    <span className="company-name">Lefebvre-El Derecho, S.A.</span>
                                                    <button type="button" className="col-6 btn btn-primary mt-3 mb-3">Cerrar sesión</button>
                                                </div>						
                                            </div>
                                        </div>
                                    </div>    
                                    <div className="ml-3 ml-md-5 header-item">
                                        <Link to="#" id="appsList" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-display="static"><span className="lf-icon-products"></span></Link>
                                        <div className="dropdown-menu dropdown-menu-right app-list" aria-labelledby="appsList">
                                            <span className="dropdown-menu-arrow"></span>
                                            <Link to="#" className="text-right d-block pr-3 pt-3" id="appsList" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span className="lf-icon-close"></span></Link>
                                            <div className="content">
                                                <div className="menu-title mb-4">
                                                    <span>Productos Lefebvre</span>
                                                </div>												
                                                <div className="product-list">
                                                    <ul className="text-center p-0 m-0">
                                                        <li><Link to="#"><span className="lf-icon-qmemento"></span></Link><span>Bases de datos</span></li>
                                                        <li><Link to="#"><span className="lf-icon-shop"></span></Link><span>Tienda virtual</span></li>
                                                        <li><Link to="#"><span className="lf-icon-learn"></span></Link><span>Formación</span></li>
                                                        <li><Link to="#"><span className="lf-icon-calculator"></span></Link><span>Calculadoras</span></li>
                                                        <li><Link to="#"><span className="lf-icon-mementos"></span></Link><span>Mementos</span></li>
                                                        <li><Link to="#"><span className="lf-icon-library"></span></Link><span>Biblioteca</span></li>
                                                        <li><Link to="#"><span className="lf-icon-actum"></span></Link><span>Actum</span></li>
                                                        <li><Link to="#"><span className="lf-icon-forms"></span></Link><span>Formularios</span></li>
                                                        <li><Link to="#"><span className="lf-icon-doctrine"></span></Link><span>Doctrina</span></li>
                                                        <li><Link to="#"><span className="lf-icon-magazine"></span></Link><span>Revistas</span></li>								
                                                        <li><Link to="#"><span className="lf-icon-strada"></span></Link><span>Stradatax</span></li>
                                                        <li><Link to="#"><span className="lf-icon-search-rrhh"></span></Link><span>Experto RRHH</span></li>
                                                        <li><Link to="#"><span className="lf-icon-adn"></span></Link><span>ADN</span></li>
                                                        <li><Link to="#"><span className="lf-icon-lexon"></span></Link><span>LEX-ON</span></li>
                                                        <li><Link to="#"><span className="lf-icon-desk"></span></Link><span>Gestión despachos</span></li>
                                                        <li><Link to="#"><span className="lf-icon-expert-call"></span></Link><span>Llamada experta</span></li>
                                                        <li><Link to="#"><span className="lf-icon-iqmemento"></span></Link><span>IQMEMENTO SOLUCIONA</span></li>
                                                    </ul>
                                                </div>
                                                <div className="product-description">
                                                    <span>Utiliza este menú para iniciar directamente otro producto de Lefebvre.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>                    
                                <div className="col-12 col-md-5 order-md-0 mail-header d-flex align-items-center p-md-0">                                
                                    <div className="d-md-none">
                                        <Link to="#"><span className="lf-icon-hamburger-menu"></span></Link>
                                    </div>
                                    <div className="mr-auto ml-auto ml-md-0 text-center">
                                        <h2 className="brand d-flex align-items-center m-0" onClick={this._handleOnClick}>
                                            <span>Mail</span><span><img src="/assets/img/logomicrosoft.png" alt="Outlook" /></span>
                                        </h2>
                                    </div>
                                    <div className="d-md-none">
                                            <Link to="#"><span className="lf-icon-search"></span></Link>
                                    </div>                                
                                </div>
                            </div>
                        </div>
                    </div>                			
                </div>                
            </header>           
        );
    }
}

export default Header;
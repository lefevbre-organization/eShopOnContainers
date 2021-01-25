import React from 'react'
import PropTypes from 'prop-types';
// import { NavLink } from 'react-router-dom';
import {Container } from 'reactstrap';

import Header from '../../components/Header/Header';
import './layout.scss';

const Layout = ({children}) => {  
	return (
		<div >         
			<Header />
			<main>
				<Container>
					{children}
				</Container>
			</main>
			<div>
				<Container>
				</Container>
			</div>
		</div>
	)
}

Layout.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Layout

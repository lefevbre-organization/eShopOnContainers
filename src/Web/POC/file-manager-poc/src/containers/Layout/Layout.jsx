// import React from 'react'
// import PropTypes from 'prop-types';
// // import { NavLink } from 'react-router-dom';
// import {Container } from 'reactstrap';

// import './Layout.sass';

// const Layout = ({ children, page}) => {  
    
//   var colorBorder = "#ECEFF1"
//   var colorTitle = ""
//   var colorIcon = ""

//   if (page === "perfil") {
//     colorTitle = "#FFFFFF"
//     colorBorder = "#FFFFFF"
//     colorIcon = "#FFFFFF"
//   }

//   const props = { colorTitle, colorBorder, colorIcon };
//   const classes = useStyles(props);

//   return (
//       <div >         
//           <AppBar>

//           </AppBar>
//           <main>
//               <Container className={classes.contenMain}>
//                   {children}
//               </Container>
//           </main>
//           <div className={classes.footer}>
//               <Container className={classes.conten}>
//                   <p>© Hazitek 2020</p>
//               </Container>
//           </div>
//       </div>
//   )
// }


// Layout.propTypes = {
//     children: PropTypes.node.isRequired,
//     page: PropTypes.string,
//   };

// export default Layout

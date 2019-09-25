import React, { Component } from "react";
import "./App.css";
import SendMessage from "./components/send-message/SendMessage";

const navigateTo = url => window.history.pushState(null, null, url);

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pathname: window.location.pathname
    };
  }

  handleMenuClick = () => {
    this.setState(() => ({ pathname: window.location.pathname }));
  };

  render() {
    return (
      <div className="Menu" onClick={this.handleMenuClick}>
        {this.props.children(this.state.pathname)}
      </div>
    );
  }
}

const MenuItem = ({ link, children, pathname }) => {
  const classes = ["Menu-Item"];
  if (pathname === link) {
    classes.push("Menu-Item--Selected");
  }
  return (
    <div className={classes.join(" ")} onClick={() => navigateTo(link)}>
      {children}
    </div>
  );
};

class App extends Component {
  render() {
    // return (
    //     <div className="App">
    //         <header className="App-header">

    //             <h1 className="App-title">Welcome to Micro-frontend launcher</h1>
    //         </header>
    //         <div className="App-content">
    //             <Menu>
    //                 {(pathname) => (
    //                     <div>
    //                         {/*<MenuItem pathname={pathname} link='/'>All applications</MenuItem>*/}
    //                         <MenuItem pathname={pathname} link='/navmenu'>Main Menu</MenuItem>
    //                         <MenuItem pathname={pathname} link='/lexon'>Lex-On connector</MenuItem>
    //                     </div>
    //                 )}
    //             </Menu>
    //             <div className="App-container">
    //                 <div id="mainnav-app" />
    //                 <div id="lexon-app" />
    //             </div>
    //         </div>
    //     </div>
    // );

    return (
      <div>
        <Menu>
          {pathname => (
            <div>
              <MenuItem pathname={pathname} link="/navmenu">
                Main Menu
              </MenuItem>
              <MenuItem pathname={pathname} link="/lexon">
                Lex-On connector
              </MenuItem>
            </div>
          )}
        </Menu>

        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        
        <h1>LEX-ON (mandar mensajes)</h1>
        <div className="container">
          <div className="product-list">
            <SendMessage />
          </div>
        </div>
        <div className="contentpresentation">
          <div id="lexon-app" />
        </div>
      </div>
    );
  }
}

export default App;

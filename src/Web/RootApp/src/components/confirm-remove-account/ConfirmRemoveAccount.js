import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

class ConfirmRemoveAccount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };

    this._handleOnHide = this._handleOnHide.bind(this);
  }

  _handleOnHide() {
    this.setState = {
      show: false
    };
  }

  _handleOnShow() {
    this.setState = {
      show: true
    };
  }

  render() {
    const { show } = this.state;

    return (
      <div>
        <Modal show={show} onHide={this._handleOnHide()}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this._handleOnHide()}>
              Close
            </Button>
            <Button variant="primary" onClick={this._handleOnHide()}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ConfirmRemoveAccount;

// import React, { useState } from "react";
// import { Modal, Button } from "react-bootstrap";

// const ConfirmRemoveAccount = () => {
//   const [show, setShow] = useState(false);

//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

//   return (
//     <div>
//       <Button variant="primary" onClick={handleShow}>
//         Launch demo modal
//       </Button>

//       <Modal show={show} onHide={handleClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Modal heading</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleClose}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleClose}>
//             Save Changes
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default ConfirmRemoveAccount;

import * as React from "react";

class LoginHeader extends React.Component {
  render() {
    const { title, logo } = this.props;

    return (
      <section className="ms-welcome__header  ms-u-fadeIn500">
        <img src={logo} alt={title} title={title} />
      </section>
    );
  }
}

export default LoginHeader
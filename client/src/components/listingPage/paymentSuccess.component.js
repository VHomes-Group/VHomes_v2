import React, { Component } from "react";
import "./paymentSuccess.css";

export default class PaymentSuccess extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.history.push('/MyAccount')
    }, 1000)
  }

  render() {
    return (
      <div className="container">
        <h1>Thanks for reserving with VHomes!</h1>
        <br />
        You will be redirected shortly.
      </div>
    )
  }
}

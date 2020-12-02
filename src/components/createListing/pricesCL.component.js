import React, { Component } from "react";
import "./createListing.css";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  incompleteForm,
  completeForm,
} from "../../redux/actions/loadingActions";
class PricesCL extends Component {
  constructor(props) {
    super(props);
    this.state = {
      price: this.oldData(),
    };
    this.handleChange = this.handleChange.bind(this);
  }

  oldData = () => {
    return this.props.listingData.CreateListing.state.price;
  };
  componentDidMount() {
    const oldPrice = this.props.listingData.CreateListing.state.price;
    if (oldPrice === "") {
      this.props.incompleteForm();
    } else {
      this.props.completeForm();
    }
  }
  handleChange(e) {
    const { name, value } = e.target;
    if (!isNaN(value) && value < 1000) {
      this.props.completeForm();
      this.setState({
        [name]: value,
      });
      this.props.handle(value, name);
    }
    if (value === "") {
      this.props.incompleteForm();
    }
  }
  render() {
    return (
      <div>
        <div>
          <div className="startText">Price</div>
          <br />
          <div className="questionText">How much are you listing for?</div>
          <br />
          <input
            type="text"
            name="price"
            className="priceInputBox"
            value={this.state.price}
            placeholder="$ per night"
            onChange={this.handleChange}
            required
          />
          {this.state.price ? (
            <p>List Price: ${this.state.price} per night</p>
          ) : (
            ""
          )}
          {this.state.price ? (
            <p>After taxes and fees: ${this.state.price} per night</p>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    listingData: state,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    completeForm: () => dispatch(completeForm()),
    incompleteForm: () => dispatch(incompleteForm()),
  };
};
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PricesCL)
);

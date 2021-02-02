import React, { Component } from "react";
import "./createListing.css";
import "./locationListing.css";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  incompleteForm,
  completeForm,
} from "../../redux/actions/loadingActions";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";

import { newListing } from "../../redux/actions/createListingActions";

class Location extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.oldData(),
      address: "",
      coordinates: {
        lat: null,
        lng: null
      },
    };
    this.handleChange = this.handleChange.bind(this);
  }
  oldData = () => {
    return this.props.listingData.location;
  };
  /*
  componentDidMount() {
    const oldAddy = this.props.listingData.CreateListing.state.location.street;
    if (oldAddy === "") {
      this.props.incompleteForm();
    } else {
      this.props.completeForm();
    }
  }
  */
  handleChange(e) {
    const { name, value } = e.target;
    if (isNaN(value) && name === "zipcode") {
      this.props.incompleteForm();
      console.log("invalid input");
    } else {
      this.props.completeForm();
      this.setState({
        [name]: value,
      });
    }
    const updatedData = {
      ...this.state,
      [name]: value,
    };
    if (value === "") {
      this.props.incompleteForm();
    }

    if (name === 'zipcode' && !/^\d{5}(-\d{4})?$/.test(value)) this.props.incompleteForm();
    this.props.newListing({ name: "location", value: updatedData });
  }

  handleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    const [street, city, stateZip, country] = results[0].formatted_address.split(', ');
    const [state, zipcode] = stateZip.split(' ');;

    this.setState({
      address: value,
      coordinates: latLng,
      street: street ? street : "",
      city: city ? city : "",
      state: state ? state : "",
      country: country ? country : "",
      zipcode: zipcode ? zipcode : ""
    });
  };

  render() {
    return (
      <div className="LocationForm">
        <div>
          <div className="questionText">Location</div>
          <div className="spacer_xs"></div>
          <div className="listing-wrapper">
            <div className="listing-inputs">
              <PlacesAutocomplete
                value={this.state.address}
                onChange={(address) => this.setState({ address })}
                onSelect={this.handleSelect}
              >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                  <div>
                    <input {...getInputProps({ placeholder: "Search for address" })} />
                    <p>Invalid addresses may cause autocomplete to fail.</p>
                    <p>Latitude: {this.state.coordinates.lat}</p>
                    <p>Longitude: {this.state.coordinates.lng}</p>

                    <div>
                      {loading ? <div>...loading</div> : null}

                      {suggestions.map((suggestion, idx) => {
                        const style = {
                          backgroundColor: suggestion.active ? "#41b6e6" : "#fff"
                        };

                        return (
                          <div {...getSuggestionItemProps(suggestion, { style })} key={`suggestion_${idx}`}>
                            {suggestion.description}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
              <div className="gen-subsec">
                <div className="label-text">Street:</div>
                <input
                  type="text"
                  name="street"
                  className="inputBox streetInputbox"
                  value={this.state.street}
                  placeholder="5230 Newell Road"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="gen-subsec">
                <div className="label-text">City:</div>
                <input
                  type="text"
                  name="city"
                  className="inputBox cityInputBox"
                  value={this.state.city}
                  placeholder="Palo Alto"
                  onChange={this.handleChange}
                  required
                />
              </div>

              <div className="gen-subsec">
                <div className="label-text">State:</div>
                <div className="stateInputBox">
                  <select
                    onChange={this.handleChange}
                    name="state"
                    value={this.state.state}
                  >
                    {stateDropDown}
                  </select>
                </div>
              </div>

              <div className="gen-subsec">
                <div className="label-text">Country:</div>
                <input
                  type="text"
                  name="country"
                  className="inputBox countryInputBox"
                  value={this.state.country}
                  placeholder="USA"
                  onChange={this.handleChange}
                  required
                />
              </div>

              <div className="gen-subsec">
                <div className="label-text">Zipcode:</div>
                <input
                  type="text"
                  name="zipcode"
                  className="inputBox zipInputBox"
                  value={this.state.zipcode}
                  placeholder="90210"
                  onChange={this.handleChange}
                  required
                />
              </div>

              <div className="gen-subsec">
                <div className="label-text">Apartment:</div>
                <input
                  type="text"
                  name="aptnum"
                  className="inputBox aptnumInputBox"
                  value={this.state.aptnum}
                  placeholder="aptnum"
                  onChange={this.handleChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="spacer_m"></div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    listingData: state.CreateListing,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    newListing: (updatedData) => dispatch(newListing(updatedData)),
    completeForm: () => dispatch(completeForm()),
    incompleteForm: () => dispatch(incompleteForm()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Location)
);

const stateDropDown = (
  <>
    <option value="N/A">state</option>
    <option value="AL">Alabama</option>
    <option value="AK">Alaska</option>
    <option value="AZ">Arizona</option>
    <option value="AR">Arkansas</option>
    <option value="CA">California</option>
    <option value="CO">Colorado</option>
    <option value="CT">Connecticut</option>
    <option value="DE">Delaware</option>
    <option value="DC">District Of Columbia</option>
    <option value="FL">Florida</option>
    <option value="GA">Georgia</option>
    <option value="HI">Hawaii</option>
    <option value="ID">Idaho</option>
    <option value="IL">Illinois</option>
    <option value="IN">Indiana</option>
    <option value="IA">Iowa</option>
    <option value="KS">Kansas</option>
    <option value="KY">Kentucky</option>
    <option value="LA">Louisiana</option>
    <option value="ME">Maine</option>
    <option value="MD">Maryland</option>
    <option value="MA">Massachusetts</option>
    <option value="MI">Michigan</option>
    <option value="MN">Minnesota</option>
    <option value="MS">Mississippi</option>
    <option value="MO">Missouri</option>
    <option value="MT">Montana</option>
    <option value="NE">Nebraska</option>
    <option value="NV">Nevada</option>
    <option value="NH">New Hampshire</option>
    <option value="NJ">New Jersey</option>
    <option value="NM">New Mexico</option>
    <option value="NY">New York</option>
    <option value="NC">North Carolina</option>
    <option value="ND">North Dakota</option>
    <option value="OH">Ohio</option>
    <option value="OK">Oklahoma</option>
    <option value="OR">Oregon</option>
    <option value="PA">Pennsylvania</option>
    <option value="RI">Rhode Island</option>
    <option value="SC">South Carolina</option>
    <option value="SD">South Dakota</option>
    <option value="TN">Tennessee</option>
    <option value="TX">Texas</option>
    <option value="UT">Utah</option>
    <option value="VT">Vermont</option>
    <option value="VA">Virginia</option>
    <option value="WA">Washington</option>
    <option value="WV">West Virginia</option>
    <option value="WI">Wisconsin</option>
    <option value="WY">Wyoming</option>
  </>
);

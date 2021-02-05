// https://stripe.com/docs/checkout/integration-builder

import React, { Component } from "react";
import { app } from "../../utils/axiosConfig.js";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import DayPicker, { DateUtils } from "react-day-picker";
import ImageGallery from "react-image-gallery";
import StarRatings from "react-star-ratings";
import "react-day-picker/lib/style.css";
import "./listingPage.css";
import handleReq from "../../utils/fetchRequest";
import { submitReview } from "../../redux/actions/reviewActions";
import {
  getCalendarURL,
  importCalendar,
} from "../../redux/actions/calendarSyncActions";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import StarIcon from "@material-ui/icons/Star";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import defaultProfile from "../../../src/assets/img/default-profile.png";
import LocationOnIcon from "@material-ui/icons/LocationOn";

const stripePublicKey =
  "pk_test_51HqRrRImBKNBYsooNTOTLagbqd8QUGaK6BeGwy6k2pQAJxkFF7NRwTT3ksBwyGVmq8UqhNVvKQS7Vlb69acFFCvq00hxgBuZhh";
const stripePromise = loadStripe(stripePublicKey);

class ListingPage extends Component {
  constructor(props) {
    super(props);
    this.handleSessionRedirect = this.handleSessionRedirect.bind(this);
    this.handleChangeRating = this.handleChangeRating.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleReviewChange = this.handleReviewChange.bind(this);
    this.handleReviewSubmit = this.handleReviewSubmit.bind(this);
    this.state = this.getInitialState();
    this.setState({
      listingPictures: [],
      isLoading: true,
      outOfRange: false,
      rating: 0,
      review: "",
    });
  }

  async componentDidMount() {
    var today = new Date();
    this.setState({
      outOfRange: false,
    });
    // Sync calendar with remote if listing calendar was imported
    await this.props.getCalendarURL(this.props.match.params.id);
    if (this.props.Calendar.calendarURL) {
      await this.props.importCalendar(
        this.props.Calendar.calendarURL,
        this.props.match.params.id
      );
    }
    await app
      .get("/listings/byId/" + this.props.match.params.id)
      .then((res) => {
        // If the listing is a draft and the current user is not the host, redirect to 404
        if (
          !res.data.listing.active &&
          (!this.props.User.userInfo ||
            this.props.User.userInfo._id !== res.data.listing.userId)
        ) {
          window.location = "/page-not-found";
          return;
        }
        this.setState({
          listingTitle: res.data.listing.title,
          listingDescription: res.data.listing.description,
          listingLocation: `${res.data.listing.location.city}, ${res.data.listing.location.state}, ${res.data.listing.location.country}`,
          listingStreet: res.data.listing.location.street,
          listingZipcode: res.data.listing.location.zipcode,
          listingAptnum: res.data.listing.location.aptnum,
          listingBaths: res.data.listing.details.baths,
          listingBeds: res.data.listing.details.beds,
          listingMaxPeople: res.data.listing.details.maxpeople,
          listingPrice: res.data.listing.price,
          listingStartDate: res.data.listing.available[0],
          listingEndDate: res.data.listing.available[1],
          listingUser: res.data.listing.userId,
          listingPictures: res.data.listing.pictures,
          listingAmenities: res.data.listing.amenities,
          listingRatings: res.data.listing.rating,
          listingId: res.data.listing.userId,
          isActive: res.data.listing.active,
        });
        let pictures = [];
        for (let i = 0; i < this.state.listingPictures.length; i++) {
          pictures.push({
            original: String(this.state.listingPictures[i]),
            thumbnail: String(this.state.listingPictures[i]),
          });
        }
        this.setState({
          listingPictures: pictures,
        });
        // Set default disabled days based on booked days in listing object
        let startDate = new Date(this.state.listingStartDate);
        let endDate = new Date(this.state.listingEndDate);
        endDate.setDate(endDate.getDate() + 1);
        startDate.setDate(startDate.getDate() + 1);
        let bookedDays = [
          {
            after: endDate,
            before: startDate,
          },
        ];
        // Append days from booked field in listing object
        for (let i = 0; i < res.data.listing.booked.length; i++) {
          let reserveStart = new Date(res.data.listing.booked[i].start);
          let reserveEnd = new Date(res.data.listing.booked[i].end);
          reserveStart.setDate(reserveStart.getDate());
          reserveEnd.setDate(reserveEnd.getDate() + 2);
          bookedDays.push({
            after: reserveStart,
            before: reserveEnd,
          });
        }
        bookedDays.push({
          before: new Date(today),
        });
        this.setState({
          listingBookedDays: bookedDays,
          today: today.setUTCHours(0, 0, 0, 0),
        });
        // Get host's email from their userId
        app.get(`/user/getUserInfo/${this.state.listingUser}`).then((res) =>
          this.setState({
            hostEmail: res.data.email,
            isLoading: false,
          })
        );

        const userId = this.state.listingId;
        app.get(`/user/getUserInfo/${userId}`).then((res) => {
          this.setState({ listingUserName: res.data });
        });
      })
      .catch((err) => {
        console.log(err.response);
      });
  }

  async handleSessionRedirect() {
    this.setState({
      isLoading: true,
    });

    if (!this.props.userSession) {
      alert("Please log in to create a reservation.");
      return this.props.history.push("/login");
    }
    const selectedStartDay = JSON.stringify(this.state.from).substring(
      1,
      JSON.stringify(this.state.from).indexOf("T")
    );
    const selectedEndDay = JSON.stringify(this.state.to).substring(
      1,
      JSON.stringify(this.state.to).indexOf("T")
    );
    const data = {
      user: this.props.userSession.userId, // get userId from redux store
      listing: this.props.match.params.id,
      days: [selectedStartDay, selectedEndDay],
    };

    const stripe = await stripePromise;
    const resDays =
      parseInt((this.state.to - this.state.from) / (1000 * 3600 * 24)) + 1;
    const listingId = data.listing;
    let body = {
      listingId: listingId,
      days: resDays,
      dates: [this.state.from, this.state.to],
    };

    // Wrap calls in try-catch block.  All errors handled by catch
    try {
      const newReservation = await handleReq(
        "/reservation/createReservation",
        "POST",
        {
          Authorization: `Bearer ${this.props.userSession.token}`,
        },
        data
      );

      // If the stripe call succeeds, create reservation
      if (newReservation.status === 201) {
        const { reservationId } = newReservation.data;
        body["reservationId"] = reservationId;

        const response = await handleReq(
          "/payment/create-session",
          "POST",
          {
            "Content-Type": "application/json",
          },
          JSON.stringify(body)
        );
        // Redirect to stripe session after inactive reservation is made
        if (response.status === 201) {
          const session = response.data; //json();
          // Redirect to stripe checkout session
          const result = await stripe.redirectToCheckout({
            sessionId: session.id,
          });
          if (result.error) alert(result.error.message);
          this.setState({
            isLoading: false,
          });
        }
      }
    } catch (e) {
      console.log(e.response.data.errors);
      console.log(e);
      this.setState({
        isLoading: false,
      });
      alert(e.response.data.errors); //response.data
    }
  }

  getInitialState() {
    return {
      from: undefined,
      to: undefined,
    };
  }

  handleDayClick(day) {
    // Check listing availability dates separately
    if (day < this.state.today) {
      this.setState({
        outOfRange: true,
      });
      return;
    }
    for (let i = 0; i < this.state.listingBookedDays.length; i++) {
      // Have to subtract one from end date of reservation because of offset
      const endDate = new Date(this.state.listingBookedDays[i].before);
      endDate.setDate(endDate.getDate() - 1);
      // Check if selected day falls within any of the disabled days
      if (day < endDate && day > this.state.listingBookedDays[i].after) {
        this.setState({
          outOfRange: true,
        });
        return;
      }
    }

    this.setState({
      outOfRange: false,
    });
    const range = DateUtils.addDayToRange(day, this.state);
    this.setState(range);

    // console.log(this.state.from, this.state.to)
  }

  handleResetClick() {
    this.setState(this.getInitialState());
  }

  handleChangeRating(newRating, name) {
    return this.setState({ [name]: newRating });
  }

  handleReviewChange(e) {
    const { name, value } = e.target;
    return this.setState({ [name]: value });
  }

  handleReviewSubmit(e) {
    e.preventDefault();
    const { rating, review } = this.state;
    const listingId = this.props.match.params.id;
    const token = this.props.userSession.token;

    this.props.submitReview(rating, review, listingId, token);
  }

  render() {
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };

    // const lessThanFourDays =
    //   parseInt((this.state.to - this.state.from) / (1000 * 3600 * 24)) + 1 < 4
    //     ? true
    //     : false;
    const getRating = () => {
      let n = Object.keys(this.state.listingRatings).length;
      let average = 0;
      const stars = [];
      for (let props in this.state.listingRatings) {
        average = average + this.state.listingRatings[props].stars / n;
      }
      for (let i = 1; i <= 5; i++) {
        if (i <= average) {
          stars.push(<StarIcon className="star-icon" alt={i} />);
        } else {
          stars.push(<StarBorderIcon className="star-icon" alt={i} />);
        }
      }
      stars.push(<p className="rating-number">({n})</p>);
      return stars;
    };

    return (
      <div className="individual-listing-container">
        {!this.state.listingPictures ? (
          <div id="spinner"></div>
        ) : (
          <div>
            <ImageGallery
              items={this.state.listingPictures}
              showThumbnails={true}
              showPlayButton={false}
              showBullets={true}
              showFullscreenButton={false}
              bulletClass="image-gallery-bullet"
              onErrorImageURL={"/images/default_listing.jpg"}
              originalAlt={`${this.state.listingTitle}`}
              renderLeftNav={(onClick, disabled) => {
                return (
                  <button
                    disabled={disabled}
                    onClick={onClick}
                    className="image-gallery-left-nav image-gallery-icon"
                  >
                    <ArrowBackIcon
                      style={{ width: 40, height: 40 }}
                      className="image-gallery-arrow-icon"
                    />
                  </button>
                );
              }}
              renderRightNav={(onClick, disabled) => {
                return (
                  <button
                    disabled={disabled}
                    onClick={onClick}
                    className="image-gallery-right-nav image-gallery-icon"
                  >
                    <ArrowForwardIcon
                      style={{ width: 40, height: 40 }}
                      className="image-gallery-arrow-icon"
                    />
                  </button>
                );
              }}
            />
            <div className="details-container">
              <div className="listing-details">
                {!this.state.isActive ? (
                  <div>
                    <h2 className="listing-title">
                      [DRAFT] {this.state.listingTitle}
                    </h2>
                    <div>This listing is not viewable to the public.</div>
                  </div>
                ) : (
                  <h2 className="listing-title">{this.state.listingTitle}</h2>
                )}
                {this.state.listingRatings && (
                  <div className="rating-container">{getRating()}</div>
                )}
                <div className="details">
                  <div className="listing-info-container">
                    <div className="listing-info">
                      <PermIdentityIcon className="listing-info-icon" />
                      <h2>
                        {this.state.listingMaxPeople} Guest
                        {this.state.listingMaxPeople > 1 ? "s" : ""}
                      </h2>
                    </div>
                    <div className="listing-info">
                      <img
                        src="/images/bed.svg"
                        alt="bed"
                        className="listing-info-icon"
                      />
                      <h2>
                        {this.state.listingBeds} Bed
                        {this.state.listingBeds > 1 ? "s" : ""}
                      </h2>
                    </div>
                    <div className="listing-info">
                      <img
                        src="/images/bath.svg"
                        alt="bath"
                        className="listing-info-icon"
                      />
                      <h2>
                        {this.state.listingBaths} Bath
                        {this.state.listingBaths > 1 ? "s" : ""}
                      </h2>
                    </div>
                  </div>
                  <div className="spacer_xs"></div>
                  {this.props.userSession ? (
                    <div className="listing-contact">
                      <div className="listing-contact-info">
                        <img src={defaultProfile} alt="profile" />
                        {this.state.listingUserName && (
                          <h2>{this.state.listingUserName.name}</h2>
                        )}
                      </div>
                      <a href={`mailto:${this.state.hostEmail}`}>
                        <button
                          className="listing-button btn green"
                          type="button"
                        >
                          {" "}
                          Contact Host{" "}
                        </button>
                      </a>{" "}
                    </div>
                  ) : null}
                </div>
                <h4 className="listing-subtitle">Details</h4>
                <p className="listing-description">
                  {this.state.listingDescription}
                </p>{" "}
                <br />
                {this.state.listingAmenities.length > 0 && (
                  <div className="listing-amenities">
                    <h4 className="listing-subtitle">Amenities</h4>
                    <div className="listing-amenities-container">
                      {this.state.listingAmenities.map((amenity) => {
                        let imagepath;
                        switch (amenity) {
                          case "TV": {
                            imagepath = "/images/amenities/TV_.svg";
                            break;
                          }
                          case "Kitchen": {
                            imagepath = "/images/amenities/Kitchen_.svg";
                            break;
                          }
                          case "Wifi": {
                            imagepath = "/images/amenities/Wifi_.svg";
                            break;
                          }
                          case "Heating": {
                            imagepath = "/images/amenities/Heating_.svg";
                            break;
                          }
                          case "Kitchen": {
                            imagepath = "/images/amenities/Kitchen_.svg";
                            break;
                          }
                          case "Pool": {
                            imagepath = "/images/amenities/Pool_.svg";
                            break;
                          }
                          case "Towels": {
                            imagepath = "/images/amenities/Towels_.svg";
                            break;
                          }
                          case "Hair dryer": {
                            imagepath = "/images/amenities/Hairdryer_.svg";
                            break;
                          }
                          case "Heat": {
                            imagepath = "/images/amenities/Heating_.svg";
                            break;
                          }
                          case "AC": {
                            imagepath = "/images/amenities/ac_.svg";
                            break;
                          }
                        }
                        return (
                          <div className="amenities-div">
                            <img src={imagepath} />
                            <h1>{amenity}</h1>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="listing-location"></div>
                <h4 className="listing-subtitle">Location</h4>
                <h5 className="listing-location-text">
                  <LocationOnIcon className="listing-location-icon" />
                  {this.state.listingLocation}
                </h5>{" "}
                <div className="listing-divider"></div>
              </div>
              <div className="listing-calendar">
                <div className="spacer_xs"></div>
                <div style={{ alignText: "center" }}>
                  {this.state.outOfRange ? (
                    "Selected day is not available."
                  ) : (
                    // lessThanFourDays ? (
                    //   "Minimum 4 days required"
                    // ) :
                    <div>
                      {!from && !to && "Please select the first day."}
                      {from && !to && "Please select the last day."}
                      {from &&
                        to &&
                        `From ${from.toLocaleDateString()} to
                    ${to.toLocaleDateString()}`}{" "}
                    </div>
                  )}
                </div>
                <DayPicker
                  className="Selectable"
                  selectedDays={[from, { from, to }]}
                  modifiers={modifiers}
                  onDayClick={this.handleDayClick}
                  disabledDays={this.state.listingBookedDays}
                  inputProps={{ required: true }}
                />
                <div className="spacer_xs"></div>
                <h2 className="listing-price">
                  <span>${this.state.listingPrice.toFixed(2)}</span> / night
                </h2>
                <div className="reserve-now">
                  {this.state.from && this.state.to ? (
                    // && !lessThanFourDays
                    this.state.isLoading ? (
                      <div id="spinner"></div>
                    ) : (
                      <input
                        className="listing-button btn green"
                        type="button"
                        value="Book Now"
                        onClick={this.handleSessionRedirect}
                      />
                    )
                  ) : null}
                </div>
              </div>
            </div>
            {this.props.review ? (
              <>
                <form onSubmit={this.handleReviewSubmit}>
                  <StarRatings
                    rating={this.state.rating}
                    changeRating={this.handleChangeRating}
                    starHoverColor="#00B183"
                    starRatedColor="#00B183"
                    name="rating"
                  />
                  <input
                    type="text"
                    name="review"
                    placeholder="e.g. This was a great place to stay!"
                    value={this.state.review}
                    onChange={this.handleReviewChange}
                    required
                  />
                  <button className="btn green" type="submit">
                    Submit Review
                  </button>
                </form>
              </>
            ) : null}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let stateToReturn = { ...state };
  if (state.Login.userInfo)
    stateToReturn["userSession"] = state.Login.userInfo.session;
  stateToReturn["calendarURL"] = state.Calendar.calendarURL;
  return stateToReturn;
};

const mapDispatchToProps = (dispatch) => {
  return {
    submitReview: (...args) => dispatch(submitReview(...args)),
    getCalendarURL: (listingId) => dispatch(getCalendarURL(listingId)),
    importCalendar: (calendarURL, listingId) =>
      dispatch(importCalendar(calendarURL, listingId)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ListingPage)
);

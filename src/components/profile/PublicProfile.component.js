import React, { useEffect, useState } from "react";
import { app } from "../../utils/axiosConfig";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { searchUserListings } from "../../redux/actions/searchListingActions";
import "./PublicProfile.css";

import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";

const PublicProfile = (props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const getInfo = async () => {
      await props.searchUserListings(props.match.params.id);
      app
        .get(`/user/getUserInfo/${props.match.params.id}`)
        .then((res) => {
          setName(res.data.name);
          setDescription(res.data.description);
          if (props.userSession) setEmail(res.data.email);
        })
        .catch((err) => setError(true));
    };
    getInfo();
  }, []);

  const getStars = () => {
    let totalReviews = 0;
    let totalStars = 0;
    const stars = [];
    props.userListings.map((listing) => {
      for (let props in listing.rating) {
        totalStars = totalStars + listing.rating[props].stars;
        totalReviews++;
      }
    });
    if (totalReviews === 0) {
      return <p>No Reviews yet</p>;
    }
    let average = totalStars / totalReviews;
    for (let i = 1; i <= 5; i++) {
      if (i <= average) {
        stars.push(<StarIcon className="star-icon" alt={i} />);
      } else {
        stars.push(<StarBorderIcon className="star-icon" alt={i} />);
      }
    }
    stars.push(<p className="rating-number">({totalReviews})</p>);

    return stars;
  };

  return (
    <div className="public-profile-screen">
      <h1>test</h1>
      {props.userListings && getStars()}
    </div>
  );
};

const mapStateToProps = (state) => {
  let stateToReturn = { ...state };
  if (state.Login.userInfo)
    stateToReturn["userSession"] = state.Login.userInfo.session;
  stateToReturn["userListings"] = state.Listing.userListings;
  return stateToReturn;
};

const mapDispatchToProps = (dispatch) => {
  return {
    searchUserListings: (userId) => dispatch(searchUserListings(userId)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PublicProfile)
);

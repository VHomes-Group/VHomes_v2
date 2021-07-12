import React, { useState } from "react";
import Navbar from "./components/homePage/navbar.component";
import Footer from "./components/homePage/footer.component";
import Home from "./components/homePage/newHome.component";
import Login from "./components/authentication/login.component";
import Signup from "./components/authentication/signup.component";
import Contact from "./components/subpages/contact.component.js";
import AllListings from "./components/matches/AllListings.component.js";
import Explore from "./components/matches/listing/Explore.component";
// import Questionnaire from "./components/matches/questionnaire.component";
import EditProfileInfo from "./components/myAccount/editProfileInfo.component";
import ReservationLookup from "./components/reservations/reservationLookupModal.component";
import { Route, Switch, useHistory } from "react-router-dom";
import CreateListing from "./components/createListing/createListing.component";
import MyAccount from "./components/myAccount/menu.component";
import ListingPage from "./components/listingPage/listingPage.component";
// import EditListing from "./components/editListing/editListing";
import PaymentSuccess from "./components/listingPage/paymentSuccess.component";
import AccountVerification from "./components/authentication/verifyAccount.component";
import ActivateReservation from "./components/reservations/activateReservation.component";
import ReviewPopup from "./components/review/reviewModal.component";
import CalendarImportInfo from "./components/subpages/calendarImportInfo.component.js";
import PageNotFound from "./components/subpages/404.component";
import About from "./components/subpages/about.component";
import ListingMap from "./components/map/maps.component";
import PublicProfile from "./components/profile/PublicProfile.component";
import "./App.css";

//to add more items just copy the format and add the route path. look at navbar component to see where the path is currently set to
function App() {
  const history = useHistory();
  const [reservationModal, setReservationModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewListingId, setReviewListingId] = useState("");

  return (
    <>
      <Navbar
        history={history}
        setReservationModal={setReservationModal}
        reservationModal={reservationModal}
      />
      <div className="App">
        <div className="body-container">
          <Switch>
            <Route
              path="/"
              exact
              component={() => (
                <Home isBlurred={reservationModal} history={history} />
              )}
            />
            <Route path="/ContactUs" exact component={Contact} />
            <Route path="/Login" exact component={Login} />
            <Route path="/SignUp" exact component={Signup} />
            <Route path="/CreateListing" exact component={CreateListing} />
            <Route
              path="/Listings"
              exact
              component={AllListings}
              history={history}
            />
            <Route
              path="/Explore"
              exact
              component={Explore}
              history={history}
            />
            <Route path="/Map" exact component={ListingMap} />
            <Route
              path="/MyAccount"
              exact
              component={() => (
                <MyAccount
                  setReviewModal={setReviewModal}
                  setReviewListingId={setReviewListingId}
                />
              )}
            />
            {/* <Route path="/Questionnaire" exact component={Questionnaire} /> */}
            <Route
              path="/Listing/:id"
              exact
              component={() => <ListingPage review={false} />}
            />
            <Route
              path="/Listing/:id/review"
              exact
              component={() => <ListingPage review={true} />}
            />
            <Route
              path="/EditListing/:listingId"
              exact
              render={() => <CreateListing isEditing={true} />}
            />
            <Route path="/PaymentSuccess" exact component={PaymentSuccess} />
            <Route
              path="/AccountVerification/:userId"
              exact
              component={AccountVerification}
            />
            <Route path="/EditProfileInfo" exact component={EditProfileInfo} />
            <Route path="/contact" exact component={Contact} />
            <Route path="/profile/:id" exact component={PublicProfile} />
            <Route
              path="/completeReservation/:listingId/:reservationId"
              exact
              component={ActivateReservation}
            />
            <Route
              path="/how-to-import-or-export-calendar"
              exact
              component={CalendarImportInfo}
            />
            <Route path="/about" exact component={About} />
            <Route path="*" exact component={PageNotFound} />
          </Switch>
        </div>
        {reservationModal ? (
          <ReservationLookup
            reservationModal={reservationModal}
            setReservationModal={setReservationModal}
          />
        ) : null}
        {reviewModal ? (
          <ReviewPopup
            setReviewModal={setReviewModal}
            reviewListingId={reviewListingId}
          />
        ) : null}
        <Footer />
      </div>
    </>
  );
}

export default App;

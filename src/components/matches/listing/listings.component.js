import React, { Component } from "react";
import { NavLink, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Pagination from "@material-ui/lab/Pagination";
import MaterialUIMenu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Switch from "@material-ui/core/Switch";
import _ from "lodash";
import "./listings.css";
import ListingCard from "./listingCard.component";
import {
  searchAllListings,
  searchForListings,
  searchFilteredListings,
  searchUserListings,
} from "../../../redux/actions/searchListingActions";
import ProfileHorizontalScrollMenu from "./ProfileHorizontalScrollMenu.component";

class Listings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideExpired: true,
      itemsToDisplay: [],
      listings: [],
      page: 0,
      pageCount: 0,
      sorting: "newest",
      filters: {
        showDrafts: false,
        sortByPrice: this.props.router.location.query.sortPrice,
        sortByGuests: this.props.router.location.query.sortGuests,
        maxPrice: this.props.router.location.query.maxPrice,
        minGuests: this.props.router.location.query.minGuests,
      },
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleExpiredToggle = this.handleExpiredToggle.bind(this);
  }

  handleSearch() {
    let filter;
    let filterClicked;
    if (this.props.listingFilterState) {
      filter = this.props.listingFilterState;
      filterClicked =
        filter.minGuestsClicked ||
        filter.minRatingClicked ||
        filter.startingPriceClicked;
    }

    if (this.props.location.search) {
      /* Get listing using search term */
      const itemToSearch = this.props.router.location.query.search;
      this.props.searchForListings(itemToSearch);
    } else if (filterClicked) {
      /* Get listing using listing filter */
      this.props.searchFilteredListings(filter, false);
    } else {
      // console.log(this.props.searchOnlyUser)
      if (this.props.searchOnlyUser)
        this.props.searchUserListings(this.props.User.userInfo._id);
      else this.props.searchAllListings();
    }
  }

  componentDidMount() {
    this.handleSearch();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.location !== prevProps.location ||
      this.props.listingFilterState !== prevProps.listingFilterState
    ) {
      return this.handleSearch();
    }
  }

  static getDerivedStateFromProps(props, state) {
    const listingType = props.searchOnlyUser
      ? "userListings"
      : "searchListings";

    if (props[listingType] && props[listingType] !== state.listings) {
      const activeListings = props[listingType].filter((listing) => {
        // Split string to Year (idx 0), Month (idx 1), Day (idx 2) then convert to num
        const expireDate = listing.available[1];
        const curDateUTC = new Date().toISOString();
        const curDateTimestamp = new Date(curDateUTC).getTime();
        // Compare to check if curDate is past expired
        let isExpired = curDateTimestamp > expireDate;
        if (isExpired && state.hideExpired) return false;
        else return true;
      });

      if (state.sorting === "oldest") {
        activeListings.sort((listing1, listing2) => {
          return listing1.createdAt > listing2.createdAt ? 1 : -1;
        });
      }

      if (state.sorting === "newest") {
        activeListings.sort((listing1, listing2) => {
          return listing1.createdAt > listing2.createdAt ? -1 : 1;
        });
      }

      // Divide by number of items per page
      const pageCount = Math.ceil(activeListings.length / 10);
      // Display first 10 else max shown
      const itemsToDisplay =
        activeListings.length > 10 ? [0, 9] : [0, activeListings.length - 1];

      if (state && state.itemsToDisplay.length !== 0 && state.page !== 0) {
        const { itemsToDisplay, page } = state;
        return {
          itemsToDisplay: itemsToDisplay,
          listings: activeListings,
          page: page,
          pageCount: pageCount,
        };
      }

      return {
        itemsToDisplay: itemsToDisplay,
        listings: activeListings,
        page: 1,
        pageCount: pageCount,
      };
    } else return state;
  }

  handlePageChange(event, page) {
    const startIdx = (page - 1) * 10;
    const endIdx =
      page * 10 - 1 > this.state.listings.length - 1
        ? this.state.listings.length - 1
        : this.state.page * 10 - 1;
    console.log(endIdx);
    console.log(this.state.listings.length);
    this.setState({ itemsToDisplay: [startIdx, endIdx] });
  }

  handleExpiredToggle() {
    return this.state.hideExpired
      ? this.setState({ hideExpired: false })
      : this.setState({ hideExpired: true });
  }

  render() {
    let listings = this.state.listings || null;
    const open = Boolean(this.state.sortAnchorEl);

    const handleClick = (event) => {
      this.setState({ sortAnchorEl: event.currentTarget });
      // console.log(this.state.sortAnchorEl)
    };

    // Adjust this for sorting the listings -> TODO
    const handleClose = () => {
      this.setState({ sortAnchorEl: null });
    };

    return (
      <>
        {this.props.location.pathname === "/MyAccount" ? (
          <div className="account-listing-buttons-container">
            <div className="account-listing-button">
              <NavLink to="/CreateListing">Create Listing</NavLink>
            </div>
            {/* {!this.state.hideExpired ? (
              <div
                className="account-listing-button"
                onClick={this.handleExpiredToggle}
              >
                Hide Expired
              </div>
            ) : (
              <div
                className="account-listing-button"
                onClick={this.handleExpiredToggle}
              >
                Show Expired
              </div>
            )} */}
            <div className="account-switch-container">
              <p>Show Expired</p>
              <Switch
                checked={!this.state.hideExpired}
                onChange={this.handleExpiredToggle}
              />
            </div>
            {/* {!this.state.filters.showDrafts ? (
              <div
                className="account-listing-button"
                onClick={() =>
                  this.setState((prevState) => ({
                    filters: {
                      ...prevState.filters,
                      showDrafts: true,
                    },
                  }))
                }
              >
                Show Drafts
              </div>
            ) : (
              <div
                className="account-listing-button"
                onClick={() =>
                  this.setState((prevState) => ({
                    filters: {
                      ...prevState.filters,
                      showDrafts: false,
                    },
                  }))
                }
              >
                Show Active
              </div>
            )} */}
            <div className="account-switch-container">
              <p>Show Drafts</p>
              <Switch
                checked={this.state.filters.showDrafts}
                onChange={() =>
                  this.setState((prevState) => ({
                    filters: {
                      ...prevState.filters,
                      showDrafts: !this.state.filters.showDrafts,
                    },
                  }))
                }
              />
            </div>
            <MoreVertIcon
              onClick={handleClick}
              className="vert-menu account-listing-menu-button"
            />
            <MaterialUIMenu
              id="long-menu"
              anchorEl={this.state.sortAnchorEl}
              keepMounted
              open={open}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  this.setState({ sorting: "newest" });
                }}
              >
                Sort by Created Date (Newest First)
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  this.setState({ sorting: "oldest" });
                }}
              >
                Sort by Created Date (Oldest First)
              </MenuItem>
            </MaterialUIMenu>
          </div>
        ) : null}
        {this.state.listings ? (
          listings.length <= 0 ? (
            <>
              <p
                className="account-listing-no-listing"
                ref={(el) => {
                  if (el) {
                    el.style.setProperty("text-align", "center", "important");
                  }
                }}
              >
                No listings yet!
              </p>
            </>
          ) : this.props.location.pathname === "/MyAccount" ? (
            <ProfileHorizontalScrollMenu
              className="horizontal-scroll-container"
              data={this.state.listings.filter((listing) =>
                this.state.filters.showDrafts
                  ? listing
                  : listing.active === true
              )}
            />
          ) : (
            <div className="listings-container">
              <div
                id="listing-content"
                className={
                  this.props.location.pathname === "/MyAccount"
                    ? ""
                    : "wow fadeInUp"
                }
                data-wow-delay="0.5s"
              >
                {_.chain(this.state.listings)
                  .orderBy(
                    [
                      (listing) =>
                        this.state.filters.sortByPrice !== undefined
                          ? listing.price
                          : listing,
                    ],
                    [this.state.filters.sortByPrice === "true" ? "desc" : "asc"]
                  )
                  .orderBy(
                    [
                      (listing) =>
                        this.state.filters.sortByGuests !== undefined
                          ? listing.details.maxpeople
                          : listing,
                    ],
                    [
                      this.state.filters.sortByGuests === "true"
                        ? "desc"
                        : "asc",
                    ]
                  )
                  .filter((listing) =>
                    this.state.filters.maxPrice === undefined
                      ? listing
                      : listing.price <= this.state.filters.maxPrice
                  )
                  .filter((listing) =>
                    this.state.filters.minGuests === undefined
                      ? listing
                      : listing.details.maxpeople >=
                        this.state.filters.minGuests
                  )
                  .map((listing, idx) => {
                    if (
                      idx >= this.state.itemsToDisplay[0] &&
                      idx <= this.state.itemsToDisplay[1]
                    )
                      return (
                        <ListingCard key={listing._id} listing={listing} />
                      );
                    else return null;
                  })
                  .value()}
              </div>
            </div>
          )
        ) : null}
        <Pagination
          count={this.state.pageCount}
          onChange={this.handlePageChange}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const stateToReturn = { ...state };
  if (state.Login.userInfo)
    stateToReturn["userSession"] = state.Login.userInfo.session;
  if (state.Listing.userListings)
    stateToReturn["userListings"] = state.Listing.userListings;
  if (state.Listing.searchListings)
    stateToReturn["searchListings"] = state.Listing.searchListings;
  return stateToReturn;
};

const mapDispatchToProps = (dispatch) => {
  return {
    searchAllListings: () => dispatch(searchAllListings()),
    searchForListings: (itemToSearch) =>
      dispatch(searchForListings(itemToSearch)),
    searchFilteredListings: (filter) =>
      dispatch(searchFilteredListings(filter, false)),
    searchUserListings: (userId) => dispatch(searchUserListings(userId)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Listings)
);

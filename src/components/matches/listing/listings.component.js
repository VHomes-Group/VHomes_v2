import React, { Component } from "react";
import { NavLink, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Pagination from '@material-ui/lab/Pagination';
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import MaterialUIMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import "./listings.css";
import ListingCard from './listingCard.component'
import {
  searchAllListings,
  searchForListings,
  searchFilteredListings,
  searchUserListings,
} from "../../../redux/actions/searchListingActions";

const CustomButton = withStyles((theme) => ({
  root: {
    color: "#00B183",
    backgroundColor: "transparent",
    border: "2px solid #00B183",
    borderRadius: "8px",
    font: "inherit",
    fontSize: "16px",
    fontWeight: "normal",
  },
}))(Button);

class Listings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideExpired: true,
      itemsToDisplay: [],
      listings: [],
      page: 0,
      pageCount: 0,
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleExpiredToggle = this.handleExpiredToggle.bind(this);
  };

  handleSearch() {
    let filter;
    let filterClicked;
    if (this.props.listingFilterState) {
      filter = this.props.listingFilterState;
      filterClicked = filter.minGuestsClicked || filter.minRatingClicked || filter.startingPriceClicked;
    }

    if (this.props.location.search) {
      /* Get listing using search term */
      const itemToSearch = this.props.location.search.slice(1);
      this.props.searchForListings(itemToSearch);
    } else if (filterClicked) {
      /* Get listing using listing filter */
      this.props.searchFilteredListings(filter);
    } else {
      // console.log(this.props.searchOnlyUser)
      if (this.props.searchOnlyUser) this.props.searchUserListings(this.props.userSession.token);
      else this.props.searchAllListings();
    }
  }

  componentDidMount() {
    this.handleSearch();
  };

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location || this.props.listingFilterState !== prevProps.listingFilterState) {
      return this.handleSearch();
    };
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const listingType = nextProps.searchOnlyUser ? "userListings" : "searchListings";
    if (nextProps[listingType] && nextProps[listingType] !== prevState.listings) {
      const activeListings = nextProps[listingType].filter((listing) => {
        // Split string to Year (idx 0), Month (idx 1), Day (idx 2) then convert to num
        const expireDate = listing.available[1].split('-').map(date => {
          return Number.parseInt(date, 10)
        });
        // Convert using to milliseconds
        const expireDateConverted = new Date(expireDate[0], expireDate[1] - 1, expireDate[2]).getTime();
        const curDate = new Date().getTime();
        // Compare to check if curDate is past expired
        let isExpired = curDate > expireDateConverted;
        if (isExpired && prevState.hideExpired) return false;
        else return true;
      });

      // Divide by number of items per page
      const pageCount = Math.ceil(activeListings.length / 10);
      // Display first 10 else max shown
      const itemsToDisplay = activeListings.length > 10 ? [0, 9] : [0, activeListings.length - 1];

      if (prevState && prevState.itemsToDisplay.length !== 0 && prevState.page !== 0) {
        const { itemsToDisplay, page } = prevState;
        return {
          itemsToDisplay: itemsToDisplay,
          listings: activeListings,
          page: page,
          pageCount: pageCount
        }
      }

      return {
        itemsToDisplay: itemsToDisplay,
        listings: activeListings,
        page: 1,
        pageCount: pageCount
      }
    } else return null;
  };

  handlePageChange(event, page) {
    const startIdx = ((page - 1) * 10);
    const endIdx = ((page * 10) - 1) > this.state.listings.length ? this.state.listings.length : ((this.state.page * 10) - 1);

    this.setState({ itemsToDisplay: [startIdx, endIdx] });
  }

  handleExpiredToggle() {
    return this.state.hideExpired ? this.setState({ hideExpired: false }) : this.setState({ hideExpired: true });
  };

  render() {
    let listings = this.state.listings || null
    const open = Boolean(this.state.sortAnchorEl);

    const handleClick = (event) => {
      this.setState({ sortAnchorEl: event.currentTarget });
      console.log(this.state.sortAnchorEl)
    };

    // Adjust this for sorting the listings -> TODO
    const handleClose = () => {
      this.setState({ sortAnchorEl: null });
    };

    return (
      <div className="wow fadeInUp" data-wow-delay="0.5s">
        {
          this.props.location.pathname === "/MyAccount" ?
          <CustomButton>
            <NavLink to="/CreateListing">Create Listing</NavLink>
          </CustomButton>
          : null
        }
        {
          !this.state.hideExpired ?
            <CustomButton onClick={this.handleExpiredToggle}>Hide Expired</CustomButton>
            :
            <CustomButton onClick={this.handleExpiredToggle}>Show Expired</CustomButton>
        }
        <MoreVertIcon onClick={handleClick} className="vert-menu"/>
        <MaterialUIMenu
          id="long-menu"
          anchorEl={this.state.sortAnchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Sort by Created Date (Newest First)</MenuItem>
          <MenuItem onClick={handleClose}>Sort by Created Date (Oldest First)</MenuItem>
        </MaterialUIMenu>
        {this.state.listings ? (listings.length <= 0 ? <div><div className="spacer_s"></div>No listings yet!</div> :
          <div id='listing-content'>
            {
              this.state.listings.map((listing, idx) => {
                if (idx >= this.state.itemsToDisplay[0] && idx <= this.state.itemsToDisplay[1])
                  return <ListingCard key={listing._id} listing={listing} />;
                else return null;
              })
            }
          </div>
        ) : null}
        <Pagination count={this.state.pageCount} onChange={this.handlePageChange} />
      </div>
    );
  }


};

const mapStateToProps = state => {
  const stateToReturn = { ...state };
  if (state.Login.userInfo) stateToReturn["userSession"] = state.Login.userInfo.session;
  if (state.Listing.userListings) stateToReturn["userListings"] = state.Listing.userListings;
  if (state.Listing.searchListings) stateToReturn["searchListings"] = state.Listing.searchListings;
  return stateToReturn;
};

const mapDispatchToProps = dispatch => {
  return {
    searchAllListings: () => dispatch(searchAllListings()),
    searchForListings: (itemToSearch) => dispatch(searchForListings(itemToSearch)),
    searchFilteredListings: (filter) => dispatch(searchFilteredListings(filter)),
    searchUserListings: (token) => dispatch(searchUserListings(token)),
  };
};

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(
  Listings
));

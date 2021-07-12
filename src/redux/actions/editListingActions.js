import { push } from "connected-react-router";

import handleReq from "../../utils/fetchRequest.js";
import { setLoadingTrue, setLoadingFalse } from "./loadingActions";

/* Types */

/* Actions */

/* Fetch Calls */
export const submitEditListing =
  (token, editListingData, listingId) => async (dispatch) => {
    dispatch(setLoadingTrue());
    console.log(listingId);
    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };
    const editListingRes = await handleReq(
      `/listings/editListing/${listingId}`,
      "PUT",
      headers,
      editListingData
    );

    if (editListingRes.statusText === "OK") {
      const { listing } = editListingRes.data;
      dispatch(setLoadingFalse());
      dispatch(push(`/listing/${listing._id}`));
    }
  };

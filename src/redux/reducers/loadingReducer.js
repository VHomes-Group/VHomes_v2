import { SET_LOADING_TRUE, SET_LOADING_FALSE } from "../actions/loadingActions";
import { COMPLETE_FORM, INCOMPLETE_FORM } from "../reducers/createListingTypes";

export default function reducer(
  state = { loading: false, formCompleted: true },
  action
) {
  switch (action.type) {
    case SET_LOADING_TRUE:
      return {
        ...state,
        loading: true,
      };
    case SET_LOADING_FALSE:
      return {
        ...state,
        loading: false,
      };
    case INCOMPLETE_FORM:
      return {
        ...state,
        formCompleted: false,
      };
    case COMPLETE_FORM:
      return {
        ...state,
        formCompleted: true,
      };
    default:
      return state;
  }
}

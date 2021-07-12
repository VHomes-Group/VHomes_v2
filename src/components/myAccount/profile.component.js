import React, { useEffect, useState } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/actions/userActions";
import { app } from "../../utils/axiosConfig.js";
import MailOutlineIcon from "@material-ui/icons/MailOutline";

import ImageCrop from "./imageCrop.component";
import DefaultProfileImg from "../../assets/img/man.png";
import "./profile.css";
import "react-image-crop/dist/ReactCrop.css";

const Profile = (props) => {
  const loginInfo = useSelector((state) => state.Login);
  const user = useSelector((state) => state.User);
  const dispatch = useDispatch();
  const isEmpty = Object.keys(user).length === 0;
  const [newProfileImg, setNewProfileImg] = useState(null);
  const [imgName, setImgName] = useState(null);

  useEffect(() => {
    const userId = loginInfo.userInfo.session.userId;
    app.get(`/user/getUserInfo/${userId}`).then((res) => {
      dispatch(setUserInfo(res.data));
    });
  }, [dispatch, loginInfo.userInfo.session.userId]);

  const Greeting = () => {
    if (!isEmpty) {
      return (
        <h2 style={{ color: "#02b188", textDecoration: "none" }}>
          Welcome, {user.userInfo.name}!
        </h2>
      );
    } else {
      return null;
    }
  };

  const Information = () => {
    if (!isEmpty) {
      return (
        <>
          {props.loading ? (
            <h1>Loading</h1>
          ) : (
            <div className="profile-image-container">
              <input
                type="file"
                id="file"
                accept="image/*"
                onChange={(e) => {
                  const fileTypes = ["jpg", "jpeg", "png"];
                  if (
                    !fileTypes.includes(
                      e.target.files[0].name.split(".").pop().toLowerCase()
                    )
                  )
                    return alert("File must be a jpg, jpeg, or png.");
                  if (e.target.files && e.target.files.length > 0) {
                    setImgName(e.target.files[0].name);
                    const reader = new FileReader();
                    reader.addEventListener("load", () =>
                      setNewProfileImg(reader.result)
                    );
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
              <>
                <label
                  htmlFor="file"
                  className="profile-select-img"
                  style={{ display: "block" }}
                >
                  {user.userInfo.profileImg ? (
                    <img
                      className="profile-image"
                      src={user.userInfo.profileImg}
                      alt="Profile Pic"
                      onError={(e) =>
                        (e.target.src = "/images/abstract-user-flat-4.svg")
                      }
                    />
                  ) : (
                    <img
                      className="profile-image"
                      src={DefaultProfileImg}
                      alt="Profile Pic"
                      onError={(e) =>
                        (e.target.src = "/images/abstract-user-flat-4.svg")
                      }
                    />
                  )}

                  <div className="profile-upload-container">
                    {/* <i className="far fa-file-image" /> */}
                    <span className="profile-upload-text">Upload</span>
                  </div>
                </label>
              </>
            </div>
          )}
          <div className="profile-email">
            <MailOutlineIcon /> {user.userInfo.email}
          </div>
          <div className="profile-desc-container">
            {user.userInfo.description ? (
              <p>
                <span>Description:</span> {user.userInfo.description}
              </p>
            ) : (
              <h4>Add your description to get started!</h4>
            )}
          </div>
          {newProfileImg ? (
            <ImageCrop
              newProfileImg={newProfileImg}
              setNewProfileImg={setNewProfileImg}
              imgName={imgName}
            />
          ) : null}
        </>
      );
    } else {
      return <div>Add your description to get started!</div>;
    }
  };

  return (
    <div className="account-content">
      <div className="profile-content">
        <div className="profile-header">
          <Greeting />
          <div className="profile-line"></div>
        </div>

        <Information />

        <form action="/EditProfileInfo">
          <button className="btn green edit-profile-btn"> Edit Profile </button>
        </form>
        {/* <NavLink className="profile-roommate-form" to="/Questionnaire">
          <p>Roommate Preference Form</p>
        </NavLink> */}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  let stateToReturn = { ...state };
  if (state.User.userInfo) stateToReturn.userInfo = state.User.userInfo;
  if (state.Loading.loading) stateToReturn.loading = state.Loading.loading;
  return stateToReturn;
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

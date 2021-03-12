import React, { useState, useEffect } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";

import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import StarIcon from "@material-ui/icons/Star";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

const AllReviewsModal = ({ reviews, closeModal, openPostReview }) => {
  const [fiveStars, setFiveStars] = useState(0);
  const [fiveStarsAverage, setFiveStarsAverage] = useState(0);
  const [fourStars, setFourStars] = useState(0);
  const [fourStarsAverage, setFourStarsAverage] = useState(0);
  const [threeStars, setThreeStars] = useState(0);
  const [threeStarsAverage, setThreeStarsAverage] = useState(0);
  const [twoStars, setTwoStars] = useState(0);
  const [twoStarsAverage, setTwoStarsAverage] = useState(0);
  const [oneStar, setOneStar] = useState(0);
  const [oneStarAverage, setOneStarAverage] = useState(0);

  console.log(reviews);

  useEffect(() => {
    let total5 = 0;
    let total4 = 0;
    let total3 = 0;
    let total2 = 0;
    let total1 = 0;

    reviews.forEach((review) => {
      switch (review.stars) {
        case 5:
          total5 = total5 + 1;
          break;
        case 4:
          total4 = total4 + 1;
          break;
        case 3:
          total3 = total3 + 1;
          break;
        case 3:
          total3 = total3 + 1;
          break;
        case 2:
          total2 = total2 + 1;
          break;
        case 1:
          total1 = total1 + 1;
          break;
        default:
          return;
      }
      setFiveStars(total5);
      setFourStars(total4);
      setThreeStars(total3);
      setTwoStars(total2);
      setOneStar(total1);

      setFiveStarsAverage((total5 / reviews.length) * 100);
      setFourStarsAverage((total4 / reviews.length) * 100);
      setThreeStarsAverage((total3 / reviews.length) * 100);
      setTwoStarsAverage((total2 / reviews.length) * 100);
      setOneStarAverage((total1 / reviews.length) * 100);
    });
  }, []);

  const getStars = () => {
    let ratings = [];
    for (let props in reviews) {
      ratings.push(reviews[props].stars);
    }
    const max = ratings
      .sort(
        (a, b) =>
          ratings.filter((v) => v === a).length -
          ratings.filter((v) => v === b).length
      )
      .pop();

    let stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= max) {
        stars.push(
          <StarIcon key={i} className="all-reviews-popup-star" alt={i} />
        );
      } else {
        stars.push(
          <StarBorderIcon key={i} className="all-reviews-popup-star" alt={i} />
        );
      }
    }
    return stars;
  };

  return (
    <div className="all-reviews-popup-container">
      <div className="review-popup-container-header">
        <KeyboardBackspaceIcon onClick={closeModal} />
        <h1>Reviews</h1>
      </div>
      <div className="all-reviews-top-container">
        <div className="all-reviews-write-container">
          <div className="rating-container">{getStars()}</div>
          <h2>{`(${reviews.length} Review${
            reviews.length === 1 ? "" : "s"
          })`}</h2>
          <button
            onClick={() => {
              closeModal();
              openPostReview();
            }}
          >
            Write a review
          </button>
        </div>
        <div className="all-reviews-graph-container">
          <div className="all-reviews-graph-row-container">
            <CheckBoxIcon />
            <p>5</p>
            <StarIcon className="all-reviews-graph-star" />
            <LinearProgress variant="determinate" value={fiveStarsAverage} />
            <p>{fiveStars}</p>
          </div>
          <div className="all-reviews-graph-row-container">
            <CheckBoxIcon />
            <p>4</p>
            <StarIcon className="all-reviews-graph-star" />
            <LinearProgress variant="determinate" value={fourStarsAverage} />
            <p>{fourStars}</p>
          </div>
          <div className="all-reviews-graph-row-container">
            <CheckBoxIcon />
            <p>3</p>
            <StarIcon className="all-reviews-graph-star" />
            <LinearProgress variant="determinate" value={threeStarsAverage} />
            <p>{threeStars}</p>
          </div>
          <div className="all-reviews-graph-row-container">
            <CheckBoxIcon />
            <p>2</p>
            <StarIcon className="all-reviews-graph-star" />
            <LinearProgress variant="determinate" value={twoStarsAverage} />
            <p>{twoStars}</p>
          </div>
          <div className="all-reviews-graph-row-container">
            <CheckBoxIcon />
            <p>1</p>
            <StarIcon className="all-reviews-graph-star" />
            <LinearProgress variant="determinate" value={oneStarAverage} />
            <p>{oneStar}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllReviewsModal;
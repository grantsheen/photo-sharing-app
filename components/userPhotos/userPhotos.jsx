import React, { useState, useEffect } from 'react';
import { Typography, List, Card, Link, ListItem, Divider } from '@mui/material';
import axios from 'axios';
import './userPhotos.css';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
function UserPhotos(props) {
  const {
    match, loggedInUser, updateLoggedInUser, displayedUser, updateDisplayedUser, 
    photoUploaded, photoDoneUploading, formatDateTime, updateShowingPictures
  } = props;
  
  const [photos, setPhotos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [newComments, setNewComments] = useState([]);

  const reloadPhotos = () => {
    console.log("reloading photos");
    axios.get(`/photosOfUser/${match.params.userId}`).then((res) => {

      console.log("loaded photos", res.data);
      setPhotos(res.data.sort((a,b) => {
        const a_date = new Date(a.date_time); 
        const b_date = new Date(b.date_time);
        if (a.likes.length !== b.likes.length) {
          return b.likes.length - a.likes.length;
        } else {
          return b_date.getTime() - a_date.getTime();
        }
      }));

    }).catch((error) => {
      console.log(error);
    });
  };

  const handleLike = ((photo, idx) => {
    let updatedPhotos = [...photos];
    if (photo.likes.includes(loggedInUser._id)) {  // remove like
      updatedPhotos[idx].likes = updatedPhotos[idx].likes.filter((user_id) => user_id !== loggedInUser._id);
    } else {  // add like
      updatedPhotos[idx].likes.push(loggedInUser._id);
    }
    setPhotos(updatedPhotos);

    axios.put(`/photos/${photo._id}`, {
      user_id: loggedInUser._id,
    }).catch((err) => {
      console.log("failed", err);
    });
  });

  const handleFavorite = ((photo) => {
    let updatedFavorites = [...favorites];
    if (updatedFavorites.includes(photo._id)) {  // remove favorite
      updatedFavorites = updatedFavorites.filter((photo_id) => photo_id !== photo._id);
    } else {  // add favorite
      updatedFavorites.push(photo._id);
    }
    setFavorites(updatedFavorites);

    axios.put(`/user/${loggedInUser._id}/favorites`, {
      photo_id: photo._id,
    }).catch((err) => {
      console.log("failed", err);
    });
  });

  const updateNewComments = (value, idx) => {
    let updatedNewComments = [...newComments];
    updatedNewComments[idx] = value;
    setNewComments(updatedNewComments);
  };

  const handleComment = (event, photo, idx) => {
    event.preventDefault();
    axios.post(`/commentsOfPhoto/${photo._id}`, {
      comment: newComments[idx] || "",
    }).then(() => {
      console.log("posted comment");
      updateNewComments("", idx);
      reloadPhotos();
    }).catch((err) => {
      console.log("posting comment failed", err);
    });
  };

  const deleteComment = (photo_id, comment_id) => {
    axios.put(`/commentsOfPhoto/${photo_id}/delete`, {
      comment_id: comment_id,
    }).then(() => {
      console.log("deleted comment");
      reloadPhotos();
    }).catch((err) => {
      console.log("deleting comment failed", err);
    });
  };

  const deletePhoto = (photo) => {
    axios.put(`/photos/delete/${photo._id}`).then(() => {
      console.log("deleted photo");
      reloadPhotos();
    }).catch((err) => {
      console.log("error deleting photo", err);
    });
  };

  useEffect(() => {
    updateDisplayedUser(match.params.userId);
    updateShowingPictures(true);
    reloadPhotos();
    updateLoggedInUser();
  }, [match.params.userId]);

  useEffect(() => {
    setFavorites(loggedInUser.favorites);
  }, [loggedInUser]);

  useEffect(() => {
    if (photoUploaded) {
      reloadPhotos();
      photoDoneUploading();
    }
  }, [photoUploaded]);

  useEffect(() => {
    console.log("photos updated");
  }, [photos]);
  
  const displayPhotos = photos.map((photo, idx) => {
    return (
      <Card className="cs142-userPhotos-photoCard" key={photo._id}>
        <img src={`/images/${photo.file_name}`} alt={photo.file_name} />
        <div className="cs142-userPhotos-postedOn">
          <Typography variant="subtitle1" color="inherit">
            Posted on {formatDateTime(photo.date_time)}
          </Typography>
        </div>
        <div className="cs142-userPhotos-likeContainer">
          <span className={ photo.likes.includes(loggedInUser._id) ? 'cs142-userPhotos-likeButton-liked' : 'cs142-userPhotos-likeButton-notLiked' }
                onClick={() => handleLike(photo, idx)} role="button" tabIndex={0}>
            <span className="material-icons md-48">
              thumb_up
            </span>
            <Typography className="likeText" variant="h6" color="inherit">
              Like
            </Typography>
          </span>
          <Typography variant="h6" color="inherit">
            {photo.likes.length} {photo.likes.length !== 1 ? "Likes" : "Like"}
          </Typography>
          <span className={ favorites.includes(photo._id) ? 'cs142-userPhotos-favoriteButton-favorited' : 'cs142-userPhotos-favoriteButton-notFavorited' }
                onClick={() => handleFavorite(photo)} role="button" tabIndex={0}>
            <span className="material-icons md-48">
              favorite
            </span>
            <Typography className="favoriteText" variant="h6" color="inherit">
              Favorite
            </Typography>
          </span>
        </div>
        <div className="cs142-userPhotos-commentsContainer">
          <List>
            {
              photo.comments.length !== 0 && 
              (
                <div className="cs142-userPhotos-commentsLabel">
                  <Typography variant="h5" color="inherit">
                    Comments:
                  </Typography>
                </div>
              )
            }
            { 
              photo.comments.length !== 0 && photo.comments.map((comment, index) => (
                <div key={comment._id}>
                  <ListItem>
                    <div className="cs142-userPhotos-comment"> 
                      <Typography className="commenter" variant="h6" color="inherit">
                        <Link href={`/photo-share.html#/users/${comment.user._id}`}>
                          {comment.user.first_name} {comment.user.last_name}
                        </Link>
                      </Typography>
                      <Typography className="date" variant="subtitle1" color="inherit">
                        ({formatDateTime(comment.date_time)})
                      </Typography>
                      <Typography className="comment" variant="body1" color="inherit">
                        {comment.comment}
                      </Typography>
                      {
                        (loggedInUser._id === comment.user._id) && (
                          <div className="cs142-userPhotos-deleteComment" 
                              onClick={() => deleteComment(photo._id, comment._id)} role="button" tabIndex={0}>
                            <span className="material-icons md-48">
                              delete
                            </span>
                          </div>
                        )
                      }
                    </div>
                  </ListItem>
                  {(index !== photo.comments.length - 1) && <Divider />}
                </div>
              ))
            }
            <form className="cs142-userPhotos-commentForm" onSubmit={(event) => handleComment(event, photo, idx)}>
                  <Typography variant="h6" color="inherit">
                      <span className="cs142-userPhotos-newComment" >
                        New Comment: 
                        <input className="cs142-userPhotos-commentInput" type="text" value={newComments[idx] || ""} 
                              onChange={(event) => updateNewComments(event.target.value, idx)}/> 
                        <input type="submit" value="Submit"/>
                      </span>
                  </Typography>
            </form>
          </List>
        </div>  
        {
          (loggedInUser._id === displayedUser._id) && (
            <div className="cs142-userPhotos-deletePhoto" onClick={() => deletePhoto(photo)} role="button" tabIndex={0} >
              <Typography variant="button" color="inherit">
                Delete Photo
              </Typography>
            </div>
          )
        }
      </Card>
    );
  });

  return (
    <List>
      {displayPhotos}
    </List>
  );
}

export default UserPhotos;

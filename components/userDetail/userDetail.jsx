import React, { useEffect } from 'react';
import {
  Link, Typography
} from '@mui/material';
import './userDetail.css';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
function UserDetail(props) {
  const {
    match,
    displayedUser,
    updateDisplayedUser,
    updateShowingPictures
  } = props;

  useEffect(() => {
    updateDisplayedUser(match.params.userId); 
    updateShowingPictures(false);
  }, [match.params.userId]);

  return (
    <div>
      {
        displayedUser && (
          <div className="container">
            <Typography variant="h3" color="inherit">
              {displayedUser.first_name} {displayedUser.last_name}
            </Typography>
            <Typography variant="h5" color="inherit">
              <b>Location:</b> {displayedUser.location}
            </Typography>
            <Typography variant="h5" color="inherit">
              <b>Occupation:</b> {displayedUser.occupation}
            </Typography>
            <Typography variant="h5" color="inherit">
              <b>Description:</b> {displayedUser.description}
            </Typography>
            <Typography variant="h5" color="inherit">
              <Link href={`/photo-share.html#/photos/${displayedUser._id}`}>Photos</Link>
            </Typography>
          </div>
        )
      }
    </div>
  );
}

export default UserDetail;

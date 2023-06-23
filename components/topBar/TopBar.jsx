import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Grid
} from '@mui/material';
import axios from 'axios';
import './TopBar.css';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
function TopBar(props) {
  const { 
    loggedInUser, logoutUser, versionNum, onPhotoUpload,
    displayedUser, showingPictures
  } = props;

  const [uploadInput, setUploadInput] = useState();

  const uploadPhoto = (e) => {
    e.preventDefault();
    if (uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log(res);
          onPhotoUpload();
        })
        .catch((err) => {
          console.log("post error", err);
        });
    }
  };

  return (
    <AppBar className="cs142-topbar-appBar" position="absolute">
      <Toolbar>
        <Grid className="cs142-topbar-toolBar" container>
          <Grid item xs={2}>
            <Typography variant="h5" color="inherit" align="center">
                Grant Sheen
            </Typography>
          </Grid>
          <Grid item xs={2}>
            {
              loggedInUser ? 
              (
                <Typography className="cs142-topbar-logout" variant="h5" color="inherit" align="center" onClick={logoutUser}>
                  Logout
                </Typography> 
              ) : 
              (
                <Typography className="cs142-topbar-login" variant="h5" color="inherit" align="center">
                  Please Login
                </Typography> 
              )
            }
          </Grid>
          <Grid item xs={2}>
            {
              (loggedInUser) &&
              (
                <Typography variant="h5" color="inherit" align="center">
                  Version #: {versionNum}
                </Typography>
              )
            }
          </Grid>
          <Grid item xs={3}>
            {
              (loggedInUser) && 
              (
                <div className="cs142-topbar-uploadPhotoContainer">
                  <input type="file" accept="image/*" ref={(domFileRef) => { setUploadInput(domFileRef); }} />
                  <Typography className="cs142-topbar-uploadPhoto" variant="button" color="inherit" align="center"
                              onClick={(event) => uploadPhoto(event)}>
                    Add Photo
                  </Typography>
                </div>
              )
            }
          </Grid>
          <Grid item xs={3}>
            {
              (loggedInUser && displayedUser) && 
              (
                <Typography variant="h5" color="inherit" align="center">
                  { showingPictures && "Photos of" } {displayedUser.first_name} {displayedUser.last_name}
                </Typography>
              )
            }  
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;

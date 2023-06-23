import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch
} from 'react-router-dom';
import {
  Grid, Paper
} from '@mui/material';
import Modal from 'react-modal';
import axios from 'axios';
import './styles/main.css';

// import necessary components
import { Redirect } from 'react-router';
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/loginRegister/loginRegister';
import Favorites from './components/favorites/favorites';

Modal.setAppElement('#photoshareapp');

function PhotoShare() {
  const [loggedInUser, setLoggedInUser] = useState(undefined);
  const [versionNum, setVersionNum] = useState(undefined);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [displayedUser, setDisplayedUser] = useState(undefined);
  const [showingPictures, setShowingPictures] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log("logged in user id", loggedInUser?._id);

  const loginUser = (response) => {
    setLoggedInUser(response.data);
  };

  const logoutUser = () => {
    axios.post('/admin/logout').then(() => {
      setLoggedInUser(undefined);
    }).catch((error) => {
      console.log(error);
    });
  };

  const checkLoggedIn = () => {
    axios.post("/admin/login").then((response) => {
      setLoggedInUser(response.data);
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const getVersionNum = () => {
    axios.get('/test/info').then((res) => {
      setVersionNum(res.data.__v);
    }).catch((error) => {
      console.log(error);
    });
  };

  const onPhotoUpload = () => {
    setPhotoUploaded(true);
  };

  const photoDoneUploading = () => {
    setPhotoUploaded(false);
  };

  const updateLoggedInUser = () => {
    axios.get(`/user/${loggedInUser._id}`).then((res) => {
      setLoggedInUser(res.data);
    }).catch((error) => {
      console.log(error);
    });
  };

  const updateDisplayedUser = (user_id) => {
    if (user_id) {
      axios.get(`/user/${user_id}`).then((res) => {
        setDisplayedUser(res.data);
      }).catch((error) => {
        console.log(error);
      });
    } else {
      setDisplayedUser(undefined);
    }
  };

  const updateShowingPictures = (value) => {
    setShowingPictures(value);
  };

  const formatDateTime = (date_time) => {
    const date = new Date(date_time);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const hour = date.getHours() % 12;
    const minute = date.getMinutes();
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${month}/${day}/${year} at ${hour === 0 ? 12 : hour}:${minute.toString().padStart(2,'0')} ${ampm}`;
  };

  useEffect(() => {
    checkLoggedIn();
    getVersionNum();
  }, []);
  
  return (
    <HashRouter>
    <div>
    <Grid container spacing={8}>
      <Grid item xs={12}>
        {
          !isLoading && (
            <TopBar loggedInUser={loggedInUser} logoutUser={logoutUser} versionNum={versionNum} onPhotoUpload={onPhotoUpload} 
                    displayedUser={displayedUser} showingPictures={showingPictures} />
          )
        }
      </Grid>
      <div className="cs142-main-topbar-buffer"/>
      <Grid item sm={3}>
        {
          !isLoading && (
            <Paper className="cs142-main-grid-item">
              {loggedInUser && (
                <UserList loggedInUser={loggedInUser} logoutUser={logoutUser}/>
              )}
            </Paper>
          )
        }
      </Grid>
      <Grid item sm={9}>
        {
          !isLoading && (
            <Paper className="cs142-main-grid-item">
              <Switch>
                {
                  !loggedInUser ?
                  <LoginRegister loginUser={loginUser} /> :
                  <Redirect path="/login-register" to={`/users/${loggedInUser._id}`} />
                }
                {
                  loggedInUser ? 
                  (
                    <Route path="/users/:userId"
                        render = { 
                          props => (
                            <UserDetail {...props} displayedUser={displayedUser} updateDisplayedUser={updateDisplayedUser}
                                        updateShowingPictures={updateShowingPictures}/>
                          ) 
                        }
                    />
                  ) :
                  <Redirect path="/users/:userId" to="/login-register"/>
                }
                {
                  loggedInUser ?
                  (
                    <Route path="/photos/:userId"
                        render = { 
                          props => (
                            <UserPhotos {...props} loggedInUser={loggedInUser} updateLoggedInUser={updateLoggedInUser}
                                        displayedUser={displayedUser} updateDisplayedUser={updateDisplayedUser} photoUploaded={photoUploaded}
                                        photoDoneUploading={photoDoneUploading} formatDateTime={formatDateTime} updateShowingPictures={updateShowingPictures} />
                          ) 
                        }
                    />
                  ) :
                  <Redirect path="/photos/:userId" to="/login-register"/>
                }
                {
                  loggedInUser ? 
                  (
                    <Route path="/favorites" 
                      render = { 
                        props => (
                          <Favorites {...props} loggedInUser={loggedInUser} updateLoggedInUser={updateLoggedInUser}
                                     updateDisplayedUser={updateDisplayedUser} updateShowingPictures={updateShowingPictures} formatDateTime={formatDateTime} />
                        ) 
                      }
                    />
                  ) :
                  <Redirect path="/favorites" to="/login-register"/>
                }
                {
                  loggedInUser ?
                  <Route path="/users" component={UserList} /> :
                  <Redirect path="/users" to="/login-register"/>
                }
              </Switch>
            </Paper>
          )
        }
      </Grid>
    </Grid>
    </div>
    </HashRouter>
    );
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);

export default PhotoShare;

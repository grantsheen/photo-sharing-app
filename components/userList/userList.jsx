import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import axios from 'axios';
import './userList.css';

/**
 * Define UserList, a React componment of CS142 project #5
 */
function UserList(props) {
  const {
    loggedInUser, logoutUser
  } = props;

  const [users, setUsers] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const deleteAccount = () => {
    closeModal();
    axios.put(`/user/${loggedInUser._id}/delete`).then(() => {
      console.log("user deleted");
    }).catch((err) => {
      console.log("error deleting user", err);
    });
    logoutUser();
  };

  useEffect(() => {
    axios.get('/user/list').then((res) => {
      setUsers(res.data);
    }).catch((error) => {
      console.log(error);
    });
  }, []);

  const showModal = () => {
    return (
      <Modal className="cs142-userList-modal" isOpen={modalIsOpen}>
          <Typography variant="h6" color="inherit">
            Are you sure you want to delete your account?
          </Typography>
          <div className="buttons">
            <button className="cancelButton" onClick={closeModal}>Cancel</button>
            <button className="deleteButton" onClick={() => deleteAccount()}>Delete Account</button>
          </div>
      </Modal>
    );
  };

  const displayUsers = users.map(user => (
    <div key={user._id}>
      <ListItem component="a" href={`/photo-share.html#/users/${user._id}`}>
        <ListItemText primary={`${user.first_name} ${user.last_name}`}/>
      </ListItem>
      <Divider />
    </div>
  ));

  return (
    <div className="cs142-userList-container">
      <Typography variant="h5" color="inherit">
        User List
      </Typography>
      <List component="nav">    
        {displayUsers}
      </List>
      <div className="cs142-userList-profile">
        <Typography variant="h5" color="inherit">
          {loggedInUser.first_name} {loggedInUser.last_name}
        </Typography>
        <a className="cs142-userList-favorites" href={'/photo-share.html#/favorites'}>
          <Typography variant="button" color="inherit" sx={{ fontSize: '1rem' }}>
            My Favorites
          </Typography>
        </a>
        <div className="cs142-userList-deleteAccount" onClick={() => openModal()} role="button" tabIndex={0}>
          <Typography variant="button" color="inherit" sx={{ fontSize: '1rem' }}>
            Delete Account
          </Typography>
        </div>
      </div>
      {showModal()}
    </div>
    
  );
}

export default UserList;
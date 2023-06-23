import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Typography } from '@mui/material';
import axios from 'axios';
import './favorites.css';

/**
 * Define Favorites, a React componment of CS142 project #8
 */
function Favorites(props) {
    const {
        loggedInUser, updateLoggedInUser, updateDisplayedUser, 
        updateShowingPictures, formatDateTime
    } = props;

    const [favorites, setFavorites] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const openModal = (photo) => {
        setSelectedPhoto(photo);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const reloadFavorites = () => {
        axios.get(`/user/${loggedInUser._id}/favorites`).then((res) => {
            setFavorites(res.data);
        }).catch((err) => {
            console.log(err);
        });
    };

    const deleteFavorite = ((photo) => {
        axios.put(`/user/${loggedInUser._id}/favorites`, {
            photo_id: photo._id,
        }).then(() => { 
            updateLoggedInUser();
        }).catch((err) => {
            console.log("failed", err);
        });
    });

    useEffect(() => {
        reloadFavorites();
        updateDisplayedUser(undefined);
        updateShowingPictures(false);
    }, []);

    useEffect(() => {
        reloadFavorites();
    }, [loggedInUser]);

    const showModal = () => {
        if (!selectedPhoto) {
            return null;
        }

        return (
            <Modal className="cs142-favorites-modal" isOpen={modalIsOpen}>
                <div className="cs142-favorites-modalContent">
                    <img src={`/images/${selectedPhoto.file_name}`} alt={selectedPhoto.file_name} />
                    <Typography variant="subtitle1" color="inherit">
                        Posted on {formatDateTime(selectedPhoto.date_time)}
                    </Typography>
                </div>
                <div className="cs142-favorites-closeContainer">
                    <button className="closeButton" onClick={closeModal}>Close</button>
                </div>
            </Modal>
        );
    };

    return (
        <div className="cs142-favorites-grid">
            {favorites.map((photo) => (
                <div key={photo._id} className="cell">
                    <div className="photo">
                        <img src={`/images/${photo.file_name}`} alt={photo.file_name}
                             onClick={() => openModal(photo)}/>
                        <button className="delete" onClick={() => deleteFavorite(photo)}>
                            X
                        </button>
                    </div>
                </div>
            ))}
            {showModal()}
        </div>
    );
}



export default Favorites;
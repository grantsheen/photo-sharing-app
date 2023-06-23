import React, { useState } from 'react';
import {
    Typography
} from '@mui/material';
import axios from 'axios';
import './loginRegister.css';

/**
 * Define LoginRegister, a React componment of CS142 project #7
 */
function LoginRegister(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [occupation, setOccupation] = useState("");
    const [loginError, setLoginError] = useState("");
    const [registerMessage, setRegisterMessage] = useState("");

    const handleLogin = (event) => {
        event?.preventDefault();
        axios.post("/admin/login", {
            login_name: username,
            password: password,
        }).then((response) => {
            props.loginUser(response);
        }).catch((error) => {
            setLoginError("Error logging in");
            console.log(error);
        });
    };

    const handleRegister = (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            setRegisterMessage("Error: Password and Confirm Password do not match.");
            return;
        }
        axios.post("/user", {
            login_name: newUsername,
            password: newPassword,
            first_name: firstName,
            last_name: lastName,
            location: location,
            description: description,
            occupation: occupation,
        }).then(() => {
            setNewUsername("");
            setNewPassword("");
            setConfirmPassword("");
            setFirstName("");
            setLastName("");
            setLocation("");
            setDescription("");
            setOccupation("");
            setRegisterMessage("Successfully registered user!");   

        }).catch((error) => {
            setRegisterMessage("Failed to register user");
            console.log(error);
        });
    };

    // useEffect(() => {
    //     handleLogin();
    // }, [])
    

    return (
        <div>
            <div className="cs142-loginRegister-login">
                <Typography variant="h3" color="inherit">
                    Login
                </Typography>
                <form className="cs142-loginRegister-loginForm" onSubmit={(event) => handleLogin(event)}>
                    <Typography variant="h5" color="inherit">
                        Username: <input type="text" value={username} onChange={(event) => setUsername(event.target.value)}/>
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        Password: <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}/>
                    </Typography>
                    {
                        loginError && (
                            <div>
                                <Typography variant="body" color="red">
                                    {loginError}
                                </Typography>
                            </div>
                            
                        )
                    }
                    <input type="submit" value="Login"/>
                </form>
            </div>
            <div className="cs142-loginRegister-register">
                <Typography variant="h3" color="inherit">
                    Register
                </Typography>
                <form onSubmit={(event) => handleRegister(event)}>
                    <Typography variant="h5" color="inherit">
                        Username: <input type="text" value={newUsername} onChange={(event) => setNewUsername(event.target.value)}/>
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        Password: <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)}/>
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        Confirm Password: <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}/>
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        First Name: <input type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)}/>
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        Last Name: <input type="text" value={lastName} onChange={(event) => setLastName(event.target.value)}/>
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        Location: <input type="text" value={location} onChange={(event) => setLocation(event.target.value)}/>
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        Description: <input type="text" value={description} onChange={(event) => setDescription(event.target.value)}/>
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        Occupation: <input type="text" value={occupation} onChange={(event) => setOccupation(event.target.value)}/>
                    </Typography>
                    {
                        registerMessage && (
                            <div>
                                <Typography variant="body">
                                    {registerMessage}
                                </Typography>
                            </div>
                        )
                    }
                    <input type="submit" value="Register"/>
                </form>
            </div>
        </div>
        
    );
}

export default LoginRegister;
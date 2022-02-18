import React, { useEffect } from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './NavBar.css';
import LoginForm from '../auth/LoginForm';
import SignUpForm from '../auth/SignUpForm';
import LoginFormModal from '../Modals/LoginFormModal'
import SignupFormModal from '../Modals/SignupFormModal'
import ProfileButton from './ProfileButton';


function NavBar({ isLoaded }) {
    const history = useHistory();
    const location = useLocation();
    const sessionUser = useSelector(state => state.session.user);
    const dispatch = useDispatch();

    console.log(location);

    let sessionLinks;
    if (sessionUser) {
        sessionLinks = (
            <ProfileButton user={sessionUser} />
        );
    } else {
        if (location.pathname === '/signup'
        || location.pathname === '/login') {
            sessionLinks = (<></>)
        } else {
            sessionLinks = (
                <>
                    <LoginFormModal />
                    <SignupFormModal />
                </>
            )
        }
    }

    return (
        <div className="nav-bar">
            <div className='occupied-nav-bar'>
                <div className='nav-left'>
                    <div className="nav-bar-icon">
                        <img alt="8-track-icon" src="https://hisownbucket.s3.amazonaws.com/8-track-icon.png"></img>
                    </div>
                    <button onClick={() => history.push('/songs')} className="nav-bar-songs-button nav-button">
                        Library
                    </button>
                </div>
                <div className='nav-right'>
                    <button onClick={() => history.push('/upload')} className='nav-bar-button nav-button'>
                        Upload
                    </button>
                    <div className="nav-right">
                        {isLoaded && sessionLinks}
                    </div>
                </div>
            </div>
        </div>
    )
    };

export default NavBar;
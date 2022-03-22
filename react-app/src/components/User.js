import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHammer, faHelmetSafety } from '@fortawesome/free-solid-svg-icons'

function User() {
  const [user, setUser] = useState({});
  const { userId }  = useParams();

  useEffect(() => {
    if (!userId) {
      return;
    }
    (async () => {
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();
      setUser(user);
    })();
  }, [userId]);

  if (!user) {
    return null;
  }

  return (
    <>
      <h1>User Profile Page</h1>
      <h2><FontAwesomeIcon style={{marginRight: "10px"}} icon={faHammer} /> 
       Under Construction 
      <FontAwesomeIcon style={{marginLeft: "10px"}} icon={faHammer} />
        </h2>
      <h3>
        <FontAwesomeIcon style={{margin: "0 10px"}} icon={faHelmetSafety} />
        Please excuse the dust!
        <FontAwesomeIcon style={{marginLeft: "10px"}} icon={faHelmetSafety} />
      </h3>
      <ul>
        <li>
          <strong>User Id</strong> {userId}
        </li>
        <li>
          <strong>Username</strong> {user.username}
        </li>
        <li>
          <strong>Email</strong> {user.email}
        </li>
      </ul>
    </>
  );
}
export default User;

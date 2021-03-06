// constants
const GET_PLAYLIST = "playlist/GET_PLAYLIST";
const ADD_TO_PLAYLIST = "playlist/ADD_TO_PLAYLIST";
const MOVE_TO_NEXT_SONG = "playlist/MOVE_TO_NEXT_SONG";
const CLEAR_PLAYLIST = 'playlist/CLEAR_PLAYLIST'
const GET_MY_PLAYLISTS = "playlist/GET_MY_PLAYLISTS";
const LOAD_PLAYLIST = "playlist/LOAD_PLAYLIST";
const GET_ALL_PLAYLISTS = "playlist/GET_ALL_PLAYLISTS";


// action creators
const addSong  = songId => {
    return {
        type: ADD_TO_PLAYLIST,
        songId
    }
}

const moveToNextSong = (direction) => {
    return {
        type: MOVE_TO_NEXT_SONG,
        direction
    }
}

const emptyPlaylist = () => {
    return {
        type: CLEAR_PLAYLIST
    }
}

const getMyPlaylists = playlists => {
    return {
        type: GET_MY_PLAYLISTS,
        playlists
    }
};

const getPlaylists = playlists => {
    return {
        type: GET_ALL_PLAYLISTS,
        playlists
    }
}

const loadNewPlaylist = playlist => {
    return {
        type: LOAD_PLAYLIST,
        playlist
    }
}


// thunks

export const getAllPlaylists = () => async dispatch => {
    const res = await fetch('/api/playlists');
    if (res.ok) {
        const data = await res.json();
        dispatch(getPlaylists(data.playlists));
    }
};

export const addSongToPlaylist = (songId) => dispatch => {
    dispatch(addSong(songId));
};

export const nextSong = (direction) => dispatch => {
    dispatch(moveToNextSong(direction));
};

export const clearPlaylist = () => dispatch => {
    dispatch(emptyPlaylist());
};

export const addPlaylist = form => async dispatch => {
    const userId = form.userId
    const res = await fetch(`/api/users/${userId}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(form)
    });
    if (res.ok) {
        const data = await res.json();
        if (data.errors) {
            return data.errors;
        }
    } else {
        return ["An Error occurred. Please try again."]
    };
};

export const editPlaylist = form => async dispatch => {
    const playlistId = form.playlistId;
    const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(form)
    });
    if (res.ok) {
        const data = await res.json();
        if (data.errors) {
            return data.errors;
        }
    } else {
        return ["An Error occurred. Please try again."]
    };
}

export const removePlaylist = id => async dispatch => {
    const res = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
          }
    });
    if (res.ok) {
        return "Playlist successfully deleted!";
    } else {
        return res.error;
    }
};

export const myPlaylists = userId => async dispatch => {
    const res = await fetch(`/api/users/${userId}/playlists`);
    if (res.ok) {
        const data = await res.json();
        dispatch(getMyPlaylists(data.playlists));
    }
};

export const loadPlaylist = (playlist) => dispatch => {
    dispatch(loadNewPlaylist(playlist));
};


// reducer
const intitialState = { playlist: [], currentSongIndex: 0, myPlaylists: [], allPlaylists: [] }

export default function playlistReducer (state = intitialState, action) {
    let newState;
    switch (action.type) {
        case (GET_PLAYLIST):
            newState = { ...state };
            newState.playlist = action.playlist;
            return newState;
        case (ADD_TO_PLAYLIST):
            newState = { ...state };
            newState.playlist.push(action.songId);
            return newState;
        case (MOVE_TO_NEXT_SONG):
            newState = { ...state };
            if (action.direction === 'up') {
                newState.currentSongIndex += 1;
            } else if (newState.currentSongIndex > 0) {
                newState.currentSongIndex -= 1;
            }
            return newState;
        case GET_MY_PLAYLISTS:
            newState = { ...state }
            newState.myPlaylists = action.playlists;
            return newState;
        case GET_ALL_PLAYLISTS:
            newState = { ...state }
            newState.allPlaylists = action.playlists;
            return newState;
        case (CLEAR_PLAYLIST):
            newState = { ...state };
            newState.playlist = [];
            newState.currentSongIndex = 0;
            return newState;
        case LOAD_PLAYLIST:
            newState = { ...state };
            newState.currentSongIndex = 0;
            newState.playlist = action.playlist;
            return newState;
        default:
            return state;
    }
}
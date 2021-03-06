import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons'
import './WaveForm.css';
import UpdateSongForm from '../Modals/UpdateSongModal';
import { deleteOneSong } from '../../store/song';
import WaveSurfer from "wavesurfer.js";
import { addSongToPlayer } from "../../store/player";
import getCloudFrontDomain from "../../presignHelper";
import { clearPlaylist, addSongToPlaylist } from "../../store/playlist";

const formWaveSurferOptions = ref => ({
  container: ref,
  waveColor: "#eee",
  progressColor: "#FF4500",
  cursorColor: "OrangeRed",
  barWidth: 2,
  barRadius: 2,
  cursorWidth: 0,
  responsive: true,
  height: 100,
  partialRender: true,
  pixelRatio: 1,
  // normalize: true,
  interact: true,
  hideScrollbar: true,
  autoCenter: true,
});

export default function WaveForm({ songId }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const userId = useSelector(state => state.session.user?.id);
  const playerSong = useSelector(state => state.player.currentSong);
  const playTime = useSelector(state => state.player.time);
  const song = useSelector(state => Object.values(state.songs.song));
  const playState = useSelector(state => state?.player.playing);
  const player = useSelector(state => state.player.player);
  const songUrl = Object.values(song)[0]?.url
  const [loaded, setLoaded] = useState(false);
  const loadingMessage = 'Loading Waveform...';

  // create new WaveSurfer instance
  // On component mount and when url changes
  
  useEffect(() => {
    if (songUrl) {
      const options = formWaveSurferOptions(waveformRef.current);
      wavesurfer.current = WaveSurfer.create(options);
      if (songUrl) {
        getCloudFrontDomain(songUrl).then(signedSongUrl =>{
          wavesurfer.current?.load(signedSongUrl);
        }
          
        );
      }
      wavesurfer.current.on("ready", async function () {
        setLoaded(true);
        wavesurfer.current.setMute(true);
        // syncs waveform with song playing if they match
        if (playerSong?.url === songUrl) {
          const currentTime  = player.current?.audio.current.currentTime;
          const songLength = Object.values(song)[0].length;
          const seek = currentTime / songLength;
          if (seek > 0 && seek < 1) {
            wavesurfer.current.seekTo(currentTime / songLength);
          }
          // if song is playing, starts waveform
          if (playState) {
            wavesurfer.current.play();
          }
        } else {
          wavesurfer.current.seekTo(0);
        }
      });
      
      // when the waveform ends, it resets
      wavesurfer.current.on("finish", function () {
        wavesurfer.current.seekTo(0);
        wavesurfer.current.pause();
      });
      return () => wavesurfer.current.destroy();
    }
  }, [songUrl]);
  

  // useEffect(() => async () => {
  //   let count = "down";
  //   let length = 0;
  //   while (length < 500) {
  //     if (count === 'down') {
  //       await setTimeout(() => {
  //         const newLoadingMessage = loadingMessage.slice(0, -1);
  //         setLoadingMessage(newLoadingMessage)
  //         if (newLoadingMessage.length < 17) {
  //           count = "up";
  //         } else if (newLoadingMessage.length === 19) {
  //           count = "down";
  //         }
  //       }, 50);
  //     } else {
  //       await setTimeout(() => {
  //         const newLoadingMessage = loadingMessage + '.';
  //         setLoadingMessage(newLoadingMessage)
  //         if (newLoadingMessage.length < 17) {
  //           count = "up";
  //         } else if (newLoadingMessage.length === 19) {
  //           count = "down";
  //         }
  //       }, 50);
  //     };
  //     length += 1;
  //   }
  // });

  useEffect(() => {
    if (playState && songUrl === playerSong?.url) {
      wavesurfer.current?.play();
    } else {
      wavesurfer.current?.pause();
    }
  }, [playState, songUrl, playerSong?.url]);


  // allows the waveform to control the position of the
  // footer player
  useEffect(() => {
    wavesurfer.current?.on("seek", function (e) {
      const surfTime = wavesurfer.current.getCurrentTime();
      const playerTime = player.current?.audio.current.currentTime;
      // loopSeparator prevents infinite loop between
      // the two player control interfaces
      const loopSeparator = (Math.abs(playerTime - surfTime));
      if(playerSong?.url === songUrl && surfTime !== 0 && loopSeparator > 1) {
        player.current.audio.current.currentTime = surfTime;
      }
    });
    // this event listener can be used to toggle the
    // traveling comments
    wavesurfer.current?.on("audioprocess", function (e) {
    });
  }, [songUrl, playerSong, player]);


  // causes the waveform to seek to the appropriate position
  // once it loads
  // if the player is playing and the songs are the same
  useEffect(() => {
    if (playerSong?.url === songUrl) {
      const currentTime  = player?.current?.audio.current.currentTime;
      const songLength = Object.values(song)[0]?.length;
      const seek = currentTime / songLength;
      if (seek > 0 && seek < 1) {
        wavesurfer.current?.seekTo(currentTime / songLength);
      }
    }
  }, [playTime, player, song, songUrl, playerSong?.url]);


  // seeks the waveform appropriately when the song changes
  useEffect(() => {
    if (songUrl !== playerSong?.url && wavesurfer) {
      wavesurfer.current?.seekTo(0);
      wavesurfer.current?.pause();
    } else if (songUrl === playerSong?.url) {
      wavesurfer.current?.seekTo(0);
      wavesurfer.current?.play();

    }
  }, [songUrl, playerSong?.url]);


  const handleDelete = async () => {
    const confirm = window.confirm(
        "This will permanently delete this song. Are you sure?");
    if (confirm) {
        await dispatch(deleteOneSong(songId));
        // await dispatch(getAllSongs());
        history.push("/songs");
    }
};

  // handles the waveform play/pause buttons
  const handlePlayPause = async () => {
    if (playerSong?.url !== songUrl && songId){
      dispatch(clearPlaylist());
      dispatch(addSongToPlaylist(songId));
      dispatch(addSongToPlayer(songId));
      wavesurfer.current.play();
    } else if (playState){
      wavesurfer.current.pause();
      player.current.audio.current.pause();
    } else {
      player.current.audio.current.play();
      wavesurfer.current.play();
    }
  };

  const timeElapsed = (time) => {
    const postDate = new Date(time);
    const rightNow = new Date(Date.now());
    const elapsedTime = rightNow - postDate
    const seconds = elapsedTime / 1000;
    const minutes = seconds / 60;
    if (minutes < 5) {
        return "Just moments ago...";
    }
    const hours = minutes / 60;
    if (hours < 1) {
        return `${Math.floor(minutes)} minutes ago`
    } else if (Math.floor(hours) === 1) {
        return `1 hour ago`;
    }
    const days = hours / 24;
    if ( days < 1) {
        return `${Math.floor(hours)} hours ago`;
    } else if (Math.floor(days) ===1) {
        return `1 day ago`
    }
    const months = days / 30;
    if (months < 1) {
        return `${Math.floor(days)} days ago`;
    }
    const years = months / 12
    if (years < 1) {
        return `${Math.floor(months)} months ago`;
    } else if (Math.floor(years) === 1) {
        return `1 year ago`;
    } else {
        return `${Math.floor(years)} years ago`;
    }
};

  // useEffect(() => {
  //   console.log(checkSong);
  //   console.log(song[0]);
  //   if (song[0]?.errors && checkSong) {
  //     delete song[0].errors;
  //     console.log(song[0]?.errors);
  //     history.push('/');
  //   }
  //   else if (song[0]) {
  //     setCheckSong(true);
  //   }
  // }, [song]);


  return (
    <div className="waveform">
      <div className="song-info-headline">
        <div className="song-info-text">
          <div className="controls-and-title">
            {loaded ? ((!playState || (playerSong?.url !== songUrl)) ?
              <div className="controls">
                <button
                  className="waveform-play"
                  onClick={handlePlayPause}
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button></div> :
              <div className="controls">
                <button
                  className="waveform-play"
                  onClick={handlePlayPause}
                >
                  <FontAwesomeIcon icon={faPause} />
                </button>
              </div>
            ) : <div className="controls"><div className="empty-button"></div></div>}
            <div>
              <div className='song-info-title'>
                <p>
                  {Object.values(song)[0]?.title}
                </p>
              </div>
              <div className='song-info-artist'>
                <p>
                  {Object.values(song)[0]?.artist}
                </p>
              </div>
            </div>
          </div>

          {(userId && (userId === Object.values(song)[0]?.user?.id)) ?
            <>
              <button
                className="song-detail-buttons"
                onClick={handleDelete}>Delete Song</button>
              <UpdateSongForm />
            </> : null}
        </div>
        <div>
          <div className="song-detail-timestamp">
            {loaded ? timeElapsed(Object.values(song)[0]?.created_at) : null}
          </div>
          <div className="song-detail-genre">
            # {Object.values(song)[0]?.genre?.name}
          </div>
        </div>
      </div>

      <div id="waveform" ref={waveformRef}>
        {loaded ? null :
          <div className="loading-waveform">
            <div>
              {loadingMessage}
            </div>
            <progress />
          </div>}
      </div>
    </div>
  );
}

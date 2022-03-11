import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons'
import './WaveForm.css';

import WaveSurfer from "wavesurfer.js";
import { addSongToPlayer, setRef, setPlayerTime } from "../../store/player";
import getPreSignedUrl from "../../presignHelper";

const formWaveSurferOptions = ref => ({
  container: ref,
  waveColor: "#eee",
  progressColor: "OrangeRed",
  cursorColor: "OrangeRed",
  barWidth: 1,
  responsive: true,
  height: 100,
  normalize: true,
  interact: true,
});

export default function WaveformTEST({ songId }) {
  const playerSong = useSelector(state => state.player.currentSong);
  const dispatch = useDispatch();
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [playing, setPlay] = useState(false);
  const playTime = useSelector(state => state.player.time);
  const song = useSelector(state => Object.values(state.songs.song));
  const playState = useSelector(state => state?.player.playing);
  const player = useSelector(state => state.player.player);
  const songUrl = Object.values(song)[0]?.url
  const [loaded, setLoaded] = useState(false);

  // create new WaveSurfer instance
  // On component mount and when url changes
  
  useEffect(() => {
    setPlay(false);

    if (songUrl) {
      const options = formWaveSurferOptions(waveformRef.current);
      wavesurfer.current = WaveSurfer.create(options);
      if (songUrl) {
        getPreSignedUrl(songUrl).then(signedSongUrl =>
          wavesurfer.current.load(signedSongUrl)
        );
      }
      
      wavesurfer.current.on("ready", async function () {
        wavesurfer.current.setMute(true);
        // syncs waveform with song playing if they match
        if (playerSong?.url === songUrl) {
          const currentTime  = player.current.audio.current.currentTime;
          const songLength = Object.values(song)[0].length;
          wavesurfer.current.seekTo(currentTime / songLength);
          // if song is playing, starts waveform
          if (playState) {
            wavesurfer.current.play();
          }
        } else {
          wavesurfer.current.seekTo(0);
        }
        setLoaded(true);
      });
      
      wavesurfer.current.on("finish", function () {
        setPlay(false);
        wavesurfer.current.seekTo(0);
        wavesurfer.current.pause();
      });

      wavesurfer.current.on("seek", function (e) {
        const surfTime = wavesurfer.current.getCurrentTime();
        const playerTime = player.current.audio.current.currentTime;
        const loopSeparator = (Math.abs(playerTime - surfTime));
        console.log(playerSong);
        console.log(song);
        if(playerSong?.url === songUrl && surfTime !== 0 && loopSeparator > 1) {
          player.current.audio.current.currentTime = surfTime;
        }
      })

      return () => wavesurfer.current.destroy();
    }
  }, [songUrl, playerSong]);

  useEffect(() => {
    if (playerSong?.url === songUrl) {
      const currentTime  = player?.current?.audio.current.currentTime;
      const songLength = Object.values(song)[0]?.length;
      wavesurfer.current?.seekTo(currentTime / songLength);
    }
  }, [playTime, player, song]);

  useEffect(() => {
    if (songUrl !== playerSong?.url && wavesurfer) {
      console.log(wavesurfer);
      wavesurfer.current.seekTo(0);
      wavesurfer.current.pause();
    }
  }, [songUrl, playerSong?.url]);

  const handlePlayPause = async () => {
    setPlay(!playState);
    if (playerSong?.url !== Object.values(song)[0]?.url){
      dispatch(addSongToPlayer(songId));
      dispatch(setRef(waveformRef));
      wavesurfer.current.play();
    } else if (playState){
      wavesurfer.current.pause();
      player.current.audio.current.pause();
    } else {
      player.current.audio.current.play();
      wavesurfer.current.play();
    }
  };

  return (
    <div className="waveform">
      <div className="controls">
        {loaded ? ((!playState || (playerSong?.url !== songUrl)) ? 
        <button
          className="waveform-play"
          onClick={handlePlayPause}
        >
            <FontAwesomeIcon icon={faPlay} />
        </button> : <button
          className="waveform-play"
          onClick={handlePlayPause}
        >
            <FontAwesomeIcon icon={faPause} />
        </button>) : null}
      </div>
      <div id="waveform" ref={waveformRef} />
    </div>
  );
}

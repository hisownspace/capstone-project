import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import './AllSongs.css';

import { getAllSongs } from '../../store/song';
import { getAllGenres } from '../../store/genre';
import { getAllPlaylists } from '../../store/playlist';

import GenreList from '../GenreList';
import Carousel from 'react-multi-carousel';


const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 5,
        slidesToSlide: 2
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 3,
        slidesToSlide: 3,
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 3,
        slidesToSlide: 3,
    }
};

function AllSongs() {
    const dispatch = useDispatch();
    const genresObj = useSelector(state => state.genres.genres);
    const playlists = useSelector(state => state.playlist.allPlaylists);
    const user = useSelector(state => state.session.user)
    const genres = Object.values(genresObj);

    useEffect(() => {
        (async () => {
            await dispatch(getAllSongs());
            await dispatch(getAllGenres());
            await dispatch(getAllPlaylists());
        })();
    }, [dispatch]);

    return (
        <div>
            <div className='all-songs'>
            </div>
            <div className='genre-carousel-list'>
                <div className='genre-carousel-item'>
                { user && playlists ? <><h1>playlists</h1>
                    <Carousel responsive={responsive}>
                        {Object.values(playlists).map(playlist => (
                            <Link key={playlist.id} to={`/playlists/${playlist.id}`}>
                                <div className='hide-image'>
                                    <div className='song-image-list-item-container'>
                                        <img alt={playlist.name} src={playlist.songs[0]?.image_url
                                            || "https://eta-photobucket.s3.amazonaws.com/play-button.svg"}>
                                        </img>
                                        <div className='song-title-carousel'>
                                            <div className="carousel-title">{playlist.name}</div>
                                        </div>
                                    </div>
                                </div>
                                </Link>
                        ))}
                    </Carousel></> : null}
                </div>
            </div>
            <div className="genre-carousel-list">
                {genres?.map(genre => {
                    return (
                        <div className="genre-carousel-item" key={genre.id}>
                            <h1>{genre.name}</h1>
                            <GenreList songsType={"genre"} uniqueId={genre.id} />
                        </div>
                        )
                    })}
            </div>
        </div>
    )
}

export default AllSongs;
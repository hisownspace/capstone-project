import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addSongComment, getAllSongComments } from '../../store/comment';

function AddComment({ songId }) {
    const dispatch = useDispatch();
    const [content, setContent] = useState('');
    const userId = useSelector(state => state.session.user.id)


    const handleSubmit = async e => {
        e.preventDefault();
        console.log(userId);
        const payload = {
            content,
            songId,
            userId
        }
        console.log(payload);
        await dispatch(addSongComment(payload));
        dispatch(getAllSongComments(songId));
        setContent('');
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="content">Comment:</label>
            <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Comment..."
                />
            <button>Submit Comment</button>
        </form>
    )
}

export default AddComment;
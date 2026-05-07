import { useLocation, useNavigate } from "react-router-dom";

function SongDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const song = location.state;

  if (!song) {
    return (
      <div className="main-page">
        <div className="main-content">
          <h2>No song data found</h2>
          <button onClick={() => navigate("/")}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page">
      <div className="main-content">

        <button onClick={() => navigate(-1)}>⬅ Back</button>

        <div className="song-details">
          <img src={song.img_url} alt="song" />

          <h1>{song.title}</h1>
          <h3>{song.artist}</h3>

          <p><strong>Album:</strong> {song.album}</p>
          <p><strong>Year:</strong> {song.year}</p>

          <button className="play-main">▶ Play</button>
        </div>

      </div>
    </div>
  );
}

export default SongDetails;
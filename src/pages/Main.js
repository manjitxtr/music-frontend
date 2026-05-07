import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Main() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [subscription, setSubscription] = useState("free");
  const [subscriptions, setSubscriptions] = useState([]);
  const [results, setResults] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 8;

  const [query, setQuery] = useState({
    title: "",
    artist: "",
    year: "",
    album: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user_name");
    const storedSub = localStorage.getItem("subscription") || "free";

    if (storedUser) setUsername(storedUser);
    setSubscription(storedSub);

    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/music/all");
      const data = await res.json();

      setAllSongs(data);
      setResults(data);

    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.title && !query.artist && !query.year && !query.album) {
      setStatusMsg("⚠ Please enter at least one field");
      return;
    }

    try {
      setLoading(true);

      let url = "http://localhost:3000/music/all";

      if (query.artist) {
        url = `http://localhost:3000/music/artist/${query.artist}`;
      } else if (query.album) {
        url = `http://localhost:3000/music/album/${query.album}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      const filtered = data.filter((song) => {
        return (
          (!query.title || song.title.toLowerCase().includes(query.title.toLowerCase())) &&
          (!query.year || String(song.year).includes(query.year))
        );
      });

      setResults(filtered);
      setCurrentPage(1);

    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (song) => {
    const exists = subscriptions.find(
      (s) => s.title === song.title && s.artist === song.artist
    );

    if (!exists) {
      setSubscriptions([...subscriptions, song]);
    }
  };

  const handleRemove = (song) => {
    setSubscriptions(
      subscriptions.filter(
        (s) => !(s.title === song.title && s.artist === song.artist)
      )
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const upgradeToPremium = () => {
    setStatusMsg("⚠ Upgrade feature not implemented in backend");
  };

  const indexOfLast = currentPage * songsPerPage;
  const indexOfFirst = indexOfLast - songsPerPage;
  const currentSongs = results.slice(indexOfFirst, indexOfLast);

  return (
    <div className="main-page">

      <div className="navbar">
        <h2>🎵 Music App</h2>

        <div className="nav-right">
          {username ? (
            <>
              <span>Hi, {username}</span>

              {subscription === "premium" && (
                <span className="premium-badge">🌟 Premium</span>
              )}

              {subscription !== "premium" && (
                <button onClick={upgradeToPremium}>Upgrade</button>
              )}

              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/register")}>Sign Up</button>
            </>
          )}
        </div>
      </div>

      <div className="main-content">

        {statusMsg && <p className="status-msg">{statusMsg}</p>}

        <div className="section">
          <h3>Search Music</h3>

          <div className="search-box">
            <input placeholder="Title"
              onChange={(e) => setQuery({ ...query, title: e.target.value })} />

            <input placeholder="Artist"
              onChange={(e) => setQuery({ ...query, artist: e.target.value })} />

            <input placeholder="Year"
              onChange={(e) => setQuery({ ...query, year: e.target.value })} />

            <input placeholder="Album"
              onChange={(e) => setQuery({ ...query, album: e.target.value })} />

            <button onClick={handleSearch}>Search</button>
          </div>
        </div>

        <div className="section">
          <h3>Music Library</h3>

          {loading ? (
            <p>Loading songs...</p>
          ) : results.length === 0 ? (
            <p>No songs found</p>
          ) : (
            <>
              <div className="song-grid">
                {currentSongs.map((song, index) => {
                  const isSubscribed = subscriptions.find(
                    (s) => s.title === song.title && s.artist === song.artist
                  );

                  return (
                    <div key={index} className="song-card">

                      {/* ✅ ONLY CHANGE HERE */}
                      <img
                        src={song.img_url}
                        alt="song"
                        className="clickable-img"
                        onClick={() =>
                          navigate("/song-details", { state: song })
                        }
                      />

                      <div className="song-info">
                        <p><strong>{song.title}</strong></p>
                        <p>{song.artist}</p>
                        <p>{song.album} ({song.year})</p>
                      </div>

                      <button
                        disabled={isSubscribed}
                        onClick={() => handleSubscribe(song)}
                      >
                        {isSubscribed ? "Added" : "Subscribe"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pagination">
                <button disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}>
                  ⬅ Prev
                </button>

                <span>Page {currentPage}</span>

                <button disabled={indexOfLast >= results.length}
                  onClick={() => setCurrentPage(currentPage + 1)}>
                  Next ➡
                </button>
              </div>
            </>
          )}
        </div>

        <div className="section">
          <h3>Your Subscriptions</h3>

          {subscriptions.length === 0 ? (
            <p>No subscriptions yet</p>
          ) : (
            <div className="song-grid">
              {subscriptions.map((song, index) => (
                <div key={index} className="song-card">
                  <img src={song.img_url} alt="song" />

                  <div className="song-info">
                    <p><strong>{song.title}</strong></p>
                    <p>{song.artist}</p>
                  </div>

                  <button onClick={() => handleRemove(song)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Main;
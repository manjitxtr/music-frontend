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

  // 🔥 LOAD DATA
  useEffect(() => {
    const storedUser = localStorage.getItem("user_name");
    const storedSub = localStorage.getItem("subscription") || "free";

    if (storedUser) setUsername(storedUser);
    setSubscription(storedSub);

    setLoading(true);

    fetch(`http://localhost:5000/api/songs?subscription=${storedSub}`)
      .then(res => res.json())
      .then(data => {
        setAllSongs(data);
        setResults(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // 🔍 SEARCH
  const handleSearch = () => {
    if (!query.title && !query.artist && !query.year && !query.album) {
      setStatusMsg("⚠ Please enter at least one field");
      return;
    }

    const filtered = allSongs.filter((song) => {
      return (
        (!query.title || song.title.toLowerCase().includes(query.title.toLowerCase())) &&
        (!query.artist || song.artist.toLowerCase().includes(query.artist.toLowerCase())) &&
        (!query.year || song.year.includes(query.year)) &&
        (!query.album || song.album.toLowerCase().includes(query.album.toLowerCase()))
      );
    });

    setResults(filtered);
    setCurrentPage(1);
  };

  // ⭐ SUBSCRIBE
  const handleSubscribe = (song) => {
    const exists = subscriptions.find(
      (s) => s.title === song.title && s.artist === song.artist
    );

    if (!exists) {
      setSubscriptions([...subscriptions, song]);
    }
  };

  // ❌ REMOVE
  const handleRemove = (song) => {
    setSubscriptions(
      subscriptions.filter(
        (s) => !(s.title === song.title && s.artist === song.artist)
      )
    );
  };

  // 🔓 LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // 🚀 UPGRADE
  const upgradeToPremium = async () => {
    try {
      const email = localStorage.getItem("user_email");

      const res = await fetch("http://localhost:5000/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        setStatusMsg("❌ Upgrade failed");
        return;
      }

      localStorage.setItem("subscription", "premium");
      setSubscription("premium");

      setStatusMsg("🎉 You are now a Premium user!");

    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Error upgrading subscription");
    }
  };

  // 🔥 PAGINATION
  const indexOfLast = currentPage * songsPerPage;
  const indexOfFirst = indexOfLast - songsPerPage;
  const currentSongs = results.slice(indexOfFirst, indexOfLast);

  return (
    <div className="main-page">

      {/* NAVBAR */}
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

        {/* STATUS MESSAGE */}
        {statusMsg && <p className="status-msg">{statusMsg}</p>}

        {/* SEARCH */}
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

        {/* RESULTS */}
        <div className="section">
          <h3>Music Library</h3>

          {loading ? (
            <p>Loading songs...</p>
          ) : results.length === 0 ? (
            <p> No songs found</p>
          ) : (
            <>
              <div className="song-grid">
                {currentSongs.map((song, index) => {
                  const isSubscribed = subscriptions.find(
                    (s) => s.title === song.title && s.artist === song.artist
                  );

                  const isLocked = song.isPremium && subscription !== "premium";

                  return (
                    <div key={index} className="song-card">

                      <img
                        src={song.img_url}
                        alt="song"
                        className="clickable-img"
                      />

                      <div className="song-info">
                        <p><strong>{song.title}</strong></p>
                        <p>{song.artist}</p>
                        <p>{song.album} ({song.year})</p>

                        {isLocked && (
                          <p className="locked">🔒 Premium Only</p>
                        )}
                      </div>

                      <button
                        disabled={isSubscribed || isLocked}
                        onClick={() => handleSubscribe(song)}
                      >
                        {isLocked
                          ? "Locked"
                          : isSubscribed
                          ? "Added"
                          : "Subscribe"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ⬅ Prev
                </button>

                <span>Page {currentPage}</span>

                <button
                  disabled={indexOfLast >= results.length}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next ➡
                </button>
              </div>
            </>
          )}
        </div>

        {/* SUBSCRIPTIONS */}
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
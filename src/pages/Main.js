import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

function Main() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("Guest");

  const [subscription, setSubscription] =
    useState("free");

  const [subscriptions, setSubscriptions] =
    useState([]);

  const [results, setResults] =
    useState([]);

  const [allSongs, setAllSongs] =
    useState([]);

  const [statusMsg, setStatusMsg] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [currentPage, setCurrentPage] =
    useState(1);

  const songsPerPage = 8;

  const [query, setQuery] = useState({
    title: "",
    artist: "",
    year: "",
    album: ""
  });




  // ================= LOAD DATA =================

  useEffect(() => {

    const storedUser =
      localStorage.getItem("user_name");

    const storedSub =
      localStorage.getItem("subscription")
      || "free";

    const email =
      localStorage.getItem("user_email");



    if (storedUser) {
      setUsername(storedUser);
    }

    setSubscription(storedSub);

    loadSongs(storedSub);



    // LOAD SUBSCRIPTIONS

    if (email) {

      fetch(
        `${API_URL}/api/subscription?email=${email}`
      )
        .then(res => res.json())

        .then(data => {

          setSubscriptions(
            Array.isArray(data)
              ? data
              : []
          );
        })

        .catch(err => {

          console.error(err);

          setSubscriptions([]);
        });
    }

  }, []);




  // ================= LOAD SONGS =================

  const loadSongs = async (subType) => {

    try {

      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/songs?subscription=${subType}`
      );

      const data = await res.json();

      setAllSongs(
        Array.isArray(data)
          ? data
          : []
      );

      setResults(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(err);

      setStatusMsg(
        "❌ Failed to load songs"
      );

    } finally {

      setLoading(false);
    }
  };




  // ================= SEARCH =================

  const handleSearch = () => {

    if (
      !query.title &&
      !query.artist &&
      !query.year &&
      !query.album
    ) {

      setStatusMsg(
        "⚠ Please enter at least one field"
      );

      return;
    }



    const filtered = allSongs.filter(song => {

      return (

        (

          !query.title ||

          (song.title || "")
            .toLowerCase()
            .includes(
              query.title.toLowerCase()
            )
        )

        &&

        (

          !query.artist ||

          (song.artist || "")
            .toLowerCase()
            .includes(
              query.artist.toLowerCase()
            )
        )

        &&

        (

          !query.year ||

          String(song.year || "")
            .includes(query.year)
        )

        &&

        (

          !query.album ||

          (song.album || "")
            .toLowerCase()
            .includes(
              query.album.toLowerCase()
            )
        )
      );
    });



    setResults(filtered);

    setCurrentPage(1);



    if (filtered.length === 0) {

      setStatusMsg(
        "No matching songs found"
      );

    } else {

      setStatusMsg("");
    }
  };




  // ================= SUBSCRIBE =================

  const handleSubscribe = async (song) => {

    try {

      const email =
        localStorage.getItem("user_email");



      const exists =
        subscriptions.find(
          s => s.songId === song.songId
        );



      if (exists) {

        setStatusMsg(
          "⚠ Already subscribed"
        );

        return;
      }



      const res = await fetch(
        `${API_URL}/api/subscription`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            song
          })
        }
      );



      const data = await res.json();



      if (!res.ok) {

        setStatusMsg(
          data.message ||
          "❌ Subscribe failed"
        );

        return;
      }



      setSubscriptions([
        ...subscriptions,
        song
      ]);



      setStatusMsg(
        "🎵 Song subscribed!"
      );

    } catch (err) {

      console.error(err);

      setStatusMsg(
        "❌ Subscribe failed"
      );
    }
  };




  // ================= REMOVE =================

  const handleRemove = async (song) => {

    try {

      const email =
        localStorage.getItem("user_email");



      await fetch(
        `${API_URL}/api/subscription`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            songId: song.songId
          })
        }
      );



      setSubscriptions(

        subscriptions.filter(
          s => s.songId !== song.songId
        )
      );



      setStatusMsg(
        "🗑 Subscription removed"
      );

    } catch (err) {

      console.error(err);

      setStatusMsg(
        "❌ Remove failed"
      );
    }
  };




  // ================= UPGRADE =================

  const upgradeToPremium = async () => {

    try {

      const email =
        localStorage.getItem("user_email");



      const res = await fetch(
        `${API_URL}/api/subscription/upgrade`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email
          })
        }
      );



      const data = await res.json();



      if (!res.ok) {

        setStatusMsg(
          data.message ||
          "❌ Upgrade failed"
        );

        return;
      }



      localStorage.setItem(
        "subscription",
        "premium"
      );



      setSubscription("premium");



      loadSongs("premium");



      setStatusMsg(
        "🎉 Premium unlocked!"
      );

    } catch (err) {

      console.error(err);

      setStatusMsg(
        "❌ Upgrade error"
      );
    }
  };




  // ================= LOGOUT =================

  const handleLogout = () => {

    localStorage.clear();

    navigate("/login");

    window.location.reload();
  };




  // ================= PAGINATION =================

  const indexOfLast =
    currentPage * songsPerPage;

  const indexOfFirst =
    indexOfLast - songsPerPage;

  const currentSongs =
    results.slice(
      indexOfFirst,
      indexOfLast
    );




  return (

    <div className="main-page">

      {/* NAVBAR */}

      <div className="navbar">

        <h2>
          🎵 Music App
        </h2>

        <div className="nav-right">

          <span>
            Hi, {username}
          </span>



          {subscription === "premium" && (

            <span className="premium-badge">
              🌟 Premium
            </span>
          )}



          {subscription !== "premium" && (

            <button
              onClick={upgradeToPremium}
            >
              Upgrade
            </button>
          )}



          <button
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>




      <div className="main-content">

        {statusMsg && (

          <p className="status-msg">
            {statusMsg}
          </p>
        )}




        {/* SEARCH */}

        <div className="section">

          <h3>
            Search Music
          </h3>

          <div className="search-box">

            <input
              placeholder="Title"

              onChange={(e) =>
                setQuery({
                  ...query,
                  title: e.target.value
                })
              }
            />

            <input
              placeholder="Artist"

              onChange={(e) =>
                setQuery({
                  ...query,
                  artist: e.target.value
                })
              }
            />

            <input
              placeholder="Year"

              onChange={(e) =>
                setQuery({
                  ...query,
                  year: e.target.value
                })
              }
            />

            <input
              placeholder="Album"

              onChange={(e) =>
                setQuery({
                  ...query,
                  album: e.target.value
                })
              }
            />

            <button
              onClick={handleSearch}
            >
              Search
            </button>

          </div>

        </div>




        {/* SONGS */}

        <div className="section">

          <h3>
            Music Library
          </h3>

          {loading ? (

            <p>
              Loading songs...
            </p>

          ) : results.length === 0 ? (

            <p>
              No songs found
            </p>

          ) : (

            <>

              <div className="song-grid">

                {currentSongs.map((song, index) => {

                  const isSubscribed =
                    subscriptions.find(
                      s => s.songId === song.songId
                    );

                  return (

                    <div
                      key={index}
                      className="song-card"
                    >

                      <img
                        src={song.img_url}
                        alt="song"

                        className="clickable-img"
                      />

                      <div className="song-info">

                        <p>
                          <strong>
                            {song.title || "Unknown Title"}
                          </strong>
                        </p>

                        <p>
                          {song.artist || "Unknown Artist"}
                        </p>

                        <p>
                          {song.album || "Unknown Album"}
                          {" "}
                          ({song.year || "N/A"})
                        </p>

                      </div>

                      <button
                        disabled={isSubscribed}
                        onClick={() =>
                          handleSubscribe(song)
                        }
                      >

                        {
                          isSubscribed
                            ? "Added"
                            : "Subscribe"
                        }

                      </button>

                    </div>
                  );
                })}

              </div>




              {/* PAGINATION */}

              <div className="pagination">

                <button
                  disabled={currentPage === 1}

                  onClick={() =>
                    setCurrentPage(
                      currentPage - 1
                    )
                  }
                >
                  ⬅ Prev
                </button>

                <span>
                  Page {currentPage}
                </span>

                <button
                  disabled={
                    indexOfLast >= results.length
                  }

                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                >
                  Next ➡
                </button>

              </div>

            </>
          )}

        </div>




        {/* SUBSCRIPTIONS */}

        <div className="section">

          <h3>
            Your Subscriptions
          </h3>

          {subscriptions.length === 0 ? (

            <p>
              No subscriptions yet
            </p>

          ) : (

            <div className="song-grid">

              {subscriptions.map((song, index) => (

                <div
                  key={index}
                  className="song-card"
                >

                  <img
                    src={song.img_url}
                    alt="song"
                  />

                  <div className="song-info">

                    <p>
                      <strong>
                        {song.title || "Unknown Title"}
                      </strong>
                    </p>

                    <p>
                      {song.artist || "Unknown Artist"}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      handleRemove(song)
                    }
                  >
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
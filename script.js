const API_KEY = TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const genreSelect = document.getElementById("genreSelect");
const pickMovieBtn = document.getElementById("pickMovieBtn");
const movieCard = document.getElementById("movieCard");

const movieInput = document.getElementById("movieInput");
const movieListEl = document.getElementById("movieList");
const spinWheelBtn = document.getElementById("spinWheelBtn");
const resetListBtn = document.getElementById("resetListBtn");
const wheel = document.getElementById("wheel");

let customMovies = [];
let watchlistOpen = false;
let favoritesOpen = false;

// TMDB Genre ID map
const genreMap = {
  Action: 28,
  Anime: 16,
  Comedy: 35,
  Horror: 27,
  Romance: 10749,
  "Sci-Fi": 878,
  Drama: 18,
};

// ==========================
// Fetch random TMDB movie by genre
// ==========================
pickMovieBtn.addEventListener("click", async () => {
  const selectedGenreName = genreSelect.value;
  const genreId = genreMap[selectedGenreName];
  const isAnime = selectedGenreName === "Anime";

  if (!genreId) {
    alert("Please select a genre.");
    return;
  }

  const randomPage = Math.floor(Math.random() * 10) + 1;

  try {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=${randomPage}${
      isAnime ? "&with_original_language=ja" : ""
    }`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.results.length > 0) {
      const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
      displayTMDBMovie(randomMovie);
    } else {
      movieCard.innerHTML = `<p class="text-warning text-center">No movies found for that genre. Try again!</p>`;
    }
  } catch (err) {
    console.error(err);
    alert("Error fetching movie.");
  }
});

// ==========================
// Add custom movies manually
// ==========================
movieInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const title = movieInput.value.trim();

    if (!title) return;
    if (customMovies.length >= 12) {
      alert("You’ve already entered the maximum of 12 movies.");
      return;
    }

    customMovies.push(title);

    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = title;
    movieListEl.appendChild(li);
    movieInput.value = "";

    spinWheelBtn.disabled = customMovies.length < 2;
    updateWheelBackground();
  }
});

// ==========================
// Spin the wheel
// ==========================
spinWheelBtn.addEventListener("click", () => {
  const segments = customMovies.length;

  if (segments < 2) {
    alert("Add at least 2 movies to spin.");
    return;
  }

  const segmentAngle = 360 / segments;
  const extraSpins = Math.floor(Math.random() * 3 + 3) * 360;
  const randomAngle = Math.random() * 360;
  const finalAngle = extraSpins + randomAngle;

  wheel.style.transition = "none";
  wheel.style.transform = "rotate(0deg)";
  void wheel.offsetWidth;
  wheel.style.transition = "transform 4s cubic-bezier(0.33, 1, 0.68, 1)";
  wheel.style.transform = `rotate(${finalAngle}deg)`;

  setTimeout(() => {
    const endAngle = finalAngle % 360;
    const normalizedAngle = (360 - endAngle + 90) % 360;
    const winnerIndex = Math.floor(normalizedAngle / segmentAngle) % segments;

    const selectedMovie = customMovies[winnerIndex];
    fetchAndDisplayMovieByTitle(selectedMovie);
  }, 4000);
});

// ==========================
// Reset wheel
// ==========================
resetListBtn.addEventListener("click", () => {
  customMovies = [];
  movieListEl.innerHTML = "";
  movieInput.value = "";
  spinWheelBtn.disabled = true;
  wheel.style.transition = "none";
  wheel.style.transform = "rotate(0deg)";
  updateWheelBackground();
  movieCard.innerHTML = "";
});

// ==========================
// Update wheel colors
// ==========================
function updateWheelBackground() {
  const colors = [
    "#f44336", "#e91e63", "#9c27b0", "#3f51b5", "#2196f3", "#009688",
    "#4caf50", "#8bc34a", "#ffeb3b", "#ff9800", "#ff5722", "#795548"
  ];

  const segments = customMovies.length;

  if (segments === 0) {
    wheel.style.background = "rgba(255,255,255,0.1)";
    return;
  }

  const anglePer = 360 / segments;
  let gradient = "";

  for (let i = 0; i < segments; i++) {
    const start = i * anglePer;
    const end = start + anglePer;
    const color = colors[i % colors.length];
    gradient += `${color} ${start}deg ${end}deg${i < segments - 1 ? ", " : ""}`;
  }

  wheel.style.background = `conic-gradient(${gradient})`;
}

window.addEventListener("resize", () => {
  if (customMovies.length > 0) {
    updateWheelBackground();
  }
});

// ==========================
// Fetch by title
// ==========================
function fetchAndDisplayMovieByTitle(title) {
  fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}&language=en-US`)
    .then((res) => res.json())
    .then((data) => {
      if (data.results && data.results.length > 0) {
        displayTMDBMovie(data.results[0]);
      } else {
        alert("Movie not found.");
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Error searching for movie.");
    });
}

// ==========================
// Add Movie to Wheel
// ==========================
function addMovieToWheel(title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return;

  if (customMovies.includes(trimmedTitle)) {
    alert("This movie is already on the wheel!");
    return;
  }

  if (customMovies.length >= 12) {
    alert("You’ve reached the maximum of 12 movies on the wheel.");
    return;
  }

  customMovies.push(trimmedTitle);

  const li = document.createElement("li");
  li.className = "list-group-item";
  li.textContent = trimmedTitle;
  movieListEl.appendChild(li);

  spinWheelBtn.disabled = customMovies.length < 2;
  updateWheelBackground();

  alert(`"${trimmedTitle}" has been added to the spinner wheel!`);
}

// ==========================
// Display TMDB movie
// ==========================
function displayTMDBMovie(movie) {
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  const youtubeSearchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " trailer")}`;

  movieCard.innerHTML = "";

  const cardWrapper = document.createElement("div");
  cardWrapper.className = "d-flex justify-content-center fade-in";

  cardWrapper.innerHTML = `
  <div class="card shadow mb-4" style="max-width: 700px; width: 100%; background-color: rgba(0, 0, 0, 0.85); color: white;">
    <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start p-3">
      <img src="${poster}" class="img-fluid rounded mb-3 mb-md-0" style="max-width: 200px;" alt="${movie.title} Poster">
      <div class="ms-md-4 text-center text-md-start">
        <h5 class="card-title">${movie.title} (${movie.release_date?.slice(0, 4) || "N/A"})</h5>
        <p class="card-text">${movie.overview || "No plot available."}</p>
        <p class="card-text"><small style="color: white;">TMDB Rating: ${movie.vote_average}</small></p>
        <a href="${youtubeSearchURL}" target="_blank" class="btn btn-danger mt-2 me-2">▶️ Watch Trailer on YouTube</a>
        <button id="addToWatchlistBtn" class="btn btn-outline-primary mt-2">➕ Add to Watchlist</button>
        <button id="addToFavoritesBtn" class="btn btn-outline-primary mt-2">❤️ Add to Favorites</button>
        <button class="btn btn-outline-warning mt-2 ms-2" onclick='addMovieToWheel("${movie.title}")'>🎡 Add to Wheel</button>
      </div>
    </div>
  </div>
  `;

  movieCard.appendChild(cardWrapper);
  setTimeout(() => cardWrapper.classList.add("show"), 50);

  document.getElementById("addToWatchlistBtn").addEventListener("click", () => {
    const movieToAdd = {
      imdbID: movie.id.toString(),
      Title: movie.title,
      Year: movie.release_date?.slice(0, 4) || "N/A",
      Poster: poster,
      Genre: "N/A",
      Plot: movie.overview || "No plot available.",
      imdbRating: movie.vote_average || "N/A",
    };
    addToWatchlist(movieToAdd);
  });

  document.getElementById("addToFavoritesBtn").addEventListener("click", () => {
    const movieToAdd = {
      imdbID: movie.id.toString(),
      Title: movie.title,
      Year: movie.release_date?.slice(0, 4) || "N/A",
      Poster: poster,
      Genre: "N/A",
      Plot: movie.overview || "No plot available.",
      imdbRating: movie.vote_average || "N/A",
    };
    addToFavorites(movieToAdd);
  });
}

// ==========================
// Add to watchlist
// ==========================
function addToWatchlist(movie) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  const exists = watchlist.some((m) => m.imdbID === movie.imdbID);
  if (exists) {
    alert("This movie is already in your watchlist!");
    return;
  }

  watchlist.push(movie);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  alert(`Added "${movie.Title}" to your watchlist!`);
}

// ==========================
// Toggle watchlist view
// ==========================
document.getElementById("viewWatchlistBtn").addEventListener("click", () => {
  watchlistOpen = !watchlistOpen;

  if (watchlistOpen) {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    if (watchlist.length === 0) {
      movieCard.innerHTML = '<p class="text-center">Your watchlist is empty!</p>';
    } else {
      movieCard.innerHTML = "";
      watchlist.forEach((movie) => {
        const youtubeSearchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + " trailer")}`;

        movieCard.innerHTML += `
          <div class="card shadow mb-4">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="${
                  movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"
                }" class="img-fluid rounded-start" alt="${movie.Title} Poster">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${movie.Title} (${movie.Year})</h5>
                  <p class="card-text"><strong>Genre:</strong> ${movie.Genre}</p>
                  <p class="card-text"><strong>Plot:</strong> ${movie.Plot}</p>
                  <p class="card-text"><small class="text-muted">IMDb Rating: ${movie.imdbRating}</small></p>
                  <a href="${youtubeSearchURL}" target="_blank" class="btn btn-danger me-2 mt-2">▶️ Trailer</a>
                  <button class="btn btn-outline-danger mt-2" onclick='removeFromWatchlist("${movie.imdbID}")'>🗑️ Remove</button>
                  <button class="btn btn-outline-warning mt-2" onclick='addMovieToWheel("${movie.Title}")'>🎡 Add to Wheel</button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }

    viewWatchlistBtn.textContent = "❌ Close Watchlist";
  } else {
    movieCard.innerHTML = "";
    viewWatchlistBtn.textContent = "📺 View Watchlist";
  }
});

// ==========================
// Remove from watchlist
// ==========================
function removeFromWatchlist(imdbID) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter((m) => m.imdbID !== imdbID);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  alert("Removed from watchlist!");

  if (watchlistOpen) {
    document.getElementById("viewWatchlistBtn").click();
    document.getElementById("viewWatchlistBtn").click();
  }
}

// ==========================
// Add to favorites
// ==========================
function addToFavorites(movie) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const exists = favorites.some((m) => m.imdbID === movie.imdbID);
  if (exists) {
    alert("This movie is already in your favorites!");
    return;
  }

  favorites.push(movie);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert(`Added "${movie.Title}" to your favorites!`);
}

// ==========================
// Toggle favorites view
// ==========================
document.getElementById("viewFavoritesBtn").addEventListener("click", () => {
  favoritesOpen = !favoritesOpen;

  if (favoritesOpen) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
      movieCard.innerHTML = '<p class="text-center">Your favorites is empty!</p>';
    } else {
      movieCard.innerHTML = "";
      favorites.forEach((movie) => {
        const youtubeSearchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + " trailer")}`;

        movieCard.innerHTML += `
          <div class="card shadow mb-4">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="${
                  movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"
                }" class="img-fluid rounded-start" alt="${movie.Title} Poster">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${movie.Title} (${movie.Year})</h5>
                  <p class="card-text"><strong>Genre:</strong> ${movie.Genre}</p>
                  <p class="card-text"><strong>Plot:</strong> ${movie.Plot}</p>
                  <p class="card-text"><small class="text-muted">IMDb Rating: ${movie.imdbRating}</small></p>
                  <a href="${youtubeSearchURL}" target="_blank" class="btn btn-danger me-2 mt-2">▶️ Trailer</a>
                  <button class="btn btn-outline-danger mt-2" onclick='removeFromFavorites("${movie.imdbID}")'>🗑️ Remove</button>
                  <button class="btn btn-outline-warning mt-2" onclick='addMovieToWheel("${movie.Title}")'>🎡 Add to Wheel</button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }

    viewFavoritesBtn.textContent = "❌ Close Favorites";
  } else {
    movieCard.innerHTML = "";
    viewFavoritesBtn.textContent = "❤️ View Favorites";
  }
});

// ==========================
// Remove from favorites
// ==========================
function removeFromFavorites(imdbID) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter((m) => m.imdbID !== imdbID);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert("Removed from favorites!");

  if (favoritesOpen) {
    document.getElementById("viewFavoritesBtn").click();
    document.getElementById("viewFavoritesBtn").click();
  }
}

// ==========================
// Login Modal Logic
// ==========================
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Simple validation or simulation
  if (username && password) {
    alert(`Welcome, ${username}!`);
    const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
    modal.hide();
  } else {
    alert("Please enter valid credentials.");
  }
});
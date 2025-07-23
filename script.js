const API_KEY = TMDB_API_KEY; // Key is accessed through config.js
const BASE_URL = "https://api.themoviedb.org/3";

const genreSelect = document.getElementById("genreSelect");
const pickMovieBtn = document.getElementById("pickMovieBtn");
const movieCard = document.getElementById("movieCard");

const movieInput = document.getElementById("movieInput");
const movieListEl = document.getElementById("movieList");
const spinWheelBtn = document.getElementById("spinWheelBtn");
const resetListBtn = document.getElementById("resetListBtn");
const wheel = document.getElementById("wheel");
const viewWatchlistBtn = document.getElementById("viewWatchlistBtn");

let customMovies = [];

// ===== New state variable for toggle =====
let watchlistOpen = false;

// TMDB genre ID map
const genreMap = {
  Action: 28,
  Anime: 16,
  Comedy: 35,
  Horror: 27,
  Romance: 10749,
  "Sci-Fi": 878,
  Drama: 18,
};

// 🎲 Pick random TMDB movie by genre
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

// Add custom movies by Enter key
movieInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const title = movieInput.value.trim();

    if (!title) return;
    if (customMovies.length >= 6) {
      alert("You’ve already entered 6 movies.");
      return;
    }

    customMovies.push(title);
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = title;
    movieListEl.appendChild(li);
    movieInput.value = "";

    if (customMovies.length === 6) {
      spinWheelBtn.disabled = false;
    }
  }
});

// 🎡 Spin the wheel and pick from custom list
spinWheelBtn.addEventListener("click", () => {
  if (customMovies.length !== 6) {
    alert("You must enter exactly 6 movies.");
    return;
  }

  const segmentAngle = 360 / 6;
  const selectedIndex = Math.floor(Math.random() * 6);
  const selectedMovie = customMovies[selectedIndex];

  const extraSpins = Math.floor(Math.random() * 3 + 3) * 360;
  const offset = 360 - (selectedIndex * segmentAngle + segmentAngle / 2);
  const finalAngle = extraSpins + offset;

  document.body.classList.add("spinning");
  wheel.style.transform = `rotate(${finalAngle}deg)`;

  setTimeout(() => {
    fetchAndDisplayMovieByTitle(selectedMovie);
    document.body.classList.remove("spinning");
  }, 4000);
});

// Reset list
resetListBtn.addEventListener("click", () => {
  customMovies = [];
  movieListEl.innerHTML = "";
  movieInput.value = "";
  spinWheelBtn.disabled = true;
  wheel.style.transform = "rotate(0deg)";
  movieCard.innerHTML = "";
});

// 🧠 Fallback function for user-entered titles (uses search)
function fetchAndDisplayMovieByTitle(title) {
  fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}&language=en-US`)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        displayTMDBMovie(data.results[0]);
      } else {
        alert("Movie not found.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error searching for movie.");
    });
}

// 🖼️ Display TMDB movie in Bootstrap card
function displayTMDBMovie(movie) {
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  const youtubeSearchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`;

  movieCard.innerHTML = `
  <div class="col-md-8">
    <div class="card shadow mb-4">
      <div class="row g-0">
        <div class="col-md-4">
          <img src="${poster}" class="img-fluid rounded-start" alt="${movie.title} Poster">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${movie.title} (${movie.release_date?.slice(0, 4) || "N/A"})</h5>
            <p class="card-text">${movie.overview || "No plot available."}</p>
            <p class="card-text"><small style="color: white;">TMDB Rating: ${movie.vote_average}</small></p>
            <a href="${youtubeSearchURL}" target="_blank" class="btn btn-danger mt-2 me-2">▶️ Watch Trailer on YouTube</a>
            <button id="addToWatchlistBtn" class="btn btn-outline-primary mt-2">➕ Add to Watchlist</button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

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
}

// Dynamically update wheel background
function updateWheelBackground() {
  const colors = [
    "#f44336", "#e91e63", "#9c27b0", "#3f51b5", "#2196f3", "#009688",
    "#4caf50", "#8bc34a", "#ffeb3b", "#ff9800", "#ff5722", "#795548"
  ];

  const segments = customMovies.length;
  const anglePer = 360 / segments;
  let gradient = "";

  for (let i = 0; i < segments; i++) {
    const start = i * anglePer;
    const end = start + anglePer;
    const color = colors[i % colors.length];
    gradient += `${color} ${start}deg ${end}deg${i < segments - 1 ? ', ' : ''}`;
  }

  wheel.style.background = `conic-gradient(${gradient})`;
}

// Add to watchlist
function addToWatchlist(movie) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  const exists = watchlist.some(m => m.imdbID === movie.imdbID);
  if (exists) {
    alert("This movie is already in your watchlist!");
    return;
  }

  watchlist.push(movie);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  alert(`Added "${movie.Title}" to your watchlist!`);
}

// ===== Toggleable View Watchlist =====
document.getElementById("viewWatchlistBtn").addEventListener("click", () => {
  // Toggle state
  watchlistOpen = !watchlistOpen;

  if (watchlistOpen) {
    // Show watchlist
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    if (watchlist.length === 0) {
      movieCard.innerHTML = '<p class="text-center">Your watchlist is empty!</p>';
    } else {
      movieCard.innerHTML = "";
      watchlist.forEach(movie => {
        const youtubeSearchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + ' trailer')}`;
       
        movieCard.innerHTML += `
          <div class="card shadow mb-4">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" class="img-fluid rounded-start" alt="${movie.Title} Poster">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${movie.Title} (${movie.Year})</h5>
                  <p class="card-text"><strong>Genre:</strong> ${movie.Genre}</p>
                  <p class="card-text"><strong>Plot:</strong> ${movie.Plot}</p>
                  <p class="card-text"><small class="text-muted">IMDb Rating: ${movie.imdbRating}</small></p>
                  <a href="${youtubeSearchURL}" target="_blank" class="btn btn-danger me-2 mt-2">▶️ Trailer</a>
                  <button class="btn btn-outline-danger mt-2" onclick='removeFromWatchlist("${movie.imdbID}")'>🗑️ Remove</button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }

    // Change button text to close
    viewWatchlistBtn.textContent = "❌ Close Watchlist";
  } else {
    // Hide watchlist (clear movieCard area)
    movieCard.innerHTML = "";
    viewWatchlistBtn.textContent = "📺 View Watchlist";
  }
});

// Remove from watchlist
function removeFromWatchlist(imdbID) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter(m => m.imdbID !== imdbID);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));

  // Refresh watchlist if currently open
  if (watchlistOpen) {
    document.getElementById("viewWatchlistBtn").click();
    document.getElementById("viewWatchlistBtn").click();
  }
}

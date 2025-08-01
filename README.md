# movie-night-picker
A web app that helps you pick a random movie to watch for movie night.
  
## Features

- Pick a random movie by genre using TMDB API
- Add custom movies and spin the wheel to select one
- Save movies to your watchlist and favorites (local storage)
- Responsive UI with Bootstrap styling
- Login modal (demo only)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Parcel](https://parceljs.org/) (installed via npm)

### Setup

1. Clone the repository.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `config.js` file in the project root with your TMDB API key:

   ```js
   // config.js
   const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
   ```

### Running Locally

Start the development server:

```sh
npm start
```

Open [http://localhost:1234](http://localhost:1234) in your browser.

### Deployment

This project is configured for Firebase Hosting. To deploy:

1. Install Firebase CLI:

   ```sh
   npm install -g firebase-tools
   ```

2. Login and initialize:

   ```sh
   firebase login
   firebase init
   ```

3. Deploy:

   ```sh
   firebase deploy
   ```

## Project Structure

- `index.html` — Main HTML file
- `style.css` — Custom styles
- `script.js` — App logic
- `config.js` — TMDB API key (not committed)
- `firebase.json` — Firebase hosting config

## Credits

Developed by Jazmyn Alpha, Aaron Escobar & Dylan Wilson.

---

For questions or feedback, open an issue or contact the authors.

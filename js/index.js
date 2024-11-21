const movieSearchBox = document.getElementById("movie-search-box");
const searchList = document.getElementById("search-list");
const resultGrid = document.getElementById("result-grid");
const playVideo = document.getElementById("play_video");
const heroBanner = document.getElementById("banner");
const moviesForm = document.getElementById("form_movies");
const backButton = document.getElementById("back_button");

async function loadMovies(searchTerm) {
  const URL = `http://www.omdbapi.com/?s=${searchTerm}&apikey=56e05e51`;
  const res = await fetch(`${URL}`);
  const data = await res.json();
  //console.log(data.Search);
  if (data.Response == "True") {
    displayMovieList(data.Search);
  }
}

function findMovies() {
  let searchTerm = movieSearchBox.value.trim();
  if (searchTerm.length > 0) {
    searchList.classList.remove("hide-search-list");
    loadMovies(searchTerm);
  } else {
    searchList.classList.add("hide-search-list");
  }
}

function displayMovieList(movies) {
  searchList.innerHTML = "";
  for (let idx = 0; idx < movies.length; idx++) {
    let movieListItem = document.createElement("div");
    movieListItem.dataset.id = movies[idx].imdbID;
    movieListItem.classList.add("search-list-item");
    if (movies[idx].Poster != "N/A") {
      moviePoster = movies[idx].Poster;
    } else {
      moviePoster = "image_not_found.jpg";
    }
    movieListItem.innerHTML = `<div class="search-item-thumbnail">
               <img src="${moviePoster}" alt=""></div>
               <div class="search-item-info">
               <h3>${movies[idx].Title}</h3>
               <p class="fst-italic fs-6 fw-bold">${movies[idx].Year}</p>
            </div>`;
    searchList.appendChild(movieListItem);
  }
  getMovieDetails();
}

function getMovieDetails() {
  const searchListMovies = searchList.querySelectorAll(".search-list-item");
  searchListMovies.forEach((movie) => {
    movie.addEventListener("click", async () => {
      // console.log(movie.dataset.id);
      searchList.classList.add("hidden");
      backButton.classList.remove("hidden");
      movieSearchBox.value = "";
      const result = await fetch(
        `http://www.omdbapi.com/?i=${movie.dataset.id}&apikey=56e05e51`
      );
      const movieDetails = await result.json();
      // console.log(movieDetails);
      displayMovieDetails(movieDetails);
    });
  });
}

function displayMovieDetails(details) {
  heroBanner.classList.remove("d-none");
  resultGrid.innerHTML = `
                    <div class="movie-poster">
                        <img src="${details.Poster != "N/A"
      ? details.Poster
      : "image_not_found.jpg"
    }" alt="" class="w-full h-auto rounded-xl shadow-xl">
                    </div>
                    <div class="movie-info antialiased flex flex-col gap-4 p-6 bg-gray-800 text-white rounded-lg shadow-lg max-w-md mx-auto">
    <h3 class="font-bold text-3xl text-yellow-400">${details.Title}</h3>
    <p class="year text-gray-300">Year: <span class="text-white">${details.Year}</span></p>
    <p class="rated text-gray-300">Ratings: <span class="text-white">${details.Rated}</span></p>
    <p class="genre text-gray-300">Genre: <span class="text-white">${details.Genre}</span></p>
    <p class="writer text-gray-300">Writer(s): <span class="text-white">${details.Writer}</span></p>
    <p class="actors text-gray-300">Actors: <span class="text-white">${details.Actors}</span></p>
    <p class="plot text-gray-300">Plot: <br /><span class="text-white">${details.Plot}</span></p>
    <p class="language text-gray-300">Language: <span class="text-white">${details.Language}</span></p>
</div>
    `;

  async function filterPlayableFiles(files) {
    const playableFiles = [];
    for (const file of files) {
      // Check if the file link is empty or undefined
      if (!file.file_link || file.file_link.trim() === "") {
        continue; // Skip this file
      }

      // Check if file size is undefined or empty
      if (!file.file_size || file.file_size.trim() === "") {
        continue; // Skip this file
      }

      // Check if the server is responding
      try {
        const response = await fetch(file.file_link, { method: "HEAD" });
        if (response.ok) {
          playableFiles.push(file); // Add this file to playable files
        }
      } catch (error) {
        console.error("Error occurred while fetching server:", error);
        // Skip this file if an error occurs while fetching server
        continue;
      }
    }
    return playableFiles;
  }

  
  fetch(
    `https://filepursuit.p.rapidapi.com/?q=${details.Title}&filetype=mp4&type=video`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "filepursuit.p.rapidapi.com",
        "x-rapidapi-key": "c6b1760691msh3fd00140bb8715fp1c9172jsn1de1c9e00d40"
      }
    }
  )
    .then((response) => response.json())
    .then(async (data) => {
      playVideo.innerHTML = '<p class="text-green-500 text-4xl">Loading....</p>';
      if (data.status !== "success") {
        playVideo.innerHTML = '<p class="text-red-500 text-4xl text-center font-bold">Sorry! No Video files found!</p>';
      } else {
        playVideo.innerHTML = "";
        let files = data.files_found;
        for (let idx = 0; idx < files.length; idx++) {
          let file = files[idx];
          let card = document.createElement("div");
          card.classList.add("bg-white", "shadow-lg", "rounded-lg", "p-4", "m-2", "w-75", "text-black");
          card.innerHTML = `
            <div class="card-body">
              <p class="text-yellow-500 font-bold">${file.file_name}</p>
              <hr class="my-2" />
              <p class="text-gray-700">Type: ${file.file_type}</p>
              <hr class="my-2" />
              <p class="text-gray-700">Updated: ${file.time_ago}</p>
              <hr class="my-2" />
              <p class="text-gray-700">File Size: ${file.file_size}</p>
              <hr class="my-2" />
              <a href="${file.file_link}" class="bg-green-500 text-white px-4 py-2 rounded mt-2 w-full block text-center" target="_blank">Download</a>
            </div>
          `;
          playVideo.appendChild(card);
        }
      }
    })
    .catch((err) => {
      console.error(err);
      playVideo.innerHTML = '<p class="text-danger fs-1 text-center fw-bolder">An error occurred while fetching video files. Please try again later.</p>';
    });

}

window.addEventListener("click", (event) => {
  if (event.target.className != "form-control") {
    searchList.classList.add("hide-search-list");
  }
});


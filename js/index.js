const movieSearchBox = document.getElementById("movie-search-box");
const searchList = document.getElementById("search-list");
const resultGrid = document.getElementById("result-grid");
const playVideo = document.getElementById("play_video");
const heroBanner = document.getElementById("banner");

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
      searchList.classList.add("hide-search-list");
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
                        <img src="${
                          details.Poster != "N/A"
                            ? details.Poster
                            : "image_not_found.jpg"
                        }" alt="">
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">
                        ${details.Title}
                        </h3>
                        <p class="year"><b>Year: ${details.Year}</p>
                        <p class="rated">Ratings: ${details.Rated} </p>
                        <p class="genre">${details.Genre}</p>
                        <p class="writer">Writer(s): ${details.Writer}</p>
                        <p class="actors">Actors: ${details.Actors}</p>
                        <p class="plot"><b>Plot</b> <br />${details.Plot}</p>
                        <p class="language">${details.Language}</p>
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
      playVideo.innerHTML = '<p class="text-success fs-1 h1">Loading....</p>';
      if (data.status !== "success") {
        playVideo.innerHTML =
          '<p class="text-danger fs-1 text-center fw-bolder">Sorry! No Video files found!</p>';
      } else {
        playVideo.innerHTML = "";
        let files = data.files_found;
        for (let idx = 0; idx < files.length; idx++) {
          let file = files[idx];
          let card = document.createElement("div");
          card.classList.add(
            "card",
            "w-75",
            "m-2",
            "bg-primary",
            "text-white",
            "col-12"
          );
          if (!file.file_size || file.file_size.trim() === "") {
            card.innerHTML = "";
          } else {
            let check = false;
            fetch(file.file_link, {
              method: "HEAD"
            })
              .then((response) => {
                console.log("This is response", response);
                let check = true;
              })
              .catch((error) => {
                console.error("An Error Ocuured", error);
                let check = false;
              });
            if (check) {
              card.innerHTML = `
           <div class="card-body">
    <p class="card-text">Type: ${file.file_type}</p>
    <p class="card-text">Updated: ${file.time_ago}</p>
    <p class="card-text">File Size: ${file.file_size}</p>
    <div class="embed-responsive embed-responsive-16by9">
        <iframe class="embed-responsive-item" src="${file.file_link}" allowfullscreen></iframe>
    </div>
    <a href="${file.file_link}" class="btn btn-outline-success mt-2" target="_blank">Download</a>
</div>

        `;
            } else {
              card.innerHTML = "";
            }
          }
          playVideo.appendChild(card);
        }
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

window.addEventListener("click", (event) => {
  if (event.target.className != "form-control") {
    searchList.classList.add("hide-search-list");
  }
});

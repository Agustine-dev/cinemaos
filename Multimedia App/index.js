const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
const playVideo = document.getElementById('play_video');

async function loadMovies(searchTerm) {
    const URL = `http://www.omdbapi.com/?s=${searchTerm}&apikey=56e05e51`;
    const res = await fetch(`${URL}`);
    const data = await res.json();
    //console.log(data.Search);
    if (data.Response == 'True') {
        displayMovieList(data.Search);
    }
}

function findMovies() {
    let searchTerm = (movieSearchBox.value).trim();
    if (searchTerm.length > 0) {
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        searchList.classList.add('hide-search-list');
    }
}

function displayMovieList(movies) {
    searchList.innerHTML = "";
    for (let idx = 0; idx < movies.length; idx++) {
        let movieListItem = document.createElement('div');
        movieListItem.dataset.id = movies[idx].imdbID;
        movieListItem.classList.add('search-list-item');
        if (movies[idx].Poster != "N/A") {
            moviePoster = movies[idx].Poster;
        } else {
            moviePoster = "image_not_found.jpg"
        }
        movieListItem.innerHTML = `<div class="search-item-thumbnail">
               <img src="${moviePoster}" alt=""></div>
               <div class="search-item-info">
               <h3>${movies[idx].Title}</h3>
               <p>${movies[idx].Year}</p>
            </div>`;
        searchList.appendChild(movieListItem);
    }
    getMovieDetails();
}

function getMovieDetails() {
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async() => {
            // console.log(movie.dataset.id);
            searchList.classList.add('hide-search-list');
            movieSearchBox.value = "";
            const result = await fetch(`http://www.omdbapi.com/?i=${movie.dataset.id}&apikey=56e05e51`);
            const movieDetails = await result.json();
            // console.log(movieDetails);
            displayMovieDetails(movieDetails);
        });
    });

}

function displayMovieDetails(details) {
    resultGrid.innerHTML = `
                    <div class="movie-poster">
                        <img src="${(details.Poster != "N/A") ? details.Poster: "image_not_found.jpg" }" alt="">
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

    fetch(`https://filepursuit.p.rapidapi.com/?q=${details.Title}&filetype=mp4&type=video`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "filepursuit.p.rapidapi.com",
                "x-rapidapi-key": "c6b1760691msh3fd00140bb8715fp1c9172jsn1de1c9e00d40"
            }
        })
        .then(response => response.json())
        .then(data => {
            const movie = data.files_found[3].file_link;
            //console.log(data)
            playVideo.innerHTML = `<iframe src="${movie}" width="100%" height="800" controls allowfullscreen="true" style="border:1px solid black;">
            </iframe>
`;
        })
        .catch(err => {
            console.error(err);
        });




}

window.addEventListener('click', (event) => {
    if (event.target.className != "form-control") {
        searchList.classList.add('hide-search-list');
    }
});
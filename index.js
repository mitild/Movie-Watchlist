// GLOBAL VARIABLES
const inputEl = document.getElementById('search')
const submitBtn = document.getElementById('submit-btn')
const movieList = document.getElementById('movie-list')
const watchlist = document.getElementById('watchlist')
let moviesArr = []
let addedIdArr = []
let watchlistArray = []



// RUN SEARCH WHEN "ENTER KEY" PRESSED
if (inputEl){
  inputEl.addEventListener("keypress", (e) => {
      if (e.key === 'Enter') {
        submitBtn.click()
      }
  })
}

// RUN EVENTS WHEN BTNS CLICKED
document.addEventListener('click', e => {
  if(e.target.id === 'submit-btn') {
  render()
  }
  else if(e.target.id === 'add-btn') {
    addToWatchlist(e.target.dataset.id)
  }
  else if(e.target.id === 'remove-btn') {
    removeMovie(e.target.dataset.id)
  }
})

// SEARCH FUNCTIONS //

// DISPLAY SEARCHED-FOR MOVIE LIST
async function render() {
  loading()
  await getIdsArr(inputEl.value)
  inputEl.value = ``
  movieList.innerHTML = moviesArr.length > 0 ? getMovieHtml() : getErrorMessage()
}

// LOADING .GIF 
function loading() {
  movieList.innerHTML = `
    <div class="loader-div flex">
      <img class="loader" src="/images/loading.gif">
      <h3>We are searching for your movie</h3>
    <div>
  `
}

// LISTEN TO THE INPUT VALUE AND CREATE AN ARRAY WITH ALL THE MOVIES ID
async function getIdsArr(value) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=c8d5eb4a&s=${value}`)
  const data = await res.json()
  // RESET THE MOVIES ARRAY EVERY TIME A SEARCH IS EXCECUTED 
  moviesArr = []
  if(!data.Error) {
    // ARRAY WITH ID's
    const movieIdArr = data.Search.map(movie => movie.imdbID)
    // USE THAT ARRAY IN A FUNCTION TO SAVE ALL THE DATA FROM EACH MOVIE
    moviesArr.push(await getMovieData(movieIdArr)) 
  }
}

// CREATE AN ARRAY WITH EVERY MOVIE'S DATA
async function getMovieData(arr) {
  const movieData = []
  for(let id of arr){
      // PUSH THE DATA FROM THE API
      movieData.push(await fetchApiData(id))
    }
  return movieData
}

// GET THE DATA FROM THE API
async function fetchApiData(id) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=3d2d536a&i=${id}`)
  const data = await res.json()
  return data;
}

// GET THE HTML TO BE RENDERED 
function getMovieHtml() {
  let html = ``
  moviesArr[0].map(movie => {

    // IF MOVIE ALREADY IN WATCHLIST DISPLAYS "ADDED TO WATCH LIST" INSTEAD OF ADD BUTTON
    let addBtn = ``
    if(isInWatchlist(movie.imdbID)){
      addBtn = `<p class="added">Added to watchlist</p>`
    }
    else {
      addBtn = `<button class="add-btn" id="add-btn" data-id=${movie.imdbID}>
      <i class="fa-solid fa-circle-plus" id="add-btn" data-id=${movie.imdbID}></i>Watchlist</button>`
    }

      html += `
      <div class="movie-wrapper flex">
      <img src="${movie.Poster}" alt="" class="poster">
        <div class="movie-info flex">
          <div class="title-rate flex">
            <h2 class="title">${movie.Title}</h2>
              <div class="rate flex">
                <img src="images/star.png" alt="a star icon" class="rate-star">
                <p class="rate">${movie.imdbRating}</p>
              </div>
          </div>
            <div class="duration-genre-add flex">
              <p class="">${movie.Runtime}</p><p class="genre">${movie.Genre}</p>
              <div id=${movie.imdbID}>
                ${addBtn}
              </div>
            </div>
            <div class="description-wrapper">
              <p class="description">${movie.Plot}</p>
            </div>
        </div>    
    </div>
    `

  })
  return html
}

// MESSAGE TO DISPLAY WHEN NO MOVIE IS FOUND OR ERROR
function getErrorMessage() {
  let html = `
  <div id="placeholder-div" class="placeholder-div flex">
  <p class="text-placeholder">Sorry, we couldn't find what you where looking for...</p>
</div>
  `
  return html
}

// WATCHLIST FUNCTIONS //

// FUNCTION TO HANDLE THE ADD BUTTON
async function addToWatchlist(key) {
  document.getElementById(key).innerHTML = `<p class="added">Added to watchlist</p>`
  // TAKES ID OF CLICKED MOVIE AND ADDS IT TO AN ARRAY
  addedIdArr.unshift(key)
  // TAKES THAT ID, FETCHES DATA AND ADD IT TO AN ARRAY
  watchlistArray = await getMovieData(addedIdArr)
  //ADDS THE ARRAY TO LOCALSTORAGE
  localStorage.setItem('your-watchlist', JSON.stringify(watchlistArray))
  renderWatchlist()
}

//CHECK IF MOVIE IS IN WATCHLIST TO SHOW OR NOT ADD BUTTON
function isInWatchlist(id) {
  let idIsInWatchlist = []
  watchlistArray.forEach(movie => idIsInWatchlist.push(movie.imdbID))
  return idIsInWatchlist.includes(id)
}

// DISPLAYS THE WATCHLIST IF THERE ARE MOVIES ADDED OR A MESSAGE IF NOT
function renderWatchlist() {
  if(watchlistArray.length > 0) {
    watchlist.innerHTML = getWatchlistHtml()
  }
  else {
    watchlist.innerHTML = `
      <div id="placeholder-div" class="placeholder-div flex">
        <img src="images/Icon-film.png" alt="video film as placeholder" class="film-placeholder">
        <p class="text-placeholder" id="text-placeholder">Nothing in your Watchlist yet</p>
        <a class="start-searching" href="index.html">Start searching now!</a>
      </div>
    `
  }
}

// FUNCTION TO HANDLE THE REMOVE BUTTON
function removeMovie(key) {
  let movieIndex;
  watchlistArray.forEach((movie, index) => {
    if(movie.imdbID === key) {
      movieIndex = index
    }
  })
  watchlistArray.splice(movieIndex, 1)
  localStorage.setItem('your-watchlist', JSON.stringify(watchlistArray))
  renderWatchlist()
}


// WATCHLIST HTML
function getWatchlistHtml() {
  let html = ``
  watchlistArray.map(movie => {
      html += `
      <div class="movie-wrapper flex">
      <img src="${movie.Poster}" alt="" class="poster">
        <div class="movie-info flex">
          <div class="title-rate flex">
            <h2 class="title">${movie.Title}</h2>
              <div class="rate flex">
                <img src="images/star.png" alt="a star icon" class="rate-star">
                <p class="rate">${movie.imdbRating}</p>
              </div>
          </div>
            <div class="duration-genre-add flex">
              <p class="">${movie.Runtime}</p><p class="genre">${movie.Genre}</p>
              <div id=${movie.imdbID}>
                <button class="add-btn" id="remove-btn" data-id=${movie.imdbID}>
                <i class="fa-solid fa-circle-xmark" id="remove-btn" data-id=${movie.imdbID}></i>Remove</button>
              </div>
            </div>
            <div class="description-wrapper">
              <p class="description">${movie.Plot}</p>
            </div>
        </div>    
    </div>
    `
  })
  return html
}

// GET WHAT'S IN LOCALSTORAGE
if (localStorage.getItem('your-watchlist')) {
  watchlistArray = JSON.parse(localStorage.getItem('your-watchlist'))
  console.log(watchlistArray)
}

renderWatchlist()
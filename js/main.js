'use strict';

const inputName = document.querySelector('.js-input-serie');
const btnSrc = document.querySelector('.js-btn-src');
const form = document.querySelector('.js-form-series');
const results = document.querySelector('.js-results-series');
const favorites = document.querySelector('.js-favorite-series');
const resetBtn = document.querySelector('.js-resetBtn');
const favoritesIcon = document.querySelector('.favorites-icon');
const closePopupBtn = document.querySelector('.close-popup');
const favoritesPopup = document.querySelector('.favorites-popup');
const emptyMessage = document.querySelector('.empty-message');
const url = '//api.tvmaze.com/search/shows?q=';
let favoritesList = [];
let seriesList = [];

// Cargar favoritos del almacenamiento local al inicio
loadFromLocalStorage();

function getSeries() {
  const nameSerie = inputName.value.trim();
  if (nameSerie === '') return;
  fetch(url + nameSerie)
    .then((response) => response.json())
    .then((infoSeries) => {
      seriesList = infoSeries;
      if (seriesList.length > 0) {
        renderSerieList();
      } else {
        results.innerHTML = 'Ups! No encontramos esa serie';
      }
    })
    .catch((error) => {
      console.error('Error fetching series:', error);
      results.innerHTML = 'Error al buscar series. Intenta nuevamente.';
    });
}

function renderSerie(serie) {
  const isFavorite = favoritesList.some(
    (favSerie) => favSerie.show.id === serie.show.id
  );
  const className = isFavorite ? 'js-serieBox mark' : 'js-serieBox minibox';
  return `
        <article class="${className}" id="${serie.show.id}">
            <img class="imgSrc" src="${
              serie.show.image
                ? serie.show.image.medium
                : 'https://via.placeholder.com/70x90/ffffff/666666/?text=TV'
            }" alt="${serie.show.name}" title="${serie.show.name}" />
            <h2>${serie.show.name}</h2>
        </article>
    `;
}

function renderSerieList() {
  results.innerHTML = '';
  seriesList.forEach((serie) => {
    results.innerHTML += renderSerie(serie);
  });
  addEventstoseries();
}

function handleClickBtn(event) {
  event.preventDefault();
  getSeries();
}

document.addEventListener('DOMContentLoaded', function () {
  renderInitialSeries();
});

function renderInitialSeries() {
  const alphabet = 'abc';
  const seriesPromises = alphabet
    .split('')
    .map((letter) =>
      fetch(`${url}${letter}`).then((response) => response.json())
    );
  Promise.all(seriesPromises)
    .then((allSeries) => {
      seriesList = allSeries.flat();
      renderSerieList();
    })
    .catch((error) => console.error('Error fetching series:', error));
}

function renderFavorite(favSerie) {
  return `
        <article class="js-favBox mark favBox" id="${favSerie.show.id}">
            <img class="imgFav" src="${
              favSerie.show.image
                ? favSerie.show.image.medium
                : 'https://via.placeholder.com/70x90/ffffff/666666/?text=TV'
            }" alt="${favSerie.show.name}" title="${favSerie.show.name}" />
            <h2>${favSerie.show.name}</h2>
            <button class="delete-btn">X</button>
        </article>
    `;
}

function renderFavoritesList() {
  favorites.innerHTML = '';
  if (favoritesList.length === 0) {
    emptyMessage.style.display = 'block';
    resetBtn.style.display = 'none';
  } else {
    emptyMessage.style.display = 'none';
    resetBtn.style.display = 'block';
    favoritesList.forEach((favSerie) => {
      favorites.innerHTML += renderFavorite(favSerie);
    });
  }
}

function handleClickSerie(event) {
  const idSerie = parseInt(event.currentTarget.id, 10);
  const seriefound = seriesList.find((serie) => serie.show.id === idSerie);
  const positionFav = favoritesList.findIndex(
    (serie) => serie.show.id === idSerie
  );
  if (positionFav === -1) {
    favoritesList.push(seriefound);
    event.currentTarget.classList.add('mark');
    event.currentTarget.classList.remove('minibox');
  } else {
    favoritesList.splice(positionFav, 1);
    event.currentTarget.classList.remove('mark');
    event.currentTarget.classList.add('minibox');
  }
  renderFavoritesList();
  localStorage.setItem('favorites', JSON.stringify(favoritesList));
  toggleFavoritesPopup();
}

function addEventstoseries() {
  const allArticles = document.querySelectorAll('.js-serieBox');
  allArticles.forEach((article) =>
    article.addEventListener('click', handleClickSerie)
  );
}

function loadFromLocalStorage() {
  const storedFavorites = localStorage.getItem('favorites');
  if (storedFavorites) {
    favoritesList = JSON.parse(storedFavorites);
    renderFavoritesList();
  }
}

function handleClickDeleteOne(event) {
  const deleteBtn = event.target.closest('.delete-btn');
  if (deleteBtn) {
    const idFavClicked = parseInt(deleteBtn.parentElement.id, 10);
    const indexFav = favoritesList.findIndex(
      (item) => item.show.id === idFavClicked
    );
    if (indexFav !== -1) {
      favoritesList.splice(indexFav, 1);
      renderFavoritesList();
      localStorage.setItem('favorites', JSON.stringify(favoritesList));
    }
  }
}

favorites.addEventListener('click', handleClickDeleteOne);
function handleClickResetBtn(event) {
  event.preventDefault();
  favoritesList = [];
  favorites.innerHTML = '';
  localStorage.removeItem('favorites');
  renderSerieList();
  emptyMessage.style.display = 'block';
  resetBtn.style.display = 'none';
}
function toggleFavoritesPopup() {
  if (favoritesList.length === 0) {
    favoritesPopup.classList.remove('show');
  } else {
    favoritesPopup.classList.add('show');
  }
}

favoritesIcon.addEventListener('click', () => {
  favoritesPopup.classList.toggle('show');
});

closePopupBtn.addEventListener('click', () => {
  favoritesPopup.classList.remove('show');
});

btnSrc.addEventListener('click', handleClickBtn);
resetBtn.addEventListener('click', handleClickResetBtn);

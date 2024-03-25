'use strict';

const inputName = document.querySelector('.js-input-serie');
const btnSrc = document.querySelector('.js-btn-src');
const form = document.querySelector('.js-form-series');
const results = document.querySelector('.js-results-series');
const box = document.querySelector('.js-box-series');
const favorites = document.querySelector('.js-favorite-series');
const url = '//api.tvmaze.com/search/shows?q=';
const resetBtn = document.querySelector('.js-resetBtn');
const boxserie = document.querySelector('.js-serieBox');
const msgError=document.querySelector('.js-errorMsg');

// Datos
let favoritesList = [];
let seriesList = [];

// Función que recoja la búsqueda a la API de las series
loadFromLocalStorage();

function getSeries() {
  const nameSerie = inputName.value;
  fetch(url + nameSerie)
    .then((response) => response.json())
    .then((infoSeries) => {
      seriesList = infoSeries;
      if(seriesList.length > 0) {renderSerieList();}
      else{
    results.innerHTML='Ups!No encontramos esa serie';}
    console.log(msgError.innerHTML);

      // Llamar función que las pinta en HTML

    });
}

// Plantilla de HTML de cada búsqueda de la serie
function renderSerie(serie) {
  let html = '';
  if (
    favoritesList.findIndex((favSerie) => favSerie.show.id === serie.show.id) !==
    -1
  ) {
    html += `<article class="js-serieBox mark" id="${serie.show.id}">`;
  } else {
    html += `<article class="js-serieBox minibox" id="${serie.show.id}">`;
  }

  html += `<img class="imgSrc" src="${
    serie.show.image
      ? serie.show.image.medium
      : 'https://via.placeholder.com/70x90/ffffff/666666/?text=TV'
  }" alt="${serie.show.name}" title="${serie.show.name}" />`;

  html += `<h2>${serie.show.name}</h2>`;
  
  html += `</article>`;
  return html;
}

// Con esta función pintamos todos los resultados de la búsqueda de series a través de un bucle
function renderSerieList() {
  results.innerHTML = ''; // Dejamos el results en blanco para que a la hora de realizar nueva búsqueda no se acumulen
  for (const serie of seriesList) {
    results.innerHTML += renderSerie(serie);
  }
  addEventstoseries(); // Llamamos a esta función después de pintar las series
}

// Pulsar el botón y que aparezcan los resultados de la búsqueda de series
function handleClickBtn(event) {
  event.preventDefault();
  getSeries();
}
// Llama a renderInitialSeries al cargar la página para mostrar una lista de series automáticamente
document.addEventListener('DOMContentLoaded', function () {
  renderInitialSeries();
});

function renderInitialSeries() {
  const alphabet = 'abc';
  let seriesPromises = [];

  // Genera las promesas para obtener las series de la API para cada letra del alfabeto
  for (const letter of alphabet) {
    seriesPromises.push(fetch(`${url}${letter}`).then((response) => response.json()));
  }

  // Ejecuta todas las promesas de manera paralela
  Promise.all(seriesPromises)
    .then((allSeries) => {
      // Concatena todas las series en una sola lista
      seriesList = allSeries.flat();
      renderSerieList();
      
    })
    .catch((error) => {
      console.error('Error fetching series:', error);
    });
}


function renderFavorite(favSerie) {
  let html = '';
  html += `<article class="js-favBox mark favBox" id="${favSerie.show.id}">`;

  html += `<img class="imgFav" src="${
    favSerie.show.image
      ? favSerie.show.image.medium
      : 'https://via.placeholder.com/70x90/ffffff/666666/?text=TV'
  }" alt="${favSerie.show.name}" title="${favSerie.show.name}" />`;

  html += `<h2>${favSerie.show.name}</h2>`;
  html += `<span class="js-bin "><img class="bin" src="./images/cerca.png" alt="Borrar" class="binBag"></span>`;
  html += `</article>`;
  return html;
}

// Función para renderizar favoritos
function renderFavoritesList() {
  favorites.innerHTML = ''; // Limpiamos la lista de favoritos antes de renderizar
  for (const favSerie of favoritesList) {
    favorites.innerHTML += renderFavorite(favSerie);
  }
}

// Función que maneja lo que ocurre al dar clic en las series
function handleClickSerie(event) {
  const idSerie = parseInt(event.currentTarget.id);

  // Ya teniendo el id del artículo que se hizo clic, añadimos a favoritos
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
}

// Función para agregar eventos a los artículos que contienen las series con un bucle, ya que no sabemos cuántos resultados hay
function addEventstoseries() {
  const allArticles = document.querySelectorAll('.js-serieBox');
  for (const article of allArticles) {
    article.addEventListener('click', handleClickSerie);
  }
}

function getInfofromLocalStorage() {
  const result = JSON.parse(localStorage.getItem('favorites'));
  if (result === null) {
    return [];
  } else {
    favoritesList = result;
    renderFavoritesList();
    return favoritesList;
  }
}

// Cargar favoritos almacenados en localStorage cuando se carga la página
function loadFromLocalStorage() {
  const storedFavorites = localStorage.getItem('favorites');
  if (storedFavorites) {
    favoritesList = JSON.parse(storedFavorites);
    renderFavoritesList();
  }
}

function handleClickDeleteOne(event) {
  const binElement = event.target.closest('.js-bin');
  if (binElement) {
    const idFavClicked = parseInt(binElement.parentElement.id);
    const indexFav = favoritesList.findIndex(
      (item) => item.show.id === idFavClicked
    );
    if (indexFav !== -1) {
      favoritesList.splice(indexFav, 1);
      renderSerieList();
      renderFavoritesList();
      localStorage.setItem('favorites', JSON.stringify(favoritesList)); // Actualiza la lista de favoritos en la interfaz
    }
  }
}

// Asigna el evento clic a la lista de favoritos
favorites.addEventListener('click', handleClickDeleteOne);

function handleClickResetBtn(event) {
  event.preventDefault();
  favoritesList = []
  favorites.innerHTML = '';

  // Dejamos el results en blanco para que a la hora de realizar n
  localStorage.removeItem('favorites');
  renderSerieList();
}

// Eventos
btnSrc.addEventListener('click', handleClickBtn);
resetBtn.addEventListener('click', handleClickResetBtn);

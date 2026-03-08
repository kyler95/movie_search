export async function handler(event){

const query = event.queryStringParameters.q;
const api = process.env.TMDB_KEY;

// поиск фильма
const searchUrl =
`https://api.themoviedb.org/3/search/movie?api_key=${api}&query=${encodeURIComponent(query)}&language=ru-RU`;

const res = await fetch(searchUrl);
const data = await res.json();

// для первых 5 фильмов получаем английские переводы
const results = await Promise.all(

data.results.slice(0,5).map(async movie => {

const transUrl =
`https://api.themoviedb.org/3/movie/${movie.id}/translations?api_key=${api}`;

const tRes = await fetch(transUrl);
const tData = await tRes.json();

const english = tData.translations.find(t => t.iso_639_1 === "en");

return {
id: movie.id,
title: movie.title,
year: movie.release_date ? movie.release_date.slice(0,4) : "?",
english: english?.data?.title || movie.original_title
};

})

);

return {
statusCode:200,
body:JSON.stringify({results})
};

}

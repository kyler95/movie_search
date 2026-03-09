export async function handler(event){

const query = event.queryStringParameters.q.toLowerCase();
const api = process.env.TMDB_KEY;

const searchUrl =
`https://api.themoviedb.org/3/search/movie?api_key=${api}&query=${encodeURIComponent(query)}&language=ru-RU`;

const res = await fetch(searchUrl);
const data = await res.json();

// берём больше результатов
const movies = data.results.slice(0,20);

// сортируем по совпадению
movies.sort((a,b)=>{

const aTitle = (a.title || "").toLowerCase();
const bTitle = (b.title || "").toLowerCase();

// точное совпадение
if(aTitle === query && bTitle !== query) return -1;
if(bTitle === query && aTitle !== query) return 1;

// начинается с запроса
if(aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
if(bTitle.startsWith(query) && !aTitle.startsWith(query)) return 1;

// популярность
return b.popularity - a.popularity;

});

const results = await Promise.all(

movies.slice(0,5).map(async movie => {

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

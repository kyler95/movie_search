export async function handler(event){

const queryRaw = event.queryStringParameters.q;
const api = process.env.TMDB_KEY;

if(!queryRaw){
return {
statusCode:400,
body:JSON.stringify({error:"No query"})
};
}

// извлекаем год
const yearMatch = queryRaw.match(/\b(19|20)\d{2}\b/);
const year = yearMatch ? yearMatch[0] : null;

// очищаем текст запроса
let query = queryRaw
.replace(/\b(19|20)\d{2}\b/, "")
.replace(/эпизод\s*\d+/i, "")
.trim()
.toLowerCase();

// поиск в TMDB
let searchUrl =
`https://api.themoviedb.org/3/search/movie?api_key=${api}&query=${encodeURIComponent(query)}&language=en-US`;

const res = await fetch(searchUrl);
const data = await res.json();

let movies = data.results || [];

// фильтр по году если указан
if(year){
movies = movies.filter(movie =>
movie.release_date && movie.release_date.startsWith(year)
);
}

// сортировка для повышения точности
movies.sort((a,b)=>{

const aTitle = (a.title || "").toLowerCase();
const bTitle = (b.title || "").toLowerCase();

if(aTitle === query && bTitle !== query) return -1;
if(bTitle === query && aTitle !== query) return 1;

if(aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
if(bTitle.startsWith(query) && !aTitle.startsWith(query)) return 1;

return b.popularity - a.popularity;

});

const results = await Promise.all(

movies.slice(0,5).map(async movie => {

// получаем переводы
const transUrl =
`https://api.themoviedb.org/3/movie/${movie.id}/translations?api_key=${api}`;

const tRes = await fetch(transUrl);
const tData = await tRes.json();

const english = tData.translations.find(
t => t.iso_639_1 === "en"
);

// логика выбора английского названия
let englishTitle;

if(movie.original_language === "en"){
englishTitle = movie.original_title;
}else{
englishTitle = english?.data?.title || movie.original_title;
}

return {
id: movie.id,
title: movie.title,
year: movie.release_date ? movie.release_date.slice(0,4) : "?",
english: englishTitle
};

})

);

return {
statusCode:200,
body:JSON.stringify({results})
};

}

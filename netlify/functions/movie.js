export async function handler(event){

const queryRaw = event.queryStringParameters.q;
const api = process.env.TMDB_KEY;

if(!queryRaw){
return {
statusCode:400,
body:JSON.stringify({error:"No query"})
};
}

// извлекаем год из запроса
const yearMatch = queryRaw.match(/\b(19|20)\d{2}\b/);
const year = yearMatch ? yearMatch[0] : null;

// убираем год из текста запроса
const query = queryRaw.replace(/\b(19|20)\d{2}\b/, "").trim().toLowerCase();

// формируем URL поиска
let searchUrl =
`https://api.themoviedb.org/3/search/movie?api_key=${api}&query=${encodeURIComponent(query)}&language=ru-RU`;

// если есть год — добавляем параметр
if(year){
searchUrl += `&year=${year}`;
}

const res = await fetch(searchUrl);
const data = await res.json();

let movies = data.results || [];

// сортировка для более точного результата
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

// берём первые 5 фильмов
const results = await Promise.all(

movies.slice(0,5).map(async movie => {

const transUrl =
`https://api.themoviedb.org/3/movie/${movie.id}/translations?api_key=${api}`;

const tRes = await fetch(transUrl);
const tData = await tRes.json();

const english = tData.translations.find(
t => t.iso_639_1 === "en"
);

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

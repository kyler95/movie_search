const input = document.getElementById("movieInput");
const result = document.getElementById("result");
const suggestions = document.getElementById("suggestions");

let debounceTimer;
let currentIndex = -1;
let currentResults = [];

input.addEventListener("input", () => {

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(searchMovies, 300);

});

input.addEventListener("keydown", (e) => {

    const items = document.querySelectorAll(".suggestion");

    if(e.key === "ArrowDown"){
        e.preventDefault();
        currentIndex++;
        if(currentIndex >= items.length) currentIndex = 0;
        updateActive(items);
    }

    if(e.key === "ArrowUp"){
        e.preventDefault();
        currentIndex--;
        if(currentIndex < 0) currentIndex = items.length - 1;
        updateActive(items);
    }

    if(e.key === "Enter"){
        if(currentIndex >= 0 && currentResults[currentIndex]){
            selectMovie(currentResults[currentIndex]);
        }
    }

});

function updateActive(items){

    items.forEach(el => el.classList.remove("active"));

    if(items[currentIndex]){
        items[currentIndex].classList.add("active");
    }

}

async function searchMovies() {

    const query = input.value.trim();

    if (query.length < 2) {
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
        return;
    }

    try {

        const response = await fetch(
            `/.netlify/functions/movie?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        suggestions.innerHTML = "";
        suggestions.style.display = "block";
        currentResults = data.results;
        currentIndex = -1;

        data.results.slice(0,5).forEach((movie, index) => {

            const div = document.createElement("div");
            div.className = "suggestion";

            div.textContent = `${movie.title} (${movie.year})`;

            div.onclick = () => selectMovie(movie);

            suggestions.appendChild(div);

        });

    } catch (err) {

        console.error(err);
        result.innerText = "Ошибка запроса";

    }

}

function selectMovie(movie){

    input.value = movie.title;
    suggestions.innerHTML = "";
    suggestions.style.display = "none";

    result.innerText = "English title: " + movie.english;

}

document.addEventListener("click", (e) => {

    if(!e.target.closest(".search-box")){
        suggestions.style.display = "none";
    }

});


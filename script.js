const input = document.getElementById("movieInput");
const result = document.getElementById("result");
const suggestions = document.getElementById("suggestions");

let debounceTimer;

input.addEventListener("input", () => {

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(searchMovies, 300);

});

async function searchMovies() {

    const query = input.value.trim();

    if (query.length < 2) {
        suggestions.innerHTML = "";
        return;
    }

    try {

        const response = await fetch(
            `/.netlify/functions/movie?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        suggestions.innerHTML = "";

        data.results.slice(0,5).forEach(movie => {

            const div = document.createElement("div");
            div.className = "suggestion";

            div.textContent = `${movie.title} (${movie.year})`;

            div.onclick = () => {

                input.value = movie.title;
                suggestions.innerHTML = "";

                result.innerText = "English title: " + movie.english;

            };

            suggestions.appendChild(div);

        });

    } catch (err) {

        console.error(err);
        result.innerText = "Ошибка запроса";

    }

}

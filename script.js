const input = document.getElementById("movieInput")
const suggestions = document.getElementById("suggestions")
const result = document.getElementById("result")

let timer

input.addEventListener("input", () => {
	clearTimeout(timer)

	timer = setTimeout(search, 300)
})

async function search() {
	const query = input.value.trim()

	if (query.length < 2) {
		suggestions.innerHTML = ""
		return
	}

	const res = await fetch(
		`/.netlify/functions/movie?q=${encodeURIComponent(query)}`,
	)

	const data = await res.json()

	suggestions.innerHTML = ""

	data.results.slice(0, 5).forEach(movie => {
		const div = document.createElement("div")

		div.className = "suggestion"

		div.textContent = movie.title

		div.onclick = () => {
			result.innerText = "English title: " + movie.english

			suggestions.innerHTML = ""
		}

		suggestions.appendChild(div)
	})
}

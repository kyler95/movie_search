export async function handler(event) {
	const query = event.queryStringParameters.q

	const api = process.env.TMDB_KEY

	const url = `https://api.themoviedb.org/3/search/movie?api_key=${api}&query=${encodeURIComponent(query)}&language=ru-RU`

	const res = await fetch(url)
	const data = await res.json()

	const results = data.results.map(m => ({
		title: m.title,
		english: m.original_title,
	}))

	return {
		statusCode: 200,
		body: JSON.stringify({ results }),
	}
}

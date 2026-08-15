// Node 18+ trae fetch nativo, no se necesita ninguna librería externa.
const BASE_URL = "https://jsearch.p.rapidapi.com/search-v2";

/**
 * Busca ofertas de trabajo en JSearch.
 * @param {Object} opts
 * @param {string} opts.query - término de búsqueda, ej: "desarrollador php"
 * @param {string} opts.country - código de país, ej: "cl"
 * @param {number} opts.numPages - cuántas páginas traer (cada página ~10 resultados)
 * @returns {Promise<Array>} lista de jobs crudos devueltos por la API
 */
async function searchJobs({ query, country = "cl", numPages = 1 }) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    throw new Error("Falta RAPIDAPI_KEY en las variables de entorno");
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("query", `${query} in Chile`);
  url.searchParams.set("num_pages", String(numPages));
  url.searchParams.set("country", country);
  url.searchParams.set("date_posted", "all");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
      "x-rapidapi-key": apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `JSearch respondió ${response.status}: ${response.statusText} - ${body}`
    );
  }

  const data = await response.json();
  return data?.data?.jobs || [];
}

module.exports = { searchJobs };
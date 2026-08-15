require("dotenv").config({ quiet: true });

const { searchJobs } = require("./src/jsearch");
const { scoreJob } = require("./src/matcher");
const { hasBeenSeen, markAsSeen } = require("./src/store");
const { sendMatchEmail } = require("./src/notifier");

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/\s+/g, " ")
    .trim();
}

function getStableKey(job) {

  // Fallback por si algún día no viene el link: título + empresa normalizados.
  const title = normalize(job.job_title);
  const company = normalize(job.employer_name);
  return `${company}::${title}`;
}

async function run() {
  const rawQuery = process.env.JOB_SEARCH_QUERY || "desarrollador full stack";
  const queries = rawQuery
    .split(",")
    .map((q) => q.trim())
    .filter(Boolean);

  const country = process.env.JOB_SEARCH_COUNTRY || "cl";
  const threshold = Number(process.env.MATCH_THRESHOLD || 40);

  const newMatches = [];
  const seenInThisRun = new Set(); // evita duplicados si dos queries traen la misma oferta

  for (const query of queries) {
    console.log(`[${new Date().toISOString()}] Buscando: "${query}" en "${country}"...`);

    const jobs = await searchJobs({ query, country });
    console.log(`  → ${jobs.length} ofertas encontradas para esta búsqueda.`);

    for (const job of jobs) {
      const stableKey = getStableKey(job);
      if (!stableKey) continue;

      if (seenInThisRun.has(stableKey)) continue; // ya la vimos en otra query de esta misma corrida
      seenInThisRun.add(stableKey);

      if (hasBeenSeen(stableKey)) {
        continue; // ya notificado en una corrida anterior, se salta
      }

      const result = scoreJob(job);

      // Se marca como visto SIEMPRE (matchee o no) para no reprocesarlo eternamente
      markAsSeen({
        jobId: stableKey,
        title: job.job_title,
        company: job.employer_name,
        score: result.score,
      });

      if (result.score >= threshold) {
        newMatches.push({ job, result });
      }
    }
  }

  console.log(`${newMatches.length} oferta(s) nueva(s) superaron el umbral de ${threshold}.`);

  if (newMatches.length > 0) {
    await sendMatchEmail(newMatches);
    console.log("Correo de notificación enviado.");
  } else {
    console.log("No hay nada nuevo que notificar en esta corrida.");
  }
}

run().catch((err) => {
  console.error("Error en la ejecución:", err.message);
  process.exit(1);
});
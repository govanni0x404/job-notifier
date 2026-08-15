const profile = require("./profile");

/**
 * Calcula un score 0-100 de qué tan bien una oferta matchea con el perfil.
 * También devuelve las razones (skills encontrados) para incluir en el correo.
 */
function scoreJob(job) {
  const text = `${job.job_title || ""} ${job.job_description || ""}`.toLowerCase();

  // Descarte directo
  const excluded = profile.excludeKeywords.some((kw) =>
    text.includes(kw.toLowerCase())
  );
  if (excluded) {
    return { score: 0, matchedCore: [], matchedSecondary: [], titleMatch: false };
  }

  const matchedCore = profile.coreSkills.filter((skill) =>
    text.includes(skill.toLowerCase())
  );
  const matchedSecondary = profile.secondarySkills.filter((skill) =>
    text.includes(skill.toLowerCase())
  );
  const titleMatch = profile.titleKeywords.some((kw) =>
    (job.job_title || "").toLowerCase().includes(kw.toLowerCase())
  );

  // Ponderación simple: core vale más que secondary, título da bonus
  const coreScore = matchedCore.length * 15;
  const secondaryScore = matchedSecondary.length * 5;
  const titleBonus = titleMatch ? 15 : 0;

  const rawScore = coreScore + secondaryScore + titleBonus;
  const score = Math.min(100, rawScore);

  return { score, matchedCore, matchedSecondary, titleMatch };
}

module.exports = { scoreJob };

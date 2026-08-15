// Perfil usado para calcular el score de coincidencia contra cada oferta.
// Ajusta libremente las listas según tu CV real.

module.exports = {
  // Skills "core" (mayor peso en el score)
  coreSkills: [
    "php",
    "codeigniter",
    "postgresql",
    "postgres",
    "node.js",
    "nodejs",
    "node",
    "react native",
    "expo",
    "javascript",
  ],

  // Skills secundarias (suman, pero menos)
  secondarySkills: [
    "react",
    "typescript",
    "express",
    "sql",
    "git",
    "api rest",
    "rest api",
    "mysql",
    "docker",
  ],

  // Cargos que te interesan (si el título matchea, suma bonus)
  titleKeywords: [
    "desarrollador",
    "programador",
    "developer",
    "full stack",
    "fullstack",
    "backend",
    "analista programador",
  ],

  // Palabras que descartan una oferta directamente (ej: seniority que no aplica)
  excludeKeywords: [
    "senior manager",
    "director",
    "practicante sin remuneración",
  ],
};

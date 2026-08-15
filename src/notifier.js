const { Resend } = require("resend");

function buildEmailHtml(matches) {
  const items = matches
    .map(({ job, result }) => {
      const reasons = [...result.matchedCore, ...result.matchedSecondary].join(", ");
      return `
        <div style="margin-bottom:20px;padding:16px;border:1px solid #e2e2e2;border-radius:8px;">
          <h3 style="margin:0 0 4px;">${job.job_title}</h3>
          <p style="margin:0 0 8px;color:#555;">${job.employer_name || "Empresa no especificada"} · ${job.job_city || ""} ${job.job_country || ""}</p>
          <p style="margin:0 0 8px;"><strong>Score de match:</strong> ${result.score}/100</p>
          <p style="margin:0 0 8px;"><strong>Por qué matchea:</strong> ${reasons || "coincidencia por título"}</p>
          <a href="${job.job_apply_link}" style="color:#2563eb;">Postular aquí →</a>
        </div>
      `;
    })
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2>Nuevas ofertas acordes a tu perfil</h2>
      <p>Se encontraron ${matches.length} oferta(s) nueva(s) que coinciden con tu CV.</p>
      ${items}
    </div>
  `;
}

async function sendMatchEmail(matches) {
  if (matches.length === 0) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY en las variables de entorno");
  }

  const resend = new Resend(apiKey);

  const from = process.env.NOTIFY_EMAIL_FROM;
  const to = process.env.NOTIFY_EMAIL_TO;

  if (!from || !to) {
    throw new Error("Faltan NOTIFY_EMAIL_FROM o NOTIFY_EMAIL_TO en el .env");
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: `${matches.length} oferta(s) nueva(s) que coinciden con tu perfil`,
    html: buildEmailHtml(matches),
  });

  if (error) {
    throw new Error(`Resend falló: ${JSON.stringify(error)}`);
  }

  return data;
}

module.exports = { sendMatchEmail };

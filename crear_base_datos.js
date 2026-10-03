/**
 * Genera una base de datos (JSON y CSV) con equipos y jugadores reales
 * usando la API gratuita de football-data.org.
 *
 * Uso:
 *   1. Regístrate gratis en https://www.football-data.org/client/register
 *   2. Pon tu token en API_KEY (o en la variable de entorno FD_API_KEY)
 *   3. Node 18 o superior (no necesita instalar paquetes)
 *   4. node crear_base_datos.js
 */

const fs = require("fs");

const API_KEY = process.env.FD_API_KEY || "TU_TOKEN_AQUI";
const BASE_URL = "https://api.football-data.org/v4";

// Ligas disponibles en el plan gratuito
const LIGAS = {
  PL: "Premier League",
  PD: "La Liga",
  SA: "Serie A",
  BL1: "Bundesliga",
  FL1: "Ligue 1",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function obtenerEquipos(codigoLiga) {
  const res = await fetch(`${BASE_URL}/competitions/${codigoLiga}/teams`, {
    headers: { "X-Auth-Token": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} en ${codigoLiga}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.teams || [];
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

async function main() {
  if (API_KEY === "TU_TOKEN_AQUI") {
    console.error("Falta tu API key de football-data.org");
    process.exit(1);
  }

  const equipos = [];
  const jugadores = [];

  for (const [codigo, liga] of Object.entries(LIGAS)) {
    console.log(`Descargando ${liga}...`);
    for (const eq of await obtenerEquipos(codigo)) {
      equipos.push({
        id: eq.id,
        nombre: eq.name,
        liga,
        pais: eq.area?.name ?? null,
        escudo: eq.crest ?? null,
      });
      for (const j of eq.squad || []) {
        jugadores.push({
          id: j.id,
          nombre: j.name,
          posicion: j.position ?? null,
          nacionalidad: j.nationality ?? null,
          fecha_nacimiento: j.dateOfBirth ?? null,
          equipo_id: eq.id,
          equipo: eq.name,
          liga,
        });
      }
    }
    await sleep(7000); // el plan gratis permite ~10 peticiones/minuto
  }

  fs.writeFileSync(
    "dls_database.json",
    JSON.stringify({ equipos, jugadores }, null, 2)
  );

  const cols = Object.keys(jugadores[0] || {});
  const filas = jugadores.map((j) => cols.map((c) => csvCell(j[c])).join(","));
  fs.writeFileSync("jugadores.csv", [cols.join(","), ...filas].join("\n"));

  console.log(
    `Listo: ${equipos.length} equipos y ${jugadores.length} jugadores ` +
      `en dls_database.json y jugadores.csv`
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

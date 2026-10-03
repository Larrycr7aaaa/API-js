Usar :
const url = './archivo.json'; // ruta relativa al archivo local

async function cargarDatos() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error('Error cargando el JSON:', err);
  }
}

cargarDatos();

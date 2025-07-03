const seccionTarjetas = document.getElementById("cards-section");
import "./style.css";
function cargarFavoritos() {
  const favoritos = JSON.parse(localStorage.getItem("favoritosRM")) || [];
  seccionTarjetas.innerHTML = "";
  let contenedorReset = document.getElementById("contenedor-reset-fav");
  const contenedorPadre = seccionTarjetas.parentNode;

  if (!contenedorReset) {
    contenedorReset = document.createElement("div");
    contenedorReset.id = "contenedor-reset-fav";
    contenedorReset.style.textAlign = "center";
    contenedorReset.style.margin = "1rem 0";
    contenedorPadre.appendChild(contenedorReset);
  }
  contenedorReset.innerHTML = "";

  if (favoritos.length === 0) {
    seccionTarjetas.innerHTML = "<p>No tienes personajes favoritos.</p>";
    contenedorReset.style.display = "none"; // Ocultar el botón si no hay favoritos
    return;
  } else {
    contenedorReset.style.display = "block";
  }

  fetch(`https://rickandmortyapi.com/api/character/${favoritos.join(",")}`)
    .then((res) => res.json())
    .then((data) => {
      const personajes = Array.isArray(data) ? data : [data];
      personajes.forEach((personaje) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "card";
        tarjeta.innerHTML = `
          <img src="${personaje.image}" alt="${
          personaje.name
        }" class="card-img" />
          <h3>${personaje.name}</h3>
          <p>Estado: ${
            personaje.status === "Alive"
              ? "Vivo"
              : personaje.status === "Dead"
              ? "Muerto"
              : "Desconocido"
          }</p>
        `;
        seccionTarjetas.appendChild(tarjeta);
      });

      // crear botón para resetear favoritos
      contenedorReset.innerHTML = `<button id="reset-favoritos-btn">Eliminar todos los favoritos</button>`;
      const btnReset = document.getElementById("reset-favoritos-btn");
      btnReset.addEventListener("click", () => {
        localStorage.removeItem("favoritosRM");
        cargarFavoritos();
      });
    })
    .catch(() => {
      seccionTarjetas.innerHTML = "<p>Error al cargar favoritos.</p>";
      contenedorReset.style.display = "none"; //oculta el boton
    });
}

document.addEventListener("DOMContentLoaded", cargarFavoritos);

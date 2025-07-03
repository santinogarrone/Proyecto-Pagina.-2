let paginaActual = 1;
const seccionTarjetas = document.getElementById("cards-section");
const selectFiltro = document.getElementById("filter-select");
const selectOrden = document.getElementById("ordenar-options");
const barraBusqueda = document.getElementById("search-bar");
let estadoActual = "";
let ordenActual = "az";
// esta función obtiene los personajes de la API de Rick y Morty segun la pagina,
// y los muestra como cards. si hay algún error muestra un mensaje.

function cargarPersonajes(pagina = 1) {
  // obtener favoritos del localStorage
  const favoritos = JSON.parse(localStorage.getItem("favoritosRM")) || [];
  let url = `https://rickandmortyapi.com/api/character?page=${pagina}`;
  if (estadoActual && estadoActual !== "") {
    url += `&status=${estadoActual}`;
  }
  fetch(url)
    .then(async (respuesta) => {
      if (!respuesta.ok) {
        seccionTarjetas.innerHTML = "<p>No hay personajes con ese estado.</p>";
        renderizarPaginacion(1);
        return null;
      }
      return respuesta.json();
    })
    .then((datos) => {
      if (!datos) return;
      seccionTarjetas.innerHTML = "";
      if (!datos.results || datos.results.length === 0) {
        seccionTarjetas.innerHTML = "<p>No hay personajes con ese estado.</p>";
        renderizarPaginacion(1);
        return;
      }
      const personajesOrdenados = ordenarPersonajes(datos.results, ordenActual);
      personajesOrdenados.forEach((personaje) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "card";
        // ver si el personaje está en favoritos
        const esFavorito = favoritos.includes(String(personaje.id));
        tarjeta.innerHTML = `
          <span class="star-fav" title="Agregar a favoritos" data-id="${
            personaje.id
          }">
            ${esFavorito ? "★" : "☆"}
          </span>
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
        tarjeta.addEventListener("click", (e) => {
          if (e.target.classList.contains("star-fav")) return;
          mostrarDetallePersonaje(personaje);
        });
        seccionTarjetas.appendChild(tarjeta);
      });
      // agregar eventos a las estrellitas
      document.querySelectorAll(".star-fav").forEach((estrella) => {
        estrella.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          let favoritos = JSON.parse(localStorage.getItem("favoritosRM")) || [];
          if (favoritos.includes(id)) {
            favoritos = favoritos.filter((favId) => favId !== id);
          } else {
            favoritos.push(id);
          }
          localStorage.setItem("favoritosRM", JSON.stringify(favoritos));
          cargarPersonajes(paginaActual);
        });
      });
      renderizarPaginacion(datos.info.pages);
    })
    .catch((error) => {
      console.error("Hubo un error:", error);
      seccionTarjetas.innerHTML =
        "<p>Hubo un error al cargar los personajes.</p>";
    });
}
// esta función crea y muestra los botones de paginación (anterior y siguiente)
// y la información de la página actual
function renderizarPaginacion(totalPaginas) {
  let paginacion = document.getElementById("paginacion");
  if (!paginacion) {
    paginacion = document.createElement("div");
    paginacion.id = "paginacion";
    paginacion.style.display = "flex";
    paginacion.style.justifyContent = "center";
    paginacion.style.gap = "1rem";
    paginacion.style.margin = "2rem 0";
    seccionTarjetas.parentNode.appendChild(paginacion);
  }
  paginacion.innerHTML = "";
  const btnAnterior = document.createElement("button");
  btnAnterior.textContent = "Anterior";
  btnAnterior.disabled = paginaActual === 1;
  btnAnterior.onclick = () => {
    if (paginaActual > 1) {
      paginaActual--;
      cargarPersonajes(paginaActual);
    }
  };
  paginacion.appendChild(btnAnterior);

  const infoPagina = document.createElement("span");
  infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  paginacion.appendChild(infoPagina);

  const btnSiguiente = document.createElement("button");
  btnSiguiente.textContent = "Siguiente";
  btnSiguiente.disabled = paginaActual === totalPaginas;
  btnSiguiente.onclick = () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      cargarPersonajes(paginaActual);
    }
  };
  paginacion.appendChild(btnSiguiente);
}
selectFiltro.addEventListener("change", () => {
  estadoActual = selectFiltro.value;
  paginaActual = 1; //cuando cambio de estado para filtrar, reinicia a la pagina 1
  cargarPersonajes(paginaActual);
});
selectOrden.addEventListener("change", () => {
  ordenActual = selectOrden.value;
  cargarPersonajes(paginaActual);
});
//funcion para ordenar personajes de a-z por el nomrbe
function ordenarPersonajes(personajes, orden = "az") {
  return personajes.slice().sort((a, b) => {
    if (orden === "az") {
      return a.name.localeCompare(b.name);
    } else if (orden === "za") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });
}

// inicializar la carga de personajes al cargar la pagina
document.addEventListener("DOMContentLoaded", function () {
  cargarPersonajes(paginaActual);

  barraBusqueda.addEventListener("input", () => {
    const texto = barraBusqueda.value.toLowerCase();
    const cards = seccionTarjetas.querySelectorAll(".card");

    // si el texto esta vacio mostramos todas y ocultamos el mensaje
    if (texto === "") {
      cards.forEach((card) => (card.style.display = ""));
      let mensajeNoEncontrado = document.getElementById(
        "mensaje-no-encontrado"
      );
      if (mensajeNoEncontrado) mensajeNoEncontrado.style.display = "none";
      return;
    }

    let hayCoincidencias = false;

    cards.forEach((card) => {
      const nombre = card.querySelector("h3").textContent.toLowerCase();
      if (nombre.includes(texto)) {
        card.style.display = "";
        hayCoincidencias = true;
      } else {
        card.style.display = "none";
      }
    });

    let mensajeNoEncontrado = document.getElementById("mensaje-no-encontrado");
    if (!mensajeNoEncontrado) {
      mensajeNoEncontrado = document.createElement("div");
      mensajeNoEncontrado.id = "mensaje-no-encontrado";
      mensajeNoEncontrado.style.textAlign = "center";
      mensajeNoEncontrado.style.fontWeight = "bold";
      mensajeNoEncontrado.style.color = "red";
      mensajeNoEncontrado.style.marginTop = "1rem";
      mensajeNoEncontrado.textContent = "No se encontró el nombre buscado.";
      seccionTarjetas.parentNode.insertBefore(
        mensajeNoEncontrado,
        seccionTarjetas.nextSibling
      );
    }
    mensajeNoEncontrado.style.display = hayCoincidencias ? "none" : "block";
  });

  mensajeNoEncontrado.style.display = hayCoincidencias ? "none" : "block";
});
function mostrarDetallePersonaje(personaje) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-contenido">
      <span class="cerrar-modal">&times;</span>
      <img src="${personaje.image}" alt="${personaje.name}" />
      <h2>${personaje.name}</h2>
      <p><strong>Estado:</strong> ${personaje.status}</p>
      <p><strong>Especie:</strong> ${personaje.species}</p>
      <p><strong>Tipo:</strong> ${personaje.type || "No especificado"}</p>
      <p><strong>Género:</strong> ${personaje.gender}</p>
      <p><strong>Origen:</strong> ${personaje.origin.name}</p>
      <p><strong>Ubicación actual:</strong> ${personaje.location.name}</p>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".cerrar-modal").addEventListener("click", () => {
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

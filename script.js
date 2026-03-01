const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 25;
canvas.width = 600;
canvas.height = 600;

let serpiente = [{ x: 9 * box, y: 9 * box }];
let direccion = "DERECHA";
let comida = generarComida();
let puntuacion = 0;
let velocidad = 100;
let intervaloJuego;
let estaPausado = false;

const imagenComida = new Image();
imagenComida.src = "comida.png";

const imagenCabeza = new Image();
imagenCabeza.src = "cabeza.png";
document.addEventListener("keydown", function (event) {
  // Prevenir desplazamiento con flechas y espacio
  if (
    ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
      event.code,
    )
  ) {
    event.preventDefault();
  }

  if (event.key === "p" || event.key === "P") {
    togglePausa();
  } else if (event.key === "r" || event.key === "R") {
    reiniciar();
  } else if (event.key === "1") {
    setDificultad(150, "Fácil");
  } else if (event.key === "2") {
    setDificultad(100, "Medio");
  } else if (event.key === "3") {
    setDificultad(50, "Difícil");
  } else {
    cambiarDireccion(event);
  }
});
function comenzarJuego() {
  document.getElementById("pantallaInicio").style.display = "none";

  clearInterval(intervaloJuego);
  iniciarJuego();
}

function cambiarDireccion(event) {
  if (event.keyCode === 37 && direccion !== "DERECHA") direccion = "IZQUIERDA";
  else if (event.keyCode === 38 && direccion !== "ABAJO") direccion = "ARRIBA";
  else if (event.keyCode === 39 && direccion !== "IZQUIERDA")
    direccion = "DERECHA";
  else if (event.keyCode === 40 && direccion !== "ARRIBA") direccion = "ABAJO";
}

function colision(cabeza, array) {
  for (let i = 1; i < array.length; i++) {
    if (cabeza.x === array[i].x && cabeza.y === array[i].y) {
      return true;
    }
  }
  return false;
}

function generarComida() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imagenCabeza, serpiente[0].x, serpiente[0].y, box, box);

  for (let i = 1; i < serpiente.length; i++) {
    ctx.fillStyle = "#3CB371";

    ctx.save();
    ctx.translate(serpiente[i].x + box / 2, serpiente[i].y + box / 2);
    ctx.scale(1, 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, box / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "darkgreen";
    ctx.stroke();
    ctx.restore();
  }

  ctx.drawImage(imagenComida, comida.x, comida.y, box, box);

  let serpienteX = serpiente[0].x;
  let serpienteY = serpiente[0].y;

  if (direccion === "IZQUIERDA") serpienteX -= box;
  if (direccion === "ARRIBA") serpienteY -= box;
  if (direccion === "DERECHA") serpienteX += box;
  if (direccion === "ABAJO") serpienteY += box;

  if (
    serpienteX < 0 ||
    serpienteY < 0 ||
    serpienteX >= canvas.width ||
    serpienteY >= canvas.height
  ) {
    clearInterval(intervaloJuego);

    mostrarGameOver("¡Perdiste! Saliste de los límites.");
    guardarPuntaje(puntuacion);
    return;
  }

  let nuevaCabeza = { x: serpienteX, y: serpienteY };

  if (colision(nuevaCabeza, serpiente)) {
    clearInterval(intervaloJuego);
    mostrarGameOver("¡Perdiste! Te chocaste.");
    guardarPuntaje(puntuacion);
    return;
  }

  if (serpienteX === comida.x && serpienteY === comida.y) {
    comida = generarComida();
    puntuacion += 10;
    document.getElementById("score").innerText = "Puntuación: " + puntuacion;
  } else {
    serpiente.pop();
  }

  if (puntuacion >= 270) {
    clearInterval(intervaloJuego);
    mostrarGameOver("¡Felicidades! Ganaste 🎉");
    guardarPuntaje(puntuacion);
    return;
  }

  serpiente.unshift(nuevaCabeza);
}

function iniciarJuego() {
  intervaloJuego = setInterval(dibujar, velocidad);
}

function togglePausa() {
  if (estaPausado) {
    iniciarJuego();
  } else {
    clearInterval(intervaloJuego);
  }
  estaPausado = !estaPausado;
}

function reiniciar() {
  serpiente = [{ x: 9 * box, y: 9 * box }];
  direccion = "DERECHA";
  comida = generarComida();
  puntuacion = 0;
  document.getElementById("score").innerText = "0"; // Corregido para mostrar solo el número

  clearInterval(intervaloJuego);

  // Si el menú de inicio está visible, no debe iniciar solo
  if (document.getElementById("pantallaInicio").style.display === "none") {
    iniciarJuego();
  }
}
function setDificultad(nuevaVelocidad, nombreDificultad) {
  velocidad = nuevaVelocidad;
  document.getElementById("dificultad").innerText = nombreDificultad;

  // Obtenemos si la pantalla de inicio está visible
  const pantallaInicio = document.getElementById("pantallaInicio");
  const juegoYaEmpezo = pantallaInicio.style.display === "none";

  // Solo reiniciamos el intervalo si el juego ya está corriendo
  if (juegoYaEmpezo) {
    clearInterval(intervaloJuego);
    iniciarJuego();
  } else {
    clearInterval(intervaloJuego);
  }
}

function guardarPuntaje(puntaje) {
  let puntajesGuardados = JSON.parse(localStorage.getItem("puntajes")) || [];
  puntajesGuardados.push(puntaje);
  puntajesGuardados.sort((a, b) => b - a);
  localStorage.setItem("puntajes", JSON.stringify(puntajesGuardados));
  actualizarPuntajes();
}

function actualizarPuntajes() {
  let listaPuntajes = document.getElementById("listaPuntajes");
  listaPuntajes.innerHTML = "";

  let puntajes = JSON.parse(localStorage.getItem("puntajes")) || [];
  puntajes.forEach(function (puntaje) {
    let li = document.createElement("li");
    li.textContent = "Puntaje: " + puntaje;
    listaPuntajes.appendChild(li);
  });
}

function limpiarPuntajes() {
  localStorage.removeItem("puntajes");
  actualizarPuntajes();
}

window.onload = function () {
  document.getElementById("imagenInicial").style.display = "block";
  actualizarPuntajes();
};

const botones = document.querySelectorAll(".btn-control");

botones.forEach((boton) => {
  boton.addEventListener("touchstart", manejarDireccion);
  boton.addEventListener("click", manejarDireccion); // también funciona en desktop
});

function manejarDireccion(e) {
  const direccion = e.target.dataset.dir;

  const evento = new KeyboardEvent("keydown", {
    key:
      direccion === "up"
        ? "ArrowUp"
        : direccion === "down"
          ? "ArrowDown"
          : direccion === "left"
            ? "ArrowLeft"
            : "ArrowRight",
  });

  document.dispatchEvent(evento);
}

function mostrarGameOver(mensaje) {
  clearInterval(intervaloJuego);

  document.getElementById("mensajeFinal").innerText = mensaje;
  document.getElementById("puntajeFinal").innerText =
    "Puntaje final: " + puntuacion;

  document.getElementById("pantallaGameOver").style.display = "flex";

  guardarPuntaje(puntuacion);
}

function reiniciarDesdeGameOver() {
  document.getElementById("pantallaGameOver").style.display = "none";
  reiniciar();
}

// Evitar que las flechas muevan la barra de desplazamiento del navegador
window.addEventListener(
  "keydown",
  function (e) {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        e.code,
      ) > -1
    ) {
      e.preventDefault();
    }
  },
  false,
);

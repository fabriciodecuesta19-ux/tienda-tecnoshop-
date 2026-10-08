/* =========================================================
   script.js — Toda la interactividad del sitio TecnoShop
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  iniciarContadorCarrito();
  iniciarRegistro();
  iniciarVerMas();
  iniciarCatalogo();
  iniciarCarrito();
  iniciarBusqueda();
});

/* =========================================================
   1. CONTADOR DEL CARRITO (se muestra en el menú)
   ========================================================= */
const CLAVE_CONTADOR = 'tecnoshop_contador';

function leerContador() {
  const valor = parseInt(localStorage.getItem(CLAVE_CONTADOR) || '0', 10);
  return isNaN(valor) ? 0 : valor;
}

function escribirContador(n) {
  localStorage.setItem(CLAVE_CONTADOR, String(n));
  pintarContador();
}

function pintarContador() {
  const badge = document.getElementById('contador-carrito');
  if (badge) {
    badge.textContent = leerContador();
  }
}

function iniciarContadorCarrito() {
  pintarContador();
}

/* =========================================================
   2. REGISTRO
   ========================================================= */
function iniciarRegistro() {
  const form = document.getElementById('form-registro');
  if (!form) return;

  const terminos = document.getElementById('terminos');
  const boton = document.getElementById('btn-registrar');
  const mensaje = document.getElementById('mensaje-registro');

  terminos.addEventListener('change', function () {
    boton.disabled = !terminos.checked;
  });

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    mensaje.textContent = '';
    mensaje.classList.remove('error', 'exito');

    const nombre   = document.getElementById('nombre').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const fecha    = document.getElementById('fecha').value;
    const telefono = document.getElementById('telefono').value.trim();

    const faltantes = [];
    if (nombre === '')   faltantes.push('Nombre completo');
    if (email === '')    faltantes.push('Correo electrónico');
    if (password === '') faltantes.push('Contraseña');
    if (fecha === '')    faltantes.push('Fecha de nacimiento');
    if (telefono === '') faltantes.push('Teléfono');

    if (faltantes.length > 0) {
      mostrarMensaje(mensaje, 'Faltan completar: ' + faltantes.join(', ') + '.', 'error');
      return;
    }

    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(email)) {
      mostrarMensaje(mensaje, 'El correo no es válido. Ejemplo: ana@correo.com', 'error');
      return;
    }

    if (password.length < 6) {
      mostrarMensaje(mensaje, 'La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    const regexTel = /^[0-9]{10}$/;
    if (!regexTel.test(telefono)) {
      mostrarMensaje(mensaje, 'El teléfono debe tener exactamente 10 dígitos.', 'error');
      return;
    }

    if (!terminos.checked) {
      mostrarMensaje(mensaje, 'Debes aceptar los términos y condiciones.', 'error');
      return;
    }

    mostrarMensaje(mensaje, '¡Registro exitoso, ' + nombre + '! Bienvenido a TecnoShop.', 'exito');
    form.reset();
    boton.disabled = true;
  });
}

function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.classList.remove('error', 'exito');
  elemento.classList.add(tipo);
}

/* =========================================================
   3. QUIÉNES SOMOS — botón "Ver más"
   ========================================================= */
function iniciarVerMas() {
  const boton = document.getElementById('btn-ver-mas');
  if (!boton) return;

  const infoExtra = document.getElementById('info-extra');

  boton.addEventListener('click', function () {
    const estaOculto = infoExtra.hasAttribute('hidden');

    if (estaOculto) {
      infoExtra.removeAttribute('hidden');
      boton.textContent = 'Ver menos';
    } else {
      infoExtra.setAttribute('hidden', '');
      boton.textContent = 'Ver más';
    }
  });
}

/* =========================================================
   4. CATÁLOGO — Agregar al carrito
   ========================================================= */
function iniciarCatalogo() {
  const botones = document.querySelectorAll('.btn-agregar');
  if (botones.length === 0) return;

  const aviso = document.getElementById('aviso-catalogo');

  botones.forEach(function (boton) {
    boton.addEventListener('click', function () {
      const nombreProducto = boton.dataset.nombre;
      const nuevoTotal = leerContador() + 1;
      escribirContador(nuevoTotal);

      if (aviso) {
        mostrarMensaje(
          aviso,
          '✔ "' + nombreProducto + '" se agregó al carrito. Productos en el carrito: ' + nuevoTotal,
          'exito'
        );
      }
    });
  });
}

/* =========================================================
   5. CARRITO DE COMPRA — recalcular total
   ========================================================= */
function iniciarCarrito() {
  const tabla = document.getElementById('tabla-carrito');
  if (!tabla) return;

  const cantidades = tabla.querySelectorAll('.cantidad');

  cantidades.forEach(function (input) {
    input.addEventListener('input', recalcularTotal);
    input.addEventListener('keydown', bloquearNoNumericos);
    input.addEventListener('blur', function () {
      if (input.value === '' || parseInt(input.value, 10) < 0) {
        input.value = 0;
        recalcularTotal();
      }
    });
  });

  recalcularTotal();
}

function bloquearNoNumericos(evento) {
  const permitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
                      'Tab', 'Home', 'End', 'Enter'];
  if (permitidas.indexOf(evento.key) !== -1) return;
  if (!/^[0-9]$/.test(evento.key)) {
    evento.preventDefault();
  }
}

function recalcularTotal() {
  const filas = document.querySelectorAll('#tabla-carrito tbody tr');
  let total = 0;

  filas.forEach(function (fila) {
    const precio = parseFloat(fila.dataset.precio);
    const input = fila.querySelector('.cantidad');
    let cantidad = parseInt(input.value, 10);

    if (isNaN(cantidad) || cantidad < 0) {
      cantidad = 0;
      input.value = 0;
    }

    const subtotal = precio * cantidad;
    fila.querySelector('.subtotal').textContent = formatearMoneda(subtotal);
    total += subtotal;
  });

  document.getElementById('total-carrito').textContent = formatearMoneda(total);
}

function formatearMoneda(numero) {
  const texto = numero.toFixed(2);
  return '$' + texto.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* =========================================================
   6. BÚSQUEDA DE PRODUCTOS
   ========================================================= */
const PRODUCTOS_FICTICIOS = [
  { nombre: 'Camisa casual de algodón', precio: 299.00 },
  { nombre: 'Camisa de vestir slim fit', precio: 449.00 },
  { nombre: 'Audífonos Bluetooth', precio: 249.90 },
  { nombre: 'Mochila urbana', precio: 450.00 },
  { nombre: 'Reloj inteligente', precio: 899.00 },
  { nombre: 'Mouse inalámbrico', precio: 189.50 }
];

function iniciarBusqueda() {
  const form = document.getElementById('form-busqueda');
  if (!form) return;

  const campo = document.getElementById('campo-busqueda');
  const resultados = document.getElementById('resultados');

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const texto = campo.value.trim();
    resultados.innerHTML = '';

    if (texto === '') {
      const aviso = document.createElement('p');
      aviso.className = 'mensaje error';
      aviso.textContent = 'Escribe algo para poder buscar.';
      resultados.appendChild(aviso);
      return;
    }

    const titulo = document.createElement('h3');
    titulo.textContent = 'Resultados para la búsqueda de ' + texto;
    resultados.appendChild(titulo);

    const lista = document.createElement('ul');
    lista.className = 'lista-resultados';

    PRODUCTOS_FICTICIOS.forEach(function (producto) {
      const item = document.createElement('li');

      const nombre = document.createElement('strong');
      nombre.textContent = producto.nombre;

      const precio = document.createElement('span');
      precio.className = 'precio';
      precio.textContent = formatearMoneda(producto.precio);

      item.appendChild(nombre);
      item.appendChild(precio);
      lista.appendChild(item);
    });

    resultados.appendChild(lista);
  });
}
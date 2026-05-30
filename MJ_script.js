import { datosUE } from "./data/uecountries.js";

const ESTILO_RADIO = `radio-btn`;

function formatearPoblacion(num) {
    return num.toLocaleString("es-ES");
}

function formatearFecha(fecha) {
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
}

function ordenarPorPoblacion(listaPaises) {
    return [...listaPaises].sort((a, b) => b.poblacion_nacional - a.poblacion_nacional);
}

function mediaPoblacion(listaPaises = datosUE) {
    return listaPaises.reduce((accum, p) => accum + p.poblacion_nacional, 0) / listaPaises.length;
}

function cargarPaises(listaPaises) {
    const tbody = document.getElementById("cuerpoTabla");
    const lista = ordenarPorPoblacion(listaPaises); // siempre descendente
    const media = mediaPoblacion(listaPaises);

    tbody.innerHTML = lista.map(country => {
        let esMonarquia = country.regimen_politico.tipo.includes("Monarquía");
        let esMayorMedia = country.poblacion_nacional > media;

        return `
        <tr data-nombre="${country.pais}">
            <td style="${esMayorMedia ? "font-weight:bold; color:green" : ""}">
                ${country.pais} ${esMonarquia ? "👑" : ""}
            </td>
            <td>${country.capital}</td>
            <td>${formatearPoblacion(country.poblacion_nacional)}</td>
            <td>${formatearFecha(country.fecha_adhesion)}</td>
        </tr>
        `;
    }).join("");
}

function totalPoblacion(listaPaises) {
    const total = listaPaises.reduce((acc, p) => acc + p.poblacion_nacional, 0);
    document.getElementById("poblacion_total").textContent =
        `(${formatearPoblacion(total)} total UE)`;
    return total;
}

function actualizarBadge(idioma, esOficial, listaPaises) {
    const badge = document.getElementById("badge-filtro");
    const total = listaPaises.length;
    if (idioma === "ninguno") {
        badge.textContent = `Se muestran los ${total} países de la UE`;
    } else {
        const tipo = esOficial ? "oficial" : "no oficial";
        badge.textContent = `Filtrado por: "${idioma}" (${tipo}) (${total} de 27)`;
    }
}

function obtenerIdiomas(listaPaises = datosUE, tipo = "todos") {
    let todosLosIdiomas = new Set();
    listaPaises.forEach(pais => {
        if (tipo === "todos" || tipo === "oficiales") {
            pais.idiomas.oficial.split(",").forEach(idioma => {
                todosLosIdiomas.add(idioma.trim().toLowerCase());
            });
        }
        if ((tipo === "todos" || tipo === "otros") && pais.idiomas.otros_idiomas) {
            pais.idiomas.otros_idiomas.split(",").forEach(idioma => {
                todosLosIdiomas.add(idioma.trim().toLowerCase());
            });
        }
    });
    return [...todosLosIdiomas].sort();
}

function crearRadios(listaIdiomas, soloOficiales = false) {
    const tipo = soloOficiales ? "oficiales" : "todos";
    const idiomas = obtenerIdiomas(listaIdiomas, tipo);

    let html = `
        <label class="${ESTILO_RADIO}">
            <input type="radio" name="idioma" value="ninguno" id="ninguno" checked>
            <span>Ninguno</span>
        </label>
    `;

    html += idiomas.map(idioma => `
        <label class="${ESTILO_RADIO}" for="${idioma}">
            <input type="radio" name="idioma" value="${idioma}" id="${idioma}">
            <span>${idioma}</span>
        </label>
    `).join("");

    return html;
}

function filtrarPorIdioma(idioma, esOficial = true, listaAFiltrar) {
    if (idioma === "ninguno") return [...listaAFiltrar];
    let tipoIdioma = esOficial ? "oficial" : "otros_idiomas";
    return listaAFiltrar.filter(pais => {
        if (pais.idiomas[tipoIdioma] == null) return false;
        return pais.idiomas[tipoIdioma]
            .split(",")
            .map(i => i.trim().toLowerCase())
            .includes(idioma);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarPaises(datosUE);
    totalPoblacion(datosUE);
    actualizarBadge("ninguno", false, datosUE);

    const radioContainer = document.getElementById("radioIdiomas");
    radioContainer.innerHTML = crearRadios(datosUE);

    // Cambio de radio
    radioContainer.addEventListener("change", e => {
        const idioma = e.target.value;
        const esOficial = document.getElementById("idiomaOficial").checked;
        const lista = filtrarPorIdioma(idioma, esOficial, datosUE);
        cargarPaises(lista);
        actualizarBadge(idioma, esOficial, lista);
    });

    // Cambio del checkbox "Solo idiomas oficiales"
    document.getElementById("idiomaOficial").addEventListener("change", e => {
        const soloOficiales = e.target.checked;
        // Regenerar radios según el nuevo tipo
        radioContainer.innerHTML = crearRadios(datosUE, soloOficiales);
        // Volver a "Ninguno" y mostrar todos
        cargarPaises(datosUE);
        actualizarBadge("ninguno", soloOficiales, datosUE);
    });
});
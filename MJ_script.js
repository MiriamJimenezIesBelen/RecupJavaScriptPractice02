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
    return listaPaises.reduce((accum, p) => accum + p.poblacion_nacional, 0) / listaPaises.length
}

function cargarPaises(listaPaises) {
    const tbody = document.getElementById("cuerpoTabla");

    let media = mediaPoblacion(listaPaises);

    tbody.innerHTML = listaPaises.map(country => {
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





document.addEventListener("DOMContentLoaded", () => {
    const listaOrdenada = ordenarPorPoblacion(datosUE);

    cargarPaises(listaOrdenada);
    totalPoblacion(datosUE);

    const radioContainer = document.getElementById("radioIdiomas");
    radioContainer.innerHTML = crearRadios(datosUE);


});


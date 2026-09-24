const inputLugar = document.getElementById("lugar");
const botonBuscar = document.getElementById("search");
const resultados = document.getElementById("resultados");

async function buscarLugar() {
    const lugar = inputLugar.value.trim();

    if (!lugar) {
        resultados.innerHTML = `<p class="mensaje-alerta">Por favor, ingresa un nombre válido.</p>`;
        return;
    }

    // Mensaje durante la consulta
    resultados.innerHTML = `<p class="mensaje-info">Consultando información del lugar...</p>`;

    try {
        // Consulta 1: Datos de geolocalización
        const resGeocoding = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(lugar)}&count=1&language=es&format=json`
        );

        if (!resGeocoding.ok) {
            throw new Error("Error en el servidor de geolocalización.");
        }

        const dataGeocoding = await resGeocoding.json();

        if (!dataGeocoding.results || dataGeocoding.results.length === 0) {
            resultados.innerHTML = `<p class="mensaje-alerta">No se encontraron resultados para "${lugar}".</p>`;
            return;
        }

        const ciudad = dataGeocoding.results[0];

        // Consulta 2 (Dato adicional): Clima actual
        let climaTexto = "No disponible";
        try {
            const resClima = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${ciudad.latitude}&longitude=${ciudad.longitude}&current_weather=true`
            );
            if (resClima.ok) {
                const dataClima = await resClima.json();
                if (dataClima.current_weather) {
                    climaTexto = `${dataClima.current_weather.temperature} °C (Viento: ${dataClima.current_weather.windspeed} km/h)`;
                }
            }
        } catch (e) {
            console.warn("No se pudo obtener el clima:", e);
        }

        // Renderizado de resultados
        resultados.innerHTML = `
            <h2>${ciudad.name}</h2>
            <ul>
                <li><strong>País:</strong> ${ciudad.country || "No disponible"}</li>
                <li><strong>Estado:</strong> ${ciudad.admin1 || "No disponible"}</li>
                <li><strong>Latitud:</strong> ${ciudad.latitude}</li>
                <li><strong>Longitud:</strong> ${ciudad.longitude}</li>
                <li><strong>Zona Horaria:</strong> ${ciudad.timezone || "No disponible"}</li>
                <li><strong>Elevación:</strong> ${ciudad.elevation ? ciudad.elevation + " msnm" : "No disponible"}</li>
                <li><strong>Clima Actual:</strong> ${climaTexto}</li>
            </ul>
        `;

    } catch (error) {
        console.error(error);
        resultados.innerHTML = `<p class="mensaje-error">Ocurrió un error al obtener la información. Inténtalo de nuevo más tarde.</p>`;
    }
}

// Event Listeners
botonBuscar.addEventListener("click", buscarLugar);

inputLugar.addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarLugar();
});
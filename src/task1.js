const fs = require('fs');
const csv = require('csv-parser');

const directorio = 'data/';

const archivoCSV = 'order.csv';

const rutaCompleta = directorio + archivoCSV;

if (fs.existsSync(rutaCompleta)) {
    const stream = fs.createReadStream(rutaCompleta)
        .pipe(csv());

    // Manejar cada línea del archivo CSV
    stream.on('data', (linea) => {
        // Acceder a la información de cada línea
        console.log('Información de la línea:', linea);
    });

    // Manejar el final del archivo
    stream.on('end', () => {
        console.log('Lectura del archivo CSV completada.');
    });
} else {
    console.log('El archivo CSV no existe.');
}

const fs = require('fs');
const csv = require('csv-parser');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const dataDirectory = 'data/';
const resultFolderPath = 'result/';
const resultFile = resultFolderPath + 'order_prices.csv';
const productsFile = 'products.csv';
const ordersFile = 'orders.csv';
const productsPath = dataDirectory + productsFile;
const ordersPath = dataDirectory + ordersFile;

const orders = [];
const products = {};

// checks if the file exists
if (fs.existsSync(productsPath)) {
    fs.createReadStream(productsPath)
        .pipe(csv())
        .on('data', (order) => {
            products[order.id] = parseFloat(order.cost); // creates an object 'products' were we have the id linked with its cost
        })
        .on('end', () => {
            if (fs.existsSync(ordersPath)) {
                fs.createReadStream(ordersPath)
                    .pipe(csv())
                    .on('data', (order) => {
                        const orderProducts = order.products.split(' ').map((productId) => parseFloat(productId)); // creates an array where are all the products bought in that order
                        const orderCost = orderProducts.reduce((totalCost, productId) => totalCost + products[productId], 0); // sum of all product prices
                        orders.push({ id: order.id, euros: orderCost });
                    })
                    .on('end', () => {
                        // If the directory doesn't exist it will be created
                        if (!fs.existsSync(resultFolderPath))
                            fs.mkdirSync(resultFolderPath, { recursive: true }); // if there are more directories inside it will create all ones

                        // checks if the file exists
                        const fileExists = fs.existsSync(resultFile);

                        const csvWriterOrders = csvWriter({
                            path: resultFile,
                            header: [{ id: 'id', title: 'id' }, { id: 'euros', title: 'euros' }],
                            append: fileExists // If the file exists won't add headers
                        });

                        csvWriterOrders.writeRecords(orders)
                            .then(() => console.log('[+] Order Prices written successfully'));
                    });
            } else
                console.log(`[-] File ${ordersFile} not found`);
        });
} else
    console.log(`[-] File ${productsFile} not found`);


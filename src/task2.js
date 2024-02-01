const fs = require('fs');
const csv = require('csv-parser');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const dataDirectory = 'data/';
const resultFolderPath = 'result/';
const resultFile = resultFolderPath + 'product_customers.csv';
const ordersFile = 'orders.csv';
const ordersPath = dataDirectory + ordersFile;

const productCustomers = {};

if (fs.existsSync(ordersPath)) {
    fs.createReadStream(ordersPath)
        .pipe(csv())
        .on('data', (order) => {
            const orderProducts = order.products.split(' '); // array with the order's products

            orderProducts.forEach((productId) => {
                // if the productId is not in the list it will be created an empty array linked with that productId
                if (!productCustomers[productId])
                    productCustomers[productId] = []

                // If productId's customer array doesn't include the customer that done the order it will be insert in the array
                if (!productCustomers[productId].includes(order.customer))
                    productCustomers[productId].push(order.customer);
            })
        })
        .on('end', () => {
            const csvWriterProductCustomers = csvWriter({
                path: resultFile,
                header: [{ id: 'id', title: 'id' }, { id: 'customer_ids', title: 'customer_ids' }],
                append: false, // Always has to write the headers bc it's a new file
            });

            const records = Object.keys(productCustomers).map((productId) => ({
                id: productId,
                customer_ids: productCustomers[productId].join(' ') // list of all the customersId joined by a " "
            }));

            csvWriterProductCustomers.writeRecords(records)
                .then(() => console.log('[+] Product Customers written successfully'));
        });
} else
    console.log(`[-] File ${ordersFile} not found`);

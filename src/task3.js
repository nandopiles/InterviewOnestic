const fs = require('fs');
const csv = require('csv-parser');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const dataDirectory = 'data/';
const resultFolderPath = 'result/';
const resultFile = resultFolderPath + 'customer_ranking.csv';
const customersFile = 'customers.csv';
const productsFile = 'products.csv';
const ordersFile = 'orders.csv';
const customersPath = dataDirectory + customersFile;
const productsPath = dataDirectory + productsFile;
const ordersPath = dataDirectory + ordersFile;

const customers = {};
const products = {};

if (fs.existsSync(customersPath)) {
    fs.createReadStream(customersPath)
        .pipe(csv())
        .on('data', (customer) => {
            // saves into the customers object a customer by his id with his info and a counter of how much money has he spent
            customers[customer.id] = {
                id: customer.id,
                firstname: customer.firstname,
                lastname: customer.lastname,
                total_euros: 0
            }
        })
        .on('end', () => {
            if (fs.existsSync(productsPath)) {
                fs.createReadStream(productsPath)
                    .pipe(csv())
                    .on('data', (product) => {
                        products[product.id] = parseFloat(product.cost) // saves the cost of each product linked with its id
                    })
                    .on('end', () => {
                        if (fs.existsSync(ordersPath)) {
                            fs.createReadStream(ordersPath)
                                .pipe(csv())
                                .on('data', (order) => {
                                    const orderProducts = order.products.split(' ').map((productId) => parseFloat(productId)); // creates an array where are all the products bought in that order
                                    const orderCost = orderProducts.reduce((totalCost, productId) => totalCost + products[productId], 0); // sum of all product prices
                                    customers[order.customer].total_euros += orderCost; // increment the total with the new cost 
                                })
                                .on('end', () => {
                                    // Sort customers by total_euros in descending order
                                    const sortedCustomers = Object.values(customers).sort((a, b) => b.total_euros - a.total_euros);

                                    const csvWriterCustomers = csvWriter({
                                        path: resultFile,
                                        header: [
                                            { id: 'id', title: 'id' },
                                            { id: 'firstname', title: 'firstname' },
                                            { id: 'lastname', title: 'lastname' },
                                            { id: 'total_euros', title: 'total_euros' },
                                        ],
                                        append: false, // Always has to write the headers bc it's a new file
                                    });

                                    csvWriterCustomers.writeRecords(sortedCustomers)
                                        .then(() => console.log('[+] Customer Ranking written successfully'));
                                });
                        } else
                            console.log(`[-] File ${ordersFile} not found`);
                    });
            } else
                console.log(`[-] File ${productsFile} not found`);
        });
} else
    console.log(`[-] File ${customersFile} not found`);

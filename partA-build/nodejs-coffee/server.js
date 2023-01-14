'use strict'

// load packages
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

// connection 
const PORT = 8080;

const app = express();

const conn = mysql.createConnection({
    host: 'mysql1',
    user: 'root',
    password: 'admin',
    database: 'kohi_shop_db'
});

conn.connect( (err) => {
    if( err ) {
        console.log(err);
    } else {
        console.log("Connected to the kohi_shop_db database");
    }
});

// Static
app.use(express.static(path.join(__dirname, 'public')));        // Get the index.html
app.use(bodyParser.urlencoded({ extended: true }));             // JSON.

// #################################### FUNCTIONS ####################################

/**
 * 
 * @param {*} prod_id 
 */
function getProduct(prod_id) {
    return new Promise( (resolve, rejects) => {
        var sql =  `SELECT * FROM products WHERE prod_id=${prod_id}`;

        conn.query(sql, (err, result) => {
            if(err) {
                console.log(err.sqlMessage);
                console.log("getProduct() \t: FAILED to get products table!");
                rejects("Fails");
            }
            else {
                resolve(result);
            }
        });
    });
}

/**
 * 
 * @param {*} total_price 
 * @param {*} array 
 * @param {*} res 
 */
async function InsertDBpending(total_price, arrayNames, res) {
    var quantityDrinks = {};
    arrayNames.forEach( function(x) {
        quantityDrinks[x] = (quantityDrinks[x] || 0) + 1;
    });

    const purchasedOrder = function(arrayNames) {
        return new Promise( (resolve, rejects) => {
            var sql = "SELECT prod_id, drink_name FROM products WHERE drink_name IN (";

            for (var i = 0; i < arrayNames.length; i++ ) {
                var name = arrayNames[i];
                sql += `"${name}",`;
            }
            sql = sql.slice(0, sql.lastIndexOf(','));
            sql += ")";

            conn.query(sql, (err, result, fields) => {
                if(err) {
                    console.log(err.sqlMessage);
                    console.log("makeQuery() \t: FAILED to insert the data to order table!");
                    rejects("Fail");
                }
                else {
                    resolve(result);
                }
            });
        });
    }

    var listDB = await purchasedOrder(arrayNames);
    if( listDB == "Fail" ) {
        res.send("Fail");
    }

    var listStr_id = "";
    for( var i = 0; i < listDB.length; i++ ) {
        var id = listDB[i].prod_id;
        listStr_id += `${id},`;
        var prod_name = listDB[i].drink_name;
        if( quantityDrinks[prod_name] >= 2) {
            var strID = `${id},`;
            listStr_id += strID.repeat(quantityDrinks[prod_name]-1);
        }
    }
    listStr_id = listStr_id.slice(0, listStr_id.lastIndexOf(','));

    var time = new Date().toUTCString();
    var sql = `INSERT INTO pending (list_prod, total_price, timestamp) VALUE ("${listStr_id}", "${total_price}", "${time}")`;
    conn.query(sql, function(err, result) {
        if(err) {
            console.log(err.sqlMessage);
            console.log("InsertDBpending() \t: FAILED to insert the data to pending table!");
            res.send("Fail");
        }
        else {
            console.log("InsertDBpending() \t: SUCCESS of inserting data to pending table!");
            res.send("Success");
        }
    });
}   

/**
 * 
 * @param {*} drink 
 * @param {*} category 
 * @param {*} price 
 */
function InsertDBproduct(item, price, pic, res) {
    var sql = `INSERT INTO products (drink_name, price, pic_src) VALUE("${item}", ${price}, "${pic}")`;

    // Insert the data to table menu_coffee.
    conn.query(sql, function(err, result) {
        if( err ) {
            console.log(err.sqlMessage);
            console.log("InsertDBproduct() \t: FAILED to insert the data to product table!");
            res.send("Fail")
        }
        else {
            console.log("InsertDBproduct() \t: SUCCESS of inserting data to products table!");
            res.send("Success");
        }
    });
}

/**
 * 
 * @param {*} drink 
 * @param {*} category 
 */
function DeleteDBproduct(item, res) {
    var sql = `DELETE FROM products WHERE drink_name="${item}"`;

    // Delete the data to table menu_coffee.
    conn.query(sql, function(err) {
        if( err ) {
            console.log(err.sqlMessage);
            console.log("DeleteDBproduct() \t: FAILED to delete the data to menu_coffee table!");
            res.send("Fail")
        }
        else {
            console.log("DeleteDBproduct() \t: SUCCESS of deleting data!");
            res.send("Success");
        }
    });
}

/**
 * 
 * @param {*} res 
 */
function getDBmenu(res) {
    var sql = "SELECT * FROM products";

    conn.query(sql, function(err, result, fields) {
        if( err ) {
            console.log(err.sqlMessage);
            console.log("getDBmenu() \t: FAILED to get the data to products table!");
            res.send("Fail");
        }
        else {
            console.log("getDBmenu() \t: SUCCESS of getting data!");
            res.json(result);
        }
    });
}

/**
 * 
 * @param {*} res 
 */
async function getDBpending(res) {
    const pendingOrder = function() {
        return new Promise( (resolve, rejects) => {
            var sql = "SELECT pending.list_prod FROM pending";
            
            conn.query(sql, (err, result) => {
                if(err) {
                    console.log(err.sqlMessage);
                    console.log("pendingOrder() \t: FAILED to get the list_prod from pending table!");
                    rejects("Fail");
                }
                else {
                    resolve(result);
                }
            });
        });
    };

    var list_pending = await pendingOrder();
    if( list_pending == "Fail") {
        res.send("Fail");
    }
    else if( list_pending.length == 0 ) {
        res.send("Empty");
    } 
    else {
        var listOfProd = list_pending[0].list_prod.split(',');
        
        var returnJSON = { 'Products' : [] }

        for( var i = 0; i < listOfProd.length; i++ ) {  
            var productRow = await getProduct(listOfProd[i]);

            if( productRow.length == 0 ) {
                console.log("ERROR: There are no product found!");
                res.send("Fail");
            }
            
            var prodJSON = {
                'drink_name' : productRow[0].drink_name,
                'price'      : productRow[0].price,
                'pic_src'    : productRow[0].pic_src
            }

            returnJSON.Products.push(prodJSON)
        }

        res.json(returnJSON);
    }
}

async function completedOrder(res) {
    const getPending = function() {
        return new Promise( (resolve, rejects) => {
            var sql = "SELECT * FROM pending LIMIT 1";
            
            conn.query(sql, (err, result) => {
                if(err) {
                    console.log(err.sqlMessage);
                    console.log("getPending() \t: FAILED to get the row from the table!");
                    rejects("Fails");
                }
                else {
                    resolve(result[0]);
                }
            });
        });
    }

    var pendingRow = await getPending();
    if( pendingRow == "Fail" ) {
        res.send("Fail");
    }

    var sql = `INSERT INTO orders (list_prod, total_price, timestamp) VALUE("${pendingRow.list_prod}", "${pendingRow.total_price}", "${pendingRow.timestamp}")`;
    
    conn.query(sql, (err, result) => {
        if(err) {
            console.log(err.sqlMessage);
            console.log("completedOrder() \t: FAILED to insert the data to the table!");
            res.send("Fail");
        }
        else {
            console.log("completedOrder() \t: SUCCESS of inserting data!");

            var sql2 = `DELETE FROM pending LIMIT 1`;
            conn.query(sql2, (err, result) => {
                if(err) {
                    console.log(err.sqlMessage);
                    console.log("completedOrder() \t: FAILED to delete the data in pending!");
                    res.send("Fail");
                }
                else {
                    console.log("completedOrder() \t: SUCCESS of deleting data!");
                    res.send("Success");
                }
            });
        }
    })
}

function cancelPendingOrder(res) {
    var sql = "DELETE FROM pending LIMIT 1";

    conn.query(sql, (err, result) => {
        if(err) {
            console.log(err.sqlMessage);
            console.log("cancelPendingOrder() \t: FAILED to cancel pending order!");
            res.send("Fail");
        }
        else {
            console.log("cancelPendingOrder() \t: SUCCESS of deleting data!");
            res.send("Success");
        }
    });
}

function getDBorders(res) {
    var sql1 = "SELECT * FROM orders";

    conn.query(sql1, async (err, resultORDER) => {
        if(err) {
            console.log(err.sqlMessage);
            console.log("getDBorders() \t: FAILED to get orders!");
            res.send("Fail");
        }
        else {
            console.log("getDBorder() \t: SUCCESS of get data!");

            var returnJSON = { 'Orders' : [] }
            
            if( resultORDER.length == 0 ) {
                res.send("Empty");
            }
            else {
                for( var i = 0; i < resultORDER.length; i++ ) {
                    var orderRow = resultORDER[i];

                    var createJSON = { 
                        'Products' : [],
                        'total_price' : orderRow.total_price,
                        'timestamp' : orderRow.timestamp
                    }

                    var listOfProd = orderRow.list_prod.split(',');
                    for( var j = 0; j < listOfProd.length; j++ ) {
                        var productRow = await getProduct(listOfProd[j]);
                        if( productRow.length == 0 ) {
                            console.log("ERROR: There are no product found!");
                            res.send("Fail");
                        }

                        var prodJSON = {
                            'drink_name' : productRow[0].drink_name,
                            'price'      : productRow[0].price,
                            'pic_src'    : productRow[0].pic_src
                        }

                        createJSON.Products.push(prodJSON);
                    }

                    returnJSON.Orders.push(createJSON);
                }
                res.json(returnJSON);
            }
        }
    });
}

// ##################################### METHODS #####################################

app.get("/employee", (req, res) => {
    res.sendFile(path.join(__dirname, "/page/employee.html"));
});

app.post("/insertmenu", (req, res) => {
    var item = req.body.item;
    var price = req.body.price;
    var pic = req.body.picture;
    
    InsertDBproduct(item, price, pic, res);
});

app.post("/deletemenu", (req, res) => {
    var item = req.body.item;

    DeleteDBproduct(item, res);
});

app.get("/customer", (req, res) => {
    res.sendFile(path.join(__dirname, "/page/customer.html"));
});

app.post("/posting", (req, res) => {
    getDBmenu(res);
}); 

app.post("/purchased", (req, res) => {
    var total_price = req.body.total;
    var arrayString = req.body.record;
    var array = arrayString.split(", ");
    console.log(total_price, array);
    
    InsertDBpending(total_price, array, res);
});

app.get("/pending-order", (req, res) => {
    res.sendFile(path.join(__dirname, "/page/pending-order.html"));
});

app.post("/pending-order", (req, res) => {
    getDBpending(res);
});

app.get("/completed-order", (req, res) => {
    res.sendFile(path.join(__dirname, "/page/orderhistory.html"));
});

app.post("/completed-order", (req, res) => {
    completedOrder(res);
});

app.post("/cancel-order", (req, res) => {
    cancelPendingOrder(res);
});

app.post("/order-history", (req, res) => {
    getDBorders(res);
});

app.listen(PORT, () => {
    console.log("Running server on PORT: 8080");
});

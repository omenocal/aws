var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var carNumberId = 0;
var numberOfItemToExport = process.argv[2];

if(numberOfItemToExport !== undefined) {
  numberOfItemToExport = numberOfItemToExport * 500;
} else {
  numberOfItemToExport = 500;
}

var init = numberOfItemToExport - 500;

var allItems = JSON.parse(fs.readFileSync('json_custom_export_final.json', 'utf8'));

console.log("Importing 500 items out of " + allItems.length + " into DynamoDB. Extra info: init = " + init + " numberOfItemToExport = " + numberOfItemToExport);

if (fs.existsSync('LIST_OF_BRANDS')) {
  fs.unlinkSync('LIST_OF_BRANDS');
  fs.unlinkSync('LIST_OF_MODELS');
}


if(numberOfItemToExport > allItems.length) {
  numberOfItemToExport = allItems.length;
}

insertItems(init, numberOfItemToExport, allItems);

function insertItems(i, numberOfItemToExport, allItems) {
    if(i >= numberOfItemToExport) {
        return;
    }

    var car = allItems[i];

    var scanParams = {
        TableName: "Cars",
        ProjectionExpression: "#brand, #model, #year",
        FilterExpression: "#brand = :brand AND #model = :model AND #year = :year",
        ExpressionAttributeNames: {
            "#brand": "Brand",
            "#model": "Model",
            "#year": "Year"
        },
        ExpressionAttributeValues: {
            ":brand": car.marca.toLowerCase(),
            ":model": car.modelo.toLowerCase(),
            ":year": "" + car.anio
        }
    };

    docClient.scan(scanParams, function (errorScan, dataScan) {
        if (errorScan) {
            console.error("Unable to scan item", car.marca + "-" + car.modelo + "-" + car.anio,
                                    ". Error JSON:", JSON.stringify(errorScan, null, 2));
            insertItems(i + 1, numberOfItemToExport, allItems);
        } else {
            console.log("JSON.stringify(dataScan) = " + JSON.stringify(dataScan));

            if(dataScan && dataScan.Items.length > 0) {
                console.log("Item already in DynamoDB[" + i + "]:", car.marca + "-" + car.modelo + "-" + car.anio);
            } else {
                var params = {
                    TableName: "Cars",
                    Item: {
                        "CarId": "" + i,
                        "Brand": car.marca.toLowerCase(),
                        "Model": car.modelo.toLowerCase(),
                        "Year": car.anio,
                        "Battery": car.items
                    }
                };

                docClient.put(params, function(err, data) {
                   if (err) {
                       console.error("Unable to add item", car.marca + "-" + car.modelo + "-" + car.anio,
                                    ". Error JSON:", JSON.stringify(err, null, 2));
                       return;
                   } else {
                       console.log("PutItem succeeded[" + i + "]:", car.marca + "-" + car.modelo + "-" + car.anio);
                   }
                });
            }

            insertItems(i + 1, numberOfItemToExport, allItems);
        }
    });

    fs.appendFile('LIST_OF_BRANDS', car.marca + "\n", function (err) {});
    fs.appendFile('LIST_OF_MODELS', car.modelo + "\n", function (err) {});
}


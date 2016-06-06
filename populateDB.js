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

if(numberOfItemToExport > allItems.length) {
  numberOfItemToExport = allItems.length;
}

for (var i = init; i < numberOfItemToExport; i++) {
  var car = allItems[i];

  for (var j = 0; j < car.items.length; j++) {
    var item = car.items[j];

    var params = {
        TableName: "Cars",
        Item: {
            "CarId": "" + i,
            "Brand": car.marca.toLowerCase(),
            "Model": car.modelo.toLowerCase(),
            "Year": car.anio,
            "Title": item.titulo.toLowerCase(),
            "Description": item.descripcion.toLowerCase()
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
}


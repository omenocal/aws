var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var index = 0;
var carNumberId = 0;

console.log("Importing items into DynamoDB.");

var allItems = JSON.parse(fs.readFileSync('json_custom_export_final.json', 'utf8'));
allItems.forEach(function(car) {
    
    car.Items.forEach(function(item) {
        carNumberId ++;

        var params = {
            TableName: "Cars",
            Item: {
                "CarId": "" + carNumberId,
                "Brand": car.Brand.toLowerCase(),
                "Model": car.Model.toLowerCase(),
                "Year": car.Year,
                "Title": item.Titulo.toLowerCase(),
                "Description": item.Description.toLowerCase()
            }
        };

        docClient.put(params, function(err, data) {
           index ++;
           if (err) {
               console.error("Unable to add item", car.Brand + "-" + car.Model + "-" + car.Year,
                            ". Error JSON:", JSON.stringify(err, null, 2));
           } else {
               console.log("PutItem succeeded[" + index + "]:", car.Brand + "-" + car.Model + "-" + car.Year);
           }
        });
    });
    
});
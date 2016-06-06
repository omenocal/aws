'use strict';
var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();

var storageDynamoDB = (function () {

    /*
     * The DynamoDB class stores all batteries suggestions for the user
     */
    function DynamoDB(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = [];
        }
        this._session = session;
    }

    return {
        load: function (session, brand, model, year, callback) {
            dynamodb.scan({
                TableName: 'Cars',
                ProjectionExpression:"Title, Description",
                FilterExpression: "#brand = :brand and #model = :model and #year = :year",
                ExpressionAttributeNames: {
                    "#brand": "Brand",
                    "#model": "Model",
                    "#year": "Year"
                },
                ExpressionAttributeValues: {
                     ":brand": brand,
                     ":model": model,
                     ":year": parseInt(year)
                }
            }, function (err, data) {
                var currentDynamoDB;
                if (err) {
                    console.log(err, err.stack);
                    callback([]);
                } else {
                    console.log('get game from dynamodb=' + JSON.stringify(data.Items));
                    callback(data.Items);
                }
            });
        },
        newDynamoDB: function (session) {
            return new DynamoDB(session);
        }
    };

})();
module.exports = storageDynamoDB;
(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "contactId", alias: "Contact ID", dataType: tableau.dataTypeEnum.string },
            { id: "agentName", alias: "Agent Name", dataType: tableau.dataTypeEnum.string },
            { id: "duration", alias: "Duration (Sec)", dataType: tableau.dataTypeEnum.float }
        ];

        var tableSchema = {
            id: "nice_nde_data",
            alias: "NICE NDE Data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    myConnector.getData = function (table, doneCallback) {
        // Retrieve stored credentials
        var username = tableau.username;
        var password = tableau.password;
        var apiKey = tableau.connectionData; // API key stored here

        var apiUri = "https://api-na1.niceincontact.com/v1/data-extract"; 

        $.ajax({
            url: apiUri,
            headers: {
                "Authorization": "Basic " + btoa(username + ":" + password),
                "APIKey": apiKey
            },
            success: function (resp) {
                var records = resp.records || [];
                var tableData = records.map(function(item) {
                    return {
                        "contactId": item.contactId,
                        "agentName": item.agentName,
                        "duration": item.duration
                    };
                });

                table.appendRows(tableData);
                doneCallback();
            },
            error: function() {
                tableau.abortWithError("Check your NICE credentials and CORS settings.");
            }
        });
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            // Save inputs to Tableau's secure memory
            tableau.username = $("#username").val().trim();
            tableau.password = $("#password").val().trim();
            tableau.connectionData = $("#apiKey").val().trim();
            
            tableau.connectionName = "NICE NDE Data Feed";
            tableau.submit();
        });
    });
})();
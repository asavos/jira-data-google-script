function JiraDataGoogleScript() {

    this.maxResults = 1000;

    this.init = function () {

        SpreadsheetApp.getActiveSpreadsheet().addMenu('Jira', [

            {name: 'Set credentials...', functionName: 'setCredentials'},
            {name: 'Refresh data', functionName: 'fetchJiraData'}
        ]);
    };

    this.setCredentials = function () {

        var rawCredentials = Browser.inputBox('Enter your Jira user ID and password in the format user:password. For example, djames:whatever (Note: This data will be base64 encoded and saved as a property in the spreadsheet)', 'user:password', Browser.Buttons.OK_CANCEL),
            properties = PropertiesService.getUserProperties(),
            encodedCredentials = Utilities.base64Encode(rawCredentials);

        properties.setProperty('credentials', 'Basic ' + encodedCredentials);

        Browser.msgBox('Jira username and password saved.');
    };

    this.getStartDateFromSettings = function () {

        var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings'),
            range = settingsSheet.getRange('B2'),
            startDate = range.getValue();

        return Utilities.formatDate(new Date(startDate), 'GMT', 'yyyy/MM/dd');
    };

    this.getEndDateFromSettings = function () {

        var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings'),
            range = settingsSheet.getRange('B3'),
            endDate = range.getValue();

        return Utilities.formatDate(new Date(endDate), 'GMT', 'yyyy/MM/dd');
    };

    this.queryJira = function (path) {

        var credentials = PropertiesService.getUserProperties().getProperty('credentials'),
            response;

        if (credentials === null) {

            Browser.msgBox('Jira authentication required. Select Jira > Set Jira credentials.');
            return '';
        }

        response = UrlFetchApp.fetch('https://brighttalktech.jira.com/rest/api/2/' + path, {

            Accept: 'application/json',
            method: 'GET',
            muteHttpExceptions: true,
            headers: {

                Authorization: credentials
            }
        });

        if (response.getResponseCode() !== 200) {

            Browser.msgBox('Unexpected error fetching data from Jira API.');
            return '';
        }

        return response.getContentText();
    };

    this.fetchTicketsFromJira = function () {

        var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings'),
            projectRange = settingsSheet.getRange('B1'),
            project = projectRange.getValue(),
            ticketTypesRange = settingsSheet.getRange('B2'),
            ticketTypes = ticketTypesRange.getValue(),
            startDateRange = settingsSheet.getRange('B3'),
            startDate = startDateRange.getValue(),
            endDateRange = settingsSheet.getRange('B4'),
            endDate = endDateRange.getValue(),
            qualifyingStatusRange = settingsSheet.getRange('B5'),
            qualifyingStatus = qualifyingStatusRange.getValue(),
            closedStatusRange = settingsSheet.getRange('B6'),
            closedStatus = closedStatusRange.getValue();

        return JSON.parse(this.queryJira('search?jql=project%20%3D%20%22' + project + '%22%20and%20status%20%3D%20%22' + closedStatus + '%22%20type%20in%20(' + ticketTypes + ')%20and%20status%20was%20"' + qualifyingStatus + '"%20resolutionDate%20%3E%20"' + startDate + '"%20and%20resolutionDate%20%3C%20"' + endDate + '"%20order%20by%20resolutionDate%20DESC&expand=changelog&maxResults=' + this.maxResults));
    };
}

//original script:

//
// var C_MAX_RESULTS = 1000; - converted to maxResults property
//
// function onOpen(){ - converted to init()
//     var ss = SpreadsheetApp.getActiveSpreadsheet();
//     var menuEntries = [
//         {name: "Set Jira credentials", functionName: "setJiraCredentials"},
//         {name: "Refresh Data Now", functionName: "jiraPullManual"}
//     ];
//     ss.addMenu("Jira", menuEntries);
// }
//
// function setJiraCredentials() { - converted to setCredentials()
//
//     var userAndPassword = Browser.inputBox("Enter your Jira On Demand User id and Password in the form User:Password. e.g. Tommy.Smith:ilovejira (Note: This will be base64 Encoded and saved as a property on the spreadsheet)", "Userid:Password", Browser.Buttons.OK_CANCEL);
//     var x = Utilities.base64Encode(userAndPassword);
//     PropertiesService.getUserProperties().setProperty("digest", "Basic " + x);
//
//     Browser.msgBox("Jira username and password saved.");
// }
//
// function jiraPullManual() { - not done
//     jiraPull();
// }
//
// function getFields() { - not done
//     return JSON.parse(getDataForAPI("field"));
// }
//
// function getStartDateFromSettings() { - done
//     var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
//     var range = ss.getRange("B2");
//     var startDate = new Date(range.getValue());
//     return Utilities.formatDate(startDate, "GMT", "yyyy/MM/dd");
// }
//
// function getEndDateFromSettings() { - done
//     var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
//     var range = ss.getRange("B3");
//     var endDate = new Date(range.getValue());
//     return Utilities.formatDate(endDate, "GMT", "yyyy/MM/dd");
// }
//
// function getStories() {
//     var allData = {issues: []};
//     var data = {startAt: 0,maxResults: 0,total: 1};
//     var startDate = getStartDateFromSettings();
//     var endDate = getEndDateFromSettings();
//     var jql = "project%20%3D%20%22Content%20Team%22%20and%20status%20%3D%20done%20and%20type%20in%20(bug%2Cstory%2C%27technical%20story%27)%20and%20status%20was%20%22in%20development%22and%20resolutiondate%20%3E%20'" + startDate + "'%20and%20resolutiondate%20%3C%20'" + endDate + "'%20order%20by%20resolutiondate%20DESC";
//     //Logger.log(jql);
//
//     while (data.startAt + data.maxResults < data.total) {
//         data = JSON.parse(getDataForAPI("search?jql=" + jql + "&expand=changelog&maxResults=" + C_MAX_RESULTS));
//         allData.issues = allData.issues.concat(data.issues);
//         startAt = data.startAt + data.maxResults;
//     }
//
//     return allData;
// }
//
// function getDataForAPI(path) { - named fetchFromJira
//     var url = "https://brighttalktech.jira.com/rest/api/2/" + path;
//     var digestfull = PropertiesService.getUserProperties().getProperty("digest");
//
//     if (digestfull === null) {
//         Browser.msgBox("Jira authentication required. Select Jira > Set Jira credentials.");
//         return "";
//     }
//
//     var headers = { "Accept":"application/json",
//         "Content-Type":"application/json",
//         "method": "GET",
//         "headers": {"Authorization": digestfull},
//         "muteHttpExceptions": true
//     };
//
//     var resp = UrlFetchApp.fetch(url,headers);
//     if (resp.getResponseCode() != 200) {
//         Browser.msgBox("Error retrieving data for url" + url + ":" + resp.getContentText());
//         return "";
//     }
//     else {
//         return resp.getContentText();
//     }
// }
//
// function jiraPull() {
//
//     var allFields = getAllFields();
//
//     var data = getStories();
//
//     if (allFields === "" || data === "") {
//         Browser.msgBox("Error pulling data from Jira - aborting now.");
//         return;
//     }
//
//     var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("JiraData");
//     var headings = ss.getRange(1, 1, 1, ss.getLastColumn()).getValues()[0];
//     var y = new Array();
//     var i;
//
//     for (i=0;i<data.issues.length;i++) {
//         var d=data.issues[i];
//         y.push(getStory(d,headings,allFields));
//     }
//
//     ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("JiraData");
//     var last = ss.getLastRow();
//     if (last >= 2) {
//         ss.getRange(2, 1, ss.getLastRow()-1,ss.getLastColumn()).clearContent();
//     }
//
//     if (y.length > 0) {
//         ss.getRange(2, 1, data.issues.length, y[0].length).setValues(y);
//     }
//
// }
//
// function getAllFields() {
//
//     var theFields = getFields();
//     var allFields = new Object();
//     allFields.ids = new Array();
//     allFields.names = new Array();
//
//     for (var i = 0; i < theFields.length; i++) {
//         allFields.ids.push(theFields[i].id);
//         allFields.names.push(theFields[i].name.toLowerCase());
//     }
//
//     return allFields;
//
// }
//
// function startsWith(haystack, prefix) {
//     return haystack.indexOf(prefix) === 0;
// }
//
// function getStatusFromFieldName(fieldName) {
//     var parts = fieldName.split("(");
//     return parts[1].replace(")", "");
// }
//
// function getDateFromIso(string) {
//     try{
//         var aDate = new Date();
//         var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
//             "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
//             "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
//         var d = string.match(new RegExp(regexp));
//
//         var offset = 0;
//         var date = new Date(d[1], 0, 1);
//
//         if (d[3]) { date.setMonth(d[3] - 1); }
//         if (d[5]) { date.setDate(d[5]); }
//         if (d[7]) { date.setHours(d[7]); }
//         if (d[8]) { date.setMinutes(d[8]); }
//         if (d[10]) { date.setSeconds(d[10]); }
//         if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
//         if (d[14]) {
//             offset = (Number(d[16]) * 60) + Number(d[17]);
//             offset *= ((d[15] == '-') ? 1 : -1);
//         }
//
//         offset -= date.getTimezoneOffset();
//         var time = (Number(date) + (offset * 60 * 1000));
//         return aDate.setTime(Number(time));
//     } catch(e){
//         return;
//     }
// }
//
// function getStory(data, headings, fields) {
//
//     var fieldName, fieldData;
//     var story = [];
//     var states = [];
//
//     // extract the status changes from the changelog data and store in the "states" array
//     for (var n = 0; n < data.changelog.histories.length; n++) {
//
//         for (var o = 0; o < data.changelog.histories[n].items.length; o++) {
//
//             if (data.changelog.histories[n].items[o].field == "status") {
//                 // status change log - one we care about!
//
//                 var status = {
//                     "toState" : data.changelog.histories[n].items[o].toString.toLowerCase(),
//                     "at" : data.changelog.histories[n].created
//                 };
//                 states.push(status);
//                 break;
//             }
//         }
//     }
//
//     //Logger.log("states: " + JSON.stringify(states));
//
//     for (var i = 0; i < headings.length; i++) {
//
//         var fieldValue = "";
//
//         if (headings[i] !== "") {
//             fieldName = headings[i].toLowerCase();
//
//             if (startsWith(fieldName, "was in status")) {
//
//                 var searchStatus = getStatusFromFieldName(fieldName);
//
//                 for( var j=0; j < states.length; j++) {
//                     //Logger.log("match? : " + searchStatus + " == " + states[j].toState);
//                     if (states[j].toState == searchStatus) {
//                         fieldValue = new Date(getDateFromIso(states[j].at));
//
//                         //Logger.log("Status changed at: " + fieldValue);
//                         break;
//                     }
//                 }
//             } else {
//
//                 fieldData = getDataForHeading(data, fieldName, fields);
//
//                 if (typeof fieldData == "object" && fieldData != null) {
//                     if (fieldData.hasOwnProperty("name")) {
//                         fieldValue = fieldData.name;
//                     } else if (fieldData.hasOwnProperty("value")) {
//                         fieldValue = fieldData.value;
//                     } else {
//                         fieldValue = fieldData;
//                     }
//                 } else {
//                     fieldValue = fieldData;
//                 }
//             }
//         }
//         story.push(fieldValue);
//
//     }
//
//     return story;
//
// }
//
// function getDataForHeading(data,heading,fields) {
//
//     if (heading === 'type') {
//         return data.fields.issuetype.name;
//     }
//
//     if (data.hasOwnProperty(heading)) {
//         return data[heading];
//     }
//     else if (data.fields.hasOwnProperty(heading)) {
//         return data.fields[heading];
//     }
//
//     var fieldName = getFieldName(heading,fields);
//
//     if (fieldName !== "") {
//         if (data.hasOwnProperty(fieldName)) {
//             return data[fieldName];
//         }
//         else if (data.fields.hasOwnProperty(fieldName)) {
//             return data.fields[fieldName];
//         }
//     }
//
//     var splitName = heading.split(" ");
//
//     if (splitName.length == 2) {
//         if (data.fields.hasOwnProperty(splitName[0]) ) {
//             if (data.fields[splitName[0]] && data.fields[splitName[0]].hasOwnProperty(splitName[1])) {
//                 return data.fields[splitName[0]][splitName[1]];
//             }
//             return "";
//         }
//     }
//
//     return "Could not find value for " + heading;
//
// }
//
// function getFieldName(heading,fields) {
//     var index = fields.names.indexOf(heading);
//     if ( index > -1) {
//         return fields.ids[index];
//     }
//     return "";
// }

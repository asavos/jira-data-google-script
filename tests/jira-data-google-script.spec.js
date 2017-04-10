/*globals describe, beforeEach, it, expect*/

describe('JiraDataGoogleScript', function () {

    'use strict';

    var jdgs,
        activeSpreadsheet,
        settingsSheet,
        userProperties,
        response;

    function randomString() {

        return Math.random().toString(36).replace(/[^a-z]+/g, '');
    }

    function randomNumber() {

        return Math.ceil(Math.random() * 9999);
    }

    beforeEach(function () {

        activeSpreadsheet = new Spreadsheet();
        settingsSheet = new Sheet();
        userProperties = {

            setProperty: jasmine.createSpy('setProperty'),
            getProperty: jasmine.createSpy('getProperty')
        };
        response = new Response();
        spyOn(SpreadsheetApp, 'getActiveSpreadsheet').and.returnValue(activeSpreadsheet);
        spyOn(activeSpreadsheet, 'getSheetByName').and.callFake(function (sheetName) {

            if (sheetName === 'Settings') {

                return settingsSheet;
            }
        });
        spyOn(PropertiesService, 'getUserProperties').and.returnValue(userProperties);
        spyOn(UrlFetchApp, 'fetch').and.returnValue(response);

        jdgs = new JiraDataGoogleScript();
    });

    it('should set a maxResults property to 1,000', function () {

        expect(jdgs.maxResults).toBe(1000);
    });

    describe('init()', function () {

        it('should create a Jira menu item', function () {

            spyOn(activeSpreadsheet, 'addMenu');

            jdgs.init();

            expect(activeSpreadsheet.addMenu).toHaveBeenCalledWith('Jira', jasmine.any(Array));
        });

        it('should create a "Set credentials..." child menu item to the Jira menu', function () {

            var menuItemsUsed;
            spyOn(activeSpreadsheet, 'addMenu').and.callFake(function (menuName, menuItems) {

                menuItemsUsed = menuItems;
            });

            jdgs.init();

            expect(menuItemsUsed[0].name).toBe('Set credentials...');
        });

        it('should activate the setCredentials function when the "Set credentials..." child menu item is clicked', function () {

            var menuItemsUsed;
            spyOn(activeSpreadsheet, 'addMenu').and.callFake(function (menuName, menuItems) {

                menuItemsUsed = menuItems;
            });

            jdgs.init();

            expect(menuItemsUsed[0].functionName).toBe('setCredentials');
        });

        it('should create a "Refresh data" child menu item to the Jira menu', function () {

            var menuItemsUsed;
            spyOn(activeSpreadsheet, 'addMenu').and.callFake(function (menuName, menuItems) {

                menuItemsUsed = menuItems;
            });

            jdgs.init();

            expect(menuItemsUsed[1].name).toBe('Refresh data');
        });

        it('should activate the fetchJiraData function when the "Refresh data" child menu item is clicked', function () {

            var menuItemsUsed;
            spyOn(activeSpreadsheet, 'addMenu').and.callFake(function (menuName, menuItems) {

                menuItemsUsed = menuItems;
            });

            jdgs.init();

            expect(menuItemsUsed[1].functionName).toBe('fetchJiraData');
        });
    });

    describe('setCredentials()', function () {

        it('should display a Google Sheet prompt that asks for the user ID and password', function () {

            spyOn(Browser, 'inputBox');

            jdgs.setCredentials();

            expect(Browser.inputBox).toHaveBeenCalledWith('Enter your Jira user ID and password in the format user:password. For example, djames:whatever (Note: This data will be base64 encoded and saved as a property in the spreadsheet)', jasmine.any(String), jasmine.any(String));
        });

        it('should display a Google Sheet prompt with a field for user ID and password', function () {

            spyOn(Browser, 'inputBox');

            jdgs.setCredentials();

            expect(Browser.inputBox).toHaveBeenCalledWith(jasmine.any(String), 'user:password', jasmine.any(String));
        });

        it('should display a Google Sheet prompt with ok and cancel buttons', function () {

            var buttons = randomString();
            spyOn(Browser, 'inputBox');
            Browser.Buttons.OK_CANCEL = buttons;

            jdgs.setCredentials();

            expect(Browser.inputBox).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), buttons);
        });

        it('should set the credentials property using the input as a base64 encoded string for basic authentication', function () {

            var userPass = randomString() + ':' + randomString(),
                encodedUserPass = randomString();

            spyOn(Browser, 'inputBox').and.returnValue(userPass);
            spyOn(Utilities, 'base64Encode').and.returnValue(encodedUserPass);

            jdgs.setCredentials();

            expect(Utilities.base64Encode).toHaveBeenCalledWith(userPass);
            expect(PropertiesService.getUserProperties).toHaveBeenCalled();
            expect(userProperties.setProperty).toHaveBeenCalledWith('credentials', 'Basic ' + encodedUserPass);
        });

        it('should display a Google Sheet message box after the credentials are saved', function () {

            spyOn(Browser, 'inputBox').and.returnValue(randomString());
            spyOn(Browser, 'msgBox');

            jdgs.setCredentials();

            expect(Browser.msgBox).toHaveBeenCalledWith('Jira username and password saved.');
        });
    });

    describe('getStartDateFromSettings()', function () {

        it('should return the B2 cell data from the settings sheet as a Jira formatted date', function () {

            var range = new Range(),
                formattedDate = randomString(),
                date = randomNumber(),
                result;

            spyOn(range, 'getValue').and.returnValue(date);
            spyOn(settingsSheet, 'getRange').and.returnValue(range);
            spyOn(Utilities, 'formatDate').and.returnValue(formattedDate);

            result = jdgs.getStartDateFromSettings();

            expect(result).toBe(formattedDate);
            expect(settingsSheet.getRange).toHaveBeenCalledWith('B2');
            expect(Utilities.formatDate).toHaveBeenCalledWith(new Date(date), "GMT", "yyyy/MM/dd");
        });
    });

    describe('getEndDateFromSettings()', function () {

        it('should return the B3 cell data from the settings sheet as a Jira formatted date', function () {

            var range = new Range(),
                formattedDate = randomString(),
                date = randomNumber(),
                result;

            spyOn(range, 'getValue').and.returnValue(date);
            spyOn(settingsSheet, 'getRange').and.returnValue(range);
            spyOn(Utilities, 'formatDate').and.returnValue(formattedDate);

            result = jdgs.getEndDateFromSettings();

            expect(result).toBe(formattedDate);
            expect(settingsSheet.getRange).toHaveBeenCalledWith('B3');
            expect(Utilities.formatDate).toHaveBeenCalledWith(new Date(date), "GMT", "yyyy/MM/dd");
        });
    });

    describe('fetchFromJira()', function () {

        it('should display a message box if user credentials have not been set', function () {

            userProperties.getProperty.and.returnValue(null);
            spyOn(Browser, 'msgBox');

            jdgs.fetchFromJira();

            expect(userProperties.getProperty).toHaveBeenCalledWith('credentials');
            expect(Browser.msgBox).toHaveBeenCalledTimes(1);
            expect(Browser.msgBox).toHaveBeenCalledWith('Jira authentication required. Select Jira > Set Jira credentials.');
        });

        it('should return an empty string if user credentials have not been set', function () {

            userProperties.getProperty.and.returnValue(null);

            expect(jdgs.fetchFromJira()).toBe('');
        });

        it('should return an empty string if the response from Jira is not a status code of 200', function () {

            spyOn(response, 'getResponseCode').and.returnValue(404);
            userProperties.getProperty.and.returnValue(randomString());

            expect(jdgs.fetchFromJira()).toBe('');
        });

        it('should display a message box if the response from Jira is not a status code of 200', function () {

            spyOn(response, 'getResponseCode').and.returnValue(404);
            spyOn(Browser, 'msgBox');
            userProperties.getProperty.and.returnValue(randomString());

            jdgs.fetchFromJira();

            expect(Browser.msgBox).toHaveBeenCalledTimes(1);
            expect(Browser.msgBox).toHaveBeenCalledWith('Unexpected error fetching data from Jira API.');
        });

        it('should call the Jira rest API using the given path argument', function () {

            var path = randomString(),
                url = 'https://brighttalktech.jira.com/rest/api/2/' + path;

            userProperties.getProperty.and.returnValue(randomString());

            jdgs.fetchFromJira(path);

            expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, jasmine.any(Object));
        });

        it('should call the Jira rest API requesting JSON format', function () {

            var headersUsed = {};
            UrlFetchApp.fetch.and.callFake(function (path, headers) {

                headersUsed = headers;
                return response;
            });
            userProperties.getProperty.and.returnValue(randomString());

            jdgs.fetchFromJira(randomString());

            expect(headersUsed.Accept).toBe('application/json');
        });

        it('should call the Jira rest API using the GET method', function () {

            var headersUsed = {};
            UrlFetchApp.fetch.and.callFake(function (path, headers) {

                headersUsed = headers;
                return response;
            });
            userProperties.getProperty.and.returnValue(randomString());

            jdgs.fetchFromJira(randomString());

            expect(headersUsed.method).toBe('GET');
        });

        it('should call the Jira rest API with authorization data using the saved user credentials', function () {

            var credentials = randomString(),
                headersUsed = {};

            userProperties.getProperty.and.returnValue(credentials);
            UrlFetchApp.fetch.and.callFake(function (path, headers) {

                headersUsed = headers;
                return response;
            });

            jdgs.fetchFromJira(randomString());

            expect(userProperties.getProperty).toHaveBeenCalledWith('credentials');
            expect(headersUsed.headers.Authorization).toBe(credentials);
        });

        it('should call the Jira rest API with muted HTTP exceptions', function () {

            var headersUsed = {};
            userProperties.getProperty.and.returnValue(randomString());
            UrlFetchApp.fetch.and.callFake(function (path, headers) {

                headersUsed = headers;
                return response;
            });

            jdgs.fetchFromJira(randomString());

            expect(headersUsed.muteHttpExceptions).toBe(true);
        });

        it('should return the content text of the response', function () {

            var headersUsed = {},
                responseText = randomString(),
                result;

            spyOn(response, 'getContentText').and.returnValue(responseText);
            userProperties.getProperty.and.returnValue(randomString());
            UrlFetchApp.fetch.and.callFake(function (path, headers) {

                headersUsed = headers;
                return response;
            });

            result = jdgs.fetchFromJira(randomString());

            expect(response.getContentText).toHaveBeenCalled();
            expect(result).toBe(responseText);
        });
    });

    // describe('fetchTicketsFromJira()', function () {
    //
    //     it('should ', function () {
    //
    //
    //     });

        //point to the right project in JQL
        //point to the right closed status in JQL
        //point to the right ticket types in JQL
        //point to the right inStatus statuses in JQL
        //use the right startDate in JQL
        //use the right endDate in JQL
        //use the order by resolution date in JQL


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
//     });

});

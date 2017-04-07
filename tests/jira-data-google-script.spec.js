/*globals describe, beforeEach, it, expect*/

describe('JiraDataGoogleScript', function () {

    'use strict';

    var jdgs,
        activeSpreadsheet,
        settingsSheet;

    function randomString() {

        return Math.random().toString(36).replace(/[^a-z]+/g, '');
    }

    function randomNumber() {

        return Math.ceil(Math.random() * 9999);
    }

    beforeEach(function () {

        activeSpreadsheet = new Spreadsheet();
        settingsSheet = new Sheet();
        spyOn(SpreadsheetApp, 'getActiveSpreadsheet').and.returnValue(activeSpreadsheet);
        spyOn(activeSpreadsheet, 'getSheetByName').and.callFake(function (sheetName) {

            if (sheetName === 'Settings') {

                return settingsSheet;
            }
        });
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

        it('should set the digest property using the input as a base64 encoded string for basic authentication', function () {

            var userPass = randomString() + ':' + randomString(),
                encodedUserPass = randomString(),
                userProperties = {

                    setProperty: jasmine.createSpy('setProperty')
                };

            spyOn(Browser, 'inputBox').and.returnValue(userPass);
            spyOn(Utilities, 'base64Encode').and.returnValue(encodedUserPass);
            spyOn(PropertiesService, 'getUserProperties').and.returnValue(userProperties);

            jdgs.setCredentials();

            expect(Utilities.base64Encode).toHaveBeenCalledWith(userPass);
            expect(PropertiesService.getUserProperties).toHaveBeenCalled();
            expect(userProperties.setProperty).toHaveBeenCalledWith('digest', 'Basic ' + encodedUserPass);
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
});

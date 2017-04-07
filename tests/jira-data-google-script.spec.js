/*globals describe, beforeEach, it, expect*/

describe('JiraDataGoogleScript', function () {

    'use strict';

    var jdgs;

    beforeEach(function () {

        jdgs = new JiraDataGoogleScript();
    });

    it('should set a maxResults property to 1,000', function () {

        expect(jdgs.maxResults).toBe(1000);
    });

    describe('init()', function () {

        it('should create a Jira menu item', function () {

            var spreadsheet = {

                addMenu: jasmine.createSpy('addMenu')
            };
            spyOn(SpreadsheetApp, 'getActiveSpreadsheet').and.returnValue(spreadsheet);

            jdgs.init();

            expect(spreadsheet.addMenu).toHaveBeenCalledWith('Jira', jasmine.any(Array));
        });

        it('should create a "Set credentials..." child menu item to the Jira menu', function () {

            var menuItemsUsed,
                spreadsheet = {

                    addMenu: jasmine.createSpy('addMenu').and.callFake(function (menuName, menuItems) {

                        menuItemsUsed = menuItems;
                    })
                };
            spyOn(SpreadsheetApp, 'getActiveSpreadsheet').and.returnValue(spreadsheet);

            jdgs.init();

            expect(menuItemsUsed[0].name).toBe('Set credentials...');
        });

        it('should activate the setCredentials function when the "Set credentials..." child menu item is clicked', function () {

            var menuItemsUsed,
                spreadsheet = {

                    addMenu: jasmine.createSpy('addMenu').and.callFake(function (menuName, menuItems) {

                        menuItemsUsed = menuItems;
                    })
                };
            spyOn(SpreadsheetApp, 'getActiveSpreadsheet').and.returnValue(spreadsheet);

            jdgs.init();

            expect(menuItemsUsed[0].functionName).toBe('setCredentials');
        });



        it('should create a "Refresh data" child menu item to the Jira menu', function () {

            var menuItemsUsed,
                spreadsheet = {

                    addMenu: jasmine.createSpy('addMenu').and.callFake(function (menuName, menuItems) {

                        menuItemsUsed = menuItems;
                    })
                };
            spyOn(SpreadsheetApp, 'getActiveSpreadsheet').and.returnValue(spreadsheet);

            jdgs.init();

            expect(menuItemsUsed[1].name).toBe('Refresh data');
        });

        it('should activate the fetchJiraData function when the "Refresh data" child menu item is clicked', function () {

            var menuItemsUsed,
                spreadsheet = {

                    addMenu: jasmine.createSpy('addMenu').and.callFake(function (menuName, menuItems) {

                        menuItemsUsed = menuItems;
                    })
                };
            spyOn(SpreadsheetApp, 'getActiveSpreadsheet').and.returnValue(spreadsheet);

            jdgs.init();

            expect(menuItemsUsed[1].functionName).toBe('fetchJiraData');
        });
    });
});
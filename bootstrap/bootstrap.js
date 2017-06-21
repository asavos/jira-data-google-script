/**
 * Bootstrap file that creates the instance of JiraDataGoogleScript and exposes some methods as globals for a Jira menu.
 * This is required because Google Script does not allow a menu item to target a non-global function.
 */
var jdgs = new JiraDataGoogleScript();

function setCredentials() {

    jdgs.setCredentials();
}

function fetchTicketsFromJira() {

    jdgs.fetchTicketsFromJira();
}

function onOpen() {

    SpreadsheetApp.getActiveSpreadsheet().addMenu('Jira', [

        {
            name: 'Set credentials...',
            functionName: 'setCredentials'
        }, {

            name: 'Refresh data',
            functionName: 'fetchTicketsFromJira'
        }
    ]);
}

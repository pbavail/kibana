/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { loginAndWaitForPageWithoutDateRange } from '../tasks/login';
import { DETECTIONS_URL } from '../urls/navigation';
import {
  waitForAlertsPanelToBeLoaded,
  waitForAlertsIndexToBeCreated,
  goToManageAlertsDetectionRules,
} from '../tasks/alerts';
import {
  waitForListsIndexToBeCreated,
  waitForValueListsModalToBeLoaded,
  openValueListsModal,
  selectValueListsFile,
  uploadValueList,
  selectValueListType,
  deleteAllValueListsFromUI,
  closeValueListsModal,
  importValueList,
  deleteValueListsFile,
  exportValueList,
} from '../tasks/lists';
import { VALUE_LISTS_TABLE, VALUE_LISTS_ROW } from '../screens/lists';

describe('value lists', () => {
  describe('management modal', () => {
    beforeEach(() => {
      loginAndWaitForPageWithoutDateRange(DETECTIONS_URL);
      waitForAlertsPanelToBeLoaded();
      waitForAlertsIndexToBeCreated();
      waitForListsIndexToBeCreated();
      goToManageAlertsDetectionRules();
      waitForValueListsModalToBeLoaded();
    });

    afterEach(() => {
      deleteAllValueListsFromUI();
    });

    it('can open and close the modal', () => {
      openValueListsModal();
      closeValueListsModal();
    });

    describe('create list types', () => {
      beforeEach(() => {
        openValueListsModal();
      });

      it('creates a "keyword" list from an uploaded file', () => {
        const listName = 'value_list.txt';
        selectValueListType('keyword');
        selectValueListsFile(listName);
        uploadValueList();

        cy.get(VALUE_LISTS_TABLE)
          .find(VALUE_LISTS_ROW)
          .should(($row) => {
            expect($row.text()).to.contain(listName);
            expect($row.text()).to.contain('Keywords');
          });
      });

      it('creates a "text" list from an uploaded file', () => {
        const listName = 'value_list.txt';
        selectValueListType('text');
        selectValueListsFile(listName);
        uploadValueList();

        cy.get(VALUE_LISTS_TABLE)
          .find(VALUE_LISTS_ROW)
          .should(($row) => {
            expect($row.text()).to.contain(listName);
            expect($row.text()).to.contain('Text');
          });
      });

      it('creates a "ip" list from an uploaded file', () => {
        const listName = 'ip_list.txt';
        selectValueListType('ip');
        selectValueListsFile(listName);
        uploadValueList();

        cy.get(VALUE_LISTS_TABLE)
          .find(VALUE_LISTS_ROW)
          .should(($row) => {
            expect($row.text()).to.contain(listName);
            expect($row.text()).to.contain('IP addresses');
          });
      });

      it('creates a "ip_range" list from an uploaded file', () => {
        const listName = 'cidr_list.txt';
        selectValueListType('ip_range');
        selectValueListsFile(listName);
        uploadValueList();

        cy.get(VALUE_LISTS_TABLE)
          .find(VALUE_LISTS_ROW)
          .should(($row) => {
            expect($row.text()).to.contain(listName);
            expect($row.text()).to.contain('IP ranges');
          });
      });
    });

    describe('delete list types', () => {
      it('deletes a "keyword" list from an uploaded file', () => {
        const listName = 'value_list.txt';
        importValueList(listName, 'keyword');
        openValueListsModal();
        deleteValueListsFile(listName);
        cy.get(VALUE_LISTS_TABLE)
          .find(VALUE_LISTS_ROW)
          .should(($row) => {
            expect($row.text()).not.to.contain(listName);
          });
      });

      it('deletes a "text" list from an uploaded file', () => {
        const listName = 'value_list.txt';
        importValueList(listName, 'text');
        openValueListsModal();
        deleteValueListsFile(listName);
        cy.get(VALUE_LISTS_TABLE)
          .find(VALUE_LISTS_ROW)
          .should(($row) => {
            expect($row.text()).not.to.contain(listName);
          });
      });

      it('deletes a "ip" from an uploaded file', () => {
        const listName = 'ip_list.txt';
        importValueList(listName, 'ip');
        openValueListsModal();
        deleteValueListsFile(listName);
        cy.get(VALUE_LISTS_TABLE)
          .find(VALUE_LISTS_ROW)
          .should(($row) => {
            expect($row.text()).not.to.contain(listName);
          });
      });

      it('deletes a "ip_range" from an uploaded file', () => {
        const listName = 'cidr_list.txt';
        importValueList(listName, 'ip_range');
        openValueListsModal();
        deleteValueListsFile(listName);
        cy.get(VALUE_LISTS_TABLE)
          .find(VALUE_LISTS_ROW)
          .should(($row) => {
            expect($row.text()).not.to.contain(listName);
          });
      });
    });

    describe('export list types', () => {
      beforeEach(() => {
        cy.server();
        cy.route('POST', '**/api/lists/items/_export?list_id=*').as('exportList');
      });

      it('exports a "keyword" list from an uploaded file', () => {
        const listName = 'value_list.txt';
        importValueList('value_list.txt', 'keyword');
        openValueListsModal();
        exportValueList();
        cy.wait('@exportList').then((xhr) => {
          cy.fixture(listName).then((list: string) => {
            const [lineOne, lineTwo] = list.split('\n');
            expect(xhr.responseBody).to.contain(lineOne);
            expect(xhr.responseBody).to.contain(lineTwo);
          });
        });
      });

      it('exports a "text" list from an uploaded file', () => {
        const listName = 'value_list.txt';
        importValueList(listName, 'text');
        openValueListsModal();
        exportValueList();
        cy.wait('@exportList').then((xhr) => {
          cy.fixture(listName).then((list: string) => {
            const [lineOne, lineTwo] = list.split('\n');
            expect(xhr.responseBody).to.contain(lineOne);
            expect(xhr.responseBody).to.contain(lineTwo);
          });
        });
      });

      it('exports a "ip" list from an uploaded file', () => {
        const listName = 'ip_list.txt';
        importValueList(listName, 'ip');
        openValueListsModal();
        exportValueList();
        cy.wait('@exportList').then((xhr) => {
          cy.fixture(listName).then((list: string) => {
            const [lineOne, lineTwo] = list.split('\n');
            expect(xhr.responseBody).to.contain(lineOne);
            expect(xhr.responseBody).to.contain(lineTwo);
          });
        });
      });

      it('exports a "ip_range" list from an uploaded file', () => {
        const listName = 'cidr_list.txt';
        importValueList(listName, 'ip_range');
        openValueListsModal();
        exportValueList();
        cy.wait('@exportList').then((xhr) => {
          cy.fixture(listName).then((list: string) => {
            const [lineOne] = list.split('\n');
            expect(xhr.responseBody).to.contain(lineOne);
          });
        });
      });
    });
  });
});

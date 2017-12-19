/* global describe, beforeEach */
import { expect } from 'chai';
import it from './it-will';

import { describeApplication } from './helpers';
import CustomerResourceShowPage from './pages/customer-resource-show';

describeApplication.only('CustomerResourceShowCustomCoverage', () => {
  let pkg,
    title,
    resource;

  beforeEach(function () {
    pkg = this.server.create('package', 'withProvider');

    title = this.server.create('title');

    resource = this.server.create('customer-resource', {
      package: pkg,
      title,
      isSelected: true
    });
  });

  // describe('visting the customer resource show page with no custom coverage', () => {
  //   beforeEach(function () {
  //     return this.visit(`/eholdings/customer-resources/${resource.id}`, () => {
  //       expect(CustomerResourceShowPage.$root).to.exist;
  //     });
  //   });

  //   it('does not display custom coverage list', () => {
  //     expect(CustomerResourceShowPage.customCoverageList).to.not.exist;
  //   });

  //   it('displays add custom coverage button', () => {
  //     expect(CustomerResourceShowPage.$customCoverageAddButton).to.exist;
  //   });
  // });

  describe('visting the customer resoure show page with a empty array [] custom coverage', () => {
    beforeEach(function () {
      resource.customCoverages = this.server.createList('custom-coverage', 0).map(m => m.toJSON());
      resource.save();
      return this.visit(`/eholdings/customer-resources/${resource.id}`, () => {
        expect(CustomerResourceShowPage.$root).to.exist;
      });
    });

    it('should not display the custom coverage list', () => {
      expect(CustomerResourceShowPage.$customCoveragesList).to.not.exist;
    });

    it('displays add custom coverage button', () => {
      expect(CustomerResourceShowPage.$customCoverageAddButton).to.exist;
    });
  });

  describe('visiting the customer resource show page with one custom coverage', () => {
    beforeEach(function () {
      resource.customCoverages = this.server.createList('custom-coverage', 1, {
        beginCoverage: '1969-07-16',
        endCoverage: '1972-12-19'
      }).map(m => m.toJSON());

      resource.save();

      return this.visit(`/eholdings/customer-resources/${resource.id}`, () => {
        expect(CustomerResourceShowPage.$root).to.exist;
      });
    });

    it('displays custom coverage', () => {
      expect(CustomerResourceShowPage.customCoveragesListItems[0]).to.equal('7/16/1969 - 12/19/1972');
    });

    it('displays edit button', () => {
      expect(CustomerResourceShowPage.$customCoverageEditButton).to.exist;
    });

    describe('editing custom coverage list', () => {
      beforeEach(() => {
        CustomerResourceShowPage.clickCustomCoverageEditButton();
      });

      it('displays custom coverage edit form', () => {
        expect(CustomerResourceShowPage.$customCoveragesEditForm).to.exist;
      });

      it('displays an edit row for each coverage range', () => {
        expect(CustomerResourceShowPage.customCoverageEditList.length).to.equal(1);
      });

      it('edit row is populated with existing values', () => {
        expect(CustomerResourceShowPage.customCoverageEditList[0].beginCoverage).to.equal('1969-07-16');
        expect(CustomerResourceShowPage.customCoverageEditList[0].endCoverage).to.equal('1972-12-19');
      });
    });
  });

  describe('visting the customer resource show page with multiple custom coverage dates', () => {
    beforeEach(function () {
      resource.customCoverages = [
        this.server.create('custom-coverage', { beginCoverage: '2017-02-01', endCoverage: '2017-02-12' }),
        this.server.create('custom-coverage', { beginCoverage: '2003-01-01', endCoverage: '2003-12-12' }),
        this.server.create('custom-coverage', { beginCoverage: '2002-02-03', endCoverage: '2002-01-12' }),
      ].map(m => m.toJSON());

      resource.save();

      return this.visit(`/eholdings/customer-resources/${resource.id}`, () => {
        expect(CustomerResourceShowPage.$root).to.exist;
      });
    });

    it('displays a list of custom coverage dates', () => {
      expect(CustomerResourceShowPage.customCoveragesListItems.length).to.equal(3);
    });

    it('displays the list of custom coverage date in descending order', () => {
      expect(CustomerResourceShowPage.customCoveragesListItems[0]).to.eq('2/1/2017 - 2/12/2017');
      expect(CustomerResourceShowPage.customCoveragesListItems[1]).to.eq('1/1/2003 - 12/12/2003');
      expect(CustomerResourceShowPage.customCoveragesListItems[2]).to.eq('2/3/2002 - 1/12/2002');
    });
  });
});

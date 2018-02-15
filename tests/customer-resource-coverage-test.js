/* global describe, beforeEach */
import { expect } from 'chai';
import it, { convergeOn } from './it-will';

import { describeApplication } from './helpers';
import ResourcePage from './pages/customer-resource-show';
import CoverageForm from './pages/coverage-form';

describeApplication.only('CustomerResourceShowCoverage', () => {
  let pkg,
    title,
    resource;

  beforeEach(function () {
    pkg = this.server.create('package', 'withProvider');

    title = this.server.create('title');

    resource = this.server.create('customer-resource', {
      package: pkg,
      title
    });
  });

  describe('visiting an unselected customer resource show page', () => {
    beforeEach(function () {
      resource.isSelected = false;
      resource.save();

      return this.visit(`/eholdings/customer-resources/${resource.titleId}`, () => {
        expect(ResourcePage.$root).to.exist;
      });
    });

    it('does not display coverage', () => {
      expect(CoverageForm.$root).to.not.exist;
    });
  });

  describe('visiting a selected customer resource show page without custom coverage', () => {
    beforeEach(function () {
      resource.isSelected = true;
      resource.save();

      return this.visit(`/eholdings/customer-resources/${resource.titleId}`, () => {
        expect(ResourcePage.$root).to.exist;
      });
    });

    it('displays an add custom coverage button', () => {
      expect(CoverageForm.$addButton).to.exist;
    });

    describe('clicking the add custom coverage button', () => {
      beforeEach(() => {
        CoverageForm.clickAddButton();
      });

      it('reveals the custom coverage form', () => {
        expect(CoverageForm.$form).to.exist;
      });

      it('reveals a cancel button', () => {
        expect(CoverageForm.$cancelButton).to.exist;
      });

      it('reveals a save button', () => {
        expect(CoverageForm.$saveButton).to.exist;
      });

      it('disables the save button', () => {
        expect(CoverageForm.isSaveButtonEnabled).to.be.false;
      });

      it('hides the add custom coverage button', () => {
        expect(CoverageForm.$addButton).to.not.exist;
      });

      it.skip('does not show a clear row button on the first row', () => {
        expect(CoverageForm.dateRangeRowList[0].$removeRowButton).to.not.exist;
      });

      describe('clicking cancel', () => {
        it('hides the custom coverage form', () => {
          expect(CoverageForm.$form).to.not.exist;
        });

        it('displays an add custom coverage button', () => {
          expect(CoverageForm.$addButton).to.exist;
        });
      });

      describe('clicking the add row button', () => {
        beforeEach(() => {
          CoverageForm.clickAddRowButton();
        });

        it('adds another row of date inputs', () => {
          expect(CoverageForm.dateRangeRowList.length).to.equal(2);
        });

        it('does not put any values in the new inputs', () => {
          expect(CoverageForm.dateRangeRowList[1].beginCoverage).equal('');
          expect(CoverageForm.dateRangeRowList[1].endCoverage).equal('');
        });

        describe.skip('clicking the clear row button', () => {
          beforeEach(() => {
            CoverageForm.dateRangeRowList[1].clickRemoveRowButton();
          });

          it('removes the new row', () => {
            expect(CoverageForm.dateRangeRowList.length).to.equal(1);
          });
        });
      });

      describe('entering a valid date range', () => {
        beforeEach(() => {
          return convergeOn(() => {
            expect(CoverageForm.dateRangeRowList[0].$beginCoverageField).to.exist;
            expect(CoverageForm.dateRangeRowList[0].$endCoverageField).to.exist;
          }).then(() => {
            CoverageForm.dateRangeRowList[0].$beginCoverageField.click();
            CoverageForm.dateRangeRowList[0].inputBeginDate('12/16/2018');
            CoverageForm.dateRangeRowList[0].pressEnterBeginDate();
            CoverageForm.dateRangeRowList[0].clearBeginDate();
            CoverageForm.dateRangeRowList[0].blurBeginDate();
          });
        });

        it('enables the save button', () => {
          expect(CoverageForm.isSaveButtonEnabled).to.be.true;
        });

        it('shows the input as valid');

        it('does not display any validation errors');

        describe('successfully submitting the form', () => {
          it('switches back out of edit mode');
        });
      });
    });
  });

  describe('visiting a selected customer resource show page with custom coverage', () => {
    it('displays the date ranges');
    it('displays an edit button');
  });
});

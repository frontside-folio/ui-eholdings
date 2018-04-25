import { expect } from 'chai';
import { describe, beforeEach, it } from '@bigtest/mocha';

import { describeApplication } from './helpers';
import TitleShowPage from './pages/title-show';

describeApplication.only('TitleShow', () => {
  let title,
    resources;

  beforeEach(function () {
    title = this.server.create('title', 'withPackages', {
      name: 'Cool Title',
      publisherName: 'Cool Publisher',
      publicationType: 'Website'
    });

    resources = title.resources.models;
  });

  describe('visiting the title page', () => {
    beforeEach(function () {
      return this.visit(`/eholdings/titles/${title.id}`, () => {
        expect(TitleShowPage.$root).to.exist;
      });
    });

    describe('clicking the add to custom package button', () => {
      beforeEach(() => {
        return TitleShowPage.clickAddToCustomPackageButton();
      });

      it('shows the modal for adding a custom package', () => {
        expect(TitleShowPage.customPackageModal.isPresent).to.be.true;
      });

      it('contains a list of custom packages this title does not have a resource with');

      describe('clicking cancel', () => {
        beforeEach(() => {
          return TitleShowPage.customPackageModal.cancel();
        });

        it('dismisses the modal', () => {
          expect(TitleShowPage.customPackageModal.exists).to.be.false;
        });
      });

      describe('clicking submit', () => {
        beforeEach(() => {
          return TitleShowPage.customPackageModal.submit();
        });

        it('redirects to the newly created resource');
      });
    });
  });
});

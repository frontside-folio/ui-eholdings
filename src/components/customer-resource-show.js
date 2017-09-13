import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import KeyValueLabel from './key-value-label';
import IdentifiersList from './identifiers-list';
import ContributorsList from './contributors-list';

export default function CustomerResourceShow({ customerResource, toggleRequest, toggleSelected }) {
  const record = customerResource.content;

  return (
    <div data-test-eholdings-customer-resource-show>
      <Paneset>
        <Pane defaultWidth="100%">
          {customerResource.isResolved ? (
            <div>
              <div style={{ margin: '2rem 0' }}>
                <KeyValueLabel label="Resource">
                  <h1 data-test-eholdings-customer-resource-show-title-name>
                    {record.titleName}
                  </h1>
                </KeyValueLabel>
              </div>

              <KeyValueLabel label="Publisher">
                <div data-test-eholdings-customer-resource-show-publisher-name>
                  {record.publisherName}
                </div>
              </KeyValueLabel>

              <KeyValueLabel label="Publication Type">
                <div data-test-eholdings-customer-resource-show-publication-type>
                  {record.pubType}
                </div>
              </KeyValueLabel>

              <IdentifiersList data={record.identifiersList} />
              <ContributorsList data={record.contributorsList} />

              <KeyValueLabel label="Package">
                <div data-test-eholdings-customer-resource-show-package-name>
                  <Link to={`/eholdings/vendors/${record.vendorId}/packages/${record.packageId}`}>{record.packageName}</Link>
                </div>
              </KeyValueLabel>

              {record.contentType && (
                <KeyValueLabel label="Content Type">
                  <div data-test-eholdings-customer-resource-show-content-type>
                    {record.contentType}
                  </div>
                </KeyValueLabel>
              ) }

              <KeyValueLabel label="Vendor">
                <div data-test-eholdings-customer-resource-show-vendor-name>
                  <Link to={`/eholdings/vendors/${record.vendorId}`}>{record.vendorName}</Link>
                </div>
              </KeyValueLabel>

              {record.url && (
                <KeyValueLabel label="Managed URL">
                  <div data-test-eholdings-customer-resource-show-managed-url>
                    <Link to={record.url}>{record.url}</Link>
                  </div>
                </KeyValueLabel>
              ) }

              {record.subjectsList && record.subjectsList.length > 0 && (
                <KeyValueLabel label="Subjects">
                  <div data-test-eholdings-customer-resource-show-subjects-list>
                    {record.subjectsList.map((subjectObj) => subjectObj.subject).join('; ')}
                  </div>
                </KeyValueLabel>
              ) }

              {record.managedEmbargoPeriod.embargoUnit && (
                <KeyValueLabel label="Managed Embargo Period">
                  <div data-test-eholdings-customer-resource-show-managed-embargo-period>
                    {record.managedEmbargoPeriod.embargoValue} {record.managedEmbargoPeriod.embargoUnit}
                  </div>
                </KeyValueLabel>
              ) }

              {record.customEmbargoPeriod.embargoUnit && (
                <KeyValueLabel label="Custom Embargo Period">
                  <div data-test-eholdings-customer-resource-show-custom-embargo-period>
                    {record.customEmbargoPeriod.embargoValue} {record.customEmbargoPeriod.embargoUnit}
                  </div>
                </KeyValueLabel>
              ) }

              <hr />

              <KeyValueLabel label="Selected">
                <div data-test-eholdings-customer-resource-show-selected>
                  <input type="checkbox" onChange={toggleSelected} disabled={toggleRequest.isPending} checked={record.isSelected} />
                  {record.isSelected ? 'Yes' : 'No'}
                  {toggleRequest.isPending && (
                    <span data-test-eholdings-customer-resource-show-is-selecting>...</span>
                  )}
                </div>
              </KeyValueLabel>

              <hr/>

              {record.visibilityData.isHidden && (
                <div data-test-eholdings-customer-resource-show-is-hidden>
                  <p><strong>This resource is hidden.</strong></p>
                  <p><em>{record.visibilityData.reason}</em></p>
                  <hr />
                </div>
              )}

              <div>
                <Link to={`/eholdings/titles/${record.titleId}`}>
                  View all packages that include this title
                </Link>
              </div>
            </div>
          ) : customerResource.isRejected ? (
            <p data-test-eholdings-customer-resource-show-error>
              {customerResource.error.length ? customerResource.error[0].message : customerResource.error.message}
            </p>
          ) : (
            <p>Loading...</p>
          )}
        </Pane>
      </Paneset>
    </div>
  );
}

CustomerResourceShow.propTypes = {
  customerResource: PropTypes.object.isRequired,
  toggleRequest: PropTypes.object.isRequired,
  toggleSelected: PropTypes.func.isRequired
};

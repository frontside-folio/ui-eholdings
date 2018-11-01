import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Select } from '@folio/stripes/components';

class PackageContentTypeField extends Component {
  static propTypes = {
    intl: intlShape.isRequired
  }

  render() {
    let { input, intl } = this.props;
    return (
      <div data-test-eholdings-package-content-type-field>
        <Select
          label="Content type"
          dataOptions={[
            { value: 'Aggregated Full Text', label: intl.formatMessage({ id: 'ui-eholdings.filter.contentType.aggregated' }) },
            { value: 'Abstract and Index', label: intl.formatMessage({ id: 'ui-eholdings.filter.contentType.abstract' }) },
            { value: 'E-Book', label: intl.formatMessage({ id: 'ui-eholdings.filter.contentType.ebook' }) },
            { value: 'E-Journal', label: intl.formatMessage({ id: 'ui-eholdings.filter.contentType.ejournal' }) },
            { value: 'Print', label: intl.formatMessage({ id: 'ui-eholdings.filter.contentType.print' }) },
            { value: 'Online Reference', label: intl.formatMessage({ id: 'ui-eholdings.filter.contentType.onlineReference' }) },
            { value: 'Unknown', label: intl.formatMessage({ id: 'ui-eholdings.filter.contentType.unknown' }) }
          ]}
          {...input}
        />
      </div>
    );
  }
}

export default injectIntl(PackageContentTypeField);

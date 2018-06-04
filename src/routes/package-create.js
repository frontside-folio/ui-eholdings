import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { createResolver } from '../redux';
import Package from '../redux/package';

import View from '../components/package/create';

class PackageCreateRoute extends Component {
  static propTypes = {
    createRequest: PropTypes.object.isRequired,
    createPackage: PropTypes.func.isRequired
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        replace: PropTypes.func.isRequired
      }).isRequired
    }).isRequired
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.createRequest.isResolved && this.props.createRequest.isResolved) {
      this.context.router.history.replace(
        `/eholdings/packages/${this.props.createRequest.records[0]}`,
        { eholdings: true, isNewRecord: true }
      );
    }
  }

  packageCreateSubmitted = (values) => {
    let attrs = {};

    if (values.customCoverages[0]) {
      attrs.customCoverage = values.customCoverages[0];
    }

    if ('name' in values) {
      attrs.name = values.name;
    }

    if ('contentType' in values) {
      attrs.contentType = values.contentType;
    }

    this.props.createPackage(attrs);
  };

  render() {
    return (
      <View
        request={this.props.createRequest}
        onSubmit={this.packageCreateSubmitted}
        initialValues={{
          name: '',
          contentType: '',
          customCoverages: []
        }}
      />
    );
  }
}

export default connect(
  ({ eholdings: { data } }) => ({
    createRequest: createResolver(data).getRequest('create', { type: 'packages' })
  }), {
    createPackage: attrs => Package.create(attrs)
  }
)(PackageCreateRoute);

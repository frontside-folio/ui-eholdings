import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Icon from '@folio/stripes-components/lib/Icon';

import { getBackendStatus } from '../redux/application';
import NoBackendErrorScreen from '../components/error-screen/no-backend';
import FailedBackendErrorScreen from '../components/error-screen/failed-backend';
import InvalidBackendErrorScreen from '../components/error-screen/invalid-backend';

class ApplicationRoute extends Component {
  static propTypes = {
    showSettings: PropTypes.bool,
    children: PropTypes.node.isRequired,
    interfaces: PropTypes.object,
    status: PropTypes.object.isRequired,
    getBackendStatus: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.getBackendStatus();
  }

  get view() {
    let {
      status,
      interfaces: { eholdings: version },
      showSettings,
      children
    } = this.props;

    if (version) {
      if (status.isPending) {
        return (<Icon icon="spinner-ellipsis" />);
      } else if (status.isRejected) {
        return (<FailedBackendErrorScreen />);
      } else if (!(showSettings || status.content['is-configuration-valid'])) {
        return (<InvalidBackendErrorScreen />);
      } else {
        return children;
      }
    } else {
      return (<NoBackendErrorScreen />);
    }
  }

  render() {
    return (
      <div className="eholdings-application" data-test-eholdings-application style={{ width: '100%' }}>
        {this.view}
      </div>
    );
  }
}

export default connect(
  ({
    eholdings: { application },
    discovery: { interfaces = {} }
  }) => ({
    status: application.status,
    interfaces
  }),
  { getBackendStatus }
)(ApplicationRoute);

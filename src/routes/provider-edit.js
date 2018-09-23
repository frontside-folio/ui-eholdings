import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { connect } from 'react-redux';
import { TitleManager } from '@folio/stripes-core';

import { createResolver } from '../redux';
import Provider from '../redux/provider';
import { ProxyType, RootProxy } from '../redux/application';

import View from '../components/provider/edit';

class ProviderEditRoute extends Component {
  static propTypes = {
    match: ReactRouterPropTypes.match.isRequired,
    model: PropTypes.object.isRequired,
    getProxyTypes: PropTypes.func.isRequired,
    getRootProxy: PropTypes.func.isRequired,
    getProvider: PropTypes.func.isRequired,
    updateProvider: PropTypes.func.isRequired,
    proxyTypes: PropTypes.object.isRequired,
    rootProxy: PropTypes.object.isRequired,
    history: ReactRouterPropTypes.history.isRequired,
    location: ReactRouterPropTypes.location.isRequired
  };

  constructor(props) {
    super(props);
    let { match, getProvider, getProxyTypes, getRootProxy } = props;
    let { providerId } = match.params;
    getProvider(providerId);
    getProxyTypes();
    getRootProxy();
  }


  componentDidUpdate(prevProps) {
    let { match, getProvider } = this.props;
    let { providerId } = match.params;

    if (providerId !== prevProps.match.params.providerId) {
      getProvider(providerId);
    }
  }

  providerEditSubmitted = (values) => {
    let { model, updateProvider } = this.props;
    model.proxy.id = values.proxyId;
    model.providerToken.value = values.providerTokenValue;
    updateProvider(model);
  };

  render() {
    let { model, proxyTypes, rootProxy, history, location } = this.props;

    return (
      <TitleManager record={`Edit ${this.props.model.name}`}>
        <View
          model={model}
          onSubmit={this.providerEditSubmitted}
          onCancel={() => history.push({
            pathname: `/eholdings/providers/${model.id}`,
            search: location.search,
            state: { eholdings: true }
          })}
          initialValues={{
            proxyId: model.proxy.id,
            providerTokenValue: model.providerToken.value
          }}
          proxyTypes={proxyTypes}
          rootProxy={rootProxy}
          onSuccessfulSave={() => {
            history.push({
              pathname: `/eholdings/providers/${model.id}`,
              search: location.search,
              state: { eholdings: true, isFreshlySaved: true }
            });
          }}
          hasFullViewLink={location.search}
        />
      </TitleManager>
    );
  }
}

export default connect(
  ({ eholdings: { data } }, { match }) => ({
    model: createResolver(data).find('providers', match.params.providerId),
    proxyTypes: createResolver(data).query('proxyTypes'),
    rootProxy: createResolver(data).find('rootProxies', 'root-proxy')
  }), {
    getProvider: id => Provider.find(id),
    updateProvider: model => Provider.save(model),
    getProxyTypes: () => ProxyType.query(),
    getRootProxy: () => RootProxy.find('root-proxy')
  }
)(ProviderEditRoute);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { createResolver } from '../redux';
import Package from '../redux/package';
import Title from '../redux/title';
import Resource from '../redux/resource';
import View from '../components/title/show';

class TitleShowRoute extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        titleId: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,
    model: PropTypes.object.isRequired,
    getTitle: PropTypes.func.isRequired,
    getCustomPackages: PropTypes.func.isRequired,
    createResource: PropTypes.func.isRequired
  };

  componentWillMount() {
    let { match, getTitle } = this.props;
    let { titleId } = match.params;
    getTitle(titleId);
  }

  componentWillReceiveProps(nextProps) {
    let { match, getTitle } = nextProps;
    let { titleId } = match.params;

    if (titleId !== this.props.match.params.titleId) {
      getTitle(titleId);
    }
  }

  customPackageAdditionSubmitted = (packageId) => {
    // console.log('customPackageAdditionSubmitted');
    let { match, createResource } = this.props;
    let { titleId } = match.params;

    createResource({
      packageId,
      titleId
    });
  }

  render() {
    return (
      <View
        model={this.props.model}
        getCustomPackages={this.props.getCustomPackages}
        customPackageAdditionSubmitted={this.customPackageAdditionSubmitted}
      />
    );
  }
}

export default connect(
  ({ eholdings: { data } }, { match }) => ({
    model: createResolver(data).find('titles', match.params.titleId)
  }), {
    getTitle: id => Title.find(id, { include: 'resources' }),
    getCustomPackages: params => Package.query(params),
    createResource: attrs => Resource.create(attrs)
  }
)(TitleShowRoute);

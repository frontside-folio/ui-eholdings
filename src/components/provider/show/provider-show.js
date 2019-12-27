import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedNumber,
  FormattedMessage,
} from 'react-intl';

import update from 'lodash/fp/update';
import set from 'lodash/fp/set';
import hasIn from 'lodash/fp/hasIn';

import {
  withStripes,
  IfPermission,
} from '@folio/stripes-core';

import { NotesSmartAccordion } from '@folio/stripes/smart-components';

import {
  Accordion,
  Button,
  Headline,
  Icon,
  IconButton,
  KeyValue,
} from '@folio/stripes/components';

import { processErrors } from '../../utilities';
import {
  entityTypes,
  DOMAIN_NAME,
  paths,
} from '../../../constants';

import DetailsView from '../../details-view';
import QueryList from '../../query-list';
import PackageListItem from '../../package-list-item';
import Toaster from '../../toaster';
import ProxyDisplay from '../../proxy-display';
import TokenDisplay from '../../token-display';
import TagsAccordion from '../../tags';

const ITEM_HEIGHT = 53;

class ProviderShow extends Component {
  static propTypes = {
    fetchPackages: PropTypes.func.isRequired,
    isFreshlySaved: PropTypes.bool,
    listType: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    packages: PropTypes.object.isRequired,
    proxyTypes: PropTypes.object.isRequired,
    rootProxy: PropTypes.object.isRequired,
    searchModal: PropTypes.node,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    tagsModel: PropTypes.object,
    updateFolioTags: PropTypes.func.isRequired,
  };

  state = {
    sections: {
      providerShowTags: true,
      providerShowProviderInformation: true,
      providerShowProviderSettings: true,
      providerShowProviderList: true,
      providerShowNotes: true,
    }
  };

  handleSectionToggle = ({ id }) => {
    const next = update(`sections.${id}`, value => !value, this.state);
    this.setState(next);
  }

  handleExpandAll = (sections) => {
    const next = set('sections', sections, this.state);
    this.setState(next);
  }

  get toasts() {
    const { model, isFreshlySaved } = this.props;
    const toasts = processErrors(model);

    // if coming from saving edits to the package, show a success toast
    if (isFreshlySaved) {
      toasts.push({
        id: `success-provider-saved-${model.id}`,
        message: <FormattedMessage id="ui-eholdings.provider.toast.isFreshlySaved" />,
        type: 'success'
      });
    }

    return toasts;
  }

  getActionMenu = () => {
    const {
      stripes,
      onEdit,
    } = this.props;

    const hasEditPermission = stripes.hasPerm('ui-eholdings.records.edit');

    if (!hasEditPermission) return null;

    return ({ onToggle }) => (
      <Button
        buttonStyle="dropdownItem fullWidth"
        onClick={() => {
          onToggle();
          onEdit();
        }}
      >
        <FormattedMessage id="ui-eholdings.actionMenu.edit" />
      </Button>
    );
  }

  renderLastMenu() {
    const {
      model: { name },
      onEdit,
    } = this.props;

    return (
      <IfPermission perm="ui-eholdings.records.edit">
        <FormattedMessage
          id="ui-eholdings.label.editLink"
          values={{
            name,
          }}
        >
          {ariaLabel => (
            <IconButton
              data-test-eholdings-provider-edit-link
              icon="edit"
              ariaLabel={ariaLabel}
              onClick={onEdit}
            />
          )}
        </FormattedMessage>
      </IfPermission>
    );
  }

  renderProxy() {
    const {
      proxyTypes,
      rootProxy,
      model,
    } = this.props;

    const proxyIsLoading = !proxyTypes.request.isResolved || !rootProxy.request.isResolved || model.isLoading;

    return proxyIsLoading
      ? <Icon icon="spinner-ellipsis" />
      : (
        <ProxyDisplay
          model={model}
          proxyTypes={proxyTypes}
          inheritedProxyId={rootProxy.data.attributes.proxyTypeId}
        />
      );
  }

  renderToken() {
    const {
      model,
    } = this.props;

    return model.isLoading
      ? <Icon icon="spinner-ellipsis" />
      : (
        <KeyValue label={<FormattedMessage id="ui-eholdings.provider.token" />}>
          <TokenDisplay
            token={model.providerToken}
            type="provider"
          />
        </KeyValue>
      );
  }

  getBodyContent() {
    const {
      model,
      tagsModel,
      updateFolioTags,
    } = this.props;

    const {
      sections,
    } = this.state;

    const hasProxy = hasIn('proxy.id', model);
    const hasToken = hasIn('providerToken.prompt', model);
    const hasProviderSettings = hasProxy || hasToken;

    return (
      <Fragment>
        <TagsAccordion
          id="providerShowTags"
          model={model}
          onToggle={this.handleSectionToggle}
          open={sections.providerShowTags}
          tagsModel={tagsModel}
          updateFolioTags={updateFolioTags}
        />

        <Accordion
          label={(
            <Headline
              size="large"
              tag="h3"
            >
              <FormattedMessage id="ui-eholdings.provider.providerInformation" />
            </Headline>
          )}
          open={sections.providerShowProviderInformation}
          id="providerShowProviderInformation"
          onToggle={this.handleSectionToggle}
        >
          <KeyValue label={<FormattedMessage id="ui-eholdings.provider.packagesSelected" />}>
            <div data-test-eholdings-provider-details-packages-selected>
              <FormattedNumber value={model.packagesSelected} />
            </div>
          </KeyValue>

          <KeyValue label={<FormattedMessage id="ui-eholdings.provider.totalPackages" />}>
            <div data-test-eholdings-provider-details-packages-total>
              <FormattedNumber value={model.packagesTotal} />
            </div>
          </KeyValue>
        </Accordion>

        {
          hasProviderSettings && (
            <Accordion
              label={(
                <Headline
                  size="large"
                  tag="h3"
                >
                  <FormattedMessage id="ui-eholdings.provider.providerSettings" />
                </Headline>
              )}
              open={sections.providerShowProviderSettings}
              id="providerShowProviderSettings"
              onToggle={this.handleSectionToggle}
            >
              {hasProxy && this.renderProxy()}
              {hasToken && this.renderToken()}
            </Accordion>
          )
        }

        <NotesSmartAccordion
          id="providerShowNotes"
          open={sections.providerShowNotes}
          onToggle={this.handleSectionToggle}
          domainName={DOMAIN_NAME}
          entityName={model.name}
          entityType={entityTypes.PROVIDER}
          entityId={model.id}
          pathToNoteCreate={paths.NOTE_CREATE}
          pathToNoteDetails={paths.NOTES}
        />
      </Fragment>
    );
  }

  renderPackagesListItem = (item) => {
    const itemLink = item.content && `/eholdings/packages/${item.content.id}`;

    return (
      <PackageListItem
        link={itemLink}
        item={item.content}
        showTitleCount
        headingLevel='h4'
      />
    );
  }

  renderPackagesList = (scrollable) => {
    const {
      fetchPackages,
      packages,
    } = this.props;

    return (
      <QueryList
        type="provider-packages"
        fetch={fetchPackages}
        collection={packages}
        length={packages.length}
        scrollable={scrollable}
        itemHeight={ITEM_HEIGHT}
        notFoundMessage={<FormattedMessage id="ui-eholdings.notFound" />}
        renderItem={this.renderPackagesListItem}
      />
    );
  }

  render() {
    const {
      listType,
      model,
      packages,
      searchModal,
    } = this.props;

    const { sections } = this.state;

    return (
      <Fragment>
        <Toaster
          toasts={this.toasts}
          position="bottom"
        />
        <DetailsView
          type="provider"
          model={model}
          key={model.id}
          paneTitle={model.name}
          actionMenu={this.getActionMenu()}
          sections={sections}
          handleExpandAll={this.handleExpandAll}
          bodyContent={this.getBodyContent()}
          lastMenu={this.renderLastMenu()}
          searchModal={searchModal}
          listType={listType}
          listSectionId="providerShowProviderList"
          onListToggle={this.handleSectionToggle}
          resultsLength={packages.length}
          renderList={this.renderPackagesList}
          ariaRole="tablist"
        />
      </Fragment>
    );
  }
}

export default withStripes(ProviderShow);

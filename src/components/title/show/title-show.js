import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  IconButton,
  KeyValue,
  PaneMenu
} from '@folio/stripes-components';

import { processErrors } from '../../utilities';
import DetailsView from '../../details-view';
import ScrollView from '../../scroll-view';
import PackageListItem from '../../package-list-item';
import IdentifiersList from '../../identifiers-list';
import ContributorsList from '../../contributors-list';
import DetailsViewSection from '../../details-view-section';
import Toaster from '../../toaster';
import Modal from '../../modal';
import AddForm from './add-form';
import styles from './title-show.css';


export default class TitleShow extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    customPackages: PropTypes.object.isRequired,
    customPackageAdditionSubmitted: PropTypes.func.isRequired,
  };

  static contextTypes = {
    router: PropTypes.object,
    queryParams: PropTypes.object
  };

  state = {
    showCustomPackageModal: false,
  };

  toggleCustomPackageModal = () => {
    this.setState({
      showCustomPackageModal: !this.state.showCustomPackageModal
    });
  };

  submitCustomPackageModal = () => {
    this.props.customPackageAdditionSubmitted();
  };

  render() {
    let {
      model,
      customPackages
    } = this.props;
    let {
      queryParams,
      router
    } = this.context;
    let { showCustomPackageModal } = this.state;
    let actionMenuItems = [];

    if (model.isTitleCustom) {
      actionMenuItems.push({
        label: 'Edit',
        to: {
          pathname: `/eholdings/titles/${model.id}/edit`,
          search: router.route.location.search,
          state: { eholdings: true }
        }
      });
    }

    if (queryParams.searchType) {
      actionMenuItems.push({
        label: 'Full view',
        to: {
          pathname: `/eholdings/titles/${model.id}`,
          state: { eholdings: true }
        },
        className: styles['full-view-link']
      });
    }

    let customPackageOptions = customPackages.map(pkg => ({
      label: pkg.name,
      value: pkg.id
    }));

    let lastMenu;
    if (model.isTitleCustom) {
      lastMenu = (
        <PaneMenu>
          <IconButton
            data-test-eholdings-title-edit-link
            icon="edit"
            ariaLabel={`Edit ${model.name}`}
            href={{
              pathname: `/eholdings/titles/${model.id}/edit`,
              search: router.route.location.search,
              state: { eholdings: true }
            }}
          />
        </PaneMenu>
      );
    }

    return (
      <div>
        <Toaster toasts={processErrors(model)} position="bottom" />

        <DetailsView
          type="title"
          model={model}
          paneTitle={model.name}
          actionMenuItems={actionMenuItems}
          lastMenu={lastMenu}
          bodyContent={(
            <DetailsViewSection label="Title information">
              <ContributorsList data={model.contributors} />

              {model.publisherName && (
                <KeyValue label="Publisher">
                  <div data-test-eholdings-title-show-publisher-name>
                    {model.publisherName}
                  </div>
                </KeyValue>
              )}

              {model.publicationType && (
                <KeyValue label="Publication Type">
                  <div data-test-eholdings-title-show-publication-type>
                    {model.publicationType}
                  </div>
                </KeyValue>
              )}

              <IdentifiersList data={model.identifiers} />

              {model.subjects.length > 0 && (
                <KeyValue label="Subjects">
                  <div data-test-eholdings-title-show-subjects-list>
                    {model.subjects.map(subjectObj => subjectObj.subject).join('; ')}
                  </div>
                </KeyValue>
              )}

              <KeyValue label="Peer reviewed">
                <div data-test-eholdings-peer-reviewed-field>
                  {model.isPeerReviewed ? 'Yes' : 'No'}
                </div>
              </KeyValue>

              <KeyValue label="Title type">
                <div data-test-eholdings-title-details-type>
                  {model.isTitleCustom ? 'Custom' : 'Managed'}
                </div>
              </KeyValue>

              {model.description && (
                <KeyValue label="Description">
                  <div data-test-eholdings-description-field>
                    {model.description}
                  </div>
                </KeyValue>
              )}

              <div className={styles['add-to-custom-package-button']}>
                <Button
                  data-test-eholdings-add-to-custom-package-button
                  onClick={this.toggleCustomPackageModal}
                >
                  Add to custom package
                </Button>
              </div>
            </DetailsViewSection>
          )}
          listType="packages"
          renderList={scrollable => (
            <ScrollView
              itemHeight={70}
              items={model.resources}
              scrollable={scrollable}
              data-test-query-list="title-packages"
            >
              {item => (
                <PackageListItem
                  link={`/eholdings/resources/${item.id}`}
                  packageName={item.packageName}
                  item={item}
                  headingLevel='h4'
                />
              )}
            </ScrollView>
          )}
        />

        <Modal
          open={showCustomPackageModal}
          size="small"
          label="Add title to custom package"
          scope="root"
          id="eholdings-custom-package-modal"
          footer={(
            <div>
              <Button
                buttonStyle="primary"
                onClick={this.submitCustomPackageModal}
                data-test-eholdings-custom-package-modal-submit
              >
                Submit
              </Button>
              <Button
                onClick={this.toggleCustomPackageModal}
                data-test-eholdings-custom-package-modal-cancel
              >
                Cancel
              </Button>
            </div>
          )}
        >
          <AddForm
            options={customPackageOptions}
            onSubmit={this.props.customPackageAdditionSubmitted}
            initialValues={{
              packageId: customPackageOptions.length && customPackageOptions[0].id
            }}
          />
        </Modal>
      </div>
    );
  }
}

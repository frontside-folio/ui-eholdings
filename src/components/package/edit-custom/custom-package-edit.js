import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import isEqual from 'lodash/isEqual';
import { intlShape, injectIntl } from 'react-intl';

import {
  Button,
  Icon,
  KeyValue,
  RadioButton,
  RadioButtonGroup
} from '@folio/stripes-components';
import { processErrors } from '../../utilities';

import DetailsView from '../../details-view';
import NameField, { validate as validatePackageName } from '../_fields/name';
import CoverageFields, { validate as validateCoverageDates } from '../_fields/custom-coverage';
import ContentTypeField from '../_fields/content-type';
import DetailsViewSection from '../../details-view-section';
import NavigationModal from '../../navigation-modal';
import ToggleSwitch from '../../toggle-switch/toggle-switch';
import Modal from '../../modal/modal';
import Toaster from '../../toaster';
import styles from './custom-package-edit.css';

class CustomPackageEdit extends Component {
  static propTypes = {
    change: PropTypes.func,
    handleSubmit: PropTypes.func,
    initialValues: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    intl: intlShape.isRequired // eslint-disable-line react/no-unused-prop-types
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    queryParams: PropTypes.object
  };

  state = {
    showSelectionModal: false,
    allowFormToSubmit: false,
    packageSelected: this.props.initialValues.isSelected,
    packageVisible: this.props.initialValues.isVisible,
    formValues: {}
  }

  componentWillReceiveProps(nextProps) {
    let wasPending = this.props.model.update.isPending && !nextProps.model.update.isPending;
    let needsUpdate = !isEqual(this.props.model, nextProps.model);
    let { router } = this.context;

    if (nextProps.initialValues.isSelected !== this.props.initialValues.isSelected) {
      this.setState({
        ...this.state,
        packageSelected: nextProps.initialValues.isSelected
      });
    }

    if (wasPending && needsUpdate) {
      router.history.push({
        pathname: `/eholdings/packages/${this.props.model.id}`,
        search: router.route.location.search,
        state: { eholdings: true, isFreshlySaved: true }
      });
    }
  }

  handleCancel = () => {
    let { router } = this.context;

    router.history.push({
      pathname: `/eholdings/packages/${this.props.model.id}`,
      search: this.context.router.route.location.search,
      state: { eholdings: true }
    });
  }

  handleSelectionToggle = (e) => {
    this.setState({
      packageSelected: e.target.checked
    });
  }

  commitSelectionToggle = () => {
    this.setState({
      showSelectionModal: false,
      allowFormToSubmit: true
    }, () => { this.handleOnSubmit(this.state.formValues); });
  };

  cancelSelectionToggle = () => {
    this.setState({
      showSelectionModal: false,
      packageSelected: true,
    }, () => {
      this.props.change('isSelected', true);
    });
  };

  handleOnSubmit = (values) => {
    if (this.state.allowFormToSubmit === false && values.isSelected === false) {
      this.setState({
        showSelectionModal: true,
        formValues: values
      });
    } else {
      this.setState({
        allowFormToSubmit: false,
        formValues: {}
      }, () => {
        this.props.onSubmit(values);
      });
    }
  }

  render() {
    let {
      model,
      initialValues,
      handleSubmit,
      pristine,
    } = this.props;

    let {
      showSelectionModal,
      packageSelected
    } = this.state;

    let {
      queryParams,
      router
    } = this.context;

    let visibilityMessage = model.visibilityData.reason && `(${model.visibilityData.reason})`;

    let actionMenuItems = [
      {
        label: 'Cancel editing',
        to: {
          pathname: `/eholdings/packages/${model.id}`,
          search: router.route.location.search,
          state: { eholdings: true }
        }
      }
    ];

    if (queryParams.searchType) {
      actionMenuItems.push({
        label: 'Full view',
        to: {
          pathname: `/eholdings/packages/${model.id}/edit`,
          state: { eholdings: true }
        },
        className: styles['full-view-link']
      });
    }

    return (
      <div>
        <Toaster toasts={processErrors(model)} position="bottom" />
        <DetailsView
          type="package"
          model={model}
          paneTitle={model.name}
          actionMenuItems={actionMenuItems}
          bodyContent={(
            <form onSubmit={handleSubmit(this.handleOnSubmit)}>
              <DetailsViewSection
                label="Package information"
              >
                {packageSelected ? (
                  <NameField />
               ) : (
                 <KeyValue label="Name">
                   <div data-test-eholdings-package-readonly-name-field>
                     {model.name}
                   </div>
                 </KeyValue>

               )}
                {packageSelected ? (
                  <ContentTypeField />
               ) : (
                 <KeyValue label="Content type">
                   <div data-test-eholdings-package-details-readonly-content-type>
                     {model.contentType}
                   </div>
                 </KeyValue>
               )}
              </DetailsViewSection>
              <DetailsViewSection
                label="Holding status"
              >
                <label
                  data-test-eholdings-package-details-selected
                  htmlFor="custom-package-details-toggle-switch"
                >
                  <h4>{packageSelected ? 'Selected' : 'Not selected'}</h4>
                  <br />

                  <Field
                    name="isSelected"
                    component={ToggleSwitch}
                    checked={packageSelected}
                    onChange={this.handleSelectionToggle}
                    id="custom-package-details-toggle-switch"
                  />
                </label>
              </DetailsViewSection>
              <DetailsViewSection label="Package settings">
                {packageSelected ? (
                  <div className={styles['visibility-radios']}>
                    {this.props.initialValues.isVisible != null ? (
                      <Fragment>
                        <div data-test-eholdings-package-visibility-field>
                          <Field
                            label="Show titles in package to patrons"
                            name="isVisible"
                            component={RadioButtonGroup}
                          >
                            <RadioButton label="Yes" value="true" />
                            <RadioButton label={`No ${visibilityMessage}`} value="false" />
                          </Field>
                        </div>
                      </Fragment>
                    ) : (
                      <label
                        data-test-eholdings-package-details-visibility
                        htmlFor="managed-package-details-visibility-switch"
                      >
                        <Icon icon="spinner-ellipsis" />
                      </label>

                    )}
                  </div>
                ) : (
                  <p>Not shown to patrons.</p>
                )}
              </DetailsViewSection>

              <DetailsViewSection
                label="Coverage dates"
              >
                {packageSelected ? (
                  <CoverageFields
                    initialValue={initialValues.customCoverages}
                  />) : (
                    <p>Add the package to holdings to set custom coverage dates.</p>
                )}
              </DetailsViewSection>

              <div className={styles['package-edit-action-buttons']}>
                <div
                  data-test-eholdings-package-cancel-button
                >
                  <Button
                    disabled={model.update.isPending}
                    type="button"
                    onClick={this.handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
                <div
                  data-test-eholdings-package-save-button
                >
                  <Button
                    disabled={pristine || model.update.isPending}
                    type="submit"
                    buttonStyle="primary"
                  >
                    {model.update.isPending ? 'Saving' : 'Save'}
                  </Button>
                </div>
                {model.update.isPending && (
                  <Icon icon="spinner-ellipsis" />
                )}
              </div>
              <NavigationModal when={!pristine && !model.update.isPending} />
            </form>
          )}
        />


        <Modal
          open={showSelectionModal}
          size="small"
          label="Delete custom package"
          scope="root"
          id="eholdings-package-confirmation-modal"
          footer={(
            <div>
              <Button
                buttonStyle="primary"
                onClick={this.commitSelectionToggle}
                data-test-eholdings-package-deselection-confirmation-modal-yes
              >
                Yes, delete
              </Button>
              <Button
                onClick={this.cancelSelectionToggle}
                data-test-eholdings-package-deselection-confirmation-modal-no
              >
                No, do not delete
              </Button>
            </div>
          )}
        >
          Are you sure you want to delete this package? By deleting this package it will no longer be available for selection and all customization will be lost. If a title only appears in this package it will no longer be available for selection.
        </Modal>
      </div>
    );
  }
}

const validate = (values, props) => {
  return Object.assign({}, validatePackageName(values), validateCoverageDates(values, props));
};

export default injectIntl(reduxForm({
  validate,
  form: 'CustomPackageEdit',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(CustomPackageEdit));

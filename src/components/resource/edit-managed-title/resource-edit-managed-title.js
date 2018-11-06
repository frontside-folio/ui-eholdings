import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import update from 'lodash/fp/update';

import {
  Accordion,
  Button,
  Headline,
  Icon,
  Modal,
  ModalFooter
} from '@folio/stripes/components';

import { processErrors, isBookPublicationType } from '../../utilities';

import DetailsView from '../../details-view';
import VisibilityField from '../_fields/visibility';
import CoverageStatementFields from '../_fields/coverage-statement';
import ManagedCoverageFields, { validate as validateCoverageDates } from '../_fields/managed-coverage';
import CustomEmbargoFields, { validate as validateEmbargo } from '../_fields/custom-embargo';
import NavigationModal from '../../navigation-modal';
import Toaster from '../../toaster';
import PaneHeaderButton from '../../pane-header-button';
import CoverageDateList from '../../coverage-date-list';
import ProxySelectField from '../../proxy-select';

class ResourceEditManagedTitle extends Component {
  static propTypes = {
    change: PropTypes.func,
    customCoverageDateValues: PropTypes.array,
    handleSubmit: PropTypes.func,
    initialValues: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    proxyTypes: PropTypes.object.isRequired
  };

  state = {
    managedResourceSelected: this.props.initialValues.isSelected,
    showSelectionModal: false,
    allowFormToSubmit: false,
    formValues: {},
    initialValues: this.props.initialValues,
    sections: {
      resourceShowHoldingStatus: true,
      resourceShowSettings: true,
      resourceShowCoverageSettings: true,
    },
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let stateUpdates = {};

    if (nextProps.model.update.errors.length) {
      stateUpdates.showSelectionModal = false;
    }

    if (nextProps.initialValues.isSelected !== prevState.initialValues.isSelected) {
      Object.assign(stateUpdates, {
        initialValues: {
          isSelected: nextProps.initialValues.isSelected
        },
        managedResourceSelected: nextProps.initialValues.isSelected
      });
    }

    return stateUpdates;
  }

  toggleSection = ({ id }) => {
    const newState = update(`sections.${id}`, value => !value, this.state);
    this.setState(newState);
  };

  toggleAllSections = (sections) => {
    this.setState({ sections });
  };

  getSectionHeader = (translationKey) => {
    return (
      <Headline
        size="large"
        tag="h3"
      >
        <FormattedMessage id={translationKey} />
      </Headline>);
  };

  handleSelectionToggle = (e) => {
    this.setState({
      managedResourceSelected: e.target.checked
    });
  };

  handleRemoveResourceFromHoldings = () => {
    this.setState({
      formValues: {
        isSelected: false
      }
    }, () => { this.handleOnSubmit(this.state.formValues); });
  };

  handleAddResourceToHoldings = () => {
    this.setState({
      formValues: {
        isSelected: true
      }
    }, () => { this.handleOnSubmit(this.state.formValues); });
  };

  commitSelectionToggle = () => {
    this.setState({
      allowFormToSubmit: true
    }, () => { this.handleOnSubmit(this.state.formValues); });
  };

  cancelSelectionToggle = () => {
    this.setState({
      showSelectionModal: false,
      managedResourceSelected: true,
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
  };

  renderCoverageDates = () => {
    let { customCoverageDateValues, model } = this.props;
    let coverageDates = model.managedCoverages;

    if (customCoverageDateValues && customCoverageDateValues.length > 0) {
      coverageDates = customCoverageDateValues;
    }

    return (
      <CoverageDateList
        coverageArray={coverageDates}
        isYearOnly={isBookPublicationType(model.publicationType)}
      />
    );
  };

  render() {
    let {
      model,
      proxyTypes,
      initialValues,
      handleSubmit,
      pristine,
      change,
      onCancel
    } = this.props;

    let {
      showSelectionModal,
      managedResourceSelected,
      sections,
    } = this.state;

    let isSelectInFlight = model.update.isPending && 'isSelected' in model.update.changedAttributes;

    let hasInheritedProxy = model.package &&
      model.package.proxy &&
      model.package.proxy.id;

    let actionMenuItems = [
      {
        'label': <FormattedMessage id="ui-eholdings.actionMenu.cancelEditing" />,
        'onClick': onCancel,
        'data-test-eholdings-resource-cancel-action': true
      }
    ];

    if (managedResourceSelected === true) {
      actionMenuItems.push({
        'label': <FormattedMessage id="ui-eholdings.resource.actionMenu.removeHolding" />,
        'state': { eholdings: true },
        'onClick': this.handleRemoveResourceFromHoldings,
        'data-test-eholdings-remove-resource-from-holdings': true
      });
    } else if (managedResourceSelected === false) {
      actionMenuItems.push({
        'label': <FormattedMessage id="ui-eholdings.resource.actionMenu.addHolding" />,
        'state': { eholdings: true },
        'onClick': this.handleAddResourceToHoldings,
        'data-test-eholdings-add-resource-to-holdings': true
      });
    }

    let visibilityMessage = model.package.visibilityData.isHidden
      ? <FormattedMessage id="ui-eholdings.resource.visibilityData.isHidden" />
      : model.visibilityData.reason && `(${model.visibilityData.reason})`;

    return (
      <div>
        <Toaster toasts={processErrors(model)} position="bottom" />
        <form onSubmit={handleSubmit(this.handleOnSubmit)}>
          <DetailsView
            type="resource"
            model={model}
            paneTitle={model.title.name}
            paneSub={model.package.name}
            actionMenuItems={actionMenuItems}
            handleExpandAll={this.toggleAllSections}
            sections={sections}
            lastMenu={(
              <Fragment>
                {(model.update.isPending || model.destroy.isPending) && (
                  <Icon icon="spinner-ellipsis" />
                )}
                {managedResourceSelected && (
                  <PaneHeaderButton
                    disabled={pristine || model.update.isPending || model.destroy.isPending}
                    type="submit"
                    buttonStyle="primary"
                    data-test-eholdings-resource-save-button
                  >
                    {model.update.isPending || model.destroy.isPending ?
                      (<FormattedMessage id="ui-eholdings.saving" />)
                      :
                      (<FormattedMessage id="ui-eholdings.save" />)}
                  </PaneHeaderButton>
                )}
              </Fragment>
            )}
            bodyContent={(
              <Fragment>
                <Accordion
                  label={this.getSectionHeader('ui-eholdings.label.holdingStatus')}
                  open={sections.resourceShowHoldingStatus}
                  id="resourceShowHoldingStatus"
                  onToggle={this.toggleSection}
                >
                  <label
                    data-test-eholdings-resource-holding-status
                    htmlFor="managed-resource-holding-status"
                  >
                    {model.update.isPending ? (
                      <Icon icon='spinner-ellipsis' />
                    ) : (
                      <Headline margin="none">
                        {managedResourceSelected ?
                          (<FormattedMessage id="ui-eholdings.selected" />)
                          : (<FormattedMessage id="ui-eholdings.notSelected" />)
                        }
                      </Headline>
                    )
                    }
                    <br />
                    {((!managedResourceSelected && !isSelectInFlight) || (!this.props.model.isSelected && isSelectInFlight)) && (
                      <Button
                        buttonStyle="primary"
                        onClick={this.handleAddResourceToHoldings}
                        disabled={isSelectInFlight}
                        data-test-eholdings-resource-add-to-holdings-button
                      >
                        <FormattedMessage id="ui-eholdings.addToHoldings" />
                      </Button>)}
                  </label>
                </Accordion>

                {managedResourceSelected && (
                  <Accordion
                    label={this.getSectionHeader('ui-eholdings.resource.resourceSettings')}
                    open={sections.resourceShowSettings}
                    id="resourceShowSettings"
                    onToggle={this.toggleSection}
                  >
                    <VisibilityField disabled={visibilityMessage} />
                    <div>
                      {hasInheritedProxy && (
                        (!proxyTypes.request.isResolved) ? (
                          <Icon icon="spinner-ellipsis" />
                        ) : (
                          <div data-test-eholdings-resource-proxy-select>
                            <ProxySelectField proxyTypes={proxyTypes} inheritedProxyId={model.package.proxy.id} />
                          </div>
                        ))}
                    </div>
                  </Accordion>
                )}

                <Accordion
                  label={this.getSectionHeader('ui-eholdings.label.coverageSettings')}
                  open={sections.resourceShowCoverageSettings}
                  id="resourceShowCoverageSettings"
                  onToggle={this.toggleSection}
                >
                  {managedResourceSelected ? (
                    <Fragment>
                      <Headline tag="h4">
                        <FormattedMessage id="ui-eholdings.label.dates" />
                      </Headline>
                      <ManagedCoverageFields
                        initialValue={initialValues.customCoverages}
                        model={model}
                      />

                      <Headline tag="h4">
                        <FormattedMessage id="ui-eholdings.label.coverageDisplay" />
                      </Headline>
                      <CoverageStatementFields
                        change={change}
                        coverageDates={this.renderCoverageDates()}
                      />

                      <Headline tag="h4">
                        <FormattedMessage id="ui-eholdings.resource.embargoPeriod" />
                      </Headline>
                      <CustomEmbargoFields
                        change={change}
                        showInputs={(initialValues.customEmbargoValue > 0)}
                        initialValue={{
                          customEmbargoValue: initialValues.customEmbargoValue,
                          customEmbargoUnit: initialValues.customEmbargoUnit
                        }}
                      />
                    </Fragment>
                  ) : (
                    <p data-test-eholdings-resource-edit-settings-message>
                      <FormattedMessage id="ui-eholdings.resource.coverage.notSelected" />
                    </p>
                  )}
                </Accordion>

                <NavigationModal
                  modalLabel={<FormattedMessage id="ui-eholdings.navModal.modalLabel" />}
                  continueLabel={<FormattedMessage id="ui-eholdings.navModal.continueLabel" />}
                  dismissLabel={<FormattedMessage id="ui-eholdings.navModal.dismissLabel" />}
                  when={!pristine && !model.update.isPending}
                />
              </Fragment>
            )}
          />
        </form>

        <Modal
          open={showSelectionModal}
          size="small"
          label={<FormattedMessage id="ui-eholdings.resource.modal.header" />}
          id="eholdings-resource-confirmation-modal"
          footer={(
            <ModalFooter
              primaryButton={{
                'label': model.update.isPending ?
                  (<FormattedMessage id="ui-eholdings.resource.modal.buttonWorking" />)
                  :
                  (<FormattedMessage id="ui-eholdings.resource.modal.buttonConfirm" />),
                'onClick': this.commitSelectionToggle,
                'disabled': model.update.isPending,
                'data-test-eholdings-resource-deselection-confirmation-modal-yes': true
              }}
              secondaryButton={{
                'label': <FormattedMessage id="ui-eholdings.resource.modal.buttonCancel" />,
                'onClick': this.cancelSelectionToggle,
                'data-test-eholdings-resource-deselection-confirmation-modal-no': true
              }}
            />
          )}
        >
          <FormattedMessage id="ui-eholdings.resource.modal.body" />
        </Modal>
      </div>
    );
  }
}

const validate = (values, props) => {
  return Object.assign({}, validateCoverageDates(values, props), validateEmbargo(values));
};

const selector = formValueSelector('ResourceEditManagedTitle');

export default compose(
  injectIntl,
  connect(state => ({
    customCoverageDateValues: selector(state, 'customCoverages')
  })),
  reduxForm({
    validate,
    enableReinitialize: true,
    form: 'ResourceEditManagedTitle',
    destroyOnUnmount: false,
  })
)(ResourceEditManagedTitle);

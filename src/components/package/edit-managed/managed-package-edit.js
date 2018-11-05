import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Headline,
  Icon,
  Modal,
  ModalFooter,
  RadioButton,
  RadioButtonGroup
} from '@folio/stripes/components';

import { processErrors } from '../../utilities';

import DetailsView from '../../details-view';
import CoverageFields from '../_fields/custom-coverage';
import NavigationModal from '../../navigation-modal';
import Toaster from '../../toaster';
import PaneHeaderButton from '../../pane-header-button';
import SelectionStatus from '../selection-status';
import ProxySelectField from '../../proxy-select';
import TokenField, { validate as validateToken } from '../../token';
import styles from './managed-package-edit.css';

class ManagedPackageEdit extends Component {
  static propTypes = {
    addPackageToHoldings: PropTypes.func.isRequired,
    change: PropTypes.func,
    fullViewLink: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    handleSubmit: PropTypes.func,
    initialValues: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    provider: PropTypes.object.isRequired,
    proxyTypes: PropTypes.object.isRequired
  };

  state = {
    showSelectionModal: false,
    allowFormToSubmit: false,
    packageSelected: this.props.initialValues.isSelected,
    formValues: {},
    initialValues: this.props.initialValues,
    sections: {
      packageHoldingStatus: true,
      packageSettings: true,
      packageCoverageSettings: true,
    }
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
        packageSelected: nextProps.initialValues.isSelected
      });
    }

    return stateUpdates;
  }

  handleSelectionAction = () => {
    this.setState({
      packageSelected: true,
      formValues: {
        allowKbToAddTitles: true,
        isSelected: true
      }
    }, () => this.handleOnSubmit(this.state.formValues));
  }

  handleDeselectionAction = () => {
    this.setState({
      formValues: {
        isSelected: false
      }
    }, () => this.handleOnSubmit(this.state.formValues));
  };

  commitSelectionToggle = () => {
    this.setState({
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
  };

  toggleSection = ({ id: sectionId }) => {
    this.setState((prevState) => {
      const { sections } = prevState;
      const sectionIsExpanded = sections[sectionId];
      return {
        sections: {
          ...sections,
          [sectionId]: !sectionIsExpanded
        }
      };
    });
  };

  toggleAllSections = (sections) => {
    this.setState({ sections });
  };

  getSectionHeader(translationKey) {
    return (
      <Headline
        size="large"
        tag="h3"
      >
        <FormattedMessage id={translationKey} />
      </Headline>
    );
  }

  render() {
    let {
      model,
      initialValues,
      handleSubmit,
      pristine,
      proxyTypes,
      provider,
      onCancel,
      fullViewLink
    } = this.props;

    let {
      showSelectionModal,
      packageSelected,
      sections
    } = this.state;

    let visibilityMessage = model.visibilityData.reason && `(${model.visibilityData.reason})`;

    let supportsProviderTokens = provider && provider.isLoaded && provider.providerToken && provider.providerToken.prompt;
    let supportsPackageTokens = model && model.isLoaded && model.packageToken && model.packageToken.prompt;
    let hasProviderTokenValue = provider && provider.isLoaded && provider.providerToken && provider.providerToken.value;
    let hasPackageTokenValue = model && model.isLoaded && model.packageToken && model.packageToken.value;

    let actionMenuItems = [
      {
        'label': <FormattedMessage id="ui-eholdings.actionMenu.cancelEditing" />,
        'onClick': onCancel,
        'data-test-eholdings-package-cancel-action': true
      }
    ];

    if (fullViewLink) {
      actionMenuItems.push({
        label: <FormattedMessage id="ui-eholdings.actionMenu.fullView" />,
        to: fullViewLink,
        className: styles['full-view-link']
      });
    }

    if (packageSelected) {
      actionMenuItems.push({
        'label': <FormattedMessage id="ui-eholdings.package.removeFromHoldings" />,
        'state': { eholdings: true },
        'data-test-eholdings-package-remove-from-holdings-action': true,
        'onClick': this.handleDeselectionAction
      });
    }

    if (!packageSelected || model.isPartiallySelected) {
      let messageId = model.isPartiallySelected ? 'addAllToHoldings' : 'addToHoldings';
      actionMenuItems.push({
        'label': <FormattedMessage id={`ui-eholdings.${messageId}`} />,
        'state': { eholdings: true },
        'data-test-eholdings-package-add-to-holdings-action': true,
        'onClick': this.props.addPackageToHoldings
      });
    }

    return (
      <div>
        <Toaster toasts={processErrors(model)} position="bottom" />
        <form onSubmit={handleSubmit(this.handleOnSubmit)}>
          <DetailsView
            type="package"
            model={model}
            paneTitle={model.name}
            actionMenuItems={actionMenuItems}
            handleExpandAll={this.toggleAllSections}
            sections={sections}
            lastMenu={(
              <Fragment>
                {model.update.isPending && (
                  <Icon icon="spinner-ellipsis" />
                )}
                {model.isSelected && (
                  <PaneHeaderButton
                    disabled={pristine || model.update.isPending}
                    type="submit"
                    buttonStyle="primary"
                    data-test-eholdings-package-save-button
                  >
                    {model.update.isPending ?
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
                  open={sections.packageHoldingStatus}
                  id="packageHoldingStatus"
                  onToggle={this.toggleSection}
                >
                  <SelectionStatus
                    model={model}
                    onAddToHoldings={this.props.addPackageToHoldings}
                  />
                </Accordion>

                {packageSelected && (
                  <div>
                    <Accordion
                      label={this.getSectionHeader('ui-eholdings.package.packageSettings')}
                      open={sections.packageSettings}
                      id="packageSettings"
                      onToggle={this.toggleSection}
                    >
                      <div className={styles['visibility-radios']}>
                        {this.props.initialValues.isVisible != null ? (
                          <Fragment>
                            <div data-test-eholdings-package-visibility-field>
                              <Field
                                label={<FormattedMessage id="ui-eholdings.package.visibility" />}
                                name="isVisible"
                                component={RadioButtonGroup}
                              >
                                <RadioButton label={<FormattedMessage id="ui-eholdings.yes" />} value="true" />
                                <RadioButton
                                  label={<FormattedMessage id="ui-eholdings.package.visibility.no" values={{ visibilityMessage }} />}
                                  value="false"
                                />
                              </Field>
                            </div>
                          </Fragment>
                        ) : (
                          <div
                            data-test-eholdings-package-details-visibility
                            htmlFor="managed-package-details-visibility-switch"
                          >
                            <Icon icon="spinner-ellipsis" />
                          </div>
                        )}
                      </div>
                      <div className={styles['title-management-radios']}>
                        {this.props.initialValues.allowKbToAddTitles != null ? (
                          <Fragment>
                            <Field
                              label={<FormattedMessage id="ui-eholdings.package.packageAllowToAddTitles" />}
                              name="allowKbToAddTitles"
                              data-test-eholdings-allow-kb-to-add-titles-radios
                              component={RadioButtonGroup}
                            >
                              <RadioButton
                                label={<FormattedMessage id="ui-eholdings.yes" />}
                                value="true"
                                data-test-eholdings-allow-kb-to-add-titles-radio-yes
                              />
                              <RadioButton
                                label={<FormattedMessage id="ui-eholdings.no" />}
                                value="false"
                                data-test-eholdings-allow-kb-to-add-titles-radio-no
                              />
                            </Field>
                          </Fragment>
                        ) : (
                          <div
                            data-test-eholdings-package-details-allow-add-new-titles
                            htmlFor="managed-package-details-toggle-allow-add-new-titles-switch"
                          >
                            <Icon icon="spinner-ellipsis" />
                          </div>
                        )}
                      </div>
                      {(proxyTypes.request.isResolved && provider.data.isLoaded) ? (
                        <div data-test-eholdings-package-proxy-select-field>
                          <ProxySelectField
                            proxyTypes={proxyTypes}
                            inheritedProxyId={provider.proxy.id}
                          />
                        </div>
                      ) : (
                        <Icon icon="spinner-ellipsis" />
                      )}
                      {supportsProviderTokens && (
                      <fieldset>
                        <Headline tag="legend">
                          <FormattedMessage id="ui-eholdings.provider.token" />
                        </Headline>
                        <TokenField token={provider.providerToken} tokenValue={hasProviderTokenValue} type="provider" />
                      </fieldset>
                      )}
                      {supportsPackageTokens && (
                      <fieldset>
                        <Headline tag="legend">
                          <FormattedMessage id="ui-eholdings.package.token" />
                        </Headline>
                        <TokenField token={model.packageToken} tokenValue={hasPackageTokenValue} type="package" />
                      </fieldset>
                      )}
                    </Accordion>

                    <Accordion
                      label={this.getSectionHeader('ui-eholdings.package.coverageSettings')}
                      open={sections.packageCoverageSettings}
                      id="packageCoverageSettings"
                      onToggle={this.toggleSection}
                    >
                      <CoverageFields initialValue={initialValues.customCoverages} />
                    </Accordion>
                  </div>
                )}

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
          label={<FormattedMessage id="ui-eholdings.package.modal.header" />}
          id="eholdings-package-confirmation-modal"
          footer={(
            <ModalFooter
              primaryButton={{
                'label': model.update.isPending ?
                  <FormattedMessage id="ui-eholdings.package.modal.buttonWorking" /> :
                  <FormattedMessage id="ui-eholdings.package.modal.buttonConfirm" />,
                'onClick': this.commitSelectionToggle,
                'disabled': model.update.isPending,
                'data-test-eholdings-package-deselection-confirmation-modal-yes': true
              }}
              secondaryButton={{
                'label': <FormattedMessage id="ui-eholdings.package.modal.buttonCancel" />,
                'onClick': this.cancelSelectionToggle,
                'data-test-eholdings-package-deselection-confirmation-modal-no': true
              }}
            />
          )}
        >
          <FormattedMessage id="ui-eholdings.package.modal.body" />
        </Modal>
      </div>
    );
  }
}

const validate = (values) => {
  return Object.assign({}, validateToken(values));
};

export default reduxForm({
  validate,
  enableReinitialize: true,
  form: 'ManagedPackageEdit',
  destroyOnUnmount: false,
})(ManagedPackageEdit);

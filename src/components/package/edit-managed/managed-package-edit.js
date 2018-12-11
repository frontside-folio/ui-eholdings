import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Button,
  Headline,
  Icon,
  Modal,
  ModalFooter,
  RadioButton,
  RadioButtonGroup
} from '@folio/stripes/components';

import { processErrors } from '../../utilities';

import DetailsView from '../../details-view';
import CoverageFields, { validate as validateCoverageDates } from '../_fields/custom-coverage';
import NavigationModal from '../../navigation-modal';
import Toaster from '../../toaster';
import PaneHeaderButton from '../../pane-header-button';
import SelectionStatus from '../selection-status';
import ProxySelectField from '../../proxy-select';
import TokenField from '../../token';
import FullViewLink from '../../full-view-link';
import styles from './managed-package-edit.css';

class ManagedPackageEdit extends Component {
  static propTypes = {
    addPackageToHoldings: PropTypes.func.isRequired,
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
    packageSelected: this.props.model.isSelected,
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

    if (nextProps.model.isSelected !== prevState.model.isSelected) {
      Object.assign(stateUpdates, {
        packageSelected: nextProps.model.isSelected
      });
    }

    return stateUpdates;
  }

  handleSelectionAction = () => {
    const { model, onSubmit } = this.props;

    this.setState({
      packageSelected: true,
    }, () => onSubmit(
      Object.assign(model.data.attributes, {
        allowKbToAddTitles: true,
        isSelected: true,
      })
    ));
  }

  handleDeselectionAction = () => {
    this.setState({
      showSelectionModal: true,
    });
  };

  commitDeselection = () => {
    const { model, onSubmit } = this.props;

    onSubmit(
      Object.assign(model.data.attributes, {
        isSelected: false,
      })
    );
  };

  cancelDeselection = () => {
    this.setState({
      showSelectionModal: false,
      packageSelected: true,
    });
  };

  handleOnSubmit = (values) => {
    this.props.onSubmit(values);
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

  getActionMenu = ({ onToggle }) => {
    const {
      addPackageToHoldings,
      fullViewLink,
      model,
      onCancel
    } = this.props;

    const { packageSelected } = this.state;

    return (
      <Fragment>
        <Button
          data-test-eholdings-package-cancel-action
          buttonStyle="dropdownItem fullWidth"
          onClick={() => {
            onToggle();
            onCancel();
          }}
          disabled={model.update.isPending}
        >
          <FormattedMessage id="ui-eholdings.actionMenu.cancelEditing" />
        </Button>

        {fullViewLink && (
          <FullViewLink to={fullViewLink} />
        )}

        {packageSelected && (
          <Button
            data-test-eholdings-package-remove-from-holdings-action
            buttonStyle="dropdownItem fullWidth"
            onClick={() => {
              onToggle();
              this.handleDeselectionAction();
            }}
          >
            <FormattedMessage id="ui-eholdings.package.removeFromHoldings" />
          </Button>
        )}

        {(!packageSelected || model.isPartiallySelected) && (
          <Button
            data-test-eholdings-package-add-to-holdings-action
            buttonStyle="dropdownItem fullWidth"
            onClick={() => {
              onToggle();
              addPackageToHoldings();
            }}
          >
            <FormattedMessage
              id={`ui-eholdings.${(model.isPartiallySelected ? 'addAllToHoldings' : 'addToHoldings')}`}
            />
          </Button>
        )}
      </Fragment>
    );
  }

  render() {
    let {
      model,
      initialValues,
      handleSubmit,
      onSubmit,
      pristine,
      proxyTypes,
      provider
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

    return (
      <div>
        <Toaster toasts={processErrors(model)} position="bottom" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <DetailsView
            type="package"
            model={model}
            paneTitle={model.name}
            actionMenu={this.getActionMenu}
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
                'onClick': this.commitDeselection,
                'disabled': model.update.isPending,
                'data-test-eholdings-package-deselection-confirmation-modal-yes': true
              }}
              secondaryButton={{
                'label': <FormattedMessage id="ui-eholdings.package.modal.buttonCancel" />,
                'onClick': this.cancelDeselection,
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

export default reduxForm({
  validate: validateCoverageDates,
  enableReinitialize: true,
  form: 'ManagedPackageEdit',
  destroyOnUnmount: false,
})(ManagedPackageEdit);

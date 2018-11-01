import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';

import {
  Icon,
  IconButton,
  PaneHeader
} from '@folio/stripes/components';

import DetailsViewSection from '../../details-view-section';
import NameField, { validate as validatePackageName } from '../_fields/name';
// import CoverageFields, { validate as validateCoverageDates } from '../_fields/custom-coverage';
import { validate as validateCoverageDates } from '../_fields/custom-coverage';
import ContentTypeField from '../_fields/content-type';
import NavigationModal from '../../navigation-modal';
import Toaster from '../../toaster';
import PaneHeaderButton from '../../pane-header-button';
import styles from './package-create.css';

class PackageCreate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func.isRequired,
    request: PropTypes.object.isRequired
  };

  validate = (values) => {
    return Object.assign({}, validatePackageName(values, this.props), validateCoverageDates(values, this.props));
  }

  render() {
    let {
      intl,
      request,
      onSubmit,
      onCancel
    } = this.props;

    let actionMenuItems = [];

    if (!request.isPending && onCancel) {
      actionMenuItems.push({
        'label': intl.formatMessage({ id: 'ui-eholdings.actionMenu.cancelEditing' }),
        'state': { eholdings: true },
        'onClick': onCancel,
        'data-test-eholdings-package-create-cancel-action': true
      });
    }

    return (
      <div data-test-eholdings-package-create>
        <Toaster
          position="bottom"
          toasts={request.errors.map(({ title }, index) => ({
            id: `error-${request.timestamp}-${index}`,
            message: title,
            type: 'error'
          }))}
        />
        <Form
          onSubmit={onSubmit}
          validate={this.validate}
          mutators={{ ...arrayMutators }}
          initialValues={{
            name: '',
            contentType: 'Unknown',
            customCoverages: []
          }}
          render={({ handleSubmit, pristine }) => (
            <Fragment>
              <form onSubmit={handleSubmit}>
                <PaneHeader
                  paneTitle={<FormattedMessage id="ui-eholdings.package.create.custom" />}
                  actionMenuItems={actionMenuItems}
                  firstMenu={onCancel && (
                    <IconButton
                      icon="left-arrow"
                      ariaLabel={intl.formatMessage({ id: 'ui-eholdings.label.icon.goBack' })}
                      onClick={onCancel}
                      data-test-eholdings-details-view-back-button
                    />
                  )}
                  lastMenu={(
                    <Fragment>
                      {request.isPending && (
                        <Icon icon="spinner-ellipsis" />
                      )}
                      <PaneHeaderButton
                        disabled={pristine || request.isPending}
                        type="submit"
                        buttonStyle="primary"
                        data-test-eholdings-package-create-save-button
                      >
                        {request.isPending ?
                          (<FormattedMessage id="ui-eholdings.saving" />)
                          : (<FormattedMessage id="ui-eholdings.save" />)
                        }
                      </PaneHeaderButton>
                    </Fragment>
                  )}
                />

                <div className={styles['package-create-form-container']}>
                  <DetailsViewSection
                    label={<FormattedMessage id="ui-eholdings.package.packageInformation" />}
                    separator={false}
                  >
                    <Field
                      component={NameField}
                      name="name"
                    />
                    <Field
                      component={ContentTypeField}
                      name="contentType"
                    />
                  </DetailsViewSection>
                </div>
              </form>
              <NavigationModal
                modalLabel={intl.formatMessage({ id: 'ui-eholdings.navModal.modalLabel' })}
                continueLabel={intl.formatMessage({ id: 'ui-eholdings.navModal.continueLabel' })}
                dismissLabel={intl.formatMessage({ id: 'ui-eholdings.navModal.dismissLabel' })}
                when={!pristine && !request.isResolved}
              />
            </Fragment>
          )}
        />
      </div>
    );
  }
}

export default injectIntl(PackageCreate);

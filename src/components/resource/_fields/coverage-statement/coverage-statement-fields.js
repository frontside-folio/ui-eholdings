import React, { Component } from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';

import { RadioButton, TextArea } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import styles from './coverage-statement-fields.css';

export default class CoverageStatementFields extends Component {
  static propTypes = {
    change: PropTypes.func.isRequired,
    coverageDates: PropTypes.node
  };

  validate(value) {
    let errors;

    if (value && value.length > 350) {
      errors = <FormattedMessage id="ui-eholdings.validate.errors.coverageStatement.length" />;
    }

    if (value === 'yes' && value.length === 0) {
      errors = <FormattedMessage id="ui-eholdings.validate.errors.coverageStatement.blank" />;
    }

    return errors;
  }

  render() {
    let { change, coverageDates } = this.props;

    return (
      <fieldset>
        <div data-test-eholdings-has-coverage-statement>
          <Field
            name="hasCoverageStatement"
            component={RadioButton}
            type="radio"
            label={<FormattedMessage id="ui-eholdings.label.dates" />}
            value="no"
            onChange={() => {
              change('coverageStatement', '');
            }}
          />
          <div className={styles['coverage-statement-fields-category']}>
            {coverageDates}
          </div>
          <Field
            name="hasCoverageStatement"
            component={RadioButton}
            type="radio"
            label={<FormattedMessage id="ui-eholdings.label.coverageStatement" />}
            value="yes"
          />
        </div>
        <div data-test-eholdings-coverage-statement-textarea className={styles['coverage-statement-fields-category']}>
          <Field
            name="coverageStatement"
            component={TextArea}
            onChange={(e, newValue) => {
              change('hasCoverageStatement', (newValue.length > 0) ? 'yes' : 'no');
            }}
            validate={this.validate}
          />
        </div>
      </fieldset>
    );
  }
}

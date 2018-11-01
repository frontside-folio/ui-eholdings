import React, { Component, Fragment } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import moment from 'moment';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import {
  Datepicker,
  RepeatableField
} from '@folio/stripes/components';

import styles from './package-coverage-fields.css';

class PackageCoverageFields extends Component {
  static propTypes = {
    intl: intlShape.isRequired
  };

  validate = (values) => {
    const { intl: { locale } } = this.props;
    moment.locale(locale);
    let dateFormat = moment.localeData()._longDateFormat.L;
    const errors = {};

    values.forEach((dateRange, index) => {
      let dateRangeErrors = {};

      if (dateRange.beginCoverage && !moment.utc(dateRange.beginCoverage).isValid()) {
        dateRangeErrors.beginCoverage = <FormattedMessage id="ui-eholdings.validate.errors.dateRange.format" values={{ dateFormat }} />;
      }

      if (dateRange.endCoverage && !dateRange.beginCoverage) {
        dateRangeErrors.beginCoverage = <FormattedMessage id="ui-eholdings.validate.errors.dateRange.format" values={{ dateFormat }} />;
      }

      if (dateRange.endCoverage && moment.utc(dateRange.beginCoverage).isAfter(moment.utc(dateRange.endCoverage))) {
        dateRangeErrors.beginCoverage = <FormattedMessage id="ui-eholdings.validate.errors.dateRange.startDateBeforeEndDate" />;
      }

      errors[index] = dateRangeErrors;
    });

    return errors;
  }

  renderField = (dateRange) => {
    return (
      <Fragment>
        <div
          data-test-eholdings-coverage-fields-date-range-begin
          className={styles['coverage-fields-datepicker']}
        >
          <Field
            name={`${dateRange}.beginCoverage`}
            format={(value) => (value ? moment.utc(value) : '')}
          >
            {({ input, meta }) => (
              <Datepicker
                label={<FormattedMessage id="ui-eholdings.date.startDate" />}
                input={input} // will need to be refactored when Datepicker is independent of Redux Form
                meta={meta} // will need to be refactored when Datepicker is independent of Redux Form
              />
            )}
          </Field>
        </div>
        <div
          data-test-eholdings-coverage-fields-date-range-end
          className={styles['coverage-fields-datepicker']}
        >
          <Field
            name={`${dateRange}.endCoverage`}
            format={(value) => (value ? moment.utc(value) : '')}
          >
            {({ input, meta }) => (
              <Datepicker
                label={<FormattedMessage id="ui-eholdings.date.endDate" />}
                input={input} // will need to be refactored when Datepicker is independent of Redux Form
                meta={meta} // will need to be refactored when Datepicker is independent of Redux Form
              />
            )}
          </Field>
        </div>
      </Fragment>
    );
  }

  render() {
    return (
      <div data-test-eholdings-package-coverage-fields>
        <FieldArray name="customCoverages" validate={this.validate}>
          {({ fields, meta }) => (
            <RepeatableField
              addLabel={<FormattedMessage id="ui-eholdings.package.coverage.addDateRange" />}
              emptyMessage={
                meta.initial.length > 0 && meta.initial[0].beginCoverage ?
                  <FormattedMessage id="ui-eholdings.package.noCoverageDates" /> : ''
              }
              fields={fields}
              onAdd={() => fields.push({})}
              onRemove={(index) => fields.remove(index)}
              renderField={this.renderField}
            />
          )}
        </FieldArray>
      </div>
    );
  }
}

export default injectIntl(PackageCoverageFields);

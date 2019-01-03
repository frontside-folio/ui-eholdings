import React, { Component, Fragment } from 'react';
import { Field, FieldArray } from 'redux-form';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FormattedDate, FormattedMessage } from 'react-intl';

import {
  Datepicker,
  Icon,
  RadioButton,
  RepeatableField
} from '@folio/stripes/components';

import CoverageDateList from '../../../coverage-date-list';
import { isBookPublicationType } from '../../../utilities';
import styles from './managed-coverage-fields.css';

class ResourceCoverageFields extends Component {
  static propTypes = {
    initialValue: PropTypes.array,
    model: PropTypes.object.isRequired
  };

  static defaultProps = {
    initialValue: []
  };

  renderField = (dateRange) => {
    return (
      <Fragment>
        <div
          data-test-eholdings-coverage-fields-date-range-begin
          className={styles['coverage-fields-datepicker']}
        >
          <Field
            name={`${dateRange}.beginCoverage`}
            type="text"
            component={Datepicker}
            label={<FormattedMessage id="ui-eholdings.date.startDate" />}
            id="begin-coverage"
            format={(value) => (value ? moment.utc(value) : '')}
          />
        </div>
        <div
          data-test-eholdings-coverage-fields-date-range-end
          className={styles['coverage-fields-datepicker']}
        >
          <Field
            name={`${dateRange}.endCoverage`}
            type="text"
            component={Datepicker}
            label={<FormattedMessage id="ui-eholdings.date.endDate" />}
            id="end-coverage"
            format={(value) => (value ? moment.utc(value) : '')}
          />
        </div>
      </Fragment>
    );
  }

  render() {
    const { initialValue, model } = this.props;

    return (
      <div data-test-eholdings-resource-coverage-fields>
        <FieldArray name="customCoverages">
          {({ fields }) => (
            <fieldset>
              <div>
                <RadioButton
                  label={<FormattedMessage id="ui-eholdings.label.managed.coverageDates" />}
                  disabled={model.managedCoverages.length === 0}
                  checked={fields.length === 0 && model.managedCoverages.length > 0}
                  onChange={(e) => {
                    if (e.target.value === 'on') {
                      fields.removeAll();
                    }
                  }}
                />
                <div className={styles['coverage-fields-category']} data-test-eholdings-resource-edit-managed-coverage-list>
                  {model.managedCoverages.length > 0 ? (
                    <CoverageDateList
                      coverageArray={model.managedCoverages}
                      isYearOnly={isBookPublicationType(model.publicationType)}
                    />
                  ) : (
                    <p><FormattedMessage id="ui-eholdings.resource.managedCoverageDates.notSet" /></p>
                  )}
                </div>
              </div>
              <div>
                <RadioButton
                  label={<FormattedMessage id="ui-eholdings.label.custom.coverageDates" />}
                  checked={fields.length > 0}
                  onChange={(e) => {
                    if (e.target.value === 'on' && fields.length === 0) {
                      fields.push({});
                    }
                  }}
                />
                <div className={styles['coverage-fields-category']}>
                  <RepeatableField
                    addLabel={
                      <Icon icon="plus-sign">
                        <FormattedMessage id="ui-eholdings.package.coverage.addDateRange" />
                      </Icon>
                    }
                    emptyMessage={
                      initialValue.length > 0 && initialValue[0].beginCoverage ?
                        <FormattedMessage id="ui-eholdings.package.noCoverageDates" /> : ''
                    }
                    fields={fields}
                    name="customCoverages"
                    onAdd={() => fields.push({})}
                    onRemove={(index) => fields.remove(index)}
                    renderField={this.renderField}
                  />
                </div>
              </div>
            </fieldset>
          )}
        </FieldArray>
      </div>
    );
  }
}

export default ResourceCoverageFields;

/**
 * Validator to ensure start date comes before end date chronologically
 * @param {} dateRange - coverage date range to validate
 * @returns {} - an error object if errors are found, or `false` otherwise
 */
const validateStartDateBeforeEndDate = (dateRange) => {
  const message = <FormattedMessage id="ui-eholdings.validate.errors.dateRange.startDateBeforeEndDate" />;

  if (dateRange.endCoverage && moment.utc(dateRange.beginCoverage).isAfter(moment.utc(dateRange.endCoverage))) {
    return { beginCoverage: message };
  }

  return false;
};

/**
 * Validator to ensure begin date is present and entered dates are valid
 * @param {} dateRange - coverage date range to validate
 * @returns {} - an error object if errors are found, or `false` otherwise
 */
const validateDateFormat = (dateRange, intl) => {
  moment.locale(intl.locale);
  let dateFormat = moment.localeData()._longDateFormat.L;
  const message = <FormattedMessage id="ui-eholdings.validate.errors.dateRange.format" values={{ dateFormat }} />;

  if (!dateRange.beginCoverage || !moment.utc(dateRange.beginCoverage).isValid()) {
    return { beginCoverage: message };
  }

  return false;
};

/**
 * Validator to ensure all coverage ranges are within the parent package's
 * custom coverage range if one is present
 * @param {} dateRange - coverage date range to validate
 * @param {} packageCoverage - parent package's custom coverage range
 * @returns {} - an error object if errors are found, or `false` otherwise
 */
const validateWithinPackageRange = (dateRange, packageCoverage) => {
  // javascript/moment has no mechanism for "infinite", so we
  // use an absurd future date to represent the concept of "present"
  let present = moment.utc('9999-09-09T05:00:00.000Z');
  if (packageCoverage && packageCoverage.beginCoverage) {
    let {
      beginCoverage: packageBeginCoverage,
      endCoverage: packageEndCoverage
    } = packageCoverage;

    let beginCoverageDate = moment.utc(dateRange.beginCoverage);
    let endCoverageDate = dateRange.endCoverage ? moment.utc(dateRange.endCoverage) : present;

    let packageBeginCoverageDate = moment.utc(packageBeginCoverage);
    let packageEndCoverageDate = packageEndCoverage ? moment.utc(packageEndCoverage) : moment.utc();
    let packageRange = moment.range(packageBeginCoverageDate, packageEndCoverageDate);

    let startDate =
      <FormattedDate
        value={packageBeginCoverageDate}
        timeZone="UTC"
        year="numeric"
        month="numeric"
        day="numeric"
      />;

    let endDate = packageEndCoverage ?
      <FormattedDate
        value={packageEndCoverageDate}
        timeZone="UTC"
        year="numeric"
        month="numeric"
        day="numeric"
      />
      : 'Present';

    const message = <FormattedMessage id="ui-eholdings.validate.errors.dateRange.packageRange" values={{ startDate, endDate }} />;

    let beginDateOutOfRange = !packageRange.contains(beginCoverageDate);
    let endDateOutOfRange = !packageRange.contains(endCoverageDate);
    if (beginDateOutOfRange || endDateOutOfRange) {
      return {
        beginCoverage: beginDateOutOfRange ? message : '',
        endCoverage: endDateOutOfRange ? message : ''
      };
    }
  }
  return false;
};


/**
 * Validator to check that no date ranges overlap or are identical
 * @param {} dateRange - coverage date range to validate
 * @param {} customCoverages - all custom coverage ranges present in edit form
 * @param {} index - index in the field array indicating which coverage range is
 * presently being considered
 * @returns {} - an error object if errors are found, or `false` otherwise
 */
const validateNoRangeOverlaps = (dateRange, customCoverages, index) => {
  let present = moment.utc('9999-09-09T05:00:00.000Z');

  let beginCoverageDate = moment.utc(dateRange.beginCoverage);
  let endCoverageDate = dateRange.endCoverage ? moment.utc(dateRange.endCoverage) : present;
  let coverageRange = moment.range(beginCoverageDate, endCoverageDate);

  for (let overlapIndex = 0, len = customCoverages.length; overlapIndex < len; overlapIndex++) {
    let overlapRange = customCoverages[overlapIndex];

    // don't compare range to itself or to empty rows
    if (index === overlapIndex || !overlapRange.beginCoverage) {
      continue; // eslint-disable-line no-continue
    }

    let overlapCoverageBeginDate = moment.utc(overlapRange.beginCoverage);
    let overlapCoverageEndDate = overlapRange.endCoverage ? moment.utc(overlapRange.endCoverage) : present;
    let overlapCoverageRange = moment.range(overlapCoverageBeginDate, overlapCoverageEndDate);

    let startDate =
      <FormattedDate
        value={overlapRange.beginCoverage}
        timeZone="UTC"
        year="numeric"
        month="numeric"
        day="numeric"
      />;


    let endDate = overlapRange.endCoverage ?
      <FormattedDate
        value={overlapRange.endCoverage}
        timeZone="UTC"
        year="numeric"
        month="numeric"
        day="numeric"
      />
      : 'Present';

    const message = <FormattedMessage id="ui-eholdings.validate.errors.dateRange.overlap" values={{ startDate, endDate }} />;

    if (overlapCoverageRange.overlaps(coverageRange)
        || overlapCoverageRange.isEqual(coverageRange)
        || overlapCoverageRange.contains(coverageRange)) {
      return { beginCoverage: message, endCoverage: message };
    }
  }

  return false;
};

export function validate(values, props) {
  let errors = [];
  let { intl, model } = props;

  let packageCoverage = model.package.customCoverage;

  values.customCoverages.forEach((dateRange, index) => {
    let dateRangeErrors = {};

    dateRangeErrors =
      validateDateFormat(dateRange, intl) ||
      validateStartDateBeforeEndDate(dateRange) ||
      validateNoRangeOverlaps(dateRange, values.customCoverages, index) ||
      validateWithinPackageRange(dateRange, packageCoverage);

    errors[index] = dateRangeErrors;
  });

  return { customCoverages: errors };
}

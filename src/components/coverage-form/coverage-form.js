import React, { Component } from 'react';
import { Field, FieldArray, reduxForm } from 'redux-form';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import moment from 'moment';

import Datepicker from '@folio/stripes-components/lib/Datepicker';
import Button from '@folio/stripes-components/lib/Button';
import IconButton from '@folio/stripes-components/lib/IconButton';
import KeyValueLabel from '../key-value-label';
import CoverageDates from '../coverage-dates';
import styles from './coverage-form.css';

const cx = classNames.bind(styles);

class CoverageForm extends Component {
  static propTypes = {
    initialValues: PropTypes.shape({
      customCoverages: PropTypes.array,
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func,
    pristine: PropTypes.bool,
    isPending: PropTypes.bool,
    initialize: PropTypes.func
  };

  state = {
    isEditing: false,
  };

  handleEdit = (e) => {
    e.preventDefault();
    this.setState({ isEditing: true });
  }

  sortCoverages = (values) => {
    let sortedCustomCoverages = values.sort((a, b) => {
      let dateA = moment(a.endCoverage || '9999-01-01');
      let dateB = moment(b.endCoverage || '9999-01-01');
      return dateA.diff(dateB);
    });

    return sortedCustomCoverages;
  }

  preSubmit = (data) => {
    this.setState({
      isEditing: false
    });

    this.props.onSubmit({
      customCoverages: this.sortCoverages(data.customCoverages)
    });
  }

  handleCancel = (e) => {
    e.preventDefault();
    this.setState({
      isEditing: false
    });
    this.props.initialize(this.props.initialValues);
  }

  renderDatepicker = ({ input, label, meta }) => {
    return (
      <div>
        <Datepicker
          label={label}
          input={input}
          meta={meta}
        />
      </div>
    );
  }

  renderCoverageFields = ({ fields }) => {
    return (
      <div>
        <ul className={styles['coverage-form-date-range-rows']}>
          {fields.map((dateRange, index) => (
            <li
              data-test-eholdings-coverage-form-date-range-row
              key={index}
              className={styles['coverage-form-date-range-row']}
            >
              <div
                data-test-eholdings-coverage-form-date-range-begin
                className={styles['coverage-form-datepicker']}
              >
                <Field
                  name={`${dateRange}.beginCoverage`}
                  type="text"
                  component={this.renderDatepicker}
                  label="Start date"
                />
              </div>
              <div
                data-test-eholdings-coverage-form-date-range-end
                className={styles['coverage-form-datepicker']}
              >
                <Field
                  name={`${dateRange}.endCoverage`}
                  type="text"
                  component={this.renderDatepicker}
                  label="End date"
                />
              </div>

              <div
                data-test-eholdings-coverage-form-remove-row-button
                className={styles['coverage-form-date-range-clear-row']}
              >
                {index > 0 && (
                  <IconButton
                    icon="hollowX"
                    onClick={() => fields.remove(index)}
                    size="small"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>

        <div data-test-eholdings-coverage-form-add-row-button>
          <Button
            type="button"
            role="button"
            onClick={() => fields.push({})}
          >
            Add another coverage range
          </Button>
        </div>
      </div>
    );
  };

  render() {
    let { pristine, isPending, handleSubmit } = this.props;
    let { customCoverages } = this.props.initialValues;
    let contents;

    if (this.state.isEditing) {
      contents = (
        <form onSubmit={handleSubmit(this.preSubmit)}>
          <FieldArray name="customCoverages" component={this.renderCoverageFields} />
          <div className={styles['coverage-form-action-buttons']}>
            <div
              data-test-eholdings-coverage-form-cancel-button
              className={styles['coverage-form-action-button']}
            >
              <Button
                disabled={isPending}
                type="button"
                role="button"
                onClick={this.handleCancel}
                marginBottom0 // gag
              >
                Cancel
              </Button>
            </div>
            <div
              data-test-eholdings-coverage-form-save-button
              className={styles['coverage-form-action-button']}
            >
              <Button
                disabled={pristine}
                type="submit"
                role="button"
                buttonStyle="primary"
                marginBottom0 // gag
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      );
    } else if (customCoverages.length && customCoverages[0].beginCoverage !== '') {
      contents = (
        <div>
          <CoverageDates
            coverageArray={customCoverages}
          />
          <IconButton icon="edit" onClick={this.handleEdit} />
        </div>
      );
    } else {
      contents = (
        <div
          data-test-eholdings-coverage-form-add-button
          className={styles['coverage-form-add-button']}
        >
          <Button
            type="button"
            onClick={this.handleEdit}
          >
            Add custom coverage dates
          </Button>
        </div>
      );
    }

    return (
      <div
        data-test-eholdings-coverage-form
        className={cx(styles['coverage-form'], {
          'is-editing': this.state.isEditing
        })}
      >
        <KeyValueLabel label="Coverage dates">
          {contents}
        </KeyValueLabel>
      </div>
    );
  }
}

const validate = (values) => {
  const errors = [];

  values.customCoverages.forEach((dateRange, index) => {
    let dateRangeErrors = {};

    if (dateRange.beginCoverage && !moment(dateRange.beginCoverage).isValid()) {
      dateRangeErrors.beginCoverage = 'Enter date in the right format.';
    }

    if (dateRange.endCoverage && moment(dateRange.beginCoverage).isAfter(moment(dateRange.endCoverage))) {
      dateRangeErrors.beginCoverage = 'Start date must be before end date';
    }

    errors[index] = dateRangeErrors;
  });

  return { customCoverages: errors };
};

export default reduxForm({
  validate,
  enableReinitialize: true,
  form: 'Coverage',
  destroyOnUnmount: false
})(CoverageForm);

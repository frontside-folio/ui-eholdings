import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import PropTypes from 'prop-types';

import Datepicker from '@folio/stripes-components/lib/Datepicker';
import IconButton from '@folio/stripes-components/lib/IconButton';
import Button from '@folio/stripes-components/lib/Button';
import styles from './custom-coverage-date.css';

import { formatISODateWithoutTime } from '../utilities';

class CustomCoverageDate extends Component {
  static propTypes = {
    initialValues: PropTypes.shape({
      beginCoverage: PropTypes.string,
      endCoverage: PropTypes.string
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    initialize: PropTypes.func,
    isPending: PropTypes.bool,
    deleteCustomCoverage: PropTypes.func,
    error: PropTypes.string,
    anyTouched: PropTypes.bool
  }

  static contextTypes = {
    intl: PropTypes.object,
  }

  state = {
    isEditing: false
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

  /**
   * TODO:
   * Fix Bug ::
   * When deleting multiple coverages if you start at the top of the list
   * and delete that coverage date you will see for a split second that
   * the date you are deleting is eiher duplicated or overiddes the one
   * below it before it is actually deleted.
   */

  handleDeleteCustomCoverage = (beginCoverage, endCoverage) => {
    this.setState({
      isEditing: false
    }, () => {
      this.props.deleteCustomCoverage(beginCoverage, endCoverage);
    });
  }

  handleEditCustomCoverage = (event) => {
    event.preventDefault();
    let isEditing = !this.state.isEditing;
    this.setState({ isEditing });
    this.props.initialize(this.props.initialValues);
  }

  handleCancelCustomCoverage = (event) => {
    event.preventDefault();
    this.setState({
      isEditing: false
    });
    this.props.initialize(this.props.initialValues);
  }

  handleSubmit = (data) => {
    this.setState({
      isEditing: false
    });
    if (this.props.pristine) {
      return;
    }
    this.props.onSubmit(data);
  }


  render() {
    let { pristine, isPending, error, anyTouched } = this.props;
    let { intl } = this.context;
    const { beginCoverage, endCoverage } = this.props.initialValues;

    if (this.state.isEditing) {
      return (
        <form onSubmit={this.handleSubmit}>
          <div
            data-test-eholdings-package-details-custom-coverage-inputs
            className={styles['custom-coverage-form-editing']}
          >
            <div className={styles['custom-coverage-dates']}>
              <div data-test-eholdings-package-details-custom-begin-coverage className={styles['custom-coverage-date-picker']}>
                <Field
                  name='beginCoverage'
                  component={this.renderDatepicker}
                  label="Start Date"
                />
              </div>
              <div data-test-eholdings-package-details-custom-end-coverage className={styles['custom-coverage-date-picker']}>
                <Field
                  name='endCoverage'
                  component={this.renderDatepicker}
                  label="End Date"
                />
              </div>
              <div className={styles['custom-coverage-date-clear-row']}>
                {this.props.initialValues.beginCoverage && (
                  <IconButton icon="trashBin" onClick={() => this.handleDeleteCustomCoverage(beginCoverage, endCoverage)} size="small" />
                )}
              </div>
            </div>
            <div className={styles['custom-coverage-error']}>{anyTouched && error}</div>
            <div className={styles['custom-coverage-action-buttons']}>
              <div data-test-eholdings-package-details-cancel-custom-coverage-button>
                <Button disabled={isPending} type="button" role="button" buttonStyle="secondary" onClick={this.handleCancelCustomCoverage}>
                  Cancel
                </Button>
              </div>
              <div data-test-eholdings-package-details-save-custom-coverage-button>
                <Button disabled={pristine} type="submit" role="button">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </form>
      );
    } else if (beginCoverage) {
      return (
        <div className={styles['custom-coverage-form']}>
          <div className={styles['custom-coverage-date-display']}>
            <div data-test-eholdings-package-details-custom-coverage-display className={styles['custom-coverage-dates']}>
              {formatISODateWithoutTime(beginCoverage, intl)} - {formatISODateWithoutTime(endCoverage, intl) || 'Present'}
            </div>
            <div data-test-eholdings-package-details-edit-custom-coverage-button>
              <IconButton icon="edit" onClick={this.handleEditCustomCoverage} />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles['custom-coverage-form']}>
          <div data-test-eholdings-custom-coverage-date-add-button>
            <Button
              type="button"
              onClick={this.handleEditCustomCoverage}
            >
              Add Custom Coverage
            </Button>
          </div>
        </div>
      );
    }
  }
}

// this function is a special function used by redux-form for form validation
// the values from the from are passed into this function and then
// validated based on the matching field with the same 'name' as value
function validate(values, props) {
  const errors = {};

  if (props.customValidators) {
    props.customValidators.forEach((validator) => {
      let validationResult = validator.validate(values);

      Object.keys(validationResult).forEach((key) => {
        errors[`${key}`] = validationResult[`${key}`];
      });
    });
  }

  return errors;
}

export default reduxForm({
  validate,
  enableReinitialize: true,
  form: 'CustomCoverage',
  destroyOnUnmount: false
})(CustomCoverageDate);

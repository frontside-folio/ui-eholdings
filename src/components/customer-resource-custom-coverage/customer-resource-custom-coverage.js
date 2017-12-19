import React, { Component } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import IconButton from '@folio/stripes-components/lib/IconButton';
import Button from '@folio/stripes-components/lib/Button';
import { formatISODateWithoutTime } from '../utilities';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import {
  ValidateWithinPackageCoverageRange,
  ValidateStartDateBeforeEndDate,
  ValidateNoRangeOverlaps,
  ValidateDateFormat
} from '../validators';
import styles from './customer-resource-custom-coverage.css';

import CustomCoverageDate from '../custom-coverage-date';

const moment = extendMoment(Moment);

export default class CustomerResourceCustomCoverage extends Component {
  static propTypes = {
    customCoverages: PropTypes.array,
    onSubmit: PropTypes.func.isRequired,
    packageCoverage: PropTypes.object.isRequired
  };

  static contextTypes = {
    intl: PropTypes.object
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

  // constructor(props) {
  //   super(props);

  //   this.state = {
  //     customCoverages: this.props.customCoverages || []
  //   };
  // }

  sortCoverages = (values) => {
    let sortedCustomCoverages = values.sort((a, b) => {
      let dateA = moment(a.endCoverage || '9999-01-01');
      let dateB = moment(b.endCoverage || '9999-01-01');
      return dateA.diff(dateB);
    });

    return sortedCustomCoverages;
  }

  handleEditCustomCoverage = (event) => {
    event.preventDefault();
    this.setState({ isEditing: true });
  }

  handleCancelCustomCoverage = (event) => {
    event.preventDefault();
    this.setState({
      isEditing: false
    });
  }

  handleDeleteCustomCoverage = (beginCoverage, endCoverage) => {
    let currentCustomCoverages = this.state.customCoverages;

    let nextCustomCoverages = currentCustomCoverages.filter((customCoverage) => {
      return customCoverage.beginCoverage !== moment(beginCoverage).format('YYYY-MM-DD')
             && customCoverage.endCoverage !== moment(endCoverage).format('YYYY-MM-DD');
    });

    this.setState({
      customCoverages: this.sortCoverages(nextCustomCoverages)
    }, () => { this.props.onSubmit(this.state.customCoverages); });
  }

  handleSubmit = (data) => {
    let customCoverages = [
      ...this.state.customCoverages,
      {
        beginCoverage: moment(data.beginCoverage).format('YYYY-MM-DD'),
        endCoverage: !data.endCoverage ? '' : moment(data.endCoverage).format('YYYY-MM-DD')
      }
    ];

    this.setState({
      customCoverages: this.sortCoverages(customCoverages)
    }, () => { this.props.onSubmit(this.state.customCoverages); });
  }

  renderCustomCoverageEditRow = (customCoverage, index) => {
    console.log("in render edit");
    return (
      <div
       data-test-eholdings-package-details-custom-coverage-inputs
        className={styles['custom-coverage-form-editing']}
        key={index}
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
               label="Start Date"
             />
           </div>
         </div>
       </div>
    );
  }

  renderCustomCoverageDisplayRow = (customCoverage, index, intl) => {
    console.log("in render display");
    console.log("customCoverage in display", customCoverage);
    return (
      <li key={index}>
      <div className={styles['custom-coverage-form']}>
        <div className={styles['custom-coverage-date-display']}>
          <div data-test-eholdings-package-details-custom-coverage-display className={styles['custom-coverage-dates']}>
            {formatISODateWithoutTime(customCoverage.beginCoverage, intl)} - {formatISODateWithoutTime(customCoverage.endCoverage, intl) || 'Present'}
          </div>
        </div>
      </div>
      </li>
    );
  }

  render() {
    let { pristine, isPending, error, anyTouched } = this.props;
    let { intl } = this.context;

    console.log("custom coverages is", this.props.customCoverages);
    if (this.state.isEditing) {
      return (
        <form onSubmit={this.handleSubmit} data-test-eholdings-package-title-details-edit-custom-coverage-form>
          {
            this.props.customCoverages.map((customCoverage, index) => {
              return this.renderCustomCoverageEditRow(customCoverage, index);
            })
          }

          <div className={styles['custom-coverage-action-buttons']}>
           <div data-test-eholdings-package-details-cancel-custom-coverage-button>
             <Button disabled={isPending} type="button" role="button" onClick={this.handleCancelCustomCoverage}>
               Cancel
             </Button>
           </div>
           <div data-test-eholdings-package-details-save-custom-coverage-button>
             <Button disabled={pristine} type="submit" role="button" buttonStyle="primary">
               Save
             </Button>
           </div>
          </div>

          <div className={styles['custom-coverage-form']}>
            <div data-test-eholdings-custom-coverage-date-add-row-button>
              <Button
                type="button"
                onClick={this.handleEditCustomCoverage}
              >
                Add Row
              </Button>
            </div>
          </div>
        </form>
      );
    } else if (this.props.customCoverages && this.props.customCoverages.length) {
      return (
        <div>
        <div data-test-eholdings-package-details-edit-custom-coverage-button>
          <IconButton icon="edit" onClick={this.handleEditCustomCoverage} />
        </div>
        <div data-test-eholdings-customer-resource-custom-coverages-list>
          <ul>
          {
            this.props.customCoverages.map((customCoverage, index) => {
              return this.renderCustomCoverageDisplayRow(customCoverage, index, intl);
            })
          }
          </ul>
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

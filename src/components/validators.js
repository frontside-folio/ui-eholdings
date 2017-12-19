import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { formatISODateWithoutTime } from './utilities';

const moment = extendMoment(Moment);

export class ValidateWithinPackageCoverageRange {
  constructor(params) {
    let { packageCoverage, intl } = params;

    this.packageCoverage = packageCoverage || null;
    this.intl = intl;
  }

  validate(values) {
    let { beginCoverage, endCoverage } = values;

    let errors = {};

    if (this.packageCoverage && this.packageCoverage.beginCoverage) {
      let {
        beginCoverage: packageBeginCoverage,
        endCoverage: packageEndCoverage
      } = this.packageCoverage;

      const message = `Dates must be within Package's date range
                   (${formatISODateWithoutTime(packageBeginCoverage, this.intl)}
                   - ${packageEndCoverage ? formatISODateWithoutTime(packageEndCoverage, this.intl) : 'Present'}).`;

      let beginCoverageDate = moment(beginCoverage);
      let endCoverageDate = endCoverage ? moment(endCoverage) : moment();

      let packageBeginCoverageDate = moment(packageBeginCoverage);
      let packageEndCoverageDate = packageEndCoverage ? moment(packageEndCoverage) : moment();
      let packageRange = moment.range(packageBeginCoverageDate, packageEndCoverageDate);

      if (!packageRange.contains(beginCoverageDate)) {
        errors.beginCoverage = message;
      }
      if (!packageRange.contains(endCoverageDate)) {
        errors.endCoverage = message;
      }
    }
    return errors;
  }
}


/**
 * TODO:
 * Validate dates that have a open endDate aka'Present'.
 * It is tricky because those open end date technically mean infintity and JS Dates don't deal with infinity dates well.
 * So when you are trying to validate if the date is overlapping and use moment to set the day as now or today
 * for a open end date and validate against another date it will pass locally but RMAPI will reject it.
 * For example:
 *
 * if a user inputs date in this order
 * 1 => 7/29/2018 - 9/21/2018
 * 2 => 2/6/2018 - Present
 *
 * Using let today = moment(); to set end date will pass locally because moment will set the date to whatever day it is.
 * However, RMAPI will reject it because 'Present' is infinity so i guess eventually the dates will overlap.
 *
 * So, we need to find a good way to set today as a infinite date that respects locale format.
 * As a hack i set let today = moment('9999-9-9'); which prevents the above overlapping open ended date from being submitted.
 *
 */

/**
* TODO:
* Report Form errors back to form
* We are using the _error prop on the error object to get errors that are not associated with a Form Field to get back the Form.
* The error does get back to the form but with adding `error.beginCoverage = 'Error` and error.endCoverage = 'Error'` the form would
* still submit because the form was still form some reason valid even with the _error. So this is the current work around
*/

/**
 * TODO:
 * Editing a date in the list with overlap validation.
 * When you have a list of dates and you trying to edit one within that list. The overlap validator runs against the current element you have
 * open which it should not. Then if you edit the dates it makes a new element in the array and doesn't not overwrite the current opened date.
 */


export class ValidateNoRangeOverlaps {
  constructor(params) {
    let { customCoverages, intl } = params;

    this.customCoverages = customCoverages;
    this.intl = intl;
  }

  validate(values) {
    let { beginCoverage, endCoverage } = values;

    let errors = {};
    let today = moment('9999-9-9');
    // let today = moment();

    let beginCoverageDate = moment(beginCoverage);
    let endCoverageDate = endCoverage ? moment(endCoverage) : today;
    let valueRange = moment.range(beginCoverageDate, endCoverageDate);

    for (let customCoverage of this.customCoverages) {
      let customCoverageBeginDate = moment(customCoverage.beginCoverage);
      let customCoverageEndDate = customCoverage.endCoverage ? moment(customCoverage.endCoverage) : today;
      let customCoverageRange = moment.range(customCoverageBeginDate, customCoverageEndDate);

      if (customCoverageRange.overlaps(valueRange) || customCoverageRange.isEqual(valueRange) || customCoverageRange.contains(valueRange)) {
        errors.beginCoverage = 'Error';
        errors.endCoverage = 'Error';
        errors['_error'] = `Date range overlaps with
                           ${customCoverage.beginCoverage && formatISODateWithoutTime(customCoverage.beginCoverage, this.intl)}
                           - ${customCoverage.endCoverage
                             ? formatISODateWithoutTime(customCoverage.endCoverage, this.intl)
                             : 'Present'}`;
        break;
      }
    }
    return errors;
  }
}

export class ValidateDateFormat {
  constructor(params) {
    let { intl } = params;
    this.intl = intl;
  }

  validate(values) {
    const dateFormat = this.intl.formatters.getDateTimeFormat().format();

    const message = `Enter Date in ${dateFormat} format.`;
    let errors = {};

    if (!values.beginCoverage || !moment(values.beginCoverage).isValid()) {
      errors.beginCoverage = message;
    }
    return errors;
  }
}

export class ValidateStartDateBeforeEndDate {
  static validate(values) {
    const message = 'Start Date must be before End Date';
    let errors = {};

    if (values.endCoverage && moment(values.beginCoverage).isAfter(values.endCoverage)) {
      errors.beginCoverage = message;
    }
    return errors;
  }
}

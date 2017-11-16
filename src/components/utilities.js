import moment from 'moment';

export function isBookPublicationType(publicationType) {
  let publicationTypeIsBook = {
    All: false,
    Audiobook: true,
    Book: true,
    'Book Series': true,
    Database: false,
    Journal: false,
    Newsletter: false,
    Newspaper: false,
    Proceedings: false,
    Report: false,
    'Streaming Audio': true,
    'Streaming Video': true,
    'Thesis & Dissertation': false,
    Website: false,
    Unspecified: false
  };

  return !!publicationTypeIsBook[publicationType];
}

export function formatISODateWithoutTime(dateString, intl) {
  if (!dateString) {
    return '';
  }
  let [year, month, day] = dateString.split('-');
  let dateObj = new Date();
  dateObj.setFullYear(year);
  dateObj.setMonth(parseInt(month, 10) - 1);
  dateObj.setDate(day);
  return intl.formatDate(dateObj);
}

export function formatYear(dateString) {
  if (!dateString) {
    return '';
  }
  let [year] = dateString.split('-');
  return year;
}

export function isValidCoverage(coverageObj) {
  if (coverageObj.beginCoverage) {
    if (!moment(coverageObj.beginCoverage, 'YYYY-MM-DD').isValid()) { return false; }
  }
  if (coverageObj.endCoverage) {
    if (!moment(coverageObj.endCoverage, 'YYYY-MM-DD').isValid()) { return false; }
  }
  return true;
}

export function isValidCoverageList(coverageArray) {
  return coverageArray
    .every(coverageArrayObj => (isValidCoverage(coverageArrayObj)));
}

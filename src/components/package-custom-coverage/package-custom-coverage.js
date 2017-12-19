import React from 'react';
import PropTypes from 'prop-types';
import {
  ValidateStartDateBeforeEndDate,
  ValidateDateFormat
} from '../validators';

import CustomCoverageDate from '../custom-coverage-date/custom-coverage-date';

export default function PackageCustomCoverage({ onSubmit, isPending, intl, beginCoverage, endCoverage }) {
  let handleDeleteCustomCoverage = (packageBeginCoverage, packageEndCoverage) => {
    onSubmit(packageBeginCoverage, packageEndCoverage);
  };

  return (
    <CustomCoverageDate
      onSubmit={onSubmit}
      deleteCustomCoverage={handleDeleteCustomCoverage}
      intl={intl}
      isPending={isPending}
      initialValues={{ beginCoverage, endCoverage }}
      customValidators={[
        ValidateStartDateBeforeEndDate,
        new ValidateDateFormat({ intl })
      ]}
    />
  );
}

PackageCustomCoverage.propTypes = {
  beginCoverage: PropTypes.string,
  endCoverage: PropTypes.string,
  onSubmit: PropTypes.func,
  isPending: PropTypes.bool,
  intl: PropTypes.object
};

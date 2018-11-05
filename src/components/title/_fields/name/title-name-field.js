import React from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import { TextField } from '@folio/stripes/components';

function validate(value) {
  let errors;

  if (value === undefined) {
    errors = <FormattedMessage id="ui-eholdings.validate.errors.customTitle.name" />;
  }

  if (value && value.length >= 400) {
    errors = <FormattedMessage id="ui-eholdings.validate.errors.customTitle.name.length" />;
  }

  return errors;
}

function TitleNameField() {
  return (
    <div data-test-eholdings-title-name-field>
      <Field
        name="name"
        type="text"
        component={TextField}
        label={<FormattedMessage id="ui-eholdings.label.name.isRequired" />}
        validate={validate}
      />
    </div>
  );
}

export default TitleNameField;

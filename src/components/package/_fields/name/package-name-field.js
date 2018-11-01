import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import { TextField } from '@folio/stripes/components';

function validate(value) {
  if (value === '') {
    return <FormattedMessage id="ui-eholdings.validate.errors.customPackage.name" />;
  }

  if (value.length >= 300) {
    return <FormattedMessage id="ui-eholdings.validate.errors.customPackage.name.length" />;
  }

  return null;
}

export default function PackageNameField() {
  return (
    <div data-test-eholdings-package-name-field>
      <Field name="name" validate={validate}>
        {({ input, meta }) => (
          <TextField
            label={<FormattedMessage id="ui-eholdings.label.name.isRequired" />}
            error={meta.error && meta.touched ? meta.error : undefined}
            {...input}
          />
        )}
      </Field>
    </div>
  );
}

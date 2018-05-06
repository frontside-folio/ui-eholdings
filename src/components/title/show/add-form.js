import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import {
  Select,
  Button
} from '@folio/stripes-components';

function AddTitleCustomPackageForm(props) {
  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <Field
        name="packageId"
        component={Select}
        label="Package"
        dataOptions={props.options}
      />
      <Button
        type="submit"
        buttonStyle="primary"
      >
        Submit
      </Button>
    </form>
  );
}

AddTitleCustomPackageForm.propTypes = {
  handleSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
  options: PropTypes.object
};

export default reduxForm({
  validate: () => {},
  enableReinitialize: true,
  form: 'CustomPackageAdd',
  destroyOnUnmount: false
})(AddTitleCustomPackageForm);

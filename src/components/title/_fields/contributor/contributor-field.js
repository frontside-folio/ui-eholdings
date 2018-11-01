import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { FormattedXmlMessage } from 'react-intl-formatted-xml-message';
import {
  Icon,
  RepeatableField,
  Select,
  TextField
} from '@folio/stripes/components';
import { injectIntl, intlShape } from 'react-intl';
import styles from './contributor-field.css';

class ContributorField extends Component {
  static propTypes = {
    initialValue: PropTypes.array,
    intl: intlShape.isRequired
  };

  static defaultProps = {
    initialValue: []
  };

  renderField = (contributor, index, fields) => {
    const { intl } = this.props;

    return (
      <Fragment>
        <div
          data-test-eholdings-contributor-type
          className={styles['contributor-fields-contributor']}
        >
          <Field
            name={`${contributor}.type`}
            component={Select}
            autoFocus={Object.keys(fields.get(index)).length === 0}
            label={intl.formatMessage({ id: 'ui-eholdings.type' })}
            id={`${contributor}-type`}
            dataOptions={[
              { value: 'author', label: intl.formatMessage({ id: 'ui-eholdings.label.author' }) },
              { value: 'editor', label: intl.formatMessage({ id: 'ui-eholdings.label.editor' }) },
              { value: 'illustrator', label: intl.formatMessage({ id: 'ui-eholdings.label.illustrator' }) }
            ]}
          />
        </div>
        <div
          data-test-eholdings-contributor-contributor
          className={styles['contributor-fields-contributor']}
        >
          <Field
            name={`${contributor}.contributor`}
            type="text"
            id={`${contributor}-input`}
            component={TextField}
            label={intl.formatMessage({ id: 'ui-eholdings.name' })}
          />
        </div>
      </Fragment>
    );
  }

  render() {
    const { initialValue, intl } = this.props;

    return (
      <div data-test-eholdings-contributor-field>
        <FieldArray
          addLabel={(<FormattedXmlMessage id="ui-eholdings.title.contributor.addContributor" tags={{ 'icon': <Icon /> }} />)}
          component={RepeatableField}
          emptyMessage={
            initialValue.length > 0 && initialValue[0].contributor ?
              intl.formatMessage({ id: 'ui-eholdings.title.contributor.notSet' }) : ''
          }
          legend={intl.formatMessage({ id: 'ui-eholdings.label.contributors' })}
          name="contributors"
          renderField={this.renderField}
        />
      </div>
    );
  }
}

export function validate(values, { intl }) {
  const errors = {};

  values.contributors.forEach((contributorObj, index) => {
    let contributorErrors = {};
    let isEmptyObject = Object.keys(contributorObj).length === 0;
    let contributor = contributorObj.contributor;
    let isEmptyString = typeof contributor === 'string' && !contributor.trim();

    if (isEmptyString || isEmptyObject) {
      contributorErrors.contributor = intl.formatMessage({ id: 'ui-eholdings.validate.errors.contributor.empty' });
    }

    if (contributor && contributor.length >= 250) {
      contributorErrors.contributor = intl.formatMessage({ id: 'ui-eholdings.validate.errors.contributor.exceedsLength' });
    }

    errors[index] = contributorErrors;
  });

  return { contributors: errors };
}

export default injectIntl(ContributorField);

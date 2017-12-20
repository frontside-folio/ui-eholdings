import React from 'react';
import PropTypes from 'prop-types';
import KeyValueLabel from './key-value-label';

export default function IdentifiersList({ data }) {
  // get rid of identifiers we received that aren't ISSN or ISBN
  let filteredData = data.filter(identifier => ['ISSN', 'ISBN'].includes(identifier.type));

  // turn type and subtype into compound types
  let identifiersWithCompoundTypes = filteredData.map((identifier) => {
    let compoundType = identifier.type;

    if (identifier.subtype !== 'Empty') {
      compoundType = `${identifier.type} (${identifier.subtype})`;
    }

    return {
      id: identifier.id,
      compoundType
    };
  });

  // group by type/subtype combination
  let identifiersByType = identifiersWithCompoundTypes.reduce((byType, identifier) => {
    let key = identifier.compoundType;
    byType[key] = byType[key] || [];
    byType[key].push(identifier.id);
    return byType;
  }, {});

  return (
    <div>
      {Object.keys(identifiersByType).map(key => (
        <div key={key} data-test-eholdings-identifiers-list-item>
          <KeyValueLabel label={key}>
            {identifiersByType[key].join(' ')}
          </KeyValueLabel>
        </div>
      ))}
    </div>
  );
}

IdentifiersList.propTypes = {
  data: PropTypes.array
};

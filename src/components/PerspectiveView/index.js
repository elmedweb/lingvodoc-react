import React from 'react';
import PropTypes from 'prop-types';
import { groupBy } from 'lodash';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table, Dimmer, Header, Icon } from 'semantic-ui-react';

import TableHeader from './TableHeader';
import TableBody from './TableBody';

const PerspectiveView = ({ className, mode, fields, entries, loading }) => {
  const groupedEntries = entries.map(entry => ({
    ...entry,
    contains: groupBy(entry.contains, v => `${v.field_client_id}/${v.field_object_id}`),
  }));

  const columns = fields.map(v => ({
    key: `${v.field_client_id}/${v.field_object_id}`,
    dataType: `${v.data_type_translation_gist_client_id}/${v.data_type_translation_gist_object_id}`,
  }));

  return (
    <Dimmer.Dimmable dimmed={loading} style={{ minHeight: '600px' }}>
      <Dimmer active={loading} inverted>
        <Header as="h2" icon><Icon name="spinner" loading /></Header>
      </Dimmer>

      <Table celled padded className={className} >
        <TableHeader fields={fields} />

        <TableBody entries={groupedEntries} columns={columns} mode={mode} />
      </Table>
    </Dimmer.Dimmable>
  );
};

PerspectiveView.propTypes = {
  className: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  entries: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default onlyUpdateForPropTypes(PerspectiveView);

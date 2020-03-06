import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Table } from 'semantic-ui-react';
import Row from './Row';

class TableBody extends React.Component {
  constructor ( props ) {
    super( props );
  }

  render () {
    const {
      selectedEntries,
      perspectiveId,
      selectEntries,
      onEntrySelect,
      entitiesMode,
      entries,
      columns,
      actions,
      filter,
      mode
    } = this.props;

    return(
      <Table.Body>
        {entries.map(entry => (
          <Row
            selectedEntries = { selectedEntries }
            perspectiveId   = { perspectiveId }
            onEntrySelect   = { onEntrySelect }
            selectEntries   = { selectEntries }
            entitiesMode    = { entitiesMode }
            actions         = { actions }
            columns         = { columns }
            filter          = { filter }
            entry           = { entry }
            mode            = { mode }
            key             = { entry.id }
          />
        ))}
      </Table.Body>
    )
  }
}

TableBody.propTypes = {
  selectedEntries: PropTypes.array,
  perspectiveId:   PropTypes.array.isRequired,
  selectEntries:   PropTypes.bool,
  onEntrySelect:   PropTypes.func,
  entitiesMode:    PropTypes.string.isRequired,
  entries:         PropTypes.array.isRequired,
  columns:         PropTypes.array.isRequired,
  actions:         PropTypes.array,
  mode:            PropTypes.string.isRequired
};

TableBody.defaultProps = {
  selectedEntries: [],
  onEntrySelect:   () => {},
  selectEntries:   false,
  actions:         []
};

export default onlyUpdateForKeys(['perspectiveId', 'entries', 'mode', 'selectedEntries'])(TableBody);

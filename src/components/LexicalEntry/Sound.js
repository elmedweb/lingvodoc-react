import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { onlyUpdateForKeys } from 'recompose';
import { connect } from 'react-redux';
import { Button, Checkbox, Popup } from 'semantic-ui-react';
import { find, isEqual } from 'lodash';
import { openPlayer } from 'ducks/player';
import Entities from './index';

function content(c) {
  const MAX_CONTENT_LENGTH = 12;
  if (c.length <= MAX_CONTENT_LENGTH) {
    return c;
  }
  return `${c.substr(c.lastIndexOf('/') + 1).substr(0, MAX_CONTENT_LENGTH)}...`;
}

const SoundEntityContent = onlyUpdateForKeys(['entity', 'mode'])(({
  entity, mode, publish, accept, remove, actions,
}) => {
  switch (mode) {
    case 'edit':
      return (
        <Button.Group basic icon size="mini">
          <Button as="a" href={entity.content} icon="download" />
          <Popup trigger={<Button content={content(entity.content)} />} content={entity.content} />
          <Button icon="play" onClick={() => actions.openPlayer(entity)} />
          <Button icon="remove" onClick={() => remove(entity)} />
        </Button.Group>
      );
    case 'publish':
      return (
        <div>
          <Button.Group basic icon size="mini">
            <Button as="a" href={entity.content} icon="download" />
            <Popup trigger={<Button content={content(entity.content)} />} content={entity.content} />
            <Button icon="play" onClick={() => actions.openPlayer(entity)} />
          </Button.Group>
          <Checkbox
            size="tiny"
            checked={entity.published}
            onChange={(e, { checked }) => publish(entity, checked)}
          />
        </div>
      );

    case 'view':
      return (
        <Button.Group basic icon size="mini">
          <Button as="a" href={entity.content} icon="download" />
          <Popup trigger={<Button content={content(entity.content)} />} content={entity.content} />
          <Button icon="play" onClick={() => actions.openPlayer(entity)} />
        </Button.Group>
      );
    case 'contributions':
      return (
        <Button.Group icon size="mini">
          <Button basic color='black' as="a" href={entity.content} icon="download" />
          <Popup trigger={<Button basic color='black' content={content(entity.content)} />} content={entity.content} />
          <Button basic color='black' icon="play" onClick={() => actions.openPlayer(entity)} />
          {!entity.accepted && <Button basic color='black' icon="check" onClick={() => accept(entity, true)} />}
        </Button.Group>
      );
    default:
      return null;
  }
});

const Sound = (props) => {
  const {
    perspectiveId,
    column,
    columns,
    entity,
    entry,
    mode,
    entitiesMode,
    as: Component = 'li',
    className = '',
    publish,
    accept,
    remove,
    actions,
  } = props;
  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));

  return (
    <Component className={className}>
      <SoundEntityContent entity={entity} mode={mode} publish={publish} accept={accept} remove={remove} actions={actions} />

      {subColumn && (
        <Entities
          perspectiveId={perspectiveId}
          column={subColumn}
          columns={columns}
          entry={entry}
          mode={mode}
          entitiesMode={entitiesMode}
          parentEntity={entity}
        />
      )}
    </Component>
  );
};

Sound.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
  publish: PropTypes.func,
  accept: PropTypes.func,
  remove: PropTypes.func,
  actions: PropTypes.object.isRequired,
};

Sound.defaultProps = {
  as: 'li',
  className: '',
};

Sound.Edit = ({ onSave }) => <input type="file" onChange={e => onSave(e.target.files[0])} />;

Sound.Edit.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

Sound.Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {},
};

const mapStateToProps = state => ({
  ...state,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openPlayer }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sound);

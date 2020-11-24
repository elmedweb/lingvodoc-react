import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Checkbox, Popup } from 'semantic-ui-react';
import { find, isEqual } from 'lodash';
import { openViewer } from 'ducks/markup';
import { openModal } from 'ducks/modals';

import Entities from './index';
import RunParserModal from './RunParserModal';
import ParserResults from './ParserResults';

function content(c) {
  const MAX_CONTENT_LENGTH = 12;
  if (c.length <= MAX_CONTENT_LENGTH) {
    return c;
  }
  return `${c.substr(c.lastIndexOf('/') + 1).substr(0, MAX_CONTENT_LENGTH)}...`;
}

const MarkupEntityContent = onlyUpdateForKeys([
  'entity', 'mode',
])(({
  entity, parentEntity, mode, publish, accept, remove, actions
}) => {
  switch (mode) {
    case 'edit':
      const forParse = entity.is_subject_for_parsing;
      return (
        <Button.Group basic icon size="mini">
          <Button as="a" href={entity.content} icon="download" />
          <Popup trigger={<Button content={content(entity.content)} />} content={entity.content} />
          <Button
            icon={forParse ? "power" : "table"}
            onClick={() => forParse ? actions.openModal(RunParserModal, { entityId: entity.id }) : actions.openViewer(parentEntity, entity)}
          />
          <Button icon="remove" onClick={() => remove(entity)} />
        </Button.Group>
      );
    case 'publish':
      return (
        <div>
          <Button.Group basic icon size="mini">
            <Button as="a" href={entity.content} icon="download" />
            <Popup trigger={<Button content={content(entity.content)} />} content={entity.content} />
            <Button icon="table" onClick={() => actions.openViewer(parentEntity, entity)} />
          </Button.Group>
          <Checkbox
            size="tiny"
            checked={entity.published}
            onChange={(_e, { checked }) => publish(entity, checked)}
          />
        </div>
      );

    case 'view':
      return (
        <Button.Group basic icon size="mini">
          <Button as="a" href={entity.content} icon="download" />
          <Popup trigger={<Button content={content(entity.content)} />} content={entity.content} />
          <Button icon="table" onClick={() => actions.openViewer(parentEntity, entity)} />
        </Button.Group>
      );

    case 'contributions':
      return (
        <Button.Group icon size="mini">
          <Button basic color='black' as="a" href={entity.content} icon="download" />
          <Popup trigger={<Button basic color='black' content={content(entity.content)} />} content={entity.content} />
          <Button basic color='black' icon="table" onClick={() => actions.openViewer(parentEntity, entity)} />
          {!entity.accepted && <Button basic color='black' icon="check" onClick={() => accept(entity, true)} />}
        </Button.Group>
      );
    default:
      return null;
  }
});

const Markup = (props) => {
  const {
    column,
    columns,
    entity,
    parentEntity,
    entry,
    mode,
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
      <MarkupEntityContent entity={entity} parentEntity={parentEntity} mode={mode} publish={publish} accept={accept} remove={remove} actions={actions} />
      {subColumn && <Entities column={subColumn} columns={columns} entry={entry} parentEntity={entity} mode={mode} />}
      {!subColumn && entity.is_subject_for_parsing && <ParserResults entityId={entity.id} mode={mode} />}
    </Component>
  );
};

Markup.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  parentEntity: PropTypes.object,
  mode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
  publish: PropTypes.func,
  accept: PropTypes.func,
  remove: PropTypes.func,
  actions: PropTypes.object.isRequired,
};

Markup.defaultProps = {
  parentEntity: null,
  as: 'li',
  className: '',
};

Markup.Edit = ({ onSave }) => <input type="file" onChange={e => onSave(e.target.files[0])} />;

Markup.Edit.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

Markup.Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {},
};

const mapStateToProps = state => ({
  ...state,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openViewer, openModal }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Markup);

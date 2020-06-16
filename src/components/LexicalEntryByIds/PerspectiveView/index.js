import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderComponent } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { isEqual, find, take, drop, flow, sortBy, reverse } from 'lodash';
import { Table, Dimmer, Header, Icon, Button } from 'semantic-ui-react';
import { setSortByField, addLexicalEntry, selectLexicalEntry, resetEntriesSelection } from 'ducks/perspective';
import { openModal } from 'ducks/modals';
import Placeholder from 'components/Placeholder';
import ApproveModal from 'components/ApproveModal';
import { getTranslation } from 'api/i18n';

import TableHeader from '../../PerspectiveView/TableHeader';
import TableBody from '../../PerspectiveView/TableBody';
import Pagination from './Pagination';

const ROWS_PER_PAGE = 20;

export const queryPerspective = gql`
  query queryPerspective1($id: LingvodocID!) {
    perspective(id: $id) {

      id
      translation
      columns {
        id
        field_id
        parent_id
        self_id
        position
      }
    }
    all_fields {
      id
      translation
      # NOTE: this field of this query is not used, but it needs to stay here because otherwise on showing
      # of CognateAnalysisModal the query's data gets invalidated and we have to refetch it, see
      # corresponding comments in PerspectiveViewWrapper and languageQuery of CognateAnalysisModal, and
      # fetching another translation for fields doesn't slow down everything noticeably.
      english_translation: translation(locale_id: 2)
      data_type
      data_type_translation_gist_id
    }
  }
`;

export const queryLexicalEntries = gql`
  query queryPerspective2($id: LingvodocID!, $entitiesMode: String!) {
    perspective(id: $id) {
  
      id
      translation
      lexical_entries(mode: $entitiesMode) {
        id
        parent_id
        created_at
        marked_for_deletion
        additional_metadata {
          merge {
            merge_tree
          }
        }
        entities(mode: $entitiesMode) {
          id
          parent_id
          field_id
          link_id
          self_id
          created_at
          locale_id
          content
          published
          accepted
          additional_metadata {
            link_perspective_id
            
          }
        }
      }
    }
  }
`;

const createLexicalEntryMutation = gql`
  mutation createLexicalEntry($id: LingvodocID!, $entitiesMode: String!) {
    create_lexicalentry(perspective_id: $id) {
      lexicalentry {
        id
        parent_id
        created_at
        entities(mode: $entitiesMode) {
          id
          parent_id
          field_id
          link_id
          self_id
          created_at
          locale_id
          content
          published
          accepted
          additional_metadata {
            link_perspective_id
          }
        }
      }
    }
  }
`;

const mergeLexicalEntriesMutation = gql`
  mutation mergeEntries($groupList: [[LingvodocID]]!) {
    merge_bulk(group_list: $groupList, publish_any: false, async: false) {
      triumph
    }
  }
`;

const removeLexicalEntriesMutation = gql`
  mutation removeLexicalEntries($ids: [LingvodocID]!) {
    bulk_delete_lexicalentry(ids: $ids) {
      triumph
    }
  }
`;

const TableComponent = ({
  columns,
  perspectiveId,
  entitiesMode,
  entries,
  mode,
  selectEntries,
  selectedEntries,
  onEntrySelect,
  actions,
}) => (
  <div style={{ overflowY: 'auto' }}>
    <Table celled padded>
      <TableHeader columns={columns} selectEntries={selectEntries} actions={actions} />
      <TableBody
        perspectiveId={perspectiveId}
        entitiesMode={entitiesMode}
        entries={entries}
        columns={columns}
        mode={mode}
        actions={actions}
        selectEntries={selectEntries}
        selectedEntries={selectedEntries}
        onEntrySelect={onEntrySelect}
      />
    </Table>
  </div>
);

TableComponent.propTypes = {
  columns: PropTypes.array.isRequired,
  perspectiveId: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  entries: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  selectEntries: PropTypes.bool,
  selectedEntries: PropTypes.array,
  onEntrySelect: PropTypes.func,
  actions: PropTypes.array,
};

TableComponent.defaultProps = {
  actions: [],
  selectEntries: false,
  selectedEntries: [],
  onEntrySelect: () => {},
};

const P = ({
  id,
  className,
  mode,
  entitiesMode,
  page,
  data,
  filter,
  sortByField,
  allFields,
  columns,
  setSortByField: setSort,
  changePage,
  entriesIds,
  createLexicalEntry,
  // mergeLexicalEntries,
  removeLexicalEntries,
  addLexicalEntry: addCreatedEntry,
  selectLexicalEntry: onEntrySelect,
  resetEntriesSelection: resetSelection,
  openModal: openNewModal,
  createdEntries,
  selectedEntries,
  user
}) => {
  const { loading, error } = data;

  if (loading || (!loading && !error && !data.perspective)) {
    return (
      <Dimmer active style={{ minHeight: '600px', background: 'none' }}>
        <Header as="h2" icon>
          <Icon name="spinner" color="yellow" loading />
        </Header>
      </Dimmer>
    );
  }

  const lexicalEntries = !error ? data.perspective.lexical_entries : [];

  const addEntry = () => {
    createLexicalEntry({
      variables: {
        id,
        entitiesMode,
      },
      refetchQueries: [
        {
          query: queryLexicalEntries,
          variables: {
            id,
            entitiesMode: 'published',
          },
        },
        {
          query: queryLexicalEntries,
          variables: {
            id,
            entitiesMode: 'all',
          },
        },
      ],
    }).then(({ data: d }) => {
      if (!d.loading || !d.error) {
        const {
          create_lexicalentry: { lexicalentry },
        } = d;
        addCreatedEntry(lexicalentry);
      }
    });
  };

  // const mergeEntries = () => {
  //   const groupList = [selectedEntries];
  //   mergeLexicalEntries({
  //     variables: {
  //       groupList,
  //     },
  //     refetchQueries: [
  //       {
  //         query: queryLexicalEntries,
  //         variables: {
  //           id,
  //           entitiesMode,
  //         },
  //       },
  //     ],
  //   }).then(() => {
  //     resetSelection();
  //   });
  // };

  const removeEntries = () => {
    removeLexicalEntries({
      variables: {
        ids: selectedEntries,
      },
      refetchQueries: [
        {
          query: queryLexicalEntries,
          variables: {
            id,
            entitiesMode: 'published',
          },
        },
        {
          query: queryLexicalEntries,
          variables: {
            id,
            entitiesMode: 'all',
          },
        },
      ],
    }).then(() => {
      resetSelection();
    });
  };

  const onApprove = () => {
    openNewModal(ApproveModal, { perspectiveId: id, mode });
  };

  const processEntries = flow([
    // remove empty lexical entries, if not in edit mode
    es => (mode !== 'edit' ? es.filter(e => e.entities.length > 0) : es),
    // apply filtering
    es =>
      (!!filter && filter.length > 0
        ? es.filter(entry =>
          !!entry.entities.find(entity => typeof entity.content === 'string' && entity.content.indexOf(filter) >= 0))
        : es),
    // apply sorting
    (es) => {
      // no sorting required
      if (!sortByField) {
        return es;
      }
      const { field, order } = sortByField;
      // XXX: sorts by first entity only
      const sortedEntries = sortBy(es, (e) => {
        const entities = e.entities.filter(entity => isEqual(entity.field_id, field));
        if (entities.length > 0) {
          return entities[0].content;
        }
        return '';
      });
      return order === 'a' ? sortedEntries : reverse(sortedEntries);
    },
  ]);

  const newEntries = processEntries(lexicalEntries.filter(e => !!createdEntries.find(c => isEqual(e.id, c.id))));
  const entries = processEntries(lexicalEntries.filter(e => !!entriesIds.find(entryId => isEqual(e.id, entryId))));

  const pageEntries =
    entries.length > ROWS_PER_PAGE ? take(drop(entries, ROWS_PER_PAGE * (page - 1)), ROWS_PER_PAGE) : entries;

  // Put newly created entries at the top of page.
  const e = [...newEntries, ...pageEntries.filter(pageEntry => !createdEntries.find(c => isEqual(c.id, pageEntry.id)))];

  // join fields and columns
  // {
  //   column_id = column.id
  //   position = column.position
  //   self_id = column.self_id
  //   ...field
  // }
  const fields = columns.map((column) => {
    const field = find(allFields, f => isEqual(column.field_id, f.id));
    return {
      ...field,
      self_id: column.self_id,
      column_id: column.id,
      position: column.position,
    };
  });

  function approveDisableCondition(entries) {
    return entries.length == 0 || entries.every((entry) => {
      return entry.entities.every((entity) => {
        return mode == 'publish' ? entity.published == true : entity.accepted == true;
      });
    });
  }

  const isAuthenticated = user && user.user.id;

  return (
    <div style={{ overflowY: 'auto' }}>
      <div className={mode === 'edit' ? 'lexical-entries-actions' : ''}>
        {mode === 'edit' &&
          <Button positive icon="plus" content={getTranslation('Add lexical entry')} onClick={addEntry} />
        }
        {mode === 'edit' && (
          <Button
            negative
            icon="minus"
            content={getTranslation('Remove lexical entries')}
            onClick={removeEntries}
            disabled={selectedEntries.length < 1}
          />
        )}
        {/* {mode === 'edit' && (
          <Button
            positive
            icon="plus"
            content={getTranslation('Merge lexical entries')}
            onClick={mergeEntries}
            disabled={selectedEntries.length < 2}
          />
        )} */}
        {/* {mode === 'publish' && isAuthenticated &&
          <Button
            positive
            content={getTranslation('Publish Entities')}
            disabled={approveDisableCondition(entries)}
            onClick={onApprove}
          />
        } */}
        {mode === 'contributions' && isAuthenticated &&
          <Button
            positive
            content={getTranslation('Accept Contributions')}
            disabled={approveDisableCondition(entries)}
            onClick={onApprove}
          />
        }
      </div>
      <Table celled padded className={className}>
        <TableHeader
          columns={fields}
          onSortModeChange={(fieldId, order) => setSort(fieldId, order)}
          selectEntries={mode === 'edit'}
        />
        <TableBody
          perspectiveId={id}
          entitiesMode={entitiesMode}
          entries={e}
          columns={fields}
          mode={mode}
          selectEntries={mode === 'edit'}
          selectedEntries={selectedEntries}
          onEntrySelect={onEntrySelect}
        />
      </Table>
      <Pagination current={page} total={Math.floor(entries.length / ROWS_PER_PAGE) + 1} changePage={changePage} />
    </div>
  );
};

P.propTypes = {
  id: PropTypes.array.isRequired,
  className: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  filter: PropTypes.string,
  data: PropTypes.object.isRequired,
  sortByField: PropTypes.object,
  setSortByField: PropTypes.func.isRequired,
  addLexicalEntry: PropTypes.func.isRequired,
  createLexicalEntry: PropTypes.func.isRequired,
  mergeLexicalEntries: PropTypes.func.isRequired,
  removeLexicalEntries: PropTypes.func.isRequired,
  selectLexicalEntry: PropTypes.func.isRequired,
  resetEntriesSelection: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  createdEntries: PropTypes.array.isRequired,
  selectedEntries: PropTypes.array.isRequired,
  user: PropTypes.object
};

P.defaultProps = {
  filter: '',
  sortByField: null,
};

const PerspectiveView = compose(
  connect(
    ({ user, perspective: { sortByField, createdEntries, selectedEntries } }) => ({
      user,
      sortByField,
      createdEntries,
      selectedEntries,
    }),
    dispatch =>
      bindActionCreators(
        {
          addLexicalEntry,
          setSortByField,
          selectLexicalEntry,
          resetEntriesSelection,
          openModal,
        },
        dispatch
      )
  ),
  graphql(createLexicalEntryMutation, { name: 'createLexicalEntry' }),
  graphql(mergeLexicalEntriesMutation, { name: 'mergeLexicalEntries' }),
  graphql(removeLexicalEntriesMutation, { name: 'removeLexicalEntries' }),
  graphql(queryLexicalEntries, {
    options: {
      notifyOnNetworkStatusChange: true,
      // fetchPolicy: 'network-only',
    },
  })
)(P);

export const queryLexicalEntry = gql`
  query queryLexicalEntry($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      translation
      columns {
        id
        field_id
        parent_id
        self_id
        position
      }
    }
    all_fields {
      id
      translation
      data_type
      data_type_translation_gist_id
    }
  }
`;

const PerspectiveViewWrapper = ({
  id, className, mode, entitiesMode, page, data, filter, sortByField, changePage, entriesIds,
}) => {
  if (data.error) {
    return null;
  }

  if (data.perspective === undefined)
  {
    /* If we refetch data of this perspective with a different set of column fields during initialization
     * of CognateAnalysisModal, data.perspective becomes undefined and errors and query refetching ensue.
     *
     * See additional info in comment on 'languageQuery' from CognateAnalysis modal.
     *
     * This shouldn't happen anymore, but just in case, if this happens, we refetch the data ourselves,
     * which at least precludes the errors and corresponding waste of time on re-initialization of some
     * components. */

    data.refetch();
    return null;
  }

  const {
    all_fields: allFields,
    perspective: { columns },
  } = data;

  return (
    <PerspectiveView
      id={id}
      className={className}
      mode={mode}
      entitiesMode={entitiesMode}
      entriesIds={entriesIds}
      page={page}
      filter={filter}
      sortByField={sortByField}
      allFields={allFields}
      columns={columns}
      changePage={changePage}
    />
  );
};

PerspectiveViewWrapper.propTypes = {
  id: PropTypes.array.isRequired,
  className: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  filter: PropTypes.string,
  data: PropTypes.object.isRequired,
  sortByField: PropTypes.object,
  changePage: PropTypes.func.isRequired,
};

PerspectiveViewWrapper.defaultProps = {
  filter: '',
  sortByField: null,
};

export default compose(
  graphql(queryPerspective, {
    options: { notifyOnNetworkStatusChange: true },
  }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder))
)(PerspectiveViewWrapper);

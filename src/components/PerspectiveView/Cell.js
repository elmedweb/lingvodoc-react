/* eslint-disable padded-blocks */
import React from 'react';
import PropTypes from 'prop-types';
import { pure, onlyUpdateForKeys, compose } from 'recompose';
import { Table, Popup } from 'semantic-ui-react';
import Entities from 'components/LexicalEntry';
import 'styles/main.scss';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';


const AutorsName = gql` 
query author($perspectiveId:LingvodocID!) {
  perspective(id:$perspectiveId){
    last_modified_at
    id
  authors{
    id
    name
    }
  }
}
`;
let authors = [];
let str = null;
let last_modified_at = null;
let date = null;
let BeautifulDate = (timestamp) => {
  let check = (number) => {
    if (number <= 9) {
      return '0' + number
    } else {
      return number
    }
  }
  return check(timestamp.getDate()) + '.' + check(timestamp.getMonth()) + '.' + timestamp.getFullYear();
}
let PanelAuthors = (props) => {

  props.props.client.query({
    query: AutorsName,
    variables: { perspectiveId: props.props.perspectiveId },

  }).then(result => {
    authors = result.data.perspective.authors;
    last_modified_at = result.data.perspective.last_modified_at;
    date = new Date(Math.trunc(last_modified_at) * 1000)
    str = authors.map(name => name.name + ' ') + BeautifulDate(date);

  });
  return (
    <div>{str}</div>
  )
}



const Cell = ({
  perspectiveId,
  entry,
  column,
  columns,
  mode,
  entitiesMode,
  disabled,
// eslint-disable-next-line arrow-body-style
}) => {

  return (

    <Popup content={<PanelAuthors props={props}></PanelAuthors>}
      trigger={
        <Table.Cell className="entity gentium">
          <Entities
            perspectiveId={perspectiveId}
            column={column}
            columns={columns}
            entry={entry}
            mode={mode}
            entitiesMode={entitiesMode}
          />
        </Table.Cell>
      }>


    </Popup>
  );
};

Cell.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default compose(onlyUpdateForKeys(['perspectiveId', 'entry', 'mode']), withApollo)(Cell);

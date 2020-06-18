import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys, compose } from 'recompose';
import { Table, Popup } from 'semantic-ui-react';
import Entities from 'components/LexicalEntry';
import 'styles/main.scss';
import { withApollo } from 'react-apollo';
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

let str = null;
let date = null;

const BeautifulDate = (timestamp) => {
  const check = (number) => {
    if (number <= 9) {
      return `0${number}`;
    }
    return number;
  };
  return `${check(timestamp.getDate())}.${check(timestamp.getMonth())}.${timestamp.getFullYear()}`;
};
const PanelAuthors = (props) => {
  props.content.client.query({
    query: AutorsName,
    variables: { perspectiveId: props.content.perspectiveId },

  }).then((result) => {
    const { authors } = result.data.perspective.authors;
    const { lastModifiedAt } = result.data.perspective.last_modified_at;
    date = new Date(Math.trunc(lastModifiedAt) * 1000);
    str = authors.map(name => `${name.name} `) + BeautifulDate(date);
  });
  return (
    <div>{str}</div>
  );
};


function Cell(props) {
  const {
    perspectiveId, entry, column, columns, mode, entitiesMode
  } = props;


  return (

    <Popup
      content={<PanelAuthors content={props} />}
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
      }
    />
  );
}
PanelAuthors.propTypes = {
  content: PropTypes.object.isRequired,
};

Cell.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
};

export default compose(onlyUpdateForKeys(['perspectiveId', 'entry', 'mode']), withApollo)(Cell);

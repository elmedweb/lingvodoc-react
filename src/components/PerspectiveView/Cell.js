import React from 'react';
import PropTypes from 'prop-types';
import { pure, onlyUpdateForKeys, compose } from 'recompose';
import { Table, Popup } from 'semantic-ui-react';
import Entities from 'components/LexicalEntry';
import 'styles/main.scss';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';


/* const AutorsName = gql` 
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
`; */
const AutorsName = gql` 
query userName($id: Int){
  user(id:$id){
    name
  }
       }
`;
const clientIdList =
  gql`
  query clientIdList ($clientIdList:[Int]!){
    client_list(client_id_list : $clientIdList)
    }
  `;
/*   authors = result.data.perspective.authors;
    last_modified_at = result.data.perspective.last_modified_at;
    date = new Date(Math.trunc(last_modified_at) * 1000)
    str = authors.map(name => name.name + ' ') + BeautifulDate(date);
 */
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
  const { name } = props
  const client_id = [props.props.entry.id[0]];
  console.log(props.props.entry.entities.map(el => {
    return el.id[0]
  }))
  console.log(props)
  /*   props.props.client.query({
      query: clientIdList,
      variables: { clientIdList: client_id },
    }).then(result => {
  
    props.props.client.query({
      query: AutorsName,
      variables: { id: result.data.client_list[0][1] },
    }).then(result => {
  
      name.push(result.data.user.name)
    });
  
  }) */
  return (
    <div>{props.name}</div>
  )
}
const test=(e)=>{
 console.log(e.target.innerText) 
}



function Cell(props) {
  const { perspectiveId, entry, column, columns, mode, entitiesMode } = props;


  return (

    <Popup content={<PanelAuthors props={props} />}
      trigger={
        <Table.Cell onMouseOver={test} className="entity gentium">
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
};

export default compose(onlyUpdateForKeys(['perspectiveId', 'entry', 'mode']), withApollo)(Cell);

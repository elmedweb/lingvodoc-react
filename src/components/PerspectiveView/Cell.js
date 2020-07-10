import React, { useState } from 'react';
import PropTypes, { number } from 'prop-types';
import { onlyUpdateForKeys, compose } from 'recompose';
import { Table, Popup } from 'semantic-ui-react';
import Entities from 'components/LexicalEntry';
import 'styles/main.scss';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';


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


let BeautifulDate = (timestamp) => {
  let check = (number, diff) => {
    if (number + diff <= 9) {
      return '0' + (number + diff)
    } else {
      return number + diff
    }
  }
  return check(timestamp.getDate(), 0) + '.' + check(timestamp.getMonth(), 1) + '.' + timestamp.getFullYear();
}


let PanelAuthors = (props) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const client_id = props.props.entry.entities.find(el => {
    if (el.content && el.content.includes('http')) {
      return el.content.includes(props.text)
    } else {
      return props.text === el.content
    }

  })
  if (client_id) {
    props.props.client.query({
      query: clientIdList,
      variables: { clientIdList: client_id.id[0] },
    }).then(result => {
      const userList = result.data.client_list[0][1]
      props.props.client.query({
        query: AutorsName,
        variables: { id: userList },
      }).then(result => {
        const dateCreated = client_id.created_at
        setDate(BeautifulDate(new Date(dateCreated * 1000)))
        setName(result.data.user.name)
      });
    })

  }
  return (
    <div>{name} {date}</div>
  )
}



function Cell(props) {
  const { perspectiveId, entry, column, columns, mode, entitiesMode, } = props;
  const [textCell, setTextCell] = useState(' ')
  const textHover = (e) => {
    console.log(e.target.innerText)
    setTextCell(e.target.innerText)
  }
  return (
    <Popup content={<PanelAuthors props={props} text={textCell} />}
      trigger={
        <Table.Cell onMouseOver={textHover} className="entity gentium">
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

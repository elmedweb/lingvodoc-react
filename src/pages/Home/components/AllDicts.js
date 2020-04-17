import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import LangsNav from 'pages/Home/components/LangsNav';
import Tree from './Tree';
import { Form, Radio, Dropdown, Input, Button } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';

import { compose } from 'recompose';

let authorsList = [];

let date = null;
let test89 = [];

const AutorsName = gql`
query AuthDictionaries($id:LingvodocID!) {
  dictionary(id:$id) {
    id
    parent_id
    translation
    status
    additional_metadata {
      authors
    }
    perspectives {
      id
      translation
    }
  }
}
`;
const metadataQuery = gql`
  query metadata {
    select_tags_metadata
  }
`;
const Last_modified_at = gql` 
query author($perspectiveId:LingvodocID!) {
  perspective(id:$perspectiveId){
    id
    last_modified_at
  authors{
    id
    name
    }
  }
}
`;

let last_modified_at_Dictionary_mody;
const classNames = {
  container: 'search-advanced-filter',
  field: 'search-advanced-filter__field',
  header: 'search-advanced-filter__header',
  warning: 'search-advanced-filter__warning',
  hide: 'hide',
};

class AllDicts extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      authors: [],
      test5: [],
      arrTest: [],
      test7: ''
    }
    this.flag = false;
    this.fill = this.fill.bind(this)
    this.startDate = null;
    this.endDate = null;
  }
  static isFieldLanguageVulnerability(name) {
    return name === 'languageVulnerability';
  }

  test = (e, { value }) => {
    this.setState({ test5: [] })
    this.setState({ startDate: null })
    this.endDate = null;
    this.setState({ value })
  }
  handleChangeAuthors = (e, { value }) => {
    this.flag = false;
    this.setState((state, props) => (
      { test5: value }
    )
    );
  }

  requestDate = (id_dictionary) => {
    this.props.client.query({
      query: AutorsName,
      variables: { id: id_dictionary._tail.array }
    }).then(result => {
      test89.push(result.data.dictionary)
      this.setState({ arrTest: test89 })
    })
  }
  handleChangeDate = (event) => {
    if (event.currentTarget.offsetParent.className === 'ui big input startDate') {
      this.startDate = event.currentTarget.valueAsNumber;
      // this.setState({ startDate: event.currentTarget.valueAsNumber })
    } else if (event.currentTarget.offsetParent.className === 'ui big input endDate') {
      this.endDate = event.currentTarget.valueAsNumber;
      // this.setState({ endDate: event.currentTarget.valueAsNumber })
    }

    if (this.startDate || this.endDate) {
      this.props.dictionaries.map(u => {
        let last_modified_at_Dictionary = u.getIn(['last_modified_at'])
        let id_dictionary = u.getIn(['id']);
        last_modified_at_Dictionary_mody = (new Date(Math.trunc(last_modified_at_Dictionary) * 1000)).setHours(0,0,0,0)


        if (last_modified_at_Dictionary_mody >= this.startDate && !this.endDate) {
          console.log('last_modified_at_Dictionary_mody ', new Date(last_modified_at_Dictionary_mody))

          this.requestDate(id_dictionary)
        } else if (last_modified_at_Dictionary_mody >= this.startDate && last_modified_at_Dictionary_mody <= this.endDate) {
          console.log('last_modified_at_Dictionary_mody ', new Date(last_modified_at_Dictionary_mody))

          this.requestDate(id_dictionary)
        } else if (last_modified_at_Dictionary_mody <= this.endDate && !this.startDate) {
          console.log('last_modified_at_Dictionary_mody ', new Date(last_modified_at_Dictionary_mody))

          this.requestDate(id_dictionary)
        } else {
          this.setState({ arrTest: [] })
        }
      })
    }

  }


  fill = (arr) => {
    let result = []
    arr.sort(function (a, b) {
      var nameA = a.text.toLowerCase(), nameB = b.text.toLowerCase()
      if (nameA < nameB)
        return -1
      if (nameA > nameB)
        return 1
      return 0
    })
    for (let k = 0; k < arr.length - 1; k++) {
      if (arr[k].text !== arr[k + 1].text) {
        result.push(arr[k])
      }

    }
    return result
  }



  render() {

    const { value } = this.state
    const {
      languagesTree, dictionaries, perspectives, isAuthenticated, location, data, client
    } = this.props;
    if (this.props.data.loading === false) {
      let dictList = data.select_tags_metadata.authors

      if (dictList) {
        for (let i = 0; i < dictList.length - 1; i++) {

          if (dictList[i] === " ") {
            return
          } else {

            let obj = {
              key: dictList[i],
              value: dictList[i],
              text: dictList[i],
            }
            authorsList.push(obj)
          }
        }
      }
    }

    dictionaries.map((dict1) => {
      let too = dict1.getIn(['additional_metadata'], ['authors'])
      if (too._root.entries[0][1]._tail) {
        too._root.entries[0][1]._tail.array.map(author => {
          this.state.test5.map(el => {
            if (el === author && !this.flag) {
              let idDict = dict1.getIn(['id'])
              this.props.client.query({
                query: AutorsName,
                variables: { id: idDict._tail.array }
              }).then(result => {
                this.flag = true;
                test89.push(result.data.dictionary)
                this.setState({ arrTest: test89 })

              })
            }
          })

        })
      }

    })
    let dicts = dictionaries;
    if (this.state.test5.length !== 0 || this.startDate || this.endDate) {
      const dictsSource = fromJS(this.state.arrTest);
      const localDicts = fromJS(dictionaries);
      const isDownloaded = dict => !!localDicts.find(d => d.get('id').equals(dict.get('id')));
      dicts = dictsSource.reduce(
        (acc, dict) => acc.set(dict.get('id'), dict.set('isDownloaded', isDownloaded(dict))),
        new Map()
      );

    }

    const tree = assignDictsToTree(
      buildDictTrees(fromJS({
        lexical_entries: [],
        perspectives,
        dictionaries: dicts,
      })),
      languagesTree
    );

    return (
      <div>
        <Form.Field
          control={Radio}
          label='by lang'
          value='1'
          checked={value === '1'}
          onChange={this.test}
        >

        </Form.Field>
        <Form.Field
          control={Radio}
          label='by authors'
          value='2'
          checked={value === '2'}
          onChange={this.test}

        ></Form.Field>
        <Form.Field
          control={Radio}
          label='by time'
          value='3'
          checked={value === '3'}
          onChange={this.test}

        >

        </Form.Field>
        {this.state.value === '1' && (
          <LangsNav data={tree} />
        )}

        {this.state.value === '2' && (
          <Dropdown
            placeholder='Select authors'
            onChange={this.handleChangeAuthors}
            fluid
            multiple
            search
            selection
            options={this.fill(authorsList)}

          ></Dropdown>



        )}
        {this.state.value === '3' && (

          <div>
            <Input className='startDate' type='date' size='big' onBlur={this.handleChangeDate} />
            <Input className='endDate' type='date' size='big' onBlur={this.handleChangeDate} />

          </div>

        )}




        <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />


      </div>
    );
  }

}

AllDicts.propTypes = {
  location: PropTypes.object,
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
};

AllDicts.defaultProps = {
  isAuthenticated: false,
};

export default compose(graphql(metadataQuery), withApollo)(AllDicts);
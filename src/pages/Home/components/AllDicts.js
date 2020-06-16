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

let optionsAuthorsList = [];
let authorsList = [];
let last_modified_at_Dictionary_mody = null;
let dicts = null;
const metadataQuery = gql`
  query metadata {
    select_tags_metadata
  }
`;

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

class AllDicts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      arrayDictionary: []
    }

    this.equalValueFilter = this.equalValueFilter.bind(this)
    this.startDate = null;
    this.endDate = null;
    this.selectedAuthor = [];
  }
  static isFieldLanguageVulnerability(name) {
    return name === 'languageVulnerability';
  }

  selectorMode = (e, { value }) => {
    this.selectedAuthor = [];
    this.startDate = null;
    this.endDate = null;
    this.setState({ value });
  }

  requestData = (id_dictionary) => {
    this.props.client.query({
      query: AutorsName,
      variables: { id: id_dictionary._tail.array }
    }).then(result => {
      authorsList.push(result.data.dictionary)
      this.setState({ arrayDictionary: authorsList })
    })
  }

  handleChangeAuthors = (e, { value }) => {
    authorsList = [];
    this.selectedAuthor = value;

    if (this.selectedAuthor.length !== 0) {
    this.props.dictionaries.forEach((dictionary) => {
      let dictAuthor = dictionary.getIn(['additional_metadata'], ['authors'])
      if (dictAuthor._root.entries[0][1]._tail) {
        dictAuthor._root.entries[0][1]._tail.array.forEach(author => {
          if ( this.selectedAuthor.includes( author ) ) {
            let idDict = dictionary.getIn(['id'])
            this.requestData(idDict)
          }
        })
      }
    })
    } else {
      dicts = this.props.dictionaries;
      this.setState({ arrayDictionary: [] })
    }
  }

  handleChangeDate = (event) => {
    if (event.currentTarget.offsetParent.className === 'ui big input startDate') {
      this.startDate = event.currentTarget.valueAsNumber;

    } else if (event.currentTarget.offsetParent.className === 'ui big input endDate') {
      this.endDate = event.currentTarget.valueAsNumber;
    }

    if (this.startDate || this.endDate) {
      this.props.dictionaries.map(dictionary => {
        let last_modified_at_Dictionary = dictionary.getIn(['last_modified_at']);
        let id_dictionary = dictionary.getIn(['id']);
        last_modified_at_Dictionary_mody = (new Date(Math.trunc(last_modified_at_Dictionary) * 1000)).setHours(0, 0, 0, 0);

        if (last_modified_at_Dictionary_mody >= this.startDate && !this.endDate) {
          this.requestData(id_dictionary)
        } else if (last_modified_at_Dictionary_mody >= this.startDate && last_modified_at_Dictionary_mody <= this.endDate) {
          this.requestData(id_dictionary)
        } else if (last_modified_at_Dictionary_mody <= this.endDate && !this.startDate) {
          this.requestData(id_dictionary)
        } else {
          this.setState({ arrayDictionary: [] })
        }
      })
    }

  }


  equalValueFilter = (arr) => {
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
      languagesTree, dictionaries, perspectives, isAuthenticated, location, data
    } = this.props;


    if (this.props.data.loading === false) {
      let dictList = data.select_tags_metadata.authors

      if (dictList) {
        for (let i = 0; i < dictList.length - 1; i++) {
          if (dictList[i] === " ") {
            break
          } else {
            let obj = {
              key: dictList[i],
              value: dictList[i],
              text: dictList[i],
            }
            optionsAuthorsList.push(obj)
          }
        }
      }
    }

    dicts = dictionaries;
    if (this.selectedAuthor.length !== 0 || this.startDate || this.endDate) {

      const dictsSource = fromJS(this.state.arrayDictionary);
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
          className='checkbox_radio'
          control={Radio}
          label='By Language'
          value='1'
          checked={value === '1'}
          onChange={this.selectorMode}
        >

        </Form.Field>
        <Form.Field
          className='checkbox_radio'
          control={Radio}
          label='By Authors'
          value='2'
          checked={value === '2'}
          onChange={this.selectorMode}

        ></Form.Field>
        <Form.Field
          className='checkbox_radio'
          control={Radio}
          label='By Date'
          value='3'
          checked={value === '3'}
          onChange={this.selectorMode}

        >

        </Form.Field>
        {this.state.value === '1' && (
          <LangsNav data={tree} />
        )}

        {this.state.value === '2' && (
          <Dropdown
            className='dropdown_authors'
            placeholder='Select authors'
            onChange={this.handleChangeAuthors}
            fluid
            multiple
            search
            selection
            options={this.equalValueFilter(optionsAuthorsList)}
          ></Dropdown>
        )}

        {this.state.value === '3' && (
          <div className='selected_date'>
            <label className='labelDate'>Selected start date</label>
            <br></br>
            <Input className='startDate' type='date' size='big' onBlur={this.handleChangeDate} />
            <br></br>
            <label className='labelDate'>Selected end date</label>
            <br></br>
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
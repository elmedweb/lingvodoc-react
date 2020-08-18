import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import Tree from './Tree';
import { Dropdown } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import { compose } from 'recompose';

const optionsAuthorsList = [];
let authorsList = [];

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

class AuthorsDicts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arrayDictionary: []
    };

    this.equalValueFilter = this.equalValueFilter.bind(this);
    this.selectedAuthor = [];
  }
  static isFieldLanguageVulnerability(name) {
    return name === 'languageVulnerability';
  }

  requestData = (id_dictionary) => {
    this.props.client.query({
      query: AutorsName,
      variables: { id: id_dictionary._tail.array }
    }).then((result) => {
      authorsList.push(result.data.dictionary);
      this.setState({ arrayDictionary: authorsList });
    });
  }

  handleChangeAuthors = (e, { value }) => {
    authorsList = [];
    this.selectedAuthor = value;

    if (this.selectedAuthor.length !== 0) {
      this.props.dictionaries.forEach((dictionary) => {
        const dictAuthor = dictionary.getIn(['additional_metadata'], ['authors']);
        if (dictAuthor._root.entries[0][1]._tail) {
          dictAuthor._root.entries[0][1]._tail.array.forEach((author) => {
            if (this.selectedAuthor.includes(author)) {
              const idDict = dictionary.getIn(['id']);
              this.requestData(idDict);
            }
          });
        }
      });
    } else {
      dicts = this.props.dictionaries;
      this.setState({ arrayDictionary: [] });
    }
  }

  equalValueFilter = (arr) => {
    const result = [];

    arr.sort((a, b) => {
      let nameA = a.text.toLowerCase(),
        nameB = b.text.toLowerCase();
      if (nameA < nameB) { return -1; }
      if (nameA > nameB) { return 1; }
      return 0;
    });
    for (let k = 0; k < arr.length - 1; k++) {
      if (arr[k].text !== arr[k + 1].text) {
        result.push(arr[k]);
      }
    }

    return result;
  }

  render() {
    const {
      languagesTree, dictionaries, perspectives, isAuthenticated, location, data
    } = this.props;


    if (this.props.data.loading === false) {
      const dictList = data.select_tags_metadata.authors;

      if (dictList) {
        for (let i = 0; i < dictList.length - 1; i++) {
          if (dictList[i] === ' ') {
            break;
          } else {
            const obj = {
              key: dictList[i],
              value: dictList[i],
              text: dictList[i],
            };
            optionsAuthorsList.push(obj);
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
console.log('dictionaries',dictionaries)
console.log('dicts',dicts)
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

        <Dropdown
          className="dropdown_authors"
          placeholder="Select authors"
          onChange={this.handleChangeAuthors}
          fluid
          multiple
          search
          selection
          options={this.equalValueFilter(optionsAuthorsList)}
        />


        <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />
      </div>
    );
  }
}

AuthorsDicts.propTypes = {
  location: PropTypes.object.isRequired,
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
};

AuthorsDicts.defaultProps = {
  isAuthenticated: false,
};

export default compose(graphql(metadataQuery), withApollo)(AuthorsDicts);

import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import Tree from './Tree';
import { Dropdown } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import { compose } from 'recompose';


let authorsList = [];
let dicts = null;
const optionsAuthorsList = [];
const metadataQuery = gql`
  query metadata {
    select_tags_metadata
  }
`;

const AuthDictionaries = gql`
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


  requestData = (idDictionary) => {
    this.props.client.query({
      query: AuthDictionaries,
      variables: { id: idDictionary }
    }).then((result) => {
      authorsList.push(result.data.dictionary);
      this.setState({ arrayDictionary: authorsList });
    });
  }

  handleChangeAuthors = (_e, { value }) => {
    authorsList = [];
    this.selectedAuthor = value;

    if (this.selectedAuthor.length !== 0) {
      this.props.dictionaries.forEach((dictionary) => {
        const mapAuthors = dictionary.getIn(['additional_metadata'], ['authors']);
        const authorsArray = mapAuthors.toJS().authors;

        authorsArray.forEach((author) => {
          if (this.selectedAuthor.includes(author)) {
            const idDictionary = dictionary.getIn(['id']);
            this.requestData(idDictionary.toJS());
          }
        });
      });
    } else {
      dicts = this.props.dictionaries;
      this.setState({ arrayDictionary: [] });
    }
  }

  equalValueFilter = (arr) => {
    const result = [];

    arr.sort((a, b) => {
      const nameA = a.text.toLowerCase();
      const nameB = b.text.toLowerCase();
      if (nameA < nameB) { return -1; }
      if (nameA > nameB) { return 1; }
      return 0;
    });
    for (let k = 0; k < arr.length - 1; k += 1) {
      if (arr[k].text !== arr[k + 1].text) {
        result.push(arr[k]);
      }
    }

    return result;
  }

  render() {
    const {
      languagesTree, dictionaries, perspectives, isAuthenticated, location, data: { loading, select_tags_metadata: tagsMetadata }
    } = this.props;


    if (!loading) {
      const metadataAuthorsList = tagsMetadata.authors;
      if (metadataAuthorsList) {
        for (let i = 0; i < metadataAuthorsList.length - 1; i += 1) {
          if (metadataAuthorsList[i] === ' ') {
            break;
          } else {
            const obj = {
              key: metadataAuthorsList[i],
              value: metadataAuthorsList[i],
              text: metadataAuthorsList[i],
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
  client: PropTypes.object.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool,
    select_tags_metadata: PropTypes.object
  }).isRequired
};

AuthorsDicts.defaultProps = {
  isAuthenticated: false,
};

export default compose(graphql(metadataQuery), withApollo)(AuthorsDicts);

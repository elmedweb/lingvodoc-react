import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import Tree from './Tree';
import { Input } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import { compose } from 'recompose';

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

class ModifDateDicts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arrayDictionary: []
    };

    this.startDate = null;
    this.endDate = null;
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


  handleChangeDate = (event) => {
    if (event.currentTarget.offsetParent.className === 'ui big input startDate') {
      this.startDate = event.currentTarget.valueAsNumber;
    } else if (event.currentTarget.offsetParent.className === 'ui big input endDate') {
      this.endDate = event.currentTarget.valueAsNumber;
    }

    if (this.startDate || this.endDate) {
      this.props.dictionaries.map((dictionary) => {
        const last_modified_at_Dictionary = dictionary.getIn(['last_modified_at']);
        const id_dictionary = dictionary.getIn(['id']);
        last_modified_at_Dictionary_mody = (new Date(Math.trunc(last_modified_at_Dictionary) * 1000)).setHours(0, 0, 0, 0);

        if (last_modified_at_Dictionary_mody >= this.startDate && !this.endDate) {
            this.requestData(id_dictionary);
        } else if (last_modified_at_Dictionary_mody >= this.startDate && last_modified_at_Dictionary_mody <= this.endDate) {
          this.requestData(id_dictionary);
        } else if (last_modified_at_Dictionary_mody <= this.endDate && !this.startDate) {
          this.requestData(id_dictionary);
        } else {
          this.setState({ arrayDictionary: [] });
        }
      });
    }
  }


  render() {
    const {
      languagesTree, dictionaries, perspectives, isAuthenticated, location, data
    } = this.props;


    dicts = dictionaries;
    if ( this.startDate || this.endDate) {
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
          <div className="selected_date">
            <label className="labelDate">Selected start date</label>
            <br />
            <Input className="startDate" type="date" size="big" onBlur={this.handleChangeDate} />
            <br />
            <label className="labelDate">Selected end date</label>
            <br />
            <Input className="endDate" type="date" size="big" onBlur={this.handleChangeDate} />
          </div>
       
        <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />
      </div>
    );
  }
}

ModifDateDicts.propTypes = {
  location: PropTypes.object.isRequired,
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
};

ModifDateDicts.defaultProps = {
  isAuthenticated: false,
};

export default compose(graphql(metadataQuery), withApollo)(ModifDateDicts);

import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import Tree from './Tree';
import { Input, Header, Button } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import { compose } from 'recompose';
import { getTranslation } from 'api/i18n';


let dicts = null;
const arrDictionaries = [];


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

class ModificatiedDictionariesDate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newListDictionaries: [],
      inputDateStart: '',
      inputDateEnd: ''
    };

    this.startDate = null;
    this.endDate = null;
    this.selectedAuthor = [];
    this.lastModifiedAtDictionary = null;
  }

  requestData = (idDictionary) => {
    const { client } = this.props;
    client.query({
      query: AutorsName,
      variables: { id: idDictionary }
    }).then((result) => {
      arrDictionaries.push(result.data.dictionary);
      this.setState({ newListDictionaries: arrDictionaries });
    });
  }


  handleChangeDate = (event, data) => {
    let timestampNumber = null;
    if (data.className === 'startDate date') {
      timestampNumber = Number(new Date(data.value));
      this.setState({ inputDateStart: data.value });
      this.startDate = timestampNumber;
    } else if (data.className === 'endDate date') {
      timestampNumber = Number(new Date(data.value));
      this.setState({ inputDateEnd: data.value });
      this.endDate = timestampNumber;
    }
  }
  dateChangeHandler = () => {
    if (this.startDate || this.endDate) {
      this.props.dictionaries.map((dictionary) => {
        const timestampLastModifiedDate = dictionary.getIn(['last_modified_at']);
        const idDictionary = dictionary.getIn(['id']).toJS();
        this.lastModifiedAtDictionary = (new Date(Math.trunc(timestampLastModifiedDate) * 1000)).setHours(0, 0, 0, 0);

        if (this.lastModifiedAtDictionary >= this.startDate && !this.endDate) {
          this.requestData(idDictionary);
        } else if (this.lastModifiedAtDictionary >= this.startDate && this.lastModifiedAtDictionary <= this.endDate) {
          this.requestData(idDictionary);
        } else if (this.lastModifiedAtDictionary <= this.endDate && !this.startDate) {
          this.requestData(idDictionary);
        } else {
          this.setState({ newListDictionaries: [] });
        }
      });
    }
  }
  clear = () => {
    this.startDate = null;
    this.endDate = null;
    this.setState({ inputDateStart: '', inputDateEnd: '' });
  }
  render() {
    const {
      languagesTree, dictionaries, perspectives, isAuthenticated, location
    } = this.props;


    dicts = dictionaries;
    if (this.startDate || this.endDate) {
      const dictsSource = fromJS(this.state.newListDictionaries);
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
          <Header className="labelDate">{getTranslation('Selected start date')}</Header>
          <Input className="startDate date" value={this.state.inputDateStart} type="date" size="big" onChange={(event, data) => { this.handleChangeDate(event, data); }} />
          <Header className="labelDate">{getTranslation('Selected end date')}</Header>
          <Input className="endDate date" value={this.state.inputDateEnd} type="date" size="big" onChange={(event, data) => { this.handleChangeDate(event, data); }} />
          <Button positive className="buttonOk" onClick={this.dateChangeHandler}>Ok</Button>
          <Button className="buttonOk" onClick={this.clear}>{getTranslation('Clear')}</Button>
        </div>

        <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />
      </div>
    );
  }
}

ModificatiedDictionariesDate.propTypes = {
  location: PropTypes.object.isRequired,
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
  client: PropTypes.object.isRequired
};

ModificatiedDictionariesDate.defaultProps = {
  isAuthenticated: false,
};

export default compose(graphql(metadataQuery), withApollo)(ModificatiedDictionariesDate);

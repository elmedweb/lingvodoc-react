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
const arrayDictionaries = [];

const metadataQuery = gql`
  query metadata {
    select_tags_metadata
  }
`;

const createDate = gql`
query createDate($id:LingvodocID!) {
  dictionary(id:$id) {
    id
    created_at
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

class CreatedDateDictionaries extends React.Component {
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
    this.dateChangeHandler = this.dateChangeHandler.bind(this);
    this.createdAtDictionary = null;
  }

  requestData = (idDictionary) => {
    const { client } = this.props;
    client.query({
      query: createDate,
      variables: { id: idDictionary }
    }).then((result) => {
      arrayDictionaries.push(result.data.dictionary);
      this.setState({ newListDictionaries: arrayDictionaries });
    });
  }

  dateChangeHandler = () => {
    if (this.startDate || this.endDate) {
      this.props.dictionaries.forEach((dictionary) => {
        const createAtDictionary = dictionary.getIn(['created_at']);
        const idDictionary = dictionary.getIn(['id']).toJS();

        this.createdAtDictionary = (new Date(Math.trunc(createAtDictionary) * 1000)).setHours(0, 0, 0, 0);

        if (this.createdAtDictionary >= this.startDate && !this.endDate) {
          this.requestData(idDictionary);
        } else

        if (this.createdAtDictionary >= this.startDate && this.createdAtDictionary <= this.endDate) {
          this.requestData(idDictionary);
        } else

        if (this.createdAtDictionary <= this.endDate && !this.startDate) {
          this.requestData(idDictionary);
        } else {
          return this.setState({ newListDictionaries: [] });
        }
      });
    }
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
          <Header className="labelDate text">{getTranslation('Selected start date')}</Header>
          <Input value={this.state.inputDateStart} className="startDate date" type="date" size="big" onChange={(event, data) => { this.handleChangeDate(event, data); }} />
          <Header className="labelDate text">{getTranslation('Selected end date')}</Header>
          <Input value={this.state.inputDateEnd} className="endDate date" type="date" size="big" onChange={(event, data) => { this.handleChangeDate(event, data); }} />
          <Button positive className="buttonOk" onClick={this.dateChangeHandler}>Ok</Button>
          <Button className="buttonOk" onClick={this.clear}>{getTranslation('Clear')}</Button>
        </div>
        <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />
      </div>
    );
  }
}

CreatedDateDictionaries.propTypes = {
  location: PropTypes.object.isRequired,
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
  client: PropTypes.object.isRequired
};

CreatedDateDictionaries.defaultProps = {
  isAuthenticated: false,
};

export default compose(graphql(metadataQuery), withApollo)(CreatedDateDictionaries);

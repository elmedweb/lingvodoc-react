import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import Tree from './Tree';
import { Input, Label, Placeholder } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import { compose } from 'recompose';


let createAtDictionaryMody = null;
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

class ModifDateDicts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newListDictionaries: [],
      statusResponse: true
    };
    this.startDate = null;
    this.endDate = null;
    this.selectedAuthor = [];
    this.test = this.test.bind(this)
  }
  componentDidUpdate() {
    this.test();
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

  test = () => {
    if (this.startDate || this.endDate) {
      this.props.dictionaries.forEach((dictionary) => {
        const createAtDictionary = dictionary.getIn(['created_at']);
        const idDictionary = dictionary.getIn(['id']).toJS();

        createAtDictionaryMody = (new Date(Math.trunc(createAtDictionary) * 1000)).setHours(0, 0, 0, 0);

        if (createAtDictionaryMody >= this.startDate && !this.endDate) {
          this.requestData(idDictionary);
        } else if (createAtDictionaryMody >= this.startDate && createAtDictionaryMody <= this.endDate) {
          this.requestData(idDictionary);
        } else if (createAtDictionaryMody <= this.endDate && !this.startDate) {
          this.requestData(idDictionary);
        } else {
         /*  return this.setState({ newListDictionaries: [] }); */
        }
      });
      console.log('wdadsaa');
    }
  }
  handleChangeDate = (event) => {
    this.setState({ statusResponse: false });
    if (event.currentTarget.offsetParent.className === 'ui big input startDate') {
      this.startDate = event.currentTarget.valueAsNumber;
    } else if (event.currentTarget.offsetParent.className === 'ui big input endDate') {
      this.endDate = event.currentTarget.valueAsNumber;
    }
  }


  render() {
    const {
      languagesTree, dictionaries, perspectives, isAuthenticated, location
    } = this.props;
    console.log(this.state.statusResponse);
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
          <Label className="labelDate">Selected start date</Label>
          <br />
          <Input className="startDate" type="date" size="big" onBlur={this.handleChangeDate} />
          <br />
          <Label className="labelDate">Selected end date</Label>
          <br />
          <Input className="endDate" type="date" size="big" onBlur={this.handleChangeDate} />
        </div>
        {(this.state.statusResponse) && (
          <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />
        )}
        {(!this.state.statusResponse) && (
          <Placeholder>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder>
        )}
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
  client: PropTypes.object.isRequired
};

ModifDateDicts.defaultProps = {
  isAuthenticated: false,
};

export default compose(graphql(metadataQuery), withApollo)(ModifDateDicts);

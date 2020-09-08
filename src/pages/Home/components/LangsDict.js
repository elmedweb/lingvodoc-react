import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import LangsNav from 'pages/Home/components/LangsNav';
import Tree from './Tree';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import { compose } from 'recompose';
import Languages from 'components/Search/AdditionalFilter/Languages';

const metadataQuery = gql`
  query metadata {
    select_tags_metadata
  }
`;

class AllDicts extends React.Component {
  /*  static getAllNodesValues(languagesTree, result) {
    console.log('languagesTree1', languagesTree);
    if (!result) {
      result = {
        languages: [],
        dictionaries: [],
      };
    }
    languagesTree.forEach((item) => {
      const isLanguage = !!item.dictionaries;
      const type = isLanguage ? 'languages' : 'dictionaries';

      result[type].push([item.id[0], item.id[1]]);

      if (isLanguage && item.dictionaries.length > 0) {
        item.dictionaries.forEach(dictionary => result.dictionaries.push([dictionary.id[0], dictionary.id[1]]));
      }

      this.getAllNodesValues(item.children, result);
    });

    return result;
  } */
  constructor(props) {
    super(props);
  }
  test=(e) => {
    console.log(e);
  }
  render() {
    const {
      languages, languagesTree, dictionaries, perspectives, isAuthenticated, location
    } = this.props;
    const langToFilter = languages.map(lang => lang.id);
    const dictLocal = dictionaries.toJS();
    const dictisToFilter = Object.entries(dictLocal).map(([, value]) => value.id);
    const tree = assignDictsToTree(
      buildDictTrees(fromJS({
        lexical_entries: [],
        perspectives,
        dictionaries,
      })),
      languagesTree
    );
    const localLangTree = languagesTree.toJS();
    const test666=localLangTree.splice(0, 3)
    console.log('languagesTree.toJS()',test666 );
    return (
      <div>
             <Languages
          onChange={this.test}
          languagesTree={test666}
          langsChecked={langToFilter}
          dictsChecked={dictisToFilter}
          showTree={true}
          filterMode
          checkAllButtonText={"Check all"}
          uncheckAllButtonText={"Uncheck all"}
        />

        <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />
      </div>
    );
  }
}

AllDicts.propTypes = {
  location: PropTypes.object.isRequired,
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
};

AllDicts.defaultProps = {
  isAuthenticated: false,
};

export default compose(graphql(metadataQuery), withApollo)(AllDicts);

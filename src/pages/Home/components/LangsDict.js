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
  // eslint-disable-next-line no-useless-constructor
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
    const tree = assignDictsToTree(
      buildDictTrees(fromJS({
        lexical_entries: [],
        perspectives,
        dictionaries,
      })),
      languagesTree
    );

    return (
      <div>
      {/*   <Languages
          onChange={this.onLangsDictsChange}
          languagesTree={languagesTree}
          langsChecked={langToFilter}
          dictsChecked={dictionaries}
          showTree={true}
          filterMode
          checkAllButtonText={"Check all"}
          uncheckAllButtonText={"Uncheck all"}
        /> */}

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

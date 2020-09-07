import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import LangsNav from 'pages/Home/components/LangsNav';
import Tree from './Tree';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import { compose } from 'recompose';


const metadataQuery = gql`
  query metadata {
    select_tags_metadata
  }
`;

class AllDicts extends React.Component {
  static isFieldLanguageVulnerability(name) {
    return name === 'languageVulnerability';
  }
  // eslint-disable-next-line no-useless-constructor
  constructor(props) {
    super(props);
  }
  render() {
    const {
      languagesTree, dictionaries, perspectives, isAuthenticated, location
    } = this.props;

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
        <LangsNav data={tree} />

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

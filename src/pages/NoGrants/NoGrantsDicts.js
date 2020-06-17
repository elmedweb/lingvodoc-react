import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import { Segment, Header, List } from 'semantic-ui-react';

import Tree from '../Home/components/Tree';

const grantId = id => `grant_entry_${id}`;

function restDictionaries(dicts, grants) {
  const grantedDicts = grants
    .flatMap(grant => grant.getIn(['additional_metadata', 'participant']) || new Immutable.List())
    .toSet();
  return dicts.reduce((acc, dict, id) => (grantedDicts.has(id) ? acc : acc.push(dict)), new Immutable.List());
}

function GrantedDicts(props) {
  const {
    languagesTree, dictionaries, perspectives, grants, isAuthenticated,
  } = props;

  const dicts = fromJS(dictionaries)
    .reduce((acc, dict) => acc.set(dict.get('id'), dict), new Map());


  // build tree of dictionaries not included in grants
  const restTree = assignDictsToTree(
    buildDictTrees(fromJS({
      lexical_entries: [],
      perspectives,
      dictionaries: restDictionaries(dicts, grants),
    })),
    languagesTree
  );

  const navigateToGrant = (e, grant) => {
    e.preventDefault();
    document.getElementById(grantId(grant.id)).scrollIntoView();
  };

  return (
    <div>
      <Segment>
        <div className="grant">
          <div className="grant-title">Индивидуальные исследования</div>
          <Tree tree={restTree} canSelectDictionaries={isAuthenticated} />
        </div>
      </Segment>
    </div>
  );
}

GrantedDicts.propTypes = {
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  grants: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
};

GrantedDicts.defaultProps = {
  isAuthenticated: false,
};

export default pure(GrantedDicts);

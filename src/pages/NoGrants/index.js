import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { fromJS, Map } from 'immutable';
import { Container, Segment } from 'semantic-ui-react';

import { buildLanguageTree } from 'pages/Search/treeBuilder';
import { setGrantsMode, resetDictionaries } from 'ducks/home';
import Placeholder from 'components/Placeholder';
import GrantedDicts from './NoGrantsDicts';
import config from 'config';
import './published.scss';


const guestDictionariesQuery = gql`
  query GuestDictionaries {
    dictionaries(proxy: false, published: true) {
      id
      parent_id
      translation
      status
      category
      additional_metadata {
        authors
      }
      perspectives {
        id
        translation
      }
    }
    permission_lists(proxy: false) {
      view {
        id
        parent_id
        translation
      }
      edit {
        id
        parent_id
        translation
      }
      publish {
        id
        parent_id
        translation
      }
      limited {
        id
        parent_id
        translation
      }
    }
  }
`;
const dictionaryWithPerspectivesQuery = gql`
  query DictionaryWithPerspectives {
    
    perspectives {
      id
      parent_id
      translation
    }
    grants {
      id
      translation
      issuer
      grant_number
      additional_metadata {
        participant
      }
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
    is_authenticated
  }
`;

const dictionaryWithPerspectivesProxyQuery = gql`
  query DictionaryWithPerspectivesProxy {
    dictionaries(proxy: false, published: true) {
      id
      parent_id
      translation
      additional_metadata {
        authors
      }
      perspectives {
        id
        translation
      }
    }
    perspectives {
      id
      parent_id
      translation
    }
    grants {
      id
      translation
      issuer
      grant_number
      additional_metadata {
        participant
      }
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
    is_authenticated
  }
`;

const downloadDictionariesMutation = gql`
  mutation DownloadDictionaries($ids: [LingvodocID]!) {
    download_dictionaries(ids: $ids) {
      triumph
    }
  }
`;
const AuthWrapper = ({

  perspectives, grants, language_tree: languages, is_authenticated: isAuthenticated, dictionaries,

}) => {
  const Component = compose(
    connect(
      state => ({ ...state.home, ...state.router }),
      dispatch => ({ actions: bindActionCreators({ setGrantsMode, resetDictionaries }, dispatch) })
    ),
    graphql(isAuthenticated ? authenticatedDictionariesQuery : guestDictionariesQuery, {
      options: {
        fetchPolicy: 'network-only'
      }
    }),
    graphql(downloadDictionariesMutation, { name: 'downloadDictionaries' })
  )(Home);

  if (config.buildType === 'server') {
    return (
      <Component perspectives={perspectives} grants={grants} languages={languages} isAuthenticated={isAuthenticated} />
    );
  }
  // proxy and desktop has additional parameter - local dictionaries
  return (
    <Component
      dictionaries={dictionaries}
      perspectives={perspectives}
      grants={grants}
      languages={languages}
      isAuthenticated={isAuthenticated}
    />
  );
};


const Home = (props) => {
  const {
    perspectives,
    grants,
    languages,
    isAuthenticated,
    data: {
      loading, error, dictionaries, permission_lists: permissionLists,
    },
    location: { hash },
  } = props;


  if (error) {
    return null;
  }

  if (loading) {
    return (
      <Placeholder />
    );
  }
  const localDictionaries = [];
  const languagesTree = buildLanguageTree(fromJS(languages));
  const dictsSource = fromJS(dictionaries);
  const localDicts = fromJS(localDictionaries);
  const grantsList = fromJS(grants);
  const isDownloaded = dict => !!localDicts.find(d => d.get('id').equals(dict.get('id')));
  const hasPermission = (p, permission) =>
    (config.buildType === 'server' ? false : permissions.get(permission).has(p.get('id')));

  const dicts = dictsSource.reduce(
    (acc, dict) => acc.set(dict.get('id'), dict.set('isDownloaded', isDownloaded(dict))),
    new Map()
  );
  const perspectivesList = fromJS(perspectives).map(perspective =>

    fromJS({
      ...perspective.toJS(),
      view: hasPermission(perspective, 'view'),
      edit: hasPermission(perspective, 'edit'),
      publish: hasPermission(perspective, 'publish'),
      limited: hasPermission(perspective, 'limited'),
    }));

  return (

    <Container className="published">
      <Segment>
        <GrantedDicts
          languagesTree={languagesTree}
          dictionaries={dicts}
          perspectives={perspectivesList}
          grants={grantsList}
          isAuthenticated={isAuthenticated}
        />
      </Segment>
    </Container>
  );
};


export default compose(
  graphql(dictionaryWithPerspectivesQuery), graphql(dictionaryWithPerspectivesProxyQuery))(AuthWrapper);

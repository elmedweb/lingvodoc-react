import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import { Header, Breadcrumb, Dropdown } from 'semantic-ui-react';
import { openRoles } from 'ducks/roles';
import { openModal as openDictionaryOrganizationsModal } from 'ducks/dictionaryOrganizations';
import { openDictionaryPropertiesModal } from 'ducks/dictionaryProperties';
import { openPerspectivePropertiesModal } from 'ducks/perspectiveProperties';
import { openSaveDictionaryModal } from 'ducks/saveDictionary';
import { openStatistics } from 'ducks/statistics';
import { getTranslation } from 'api/i18n';


const queryPerspectivePath = gql`
  query queryPerspectivePath($id: LingvodocID!) {
    perspective(id: $id) {
      id
      tree {
        id
        translation
      }
    }
  }
`;

const queryAvailablePerspectives = gql`
  query availablePerspectives($dictionary_id: LingvodocID!) {
    dictionary(id: $dictionary_id) {
      id
      perspectives {
        id
        parent_id
        translation
      }
    }
  }
`;

/**
 * Perspective breadcrumb component.
 */
class PerspectivePath extends React.Component {

  constructor(props) {
    super(props);
  }

  getCommonTreeSection({ treeElement }) {
    const section = {
      key: null,
      content: null
    };

    section.key = treeElement.id;
    section.link = true;
    section.content = treeElement.translation;
    section.as = Link;
    section.to = `/dashboard/dictionaries_all?anchor=${treeElement.id}`;

    return section;
  };

  getPerspectiveTreeSection({ treeElement, perspectives, mode, dictionary_id, tree, id, actions }) {
    const section = {
      key: null,
      content: null
    };

    section.key = treeElement.id;
    section.active = true;
    section.content = <Dropdown inline text={treeElement.translation}>
      <Dropdown.Menu>
        {perspectives.filter(perspective => perspective.id != tree[0].id).map(perspective => (
          <Dropdown.Item
            as='a'
            key={perspective.id}
            href={`${window.location.protocol}//${window.location.host}/dictionary/${perspective.parent_id.join('/')}/perspective/${perspective.id.join('/')}/${mode}`}
            icon='chevron right'
            text={perspective.translation}
          />))
        }
        <Dropdown.Divider />
        <Dropdown.Item
          icon='users'
          text={getTranslation(`'${treeElement.translation}' roles...`)}
          onClick={() => actions.openRoles(id, 'perspective')}
        />
        <Dropdown.Item
          icon='setting'
          text={getTranslation(`'${treeElement.translation}' properties...`)}
          onClick={() => actions.openPerspectivePropertiesModal(id, dictionary_id)}
        />
        <Dropdown.Item
          icon='percent'
          text={getTranslation(`'${treeElement.translation}' statistics...`)}
          onClick={() => actions.openStatistics(id, 'perspective')}
        />
      </Dropdown.Menu>
    </Dropdown>;

    return section;
  }

  render() {
    /* eslint-disable no-shadow */
    const {
      id, dictionary_id, queryPerspectivePath, queryAvailablePerspectives, mode, className, actions, user
    } = this.props;
    /* eslint-enable no-shadow */
    if (queryPerspectivePath.loading || queryPerspectivePath.error || queryAvailablePerspectives.loading || queryAvailablePerspectives.error) {
      return null;
    }

    const { perspective: { tree } } = queryPerspectivePath;
    const { perspectives } = queryAvailablePerspectives.dictionary;

    const sections = tree.slice().reverse().map((e, index) => {
      if (perspectives.length > 1 && index == tree.length - 1) {
        return this.getPerspectiveTreeSection({ treeElement: e, perspectives, mode, dictionary_id, tree, id, actions })
      } else {
        return this.getCommonTreeSection({ treeElement: e });
      }
    });

    return (
      <Header as="h2" className={className}>
        <Breadcrumb
          icon="right angle"
          sections={ sections }
        />
      </Header>
    );
  }
}

PerspectivePath.propTypes = {
  id: PropTypes.string.isRequired,
  dictionary_id: PropTypes.string.isRequired,
  queryPerspectivePath: PropTypes.object.isRequired,
  queryAvailablePerspectives: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  className: PropTypes.string,
  actions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

PerspectivePath.defaultProps = {
  className: 'white',
};

export default compose(
  connect(
    state => state.user,
    dispatch => ({
      actions: bindActionCreators(
        {
          openDictionaryOrganizationsModal,
          openDictionaryPropertiesModal,
          openPerspectivePropertiesModal,
          openRoles,
          openSaveDictionaryModal,
          openStatistics
        },
        dispatch
      ),
    })
  ),
  graphql(queryPerspectivePath, {
    name: 'queryPerspectivePath',
    options: props => ({ variables: { id: props.id } })
  }),
  graphql(queryAvailablePerspectives, {
    name: 'queryAvailablePerspectives',
    options: props => ({ variables: { dictionary_id: props.dictionary_id } })
  })
)(PerspectivePath);

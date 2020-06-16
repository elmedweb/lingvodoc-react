import React from 'react';
import { compose, branch, renderComponent, renderNothing } from 'recompose';
import { graphql } from 'react-apollo';
import { Table, Button, Tab, Card } from 'semantic-ui-react';
import { groupBy, isEqual } from 'lodash';
import moment from 'moment';

import Placeholder from 'components/Placeholder';
import { getTranslation } from 'api/i18n';

import { organizationsQuery } from 'pages/Organizations';
import { getUserRequestsQuery, acceptMutation } from './graphql';

const timestampToDate = ts => moment(ts * 1000).format('LLLL');
const objectById = (id, objs) => objs.find(o => o.id === id);
const objectByCompositeId = (id, objs) => objs.find(o => isEqual(o.id, id));
/* eslint-disable react/prop-types */
function acceptRequest(mutation, id, accept) {
  mutation({
    variables: {
      id,
      accept,
    },
    refetchQueries: [
      { query: getUserRequestsQuery, },
      { query: organizationsQuery, },
    ],
  }).then(() => {
    window.logger.suc(getTranslation(accept ?
      'Request accepted successfully.' :
      'Request rejected successfully.'));
  });
}

const Subject = ({
  request, grants, dictionaries, organizations,
}) => {
  const { subject } = request;

  switch (request.type) {
    case 'add_dict_to_grant':
    {
      const dictionary = objectByCompositeId(subject.dictionary_id, dictionaries);
      const grant = objectById(subject.grant_id, grants);

      return (
        <div>
          <p>Grant</p>
          <Card
            header={grant.translation}
            meta={grant.grant_number}
            description={dictionary ? dictionary.translation : getTranslation('Unknown dictionary')}
          />
        </div>);
    }

    case 'add_dict_to_org':
    {
      const dictionary = objectByCompositeId(subject.dictionary_id, dictionaries);
      const organization = objectById(subject.org_id, organizations);

      return (
        <div>
          <p>Organization</p>
          <Card
            header={organization.translation}
            meta={organization.about}
            description={dictionary ? dictionary.translation : getTranslation('Unknown dictionary')}
          />
        </div>);
    }

    case 'participate_org':
    case 'administrate_org': {
      const organization = objectById(subject.org_id, organizations);

      return <Card
        header={organization.translation}
        description={organization.about}
      />;
    }
    case 'grant_permission':
    default:
      return <div>{getTranslation('Unknow request type!')}</div>;
  }
};

const RequestsPane = ({
  requests, grants, users, dictionaries, organizations, accept,
}) => (
  <Tab.Pane>
    <Table celled padded>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{getTranslation('User')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('Subject')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('Date')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('Message')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('Action')}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {requests.length === 0 && (
          <Table.Row>
            <Table.Cell>{getTranslation('No entries')}</Table.Cell>
          </Table.Row>
        )}
        {requests.map(r => (
          <Table.Row key={r.broadcast_uuid}>
            <Table.Cell>{objectById(r.sender_id, users).intl_name}</Table.Cell>

            <Table.Cell>
              <Subject
                request={r}
                grants={grants}
                users={users}
                dictionaries={dictionaries}
                organizations={organizations}
              />
            </Table.Cell>
            <Table.Cell>{timestampToDate(r.created_at)}</Table.Cell>
            <Table.Cell>{r.message}</Table.Cell>
            <Table.Cell>
              <Button positive size="mini" onClick={() => acceptRequest(accept, r.id, true)}>
                {getTranslation('Accept')}
              </Button>
              <Button negative size="mini" onClick={() => acceptRequest(accept, r.id, false)}>
                {getTranslation('Reject')}
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </Tab.Pane>
);

const Requests = ({ data, accept }) => {
  const {
    userrequests, grants, users, dictionaries, organizations,
  } = data;
  const requestsByType = groupBy(userrequests, u => u.type);

  const panes = [
    {
      menuItem: getTranslation('Dictionaries'),
      render: () => (
        <RequestsPane
          requests={[
            ...requestsByType.add_dict_to_grant || [],
            ...requestsByType.add_dict_to_org || []]}
          grants={grants}
          users={users}
          dictionaries={dictionaries}
          organizations={organizations}
          accept={accept}
        />
      ),
    },
    {
      menuItem: getTranslation('Grants'),
      render: () => (
        <RequestsPane
          requests={requestsByType.grant_permission || []}
          grants={grants}
          users={users}
          dictionaries={dictionaries}
          organizations={organizations}
          accept={accept}
        />
      ),
    },
    {
      menuItem: getTranslation('Organization users'),
      render: () => (
        <RequestsPane
          requests={requestsByType.participate_org || []}
          grants={grants}
          users={users}
          dictionaries={dictionaries}
          organizations={organizations}
          accept={accept}
        />
      ),
    },
    {
      menuItem: getTranslation('Organization admins'),
      render: () => (
        <RequestsPane
          requests={requestsByType.administrate_org || []}
          grants={grants}
          users={users}
          dictionaries={dictionaries}
          organizations={organizations}
          accept={accept}
        />
      ),
    },
  ];

  return <Tab className="inverted" menu={{ fluid: true, vertical: true, tabular: 'right' }} panes={panes} />;
};
/* eslint-enable react/prop-types */
export default compose(
  graphql(getUserRequestsQuery),
  graphql(acceptMutation, { name: 'accept' }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder)),
  branch(({ data: { error } }) => !!error, renderNothing)
)(Requests);

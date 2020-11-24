import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Modal, Form, Button } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { getTranslation } from 'api/i18n';

const parsersQuery = gql`
  query getParsers {
    parsers {
      id
      name
      parameters {
        is_mandatory
        name
        type
      }
    }
  }
`;

const executeParserMutation = gql`
  mutation execute_parser($entity_id: LingvodocID!, $parser_id: LingvodocID!) {
    execute_parser(entity_id: $entity_id, parser_id: $parser_id) {
      triumph
    }
  }
`;

/** Modal dialog for execution of a parser for some corpus */
class RunParserModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      parserId: undefined,
      success: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.executeParser = this.executeParser.bind(this);
  }

  handleChange(_e, { name, value }) {
    this.setState({ [name]: value });
  }

  executeParser() {
    const { executeParser, entityId, onClose } = this.props;
    const { parserId } = this.state;

    executeParser({ variables: { entity_id: entityId, parser_id: parserId } }).then((response) => {
      if (response.data.execute_parser.triumph) {
        this.setState({ success: true });
      }
    });
  }

  render() {
    const { loading, error, parsers } = this.props.data;
    if (error) {
      return null;
    }
    const { onClose } = this.props;
    const { parserId, success } = this.state;

    return (
      <Modal open dimmer size="small" closeIcon onClose={onClose}>
        <Modal.Header>{getTranslation('Parser execution')}</Modal.Header>
        <Modal.Content>
          { success && getTranslation('Parser task has been started') }
          { !success &&
            <Form loading={loading}>
              <Form.Select
                name="parserId"
                fluid
                placeholder={getTranslation('Select parser')}
                options={parsers ? parsers.map(parser => ({ text: parser.name, value: parser.id })): []}
                onChange={this.handleChange}
              />
            </Form>
          }
        </Modal.Content>
        <Modal.Actions>
          { !success &&
            <Button positive icon="play" disabled={!parserId} content={getTranslation('Execute')} onClick={this.executeParser}/>
          }
          <Button
            positive={success}
            negative={!success}
            icon="cancel"
            content={getTranslation(success ? 'Close' : 'Cancel')} onClick={onClose}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

RunParserModal.propTypes = {
  entityId: PropTypes.arrayOf(PropTypes.number).isRequired,
  onClose: PropTypes.func.isRequired
};

export default compose(
  graphql(parsersQuery),
  graphql(executeParserMutation, { name: "executeParser" })
)(RunParserModal);

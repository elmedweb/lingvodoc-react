import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Button, Icon, Message } from 'semantic-ui-react';
import { Field, reduxForm } from 'redux-form';
import { getTranslation } from 'api/i18n';

function handleKeyDown(cb) {
  return (event) => {
    if (event.key === 'Enter' && event.shiftKey === false) {
      event.preventDefault();
      cb();
    }
  };
}

const Rf = ({ input, label, type, meta: { touched, error } }) => (
  <Form.Field>
    <label htmlFor={input.name}>{label}</label>
    <Form.Input {...input} placeholder={label} type={type} error={touched && !!error} />
    <Message error visible={touched && !!error} content={error} />
  </Form.Field>
);

Rf.propTypes = {
  input: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
};

function FormModal(props) {
  const {
    open,
    header,
    actions,
    fields,
    trigger,
    handleSubmit,
    submitting,
    pristine,
    error,
    reset,
    handleClose,
    message,
  } = props;

  const close = () => reset() && handleClose();

  return (
    <Modal
      trigger={trigger}
      open={open}
      closeIcon
      onClose={close}
      size="small"
      dimmer="blurring"
      onClick={e => e.stopPropagation()}
      onFocus={e => e.stopPropagation()}
    >
      <Modal.Header>{header} {submitting && <Icon loading name="spinner" />}</Modal.Header>
      <Modal.Content>
        <Form onSubmit={handleSubmit(actions)} onKeyDown={handleKeyDown(handleSubmit(actions))}>
          {
            fields.map(field =>
              <Field key={field.name} component={field.component || Rf} {...field} />)
          }
          <Message visible={!!error} error>
            <Icon name="remove" /> {error}
          </Message>
          <Message visible={!!message} error>
            {message}
          </Message>
          <Button basic color="red" type="button" onClick={close}>
            <Icon name="remove" /> {getTranslation("Close")}
          </Button>
          <Button color="green" type="submit" disabled={pristine || submitting}>
            <Icon name="checkmark" /> {getTranslation("Submit")}
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
}

FormModal.propTypes = {
  header: PropTypes.node.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  trigger: PropTypes.element.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  error: PropTypes.any.isRequired,
  fields: PropTypes.any.isRequired,
  actions: PropTypes.any.isRequired,
};

FormModal.defaultProps = {
  error: '',
};

export default reduxForm()(FormModal);

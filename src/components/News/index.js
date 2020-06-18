import React from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';
import './styles.scss';

const NewsItem = props => (
  <div className="news">
    <Header as="h1">
      {props.location.props.title}
    </Header>
    <main>
      {props.location.props.text}
    </main>

  </div>
);

NewsItem.propTypes = {
  location: PropTypes.object.isRequired
};

export default (NewsItem);


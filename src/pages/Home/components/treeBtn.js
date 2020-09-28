import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from 'semantic-ui-react';
import { compositeIdToString } from '../../../utils/compositeId';

class TreeBtn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isPressed: props.stat ? props.stat.isPressed : false,
      childrens: props.stat ? props.stat.childrens : {}
    };

    this.toggle = this.toggle.bind(this);
    this.hide = this.hide.bind(this);
    this.qwe = this.qwe.bind(this);
  }

  toggle(title, func) {
    this.setState(oldState => ({ isPressed: !oldState.isPressed }));

    func(title);
  }

  hide() {
    const asd = {};

    for (const children of Object.values(this.refs)) {
      asd[children.props.title] = children.state;
    }

    this.setState({ isPressed: false, childrens: asd });
  }

  qwe(title) {
    for (const ref of Object.values(this.refs)) {
      if (ref.props.title !== title) {
        ref.hide();
      }
    }
  }

  render() {
    const {
      title,
      data,
      func
    } = this.props;

    return (
      <span>
        <Card>
          <Button
            active={this.state.isPressed}
            onClick={() => this.toggle(title, func)}
          >{title}
          </Button>
          {(this.state.isPressed) && (data.map(item => <TreeBtn
            key={item.id.join('_')}
            title={item.translation}
            data={item.children}
            func={this.qwe}
            ref={compositeIdToString(item.id)}
            stat={this.state.childrens[item.translation]}
          />))}
        </Card>

      </span>
    );
  }
}

TreeBtn.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  func: PropTypes.func.isRequired
};

export default TreeBtn;

/* eslint-disable consistent-return */
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
import { Checkbox, List, Button, Modal, Card } from 'semantic-ui-react';
import { getNodeValue, propsNames } from 'components/Search/AdditionalFilter/Languages/helpers';

const metadataQuery = gql`
  query metadata {
    select_tags_metadata
  }
`;
const buttonStyles = {
  background: ' #fff url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjgiIGZpbGw9IiNGRkYiLz48ZyBzdHJva2U9IiM5ODk4OTgiIHN0cm9rZS13aWR0aD0iMS45IiA+PHBhdGggZD0iTTQuNSA5aDkiLz48L2c+Cjwvc3ZnPg==) no-repeat center;'
};
class AllDicts extends React.Component {
  /*  static getAllNodesValues(languagesTree, result) {
    console.log('languagesTree1', languagesTree);
    if (!result) {
      result = {
        languages: [],
        dictionaries: [],
      };
    }
    languagesTree.forEach((item) => {
      const isLanguage = !!item.dictionaries;
      const type = isLanguage ? 'languages' : 'dictionaries';

      result[type].push([item.id[0], item.id[1]]);

      if (isLanguage && item.dictionaries.length > 0) {
        item.dictionaries.forEach(dictionary => result.dictionaries.push([dictionary.id[0], dictionary.id[1]]));
      }

      this.getAllNodesValues(item.children, result);
    });

    return result;
  } */
  constructor(props) {
    super(props);

    const localLangTree = props.languagesTree.toJS();
    const test666 = localLangTree.filter((element) => {
      if (element.children.length > 0) return true;
    });

    this.state = {
      langsState: test666,
      showRoot: false,
      showElem: false,
      childrenLang: [],
      childrenDict: [],
      open: false
    };
    this.test3 = test666;
  }


  render() {
    const {
      languages, languagesTree, dictionaries, perspectives, isAuthenticated, location
    } = this.props;
    const langToFilter = languages.map(lang => lang.id);
    const dictLocal = dictionaries.toJS();
    const dictisToFilter = Object.entries(dictLocal).map(([, value]) => value.id);
    const tree = assignDictsToTree(
      buildDictTrees(fromJS({
        lexical_entries: [],
        perspectives,
        dictionaries,
      })),
      languagesTree
    );
    const localLangTree = languagesTree.toJS();
    const test666 = localLangTree.filter((element) => {
      if (element.children.length > 0) return true;
    });
    const createChildrenLanguages = (nodes) => {

    };
    console.log('test666', test666);
    const test8 = (text) => {
      console.log(text);
      this.setState(oldState => ({ showRoot: !oldState.showRoot }));
      this.setState({ childrenLang: text });
    };
    const test7 = (el) => {
      this.setState({ childrenDict: el.children });
      console.log(el);
      this.setState(oldState => ({ showElem: !oldState.showElem }));
    };


    return (
      <div>
        <Modal
          onClose={() => this.setState({ open: false })}
          onOpen={() => this.setState({ open: true })}
          open={this.state.open}
          trigger={<Button>Show Modal</Button>}
        >
          <Modal.Header>Select a Photo</Modal.Header>
          <Modal.Content>
            <List horizontal>
              {this.state.langsState.map(text =>
                <List.Item key={text.id.join('_')}>
                  <Checkbox defaultChecked onClick={() => test8(text)} label={text.translation} />
                </List.Item>)}

            </List>

            <List horizontal>
              {(this.state.childrenLang.length !== 0) && (this.state.childrenLang.children.map(el =>
                <List.Item key={el.id.join('_')}>
                  <Card>
                    <Checkbox defaultChecked onClick={() => test7(el)} label={el.translation} />
                  </Card>


                </List.Item>))}
            </List>
            <List.List>
              {(this.state.childrenDict.length !== 0)
                && (this.state.childrenDict.map(t =>
                  <List.Item key={t.id.join('_')}>
                    <Checkbox defaultChecked label={t.translation} />
                  </List.Item>))
              }
            </List.List>
          </Modal.Content>
          <Modal.Actions>
            <Button color="black" onClick={() => this.setState({ open: false })}>
              Nope
            </Button>
            <Button
              content="Yep, that's me"
              labelPosition="right"
              icon="checkmark"
              onClick={() => this.setState({ open: false })}
              positive
            />
          </Modal.Actions>
        </Modal>

        <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />
      </div >
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

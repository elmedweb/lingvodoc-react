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
import TreeBtn from './treeBtn';
import { compositeIdToString } from '../../../utils/compositeId';

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

    this.qwe = this.qwe.bind(this);
  }

  qwe(title) {
    for (let ref of Object.values(this.refs)) {
      if ( ref.props.title !== title ) {
        ref.hide()
      } else {
        console.log( ref )
      }
    }
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
    // const test666 = localLangTree.filter((element) => {
    //   if (element.children.length > 0) return true;
    // });
    // const createChildrenLanguages = (nodes) => {

    // };

    // const test8 = (text) => {
    //   this.setState(oldState => ({ showRoot: !oldState.showRoot }));
    //   this.setState({ childrenLang: text });
    // };
    // const test7 = (el) => {
    //   this.setState({ childrenDict: el.children });
    //   this.setState(oldState => ({ showElem: !oldState.showElem }));
    // };


    const treeBtns = localLangTree.map(item => <TreeBtn
      key={compositeIdToString(item.id)}
      title={item.translation}
      data={item.children}
      func={this.qwe}
      ref={compositeIdToString(item.id)}
    />);

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
            {treeBtns}
            {/* <List horizontal>
              {this.state.langsState.map(text =>
                <List.Item key={text.id.join('_')}>
                  <Button onClick={() => test8(text)}>1</Button>
                  <Checkbox defaultChecked  label={text.translation} />
                </List.Item>)}

            </List> */}
          </Modal.Content>
          <Modal.Actions>
            <Button color="black" onClick={() => this.setState({ open: false })}>
              Nope
            </Button>
            <Button
              content="Yep, that's me"
              labelPosition="right"
              icon="checkmark"
              onClick={() => {
                console.log(this.refs);
                // return this.setState({ open: false })
              }}
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

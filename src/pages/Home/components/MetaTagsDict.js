import React from 'react';
import { Button, Header, Dropdown, Modal } from 'semantic-ui-react';
import { compose } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { getNodeValue } from '../../../components/Search/AdditionalFilter/Languages/helpers';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import { fromJS } from 'immutable';
import Placeholder from 'components/Placeholder';

const languagesWithDictionariesQuery = gql`
  query Languages {
    language_tree {
      id
      parent_id
      translation
      dictionaries(deleted: false, published: true) {
        id
        parent_id
        translation
        category
        additional_metadata{
          authors
        }
      }
      additional_metadata {
        speakersAmount
      }
    }
  }
`;

const searchQuery = gql`
  query Search($query: [[ObjectVal]]!, $category: Int, $adopted: Boolean, $etymology: Boolean, $mode: String, $langs: [LingvodocID], $dicts: [LingvodocID], $searchMetadata: ObjectVal, $blocks: Boolean, $xlsxExport: Boolean) {
    advanced_search(search_strings: $query, category: $category, adopted: $adopted, etymology: $etymology, mode: $mode, languages: $langs, dicts_to_filter: $dicts, search_metadata: $searchMetadata, simple: $blocks, xlsx_export: $xlsxExport) {
      dictionaries {
        id
        parent_id
        translation
        additional_metadata {
          location
          blobs
        }
      }
      perspectives {
        id
        parent_id
        translation
        additional_metadata {
          location
        }
        tree {
          id
          translation
        }
      }
      lexical_entries {
        id
        parent_id
        entities(mode: $mode) {
          id
          parent_id
          field_id
          link_id
          self_id
          created_at
          locale_id
          content
          published
          accepted
        }
      }
      entities {
        id
      }
      xlsx_url
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
  }
`;

function Test(props) {
  let dictionariesId = [];
  let languagesId = [];
  const client = props.dicts.client;
  const languageTree = props.dicts.data.language_tree;
  const queryAllMetadata = () => {
    languageTree.forEach((dict) => {
      if (dict.dictionaries.length !== 0) {
        for (let i = 0; dict.dictionaries.length > i; i++) {
          if (dict.dictionaries[i].__typename === "Dictionary") {
            dictionariesId.push(dict.dictionaries[i]);
          } else {
            languagesId.push(dict.dictionaries[i]);
          }
        }
      }
      console.log(dictionariesId);
      console.log(languagesId);
    });
  };

  queryAllMetadata();
  const countryOptions = [
    { key: 'af', value: 'af', flag: 'af', text: 'Afghanistan' },
    { key: 'ax', value: 'ax', flag: 'ax', text: 'Aland Islands' },
    { key: 'al', value: 'al', flag: 'al', text: 'Albania' },
    { key: 'dz', value: 'dz', flag: 'dz', text: 'Algeria' },
    { key: 'as', value: 'as', flag: 'as', text: 'American Samoa' },
    { key: 'ad', value: 'ad', flag: 'ad', text: 'Andorra' },
    { key: 'ao', value: 'ao', flag: 'ao', text: 'Angola' },
    { key: 'ai', value: 'ai', flag: 'ai', text: 'Anguilla' },
    { key: 'ag', value: 'ag', flag: 'ag', text: 'Antigua' },
    { key: 'ar', value: 'ar', flag: 'ar', text: 'Argentina' },
    { key: 'am', value: 'am', flag: 'am', text: 'Armenia' },
    { key: 'aw', value: 'aw', flag: 'aw', text: 'Aruba' },
    { key: 'au', value: 'au', flag: 'au', text: 'Australia' },
    { key: 'at', value: 'at', flag: 'at', text: 'Austria' },
    { key: 'az', value: 'az', flag: 'az', text: 'Azerbaijan' },
    { key: 'bs', value: 'bs', flag: 'bs', text: 'Bahamas' },
    { key: 'bh', value: 'bh', flag: 'bh', text: 'Bahrain' },
    { key: 'bd', value: 'bd', flag: 'bd', text: 'Bangladesh' },
    { key: 'bb', value: 'bb', flag: 'bb', text: 'Barbados' },
    { key: 'by', value: 'by', flag: 'by', text: 'Belarus' },
    { key: 'be', value: 'be', flag: 'be', text: 'Belgium' },
    { key: 'bz', value: 'bz', flag: 'bz', text: 'Belize' },
    { key: 'bj', value: 'bj', flag: 'bj', text: 'Benin' },
  ]
  return (
    <div>
      <Modal trigger={<Button>Show Modal</Button>}>
        <Modal.Header>Select a Photo</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <Header>Default Profile Image</Header>
            <Dropdown
              placeholder='Select authors'
              fluid
              search
              selection
              options={countryOptions}
            />
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </div>
  );
}


const test2 = props => (
  <div>
    {props.data.loading && (<Placeholder />)}
    {!props.data.loading && (<Test dicts={props} />)}
  </div>
);

export default compose(graphql(languagesWithDictionariesQuery), withApollo)(test2);


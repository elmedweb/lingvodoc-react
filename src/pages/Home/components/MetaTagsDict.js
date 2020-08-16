import React, { useState } from 'react';
import { Button, Header, Dropdown, Modal } from 'semantic-ui-react';
import { compose } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { getNodeValue } from '../../../components/Search/AdditionalFilter/Languages/helpers';
import { fromJS } from 'immutable';
import Placeholder from 'components/Placeholder';
import { assignDictsToTree, buildDictTrees, buildLanguageTree } from 'pages/Search/treeBuilder';
import LangsNav from 'pages/Home/components/LangsNav';
import Tree from './Tree';
import QueryBuilder from 'components/Search/QueryBuilder';

const select_tags_metadata = gql`query select_tags_metadata{
  select_tags_metadata
}`;


const searchQuery = gql`
  query Search($query: [[ObjectVal]]!,
     $category: Int,
      $adopted: Boolean, 
      $etymology: Boolean,
       $mode: String,
        $langs: [LingvodocID],
         $dicts: [LingvodocID],
          $searchMetadata: ObjectVal,
           $blocks: Boolean, 
           $xlsxExport: Boolean) 
           {
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

const dropdownStyle = {
  margin: '20px 0'
};
const test2 = (props) => {
  const {
    languagesTree, dictionaries, perspectives, isAuthenticated, languages, location, data: { select_tags_metadata: metaTags }
  } = props;

  const tree = assignDictsToTree(
    buildDictTrees(fromJS({
      lexical_entries: [],
      perspectives,
      dictionaries,
    })),
    languagesTree
  );

  function builderOptions(arg) {
    return arg.map((el, index) => ({ key: index, value: el.toString(), text: el.toString() }));
  }
  const dictLocal = dictionaries.toJS();

  const dictisToFilter = Object.entries(dictLocal).map(([key, value]) => value.id);

  const langToFilter = languages.map(lang => lang.id);

  console.log(langToFilter)
  const hasAudioOptions = builderOptions(metaTags.hasAudio);
  const nativeSpeakersCountOptions = builderOptions(metaTags.nativeSpeakersCount);
  const dataSoursOptions = builderOptions(metaTags.kind);
  const yearsOptions = builderOptions(metaTags.years);
  const settlementOptions = builderOptions(metaTags.humanSettlement);
  const authorsOptions = builderOptions(metaTags.authors);

  const [open, setOpen] = React.useState(false);
  const [hasAudio, setHasAudio] = useState(null);
  const [nativeSpeakersCount, setNativeSpeakersCount] = useState(null);
  const [kind, setKind] = useState(null);
  const [years, setYears] = useState(null);
  const [humanSettlement, setHumanSettlement] = useState(null);
  const [authors, setAuthors] = useState(null);
  let searchMetadata = {};

  function builderQuery() {
    searchMetadata = {};
    setOpen(false);
    searchMetadata = {
      hasAudio,
      nativeSpeakersCount,
      kind,
      years,
      humanSettlement,
      authors
    };
    console.log(searchMetadata);
  }
  function fieldCleaner() {
    setOpen(false);
    setHasAudio(null);
    setNativeSpeakersCount(null);
    setKind(null);
    setYears(null);
    setHumanSettlement(null);
    setAuthors(null);
  }
  return (
    <div>
      <Modal
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        trigger={<Button>Show Modal</Button>}
      >
        <Modal.Header>Выберите теги для поиска</Modal.Header>
        <Modal.Content >
          <Modal.Description>
            <Header>Теги</Header>
            <Dropdown
              placeholder="Audio"
              fluid
              search
              selection
              value={hasAudio}
              options={hasAudioOptions}
              onChange={(event, value) => setHasAudio(value.value)}
            />
            <Dropdown
              style={dropdownStyle}
              placeholder="Language degree of endangerment"
              fluid
              search
              selection
              value={nativeSpeakersCount}
              options={nativeSpeakersCountOptions}
              onChange={(event, value) => setNativeSpeakersCount(value.value)}
            />
            <Dropdown
              style={dropdownStyle}
              placeholder="Data sourcet"
              fluid
              search
              selection
              value={kind}
              options={dataSoursOptions}
              onChange={(event, value) => setKind(value.value)}
            />
            <Dropdown
              style={dropdownStyle}
              placeholder="Years"
              fluid
              search
              selection
              value={years}
              options={yearsOptions}
              onChange={(event, value) => setYears(value.value)}
            />

            <Dropdown
              style={dropdownStyle}
              placeholder="Settlement"
              fluid
              search
              selection
              value={humanSettlement}
              options={settlementOptions}
              onChange={(event, value) => setHumanSettlement(value.value)}
            />
            <Dropdown
              style={dropdownStyle}
              placeholder="Authors"
              fluid
              search
              selection
              value={authors}
              options={authorsOptions}
              onChange={(event, value) => setAuthors(value.value)}
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color="black" onClick={() => fieldCleaner()}>
            Nope
          </Button>
          <Button
            content="Yep, that's me"
            labelPosition="right"
            icon="checkmark"
            onClick={() => builderQuery()}
            positive
          />
        </Modal.Actions>
      </Modal>
      <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />
    </div>
  );
};


export default graphql(select_tags_metadata)(test2);


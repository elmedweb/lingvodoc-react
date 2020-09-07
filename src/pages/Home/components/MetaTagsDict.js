import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Header, Dropdown, Modal } from 'semantic-ui-react';
import { compose } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import Tree from './Tree';
import { getTranslation } from 'api/i18n';


const selectTagsMetadata = gql`query select_tags_metadata{
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
  {   advanced_search(search_strings: $query,
      category: $category, 
      adopted: $adopted, 
      etymology: $etymology, 
      mode: $mode, 
      languages: $langs, 
      dicts_to_filter: $dicts,
      search_metadata: $searchMetadata,
      simple: $blocks, 
      xlsx_export: $xlsxExport) {
        dictionaries {
        id
        parent_id
        translation
        status
        additional_metadata {
            location
            authors
        }
        perspectives {
            id
            translation
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
const modalStyle = {
  margin: '0 0 20px 0'
};


const metaTagsSelector = (props) => {
  const {
    languagesTree,
    dictionaries,
    perspectives,
    isAuthenticated,
    languages,
    location,
    data: { select_tags_metadata: metaTags },
    client
  } = props;

  const [dictionariesFilter, setDictionariesFilter] = useState(dictionaries);


  function builderOptions(arg) {
    return arg.map((el, index) => ({ key: index, value: el.toString(), text: el.toString() }));
  }

  const dictLocal = dictionaries.toJS();

  const dictisToFilter = Object.entries(dictLocal).map(([, value]) => value.id);

  const langToFilter = languages.map(lang => lang.id);

  const hasAudioOptions = builderOptions(metaTags.hasAudio);
  const nativeSpeakersCountOptions = builderOptions(metaTags.nativeSpeakersCount);
  const dataSoursOptions = builderOptions(metaTags.kind);
  const yearsOptions = builderOptions(metaTags.years);
  const settlementOptions = builderOptions(metaTags.humanSettlement);
  const authorsOptions = builderOptions(metaTags.authors);

  const [open, setOpen] = React.useState(false);
  const [hasAudio, setHasAudio] = useState(null);
  const [nativeSpeakersCount, setNativeSpeakersCount] = useState([]);
  const [kind, setKind] = useState(null);
  const [years, setYears] = useState([]);
  const [humanSettlement, setHumanSettlement] = useState([]);
  const [authors, setAuthors] = useState([]);

  let searchMetadata = {};

  async function requestNewDictionaries() {
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

    const { data } = await client.query({
      query: searchQuery,
      variables: {
        query: [],
        mode: 'published',
        langs: langToFilter,
        dicts: dictisToFilter,
        searchMetadata,
        blocks: false,
        xlsxExport: false
      },
    });
    const newDictionaries = data.advanced_search.dictionaries;

    const dictsSource = fromJS(newDictionaries);
    const localDicts = fromJS(dictionaries);
    const isDownloaded = dict => !!localDicts.find(d => d.get('id').equals(dict.get('id')));
    const dictionariesFilter1 = dictsSource.reduce(
      (acc, dict) => acc.set(dict.get('id'), dict.set('isDownloaded', isDownloaded(dict))),
      new Map()
    );
    setDictionariesFilter(dictionariesFilter1);
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

  const tree = assignDictsToTree(
    buildDictTrees(fromJS({
      lexical_entries: [],
      perspectives,
      dictionaries: dictionariesFilter,
    })),
    languagesTree
  );

  return (
    <div>
      <Modal
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        trigger={<Button style={modalStyle} fluid positive className="modal_select_tags" >{getTranslation('Select tags to search')}</Button>}
      >
        <Modal.Header> {getTranslation('Select tags to search')}</Modal.Header>
        <Modal.Content >
          <Modal.Description>
            <Header>{getTranslation('Tags')}</Header>
            <Dropdown
              placeholder={getTranslation('Audio')}
              fluid
              search
              selection
              value={hasAudio}
              options={hasAudioOptions}
              onChange={(event, value) => setHasAudio(value.value)}
            />
            <Dropdown
              style={dropdownStyle}
              placeholder={getTranslation('Language degree of endangerment')}
              fluid
              search
              multiple
              selection
              value={nativeSpeakersCount}
              options={nativeSpeakersCountOptions}
              onChange={(event, value) => setNativeSpeakersCount(value.value)}
            />
            <Dropdown
              style={dropdownStyle}
              placeholder={getTranslation('Data sourcet')}
              fluid
              search
              selection
              value={kind}
              options={dataSoursOptions}
              onChange={(event, value) => setKind(value.value)}
            />
            <Dropdown
              style={dropdownStyle}
              placeholder={getTranslation('Years')}
              multiple
              fluid
              search
              selection
              value={years}
              options={yearsOptions}
              onChange={(event, value) => setYears(value.value)}
            />

            <Dropdown
              style={dropdownStyle}
              placeholder={getTranslation('Settlement')}
              multiple
              fluid
              search
              selection
              value={humanSettlement}
              options={settlementOptions}
              onChange={(event, value) => setHumanSettlement(value.value)}
            />
            <Dropdown
              style={dropdownStyle}
              placeholder={getTranslation('Authors')}
              multiple
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
          <Button
            color="black"
            onClick={() => fieldCleaner()}
            content={getTranslation('Cancel')}
          />
          <Button
            content={getTranslation('Ok')}
            onClick={() => requestNewDictionaries()}
            positive
          />
        </Modal.Actions>
      </Modal>
      <Tree tree={tree} canSelectDictionaries={isAuthenticated} location={location} />
    </div>
  );
};

metaTagsSelector.propTypes = {
  location: PropTypes.object.isRequired,
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
  languages: PropTypes.array.isRequired,
  client: PropTypes.object.isRequired,
  data: PropTypes.shape({
    metaTags: PropTypes.object.isRequired,
  }),
};
metaTagsSelector.defaultProps = {
  isAuthenticated: false,
  data: PropTypes.shape({
    metaTags: {}
  })
};
export default compose(graphql(selectTagsMetadata), withApollo)(metaTagsSelector);

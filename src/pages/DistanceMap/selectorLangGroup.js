
import React, { useState } from 'react';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Checkbox, Segment, Button } from 'semantic-ui-react';
import { compose, branch, renderNothing } from 'recompose';

const dictName = gql`query dictName($id:LingvodocID) {
  dictionary(id:$id){
    id
    translation
  }
  }
   `;

function Limiter({
  mainGroup, mainDictionary, client, languagesGroup, mainDictionaryFun
}) {
  const parent_id = mainDictionary.toJS()[0].parent_id;
  const [labelDict, setLabelDict] = useState(null);
  let rootLanguage = {}
  let mainDict = []
  const arrDictionaryGroup = [];
  client.query({
    query: dictName,
    variables: { id: parent_id },
  }).then(result => setLabelDict(result.data.dictionary.translation));


  for (const language of languagesGroup) {
    for (const children of language.children) {
      for (const perspective of children.perspectives) {
        if (perspective.id[0] === mainDictionary.toJS()[0].id[0] &&
          perspective.id[1] === mainDictionary.toJS()[0].id[1]) {
          rootLanguage = language;
          mainDict = children
        }
      }
    }
  }

  const filterDictionary = (e) => {

    arrDictionaryGroup.push(e);

  };

  const sendDict = () => {
    mainGroup(arrDictionaryGroup);
    mainDictionaryFun(mainDict,rootLanguage);
  };


  return (
    <div>
      <Label size="massive" >{labelDict}</Label>
      <Segment.Group>
        {rootLanguage.children.map(dict =>
          <Segment key={dict.id}>
            <Checkbox
              onChange={() => { filterDictionary(dict) }}
              label={dict.translation}
            />
          </Segment>)}
      </Segment.Group>
      <Button onClick={sendDict}>Готово </Button>
    </div >
  );
}


export default compose(withApollo)(Limiter);
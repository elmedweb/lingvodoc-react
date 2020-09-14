import { call, put, takeLatest, select } from 'redux-saga/effects';
import locale, { getLocales } from 'api/locale';
import { setLocales, requestLocales, CHANGE, selectLocale } from 'ducks/locale';
import { err } from 'ducks/snackbar';
import gql from 'graphql-tag';
import { stringsToTranslate, setTranslations } from 'api/i18n';

const getTranslationsQuery = gql`
  query getTranslations($searchstrings: [String]!) {
    advanced_translation_search(searchstrings: $searchstrings) {
      translation
    }
  }
`;

function* reloadTranslations(action) {
  const client = yield select(state => state.apolloClient);
  if (action) {
    locale.set(action.payload.id);
    yield call([client, client.clearStore]);
  }
  const response = yield call(
    client.query,
    {
      query: getTranslationsQuery,
      variables: { searchstrings: stringsToTranslate }
    }
  );
  if (response.data) {
    setTranslations(response.data.advanced_translation_search);
  }
  else {
    yield put(err('Could not load translations'));
  }
  if (action) {
    yield put(selectLocale(action.payload));
  }
}

export default function* languageInit() {
  yield put(requestLocales());
  const response = yield call(getLocales);
  if (response.data) {
    yield call(reloadTranslations);
    yield put(setLocales(response.data));
    yield takeLatest(CHANGE, reloadTranslations);
  }
  else {
    yield put(err('Could not get locales'));
  }
}

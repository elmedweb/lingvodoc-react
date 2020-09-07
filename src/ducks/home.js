import { combineReducers } from 'redux';
import Immutable, { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import config from 'config';


// Actions
export const TOGGLE_DICT = '@home/TOGGLE_DICT';
export const RESET_DICTS = '@home/RESET_DICTS';
export const TOGGLE_GRANTS_MODE = '@home/TOGGLE_GRANTS_MODE';
export const SET_GRANTS_MODE = '@home/SET_GRANTS_MODE';
export const SET_LANGUAGES_MODE = '@home/SET_GRANTS_MODE';
export const SET_DICTIONARIES_MODE = '@home/SET_DICTIONARIES_MODE';
export const SET_MODIF_DATE_MODE = '@home/SET_MODIF_DATE_MODE';
export const SET_AUTHORS_MODE = '@home/SET_AUTHORS_MODE';
export const SET_CREATE_DATE_MODE = '@home/SET_CREATE_DATE_MODE';
export const SET_META_TAGS_MODE = '@home/SET_META_TAGS_MODE';
export const SET_SELECT_LANGUAGES_MODE = '@home/SET_SELECT_LANGUAGES_MODE';

export const toggleDictionary = id => ({
  type: TOGGLE_DICT,
  payload: id,
});

export const resetDictionaries = () => ({ type: RESET_DICTS });

export const toggleGrantsMode = () => ({
  type: TOGGLE_GRANTS_MODE,
});

export const setGrantsMode = mode => ({ type: SET_GRANTS_MODE, payload: mode });

export const setLanguagesMode = mode => ({ type: SET_LANGUAGES_MODE, payload: mode });

export const setModifDateMode = mode => ({ type: SET_MODIF_DATE_MODE, payload: mode });

export const setDictionariesMode = mode => ({ type: SET_DICTIONARIES_MODE, payload: mode });

export const setAuthorsMode = mode => ({ type: SET_AUTHORS_MODE, payload: mode });

export const setCreateDateMode = mode => ({ type: SET_CREATE_DATE_MODE, payload: mode });

export const setMetaTagsMode = mode => ({ type: SET_META_TAGS_MODE, payload: mode });

export const setSelectLanguagesMode = mode => ({ type: SET_SELECT_LANGUAGES_MODE, payload: mode });

function selected(state = new Immutable.Set(), { type, payload }) {
  const id = fromJS(payload);
  switch (type) {
    case TOGGLE_DICT:
      return state.has(id) ? state.delete(id) : state.add(id);
    case RESET_DICTS:
      return new Immutable.Set();
    default:
      return state;
  }
}


function selectMode(state = 'languagesMode', { type, payload }) {
  switch (type) {
    case TOGGLE_GRANTS_MODE:
      return !state;
    case SET_LANGUAGES_MODE:
      return payload;
    case SET_GRANTS_MODE:
      return payload;
    case SET_DICTIONARIES_MODE:
      return payload;
    case SET_MODIF_DATE_MODE:
      return payload;
    case SET_AUTHORS_MODE:
      return payload;
    case SET_CREATE_DATE_MODE:
      return payload;
    case SET_META_TAGS_MODE:
      return payload;
    case SET_SELECT_LANGUAGES_MODE:
      return payload;
    case LOCATION_CHANGE:
      if (payload.pathname === config.homePath) {
        const params = new URLSearchParams(payload.search);
        const mode = params.get('mode');
        return mode ? mode !== 'dicts' : state;
      }
      return state;
    default:
      return state;
  }
}


export default combineReducers({
  selected,
  selectMode
});

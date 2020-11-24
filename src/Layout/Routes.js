import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Info from 'pages/Info';
import Search from 'pages/Search';
import DialeqtImport from 'pages/DialeqtImport';
import DictImport from 'pages/DictImport';
import Perspective from 'pages/Perspective';
import Languages from 'pages/Languages';
import Files from 'pages/Files';
import Map from 'pages/Map';

import DistanceMap from 'pages/DistanceMap';
import SelectedLanguages from 'pages/DistanceMap/selectorLangGroup';
import MapSelectedLanguages from 'pages/DistanceMap/map';

import Desktop from 'pages/Desktop';
import NotFound from 'pages/NotFound';
import { DictionaryDashboard, CorpusDashboard } from 'pages/Dashboard';
import { CreateDictionary, CreateCorpus } from 'pages/CreateDictionary';
import Grants from 'pages/Grants';
import Requests from 'pages/Requests';
import EditTranslations from 'pages/EditTranslations';
import Organizations from 'pages/Organizations';

import TopSectionSelector from 'pages/TopSectionSelector';
import DictionariesAll from 'pages/DictionariesAll';
import LanguagesDatabasesRoute from 'pages/LanguagesDatabasesRoute';
import ToolsRoute from 'pages/ToolsRoute';
import DashboardRoute from 'pages/DashboardRoute';
import GrantsRoute from 'pages/GrantsRoute';
import SupportRoute from 'pages/SupportRoute';
import WithoutGrants from 'pages/WithoutGrants';
import CorporaAll from 'pages/CorporaAll';
import AuthorsRoute from 'pages/AuthorsRoute';
import VersionRoute from 'pages/VersionRoute'

import config from 'config';

const Routes = () => (
  <Switch>
    <Route exact path={config.homePath} component={TopSectionSelector} />
    <Route path="/info" component={Info} />
    <Route path="/desktop" component={Desktop} />
    <Route path="/languages" component={Languages} />
    <Route path="/dashboard/dictionaries" component={DictionaryDashboard} />
    <Route path="/dashboard/corpora" component={CorpusDashboard} />
    <Route path="/dashboard/create_dictionary" component={CreateDictionary} />
    <Route path="/dashboard/create_corpus" component={CreateCorpus} />
    <Route path="/dashboard/dictionaries_all" component={DictionariesAll} />
    <Route path="/grants" component={Grants} />
    <Route path="/requests" component={Requests} />
    <Route path="/map" component={Map} />
    <Route path="/map_search" component={Search} />
    <Route path="/distance_map/selected_languages/map" component={MapSelectedLanguages} />
    <Route path="/distance_map/selected_languages" component={SelectedLanguages} />
    <Route path="/distance_map" component={DistanceMap} />
    <Route path="/import" component={DictImport} />
    <Route path="/import_dialeqt" component={DialeqtImport} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode" component={Perspective} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route path="/#/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route path="/files" component={Files} />
    <Route path="/edit_translations" component={EditTranslations} />
    <Route path="/organizations" component={Organizations} />
    <Route path="/LanguagesDatabasesRoute" component={LanguagesDatabasesRoute} />
    <Route path="/toolsRoute" component={ToolsRoute} />
    <Route path="/dashboardRoute" component={DashboardRoute} />
    <Route path="/grantsRoute" component={GrantsRoute} />
    <Route path="/supportRoute" component={SupportRoute} />
    <Route path="/without_grants" component={WithoutGrants} />
    <Route path="/corpora_all" component={CorporaAll} />
    <Route path="/authors_route" component={AuthorsRoute} />
    <Route path="/version_route" component={VersionRoute} />
    <Route component={NotFound} />
  </Switch>
);

export default Routes;

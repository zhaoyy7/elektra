/* eslint no-console:0 */
import { HashRouter, Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux';
import * as Reducers from './reducers';

import Tabs from './components/tabs';

import Shares from './containers/shares/list'
import EditShareModal from './containers/shares/edit';
import ShowShareModal from './containers/shares/show';
import NewShareModal from './containers/shares/new';
import AccessControlModal from './containers/shares/access_control';

import Snapshots from './containers/snapshots/list';
import EditSnapshotModal from './containers/snapshots/edit';
import ShowSnapshotModal from './containers/snapshots/show';
import NewSnapshotModal from './containers/snapshots/new';

import ShareNetworks from './containers/share_networks/list';
import NewShareNetworkModal from './containers/share_networks/new';
import ShowShareNetworkModal from './containers/share_networks/show';
import EditShareNetworkModal from './containers/share_networks/edit';
import ShareNetworkSecurityServicesModal from './containers/share_networks/security_services';

import SecurityServices from './containers/security_services/list';
import ShowSecurityServiceModal from './containers/security_services/show';
import NewSecurityServiceModal from './containers/security_services/new';
import EditSecurityServiceModal from './containers/security_services/edit';

const tabsConfig = [
  { to: '/shares', label: 'Shares', component: Shares },
  { to: '/snapshots', label: 'Snapshots', component: Snapshots },
  { to: '/share-networks', label: 'Share Networks', component: ShareNetworks },
  { to: '/security-services', label: 'Security Services', component: SecurityServices}
]

// render all components inside a hash router
const Container = (props) =>
  <HashRouter /*hashType="noslash"*/ >
    <div>
      {/* redirect root to shares tab */}
      <Route exact path="/" render={ () => <Redirect to="/shares"/>}/>
      <Route path="/:activeTab" children={ ({match, location, history}) =>
        React.createElement(Tabs, Object.assign({}, {match, location, history, tabsConfig}, props))
      }/>

      <Route exact path="/shares/new" component={NewShareModal}/>
      <Route exact path="/shares/:id/show" component={ShowShareModal}/>
      <Route exact path="/shares/:id/edit" component={EditShareModal}/>
      <Route exact path="/shares/:id/access-control" component={AccessControlModal}/>
      <Route exact path="/shares/:id/snapshots/new" component={NewSnapshotModal}/>

      <Route exact path="/snapshots/:id/show" component={ShowSnapshotModal}/>
      <Route exact path="/snapshots/:id/edit" component={EditSnapshotModal}/>

      <Route exact path="/share-networks/new" component={NewShareNetworkModal}/>
      <Route exact path="/share-networks/:id/show" component={ShowShareNetworkModal}/>
      <Route exact path="/share-networks/:id/edit" component={EditShareNetworkModal}/>
      <Route exact path="/share-networks/:id/security-services" component={ShareNetworkSecurityServicesModal}/>

      <Route exact path="/security-services/new" component={NewSecurityServiceModal}/>
      <Route exact path="/security-services/:id/show" component={ShowSecurityServiceModal}/>
      <Route exact path="/security-services/:id/edit" component={EditSecurityServiceModal}/>
    </div>
  </HashRouter>

export default { Reducers, Container };

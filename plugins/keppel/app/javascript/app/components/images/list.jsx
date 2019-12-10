import { Link } from 'react-router-dom';

import { DataTable } from 'lib/components/datatable';

import { makeTabBar, makeHowto } from '../utils';
import ImageRow from './row';

const taggedColumns = [
  { key: 'name', label: 'Tag name / Canonical digest', sortStrategy: 'text',
    sortKey: props => props.data.name || '' },
  { key: 'media_type', label: 'Format' },
  { key: 'size_bytes', label: 'Size', sortStrategy: 'numeric',
    sortKey: props => props.data.size_bytes || 0 },
  { key: 'pushed_at', label: 'Pushed at', sortStrategy: 'numeric',
    sortKey: props => props.data.pushed_at || 0 },
];

const untaggedColumns = [
  { key: 'digest', label: 'Canonical digest', sortStrategy: 'text',
    sortKey: props => props.data.digest || '' },
  ...(taggedColumns.slice(1)),
];

export default class RepositoryList extends React.Component {
  state = {
    currentTab: 'tagged',
  };

  componentDidMount() {
    this.loadData();
  }
  componentDidUpdate() {
    this.loadData();
  }
  loadData() {
    const { name: accountName } = this.props.account || {};
    const { name: repoName } = this.props.repository || {};
    if (accountName) {
      this.props.loadManifestsOnce(accountName, repoName);
    }
  }

  selectTab(tab) {
    this.setState({ ...this.state, currentTab: tab });
  }

  renderTaggedImagesList() {
    const { isFetching, data: manifests } = this.props.manifests;
    if (isFetching) {
      return <p><span className='spinner' /> Loading tags/manifests for repository...</p>;
    }

    const tags = [];
    for (const manifest of manifests || []) {
      for (const tag of manifest.tags || []) {
        tags.push({ ...manifest, ...tag });
      }
    }
    return (
      <DataTable columns={taggedColumns}>
      {tags.map(tag => (
        <ImageRow key={tag.name} data={tag} />
      ))}
      </DataTable>
    );
  }

  renderUntaggedImagesList() {
    const { isFetching, data: manifests } = this.props.manifests;
    if (isFetching) {
      return <p><span className='spinner' /> Loading tags/manifests for repository...</p>;
    }

    const untaggedManifests = (manifests || []).filter(
      manifest => (manifest.tags || []).length == 0,
    );

    return (
      <DataTable columns={untaggedColumns}>
        {untaggedManifests.map(manifest => (
          <ImageRow key={manifest.digest} data={manifest} />
        ))}
      </DataTable>
    );
  }

  render() {
    const { account, repository } = this.props;
    if (!account) {
      return <p className='alert alert-error'>No such account</p>;
    }
    if (!repository) {
      return <p className='alert alert-error'>No such repository</p>;
    }

    const { currentTab } = this.state;
    let tabs = [
      { label: 'Tags', key: 'tagged' },
      { label: 'Untagged images', key: 'untagged' },
      { label: 'Instructions for Docker client', key: 'howto' },
    ];
    const hasUntagged = (this.props.manifests.data || []).some(
      manifest => (manifest.tags || []).length == 0,
    );
    if (!hasUntagged) {
      tabs = tabs.filter(tab => tab.key != 'untagged');
    }

    return (
      <React.Fragment>
        <ol className='breadcrumb'>
          <li><Link to='/accounts'>All accounts</Link></li>
          <li><Link to={`/account/${account.name}`}>Account: {account.name}</Link></li>
          <li className='active'>Repository: {repository.name}</li>
        </ol>
        {makeTabBar(tabs, currentTab, key => this.selectTab(key))}
        {currentTab == 'tagged' && this.renderTaggedImagesList()}
        {currentTab == 'untagged' && this.renderUntaggedImagesList()}
        {currentTab == 'howto' && makeHowto(this.props.dockerInfo, account.name, repository.name)}
      </React.Fragment>
    );
  }

}
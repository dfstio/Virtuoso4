import React from 'react';
import {Layout} from "antd";
import {Configure, connectHits, connectStateResults, InstantSearch, Pagination, Stats,} from 'react-instantsearch-dom';
import {withUrlSync} from './urlSync';
import 'instantsearch.css/themes/algolia.css';
//import './style.css'
import Header from "./Header";
import Sidebar from "./SideBar";
import Footer from "./Footer";
import ProductList from "./ProductList";
import algoliasearch from 'algoliasearch';

const {Content} = Layout;

const searchClient = algoliasearch('KJYWN9CKS8', 'e362c0f63b9afb700db75abfafecb1aa');
//  'KJYWN9CKS8',
//  'e5df9ff3c346eacace48ca6a18fab2c3'
//);

const App = props => (
  <InstantSearch className="gx-main-content"
                 indexName="virtuoso"
                 searchState={props.searchState}
                 createURL={props.createURL}
                 searchClient={searchClient}
                 onSearchStateChange={props.onSearchStateChange}>

    <Configure hitsPerPage={16}/>

    <Layout className="gx-algolia-layout-has-sider">
      <Sidebar/>
      <div className="gx-algolia-main">
        <Header/>
        <Content className="gx-algolia-content">
          <CustomResults/>
        </Content>
        <Footer>
          <Pagination showLast={true}/>
        </Footer>
      </div>
    </Layout>
  </InstantSearch>
);


const CustomResults = connectStateResults(({searchState, searchResult}) => {
  if (searchResult && searchResult.nbHits === 0) {
  console.log("CustomResults1", searchState, searchResult );
    return (
      <div className="gx-algolia-content-inner">
        <div className="gx-algolia-no-results">
          No results found matching{' '}
          <span className="gx-algolia-query">{searchState.query}</span>
        </div>
      </div>
    );
  } else {
    console.log("CustomResults2", searchState, searchResult );
    return (
      <div className="gx-algolia-content-inner">
        <Stats/>
        <ConnectedProducts/>
      </div>
    );
  }
});

const ConnectedProducts = connectHits(ProductList);

export default withUrlSync(App);

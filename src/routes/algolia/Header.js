import React from "react";
import {connectSearchBox, SortBy} from "react-instantsearch-dom";

const AlgoliaHeader = () => (
  <div className="gx-algolia-header">
    <ConnectedSearchBox/>
    <div className="gx-algolia-sort-by">
      <label>Sort by</label>
      <SortBy
        items={[
          {value: 'tokenId', label: 'Last tokens'},
          {value: 'virtuoso', label: 'Updated'},
        ]}
        defaultRefinement="virtuoso"
      />
    </div>
  </div>
);
const CustomSearchBox = ({currentRefinement, refine}) => (
  <div className="gx-search-bar gx-lt-icon-search-bar">
    <div className="gx-form-group">
      <input
        type="search"
        placeholder="Search here..."
        value={currentRefinement}
        onChange={e => refine(e.target.value)}
        autoComplete="off"
        className="ant-input form-control"
        id="q"
      />
      <span className="gx-search-icon gx-pointer"><i className="icon icon-search"/></span>
    </div>
  </div>
);
const ConnectedSearchBox = connectSearchBox(CustomSearchBox);

export default AlgoliaHeader;

import React from "react";
import {Layout} from "antd";
import {
  ClearRefinements,
  HierarchicalMenu,
  Panel,
  RangeInput,
  RatingMenu,
  RefinementList,
} from "react-instantsearch-dom";

const {Sider} = Layout;
const Sidebar = () => (
  <Sider className="gx-algolia-sidebar">
    <div className="gx-algolia-sidebar-content">
      <ClearRefinements
        translations={{
          reset: 'Clear all filters',
        }}
      />
{/*
      <div className="gx-algolia-category-item">
        <div className="gx-algolia-category-title">Show results for</div>
        <HierarchicalMenu
          attributes={['onSale']}
        />
      </div>
*/}

         <Panel header={<span>OnSale</span>}>
          <RefinementList className="gx-algolia-refinementList"
                          attribute="onSale"

          />
        </Panel>


      <div className="gx-algolia-category-item">
        <div className="gx-algolia-category-title">Refine By</div>

        <Panel header={<span>Category</span>}>
          <RefinementList className="gx-algolia-refinementList"
                  attribute="category"
                  operator="or"
                  limit={5}
                  searchable
                  searchableIsAlwaysActive={false}
                  />
        </Panel>



        <Panel header={<span>Owner</span>}>
          <RefinementList className="gx-algolia-refinementList"
                          attribute="owner"
                          operator="or"
                          limit={5}
                          searchable
          />
        </Panel>

{/*
        <Panel header={<span>Owner</span>}>
          <RatingMenu className="gx-algolia-refinementList" attribute="owner" max={5}/>
        </Panel>
*/}
        <Panel header={<span>Price</span>}>
          <RangeInput className="gx-algolia-refinementList" attribute="price"/>
        </Panel>

          <Panel header={<span>Currency</span>}>
          <RefinementList className="gx-algolia-refinementList"
                          attribute="currency"
                          operator="or"
                          limit={5}
          />
        </Panel>


      </div>

      <div className="thank-you">
        Data courtesy of <a href="https://nftvirtuoso.io/">NFT Virtuoso</a>
      </div>
    </div>
  </Sider>
);


export default Sidebar;


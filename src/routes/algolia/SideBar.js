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
import IntlMessages from "../../util/IntlMessages";

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

         <Panel header=<span><IntlMessages id="sidebar.algolia.onsale"/></span>>
          <RefinementList className="gx-algolia-refinementList"
                          attribute="onSale"

          />
        </Panel>


      <div className="gx-algolia-category-item">
        <div className="gx-algolia-category-title">Refine By</div>

        <Panel header=<span><IntlMessages id="sidebar.algolia.category"/></span>>
          <RefinementList className="gx-algolia-refinementList"
                  attribute="category"
                  operator="or"
                  limit={5}
                  searchable
                  searchableIsAlwaysActive={false}
                  />
        </Panel>



        <Panel header=<span><IntlMessages id="sidebar.algolia.owner"/></span>>
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
        <Panel header=<span><IntlMessages id="sidebar.algolia.price"/></span>>
          <RangeInput className="gx-algolia-refinementList" attribute="price"/>
        </Panel>

          <Panel header=<span><IntlMessages id="sidebar.algolia.currency"/></span>>
          <RefinementList className="gx-algolia-refinementList"
                          attribute="currency"
                          operator="or"
                          limit={5}
          />
        </Panel>


      </div>


    </div>
  </Sider>
);


export default Sidebar;


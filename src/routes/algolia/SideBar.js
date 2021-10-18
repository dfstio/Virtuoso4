import React, { useState, useEffect } from "react";
import {Layout, Checkbox} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {
  ClearRefinements,
  HierarchicalMenu,
  Panel,
  RangeInput,
  RatingMenu,
  RefinementList,
  Configure
} from "react-instantsearch-dom";
import IntlMessages from "../../util/IntlMessages";

const {Sider} = Layout;
const Sidebar = () => {

    const address = useSelector(({blockchain}) => blockchain.address);

    const [filter, setFilter] = useState("uri.visibility:public OR onSale:true");
    const [disabled, setDisabled] = useState(true);
    //const [visible, setVisible] = useState(false);


    function onChange(e) {

         if( address !== "")
         {
             setDisabled(false);
             if( e.target.checked === true )
             {

               const filterStr = "owner:" + address;
               setFilter(filterStr);
               //console.log("On change", e.target.checked, filterStr);
             }
             else
             {
               const filterStr = "uri.visibility:public OR onSale:true OR owner:" + address;
               setFilter( filterStr );

            }
         }
         else
         {
               setDisabled(true);
               setFilter("");
         };

    };

    useEffect(() => {
      if (address == "")
      {
          setDisabled(true);
          setFilter( "uri.visibility:public OR onSale:true");

      }
      else
      {
            setDisabled(false);
            const filterStr = "uri.visibility:public OR onSale:true OR owner:" + address;
            setFilter( filterStr );

      }


  }, [address]);

return (
  <Sider  className="gx-algolia-sidebar">
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

      <div className="gx-algolia-category-item">
        <div className="gx-algolia-category-title">Refine By</div>

          <div className="gx-algolia-refinementList">
        <Checkbox
          onChange={onChange}
          disabled={disabled}
          style={{marginBottom:"20px"}}

          >Only my NFTs


          </Checkbox>
          </div>


        <Configure
          filters={filter}

          />

         <Panel header=<span><IntlMessages id="sidebar.algolia.onsale"/></span>>
          <RefinementList className="gx-algolia-refinementList"
                          attribute="saleStatus"
                          operator="or"
                          limit={5}

          />
        </Panel>





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
                          showMore
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
)};


export default Sidebar;


import React from "react";
import {Card} from "antd";

const {Meta} = Card;
const defaultImage = "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png";

const MintMenuItem = ({ title, creator, description, price, link, image = defaultImage}) => {
  return (

    <Card
        title={creator}
        extra={<span className="gx-link">Create</span>}
        cover={<img alt="example" src={image}/>}
        >
      <p>{description}</p>
        <Meta
        title={title}
        description={price}
      />
    </Card>

  );
};

export default MintMenuItem;


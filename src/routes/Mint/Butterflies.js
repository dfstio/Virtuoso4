import React, {useState, useEffect} from "react";
import {Card, Button, Row, Col, Select} from "antd";

const {Meta} = Card;
const { Option } = Select;
const DEBUG = true;


const butterfliesNum = 9;
const butterflies = [
"Акрея",
"Аматузида",
"Брассолида",
"Волнянка",
"Данаида",
"Морфо",
"Нимфалида",
"Серпокрылка",
"Урания"
];

const butterfliesEng = [
"Acraea",
"Amathusiidae",
"Brassolidae",
"Lymantriidae",
"Danaidae",
"Morpho",
"Nymphalidae",
"Drepanidae",
"Uraniidae"
];

const places = [
"Африка",
"Индонезия",
"Южная Америка",
"обитает везде",
"Америка",
"Амазонка",
"обитает везде",
"Европа",
"Тропики",

];

const rareText = ["обычная", "редкая", "очень редкая"];
const rare = [1, 1, 2, 0, 0, 2, 0, 1, 1];
const prices = [500, 2000, 15000];

let i;
let names = [];
let optionsLeft = [];
let optionsRight = [];

for (i=0; i<9; i++ )
{
  names.push(butterflies[i] + " (" + places[i] + ", " + rareText[rare[i]] + ")");
  optionsLeft.push(<Option value={i} key={"ButterfliesOptionLeft"+i}>{butterflies[i]}</Option>);
  optionsRight.push(<Option value={i} key={"ButterfliesOptionRight"+i}>{butterflies[i]}</Option>);
  //                <Option value="jack">Jack</Option>
};







const MintButterfly = () => {
    const [image, setImage] = useState("https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://ipfs.io/ipfs/QmRXNX7PuJgPktMdzDgQoqcrULJnDNfq7QqH14NrxMCXQ8");
    const [description, setDescription] = useState(
`Эта уникальная бабочка скрещена из двух видов:
Морфо (Амазонка, очень редкая) - 50%
Нимфалида (обитает везде, обычная) - 50%`);
    const [title, setTitle] = useState("Морфо-Нимфалида");
    const [price, setPrice] = useState(700);
    const [left, setLeft] = useState(5);
    const [right, setRight] = useState(6);
    const [minting, setMinting] = useState(false);
    const [mintDisabled, setMintDisabled] = useState(false);

      useEffect(() => {
            async function changeNumbers() {

                 if( DEBUG) console.log("MintButterfly numbers: ", left, right);
                 const newPrice = prices[rare[left]]+prices[rare[right]];
                 if( price !== newPrice) setPrice(newPrice);
                 setTitle(butterflies[left]+"-"+butterflies[right]);
                 setDescription(
`Эта уникальная бабочка скрещена из двух видов:
${names[left]} - 50%
${names[right]}  - 50%`);



        }
      changeNumbers()
      },[left, right]);

      useEffect(() => {
            async function start() {

                 if( DEBUG) console.log("MintButterfly: ", names);

        }
      start()
      },[]);





 const mint = async () => {

    if(DEBUG) console.log("Mint butterfly token: ");
  };

  function handleChangeLeft(value) {
    if(DEBUG)  console.log("Select left: ", value.value); // { value: "lucy", key: "lucy", label: "Lucy (101)" }
    setLeft(value.value);
  }

  function handleChangeRight(value) {
    if(DEBUG)  console.log("Select right: ", value.value); // { value: "lucy", key: "lucy", label: "Lucy (101)" }
    setRight(value.value);
  }


  return (
    <div className="gx-product-item gx-product-vertical" >
    <Card
        title={title}
        cover={<img alt="example" src={image}/>}
        bordered={false}
        >
      <Row>
       <Col xl={12} lg={12} md={12} sm={24} xs={24}>
           <Select
               labelInValue
               defaultValue={{ value: 5 }}
               style={{ width: 150 }}
               onChange={handleChangeLeft}
             >
            {optionsLeft}
            </Select>
       </Col>
        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
           <Select
               labelInValue
               defaultValue={{ value: 6 }}
               style={{ width: 150 }}
               onChange={handleChangeRight}
             >
            {optionsRight}
            </Select>
       </Col>
       </Row>


      <div className="gx-mt-4"  style={{"whiteSpace": "pre-wrap"}}>
      <p>{description}</p>
        <Meta
        title="Цена:"
        description={price + " RUB"}
      />
      </div>
      <div className="gx-mt-4">
           <Button
                 type="primary"
                 onClick={mint}
                 disabled={mintDisabled}
                 loading={minting}
                 >
                 Создать NFT
            </Button>
        </div>
    </Card>
    </div>

  );
};

export default MintButterfly;


import React from "react";
import {Button, Card, Modal, Form, InputNumber, Input, Radio} from "antd";
import {isMobile, isDesktop, isChrome} from 'react-device-detect';
import sell from "../../serverless/sell"

const DEBUG = true;


class SellButton extends React.Component {
  state = {
    ModalText: 'Sell text',
    visible: false,
    confirmLoading: false,
    title: "Sell NFT token " + this.props.item.vrtTokenId,
    price: 0,
    currency: 'usd',
    comment: ""
  };
  showModal = () => {
    this.setState({
      visible: true,
      ModalText: 'Please specify the price of the NFT token',
      confirmLoading: false,
    });
  };
  handleOk = async () => {
    this.setState({
      ModalText: 'Preparing sale information...',
      confirmLoading: true,
    });
    if(DEBUG) console.log("Sell", this.props.item.tokenId, this.state);
    const sellData =
    {
        tokenId: this.props.item.tokenId,
        price: this.state.price,
        currency: this.state.currency,
        comment: this.state.comment,
        item: this.props.item

    };
    const operatorData = await sell.operator(sellData);
    if(DEBUG) console.log("Sell 2", operatorData);
    this.setState({
      ModalText: 'Writing sale information to IPFS...',
      confirmLoading: true,
    });
    const ipfsHash = await sell.ipfs(operatorData.sale);

    let unlockableIPFSHash = "";
    if( this.props.item.contains_unlockable_content === true)
    {
             this.setState({
           ModalText: 'Writing unlockable information to IPFS...',
           confirmLoading: true,
         });

          unlockableIPFSHash = await sell.unlockable(sellData, operatorData, this.props.address);

    };

    this.setState({
      ModalText: 'Writing sale information to blockchain..',
      confirmLoading: true,
    });
    const txresult = await sell.blockchain(
            sellData.tokenId,
            ipfsHash,
            operatorData.sale.operator,
            unlockableIPFSHash,
            this.props.address );
    if(DEBUG) console.log("Sell txresult", txresult);
    this.setState({
        visible: false,
      });
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleChange = (values) => {
  if(DEBUG) console.log("Sell values changed", values);
      if( values.price !== undefined) this.setState({price: values.price});
      if( values.comment !== undefined) this.setState({comment: values.comment});
      if( values.currency !== undefined) this.setState({currency: values.currency});
  };



  render() {
    const {visible, confirmLoading, ModalText, title} = this.state;

    return (
        <span>
        {( (isChrome===true && isDesktop===true && this.props.address !== "") ||
           (this.props.item.uri.contains_unlockable_content === false && this.props.address !== "") )?(
        <Button type="primary" onClick={this.showModal}>Sell</Button>):("")}
        <Modal title={title}
               visible={visible}
               onOk={this.handleOk}
               confirmLoading={confirmLoading}
               onCancel={this.handleCancel}
        >
          <p>{ModalText}</p>
        <Form
        onValuesChange = {this.handleChange}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          currency: 'usd',
          comment: "",
        }}
      >
        <Form.Item
          name="price"
          label="Price"
          rules={[
            {
              required: true,
              message: 'Please input the the price of NFT token!',
            },
          ]}
        >
          <InputNumber
            defaultValue={100}
            min={5}
          />
        </Form.Item>
        {/*}
        <Form.Item name="comment" label="Comment">
          <Input type="textarea" />
        </Form.Item>
        */}
        <Form.Item name="currency" className="currency-sell-form_last-form-item">
          <Radio.Group>
            <Radio value="usd"  >USD</Radio>
            <Radio value="eur"  >EUR</Radio>
            <Radio value="chf"  >CHF</Radio>
            <Radio value="rub"  >RUB</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>

        </Modal>
       </span>
    );
  }
};

export default SellButton;

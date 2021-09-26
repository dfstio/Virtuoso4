import React from "react";
import {Button, Card, Modal, Form, InputNumber, Input, Radio} from "antd";
import sellToken from "../../serverless/sell"



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
    });
  };
  handleOk = async () => {
    this.setState({
      ModalText: 'Writing sell price information to blockchain...',
      confirmLoading: true,
    });
    console.log("Sell", this.props.item.tokenId, this.state);
    const sellData =
    {
        tokenId: this.props.item.tokenId,
        price: this.state.price,
        currency: this.state.currency,
        comment: this.state.comment,
        item: this.props.item

    };
    await sellToken(sellData);
    setTimeout(() => {
      this.setState({
        visible: false,
        confirmLoading: false,
      });
    }, 2000);
    console.log("Sold");
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleChange = (values) => {
  console.log("Sell values changed", values);
      if( values.price !== undefined) this.setState({price: values.price});
      if( values.comment !== undefined) this.setState({comment: values.comment});
      if( values.currency !== undefined) this.setState({currency: values.currency});
  };



  render() {
    const {visible, confirmLoading, ModalText, title} = this.state;

    return (
        <span>
        <Button type="primary" onClick={this.showModal}>Sell</Button>
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
          <InputNumber min={5}/>
        </Form.Item>
        <Form.Item name="comment" label="Comment">
          <Input type="textarea" />
        </Form.Item>
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

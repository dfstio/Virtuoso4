import React from "react";
import {Button, Card, Modal, Form, InputNumber, Input, Radio} from "antd";
import { useParams } from "react-router-dom";

class SellButton extends React.Component {
  const {tokenId, vrtTokenId} = useParams();
  state = {
    ModalText: 'Sell text',
    visible: false,
    confirmLoading: false,
    title: "Sell NFT token " + props.vrtTokenId
  };
  showModal = () => {
    this.setState({
      visible: true,
      ModalText: 'Please specify the price of the NFT token',
    });
  };
  handleOk = () => {
    this.setState({
      ModalText: 'Writing sell price information to blockchain...',
      confirmLoading: true,
    });
    console.log("Sell");
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



  render() {
    const {visible, confirmLoading, ModalText} = this.state;

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

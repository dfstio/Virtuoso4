import React from "react";
import {Button, Card, Modal} from "antd";

class Sell extends React.Component {
  state = {
    ModalText: 'Sell text',
    visible: false,
    confirmLoading: false,
  };
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = () => {
    this.setState({
      ModalText: 'The modal will be closed after two seconds',
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
      <Card title="Sell Card" className="gx-card">
        <Button type="primary" onClick={this.showModal}>Sell</Button>
        <Modal title="Sell NFT token"
               visible={visible}
               onOk={this.handleOk}
               confirmLoading={confirmLoading}
               onCancel={this.handleCancel}
        >
          <p>{ModalText}</p>
                <Form
        form={form}
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
      </Card>
    );
  }
};

export default Sell;

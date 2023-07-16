import React, { useContext, useEffect, useState, useSyncExternalStore } from "react";
import {
  Segment,
  Button,
  Form,
  Message,
  Label,
  Container,
  Table,
} from "semantic-ui-react";
import ResponsiveContainer from "../../components/containers/ResponsiveContainer";


import { Web3DataContext } from "../../context/Web3Context";
import {  ethers } from "ethers";
import alertify from "alertifyjs"



const HomepageLayout = () => {
  const { usdtContract, getUSDTBalance, provider, address } =
    useContext(Web3DataContext);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    color: "",
    text: "",
  });

  const [inputValue, setInputValue] = useState("")
  const [lists, setLists] = useState([]);
  const [inputValueMulti, setInputValueMulti] = useState("")
  

  const onSubmitTransfer = async (e) => {
    // console.log("onSubmit  e:", e.target["address"].value);
    const address = e.target["address"].value;
    const amount = e.target["amount"].value;
    console.log("onSubmit  amount:", address, typeof amount);

    if (!address || !amount || amount == "0") {
      displayMessage("red", "Please fill the inputs");
      return;
    }
    // 0xa0d3487c2fD9581b4bCBf5Eb9083FDfe6c365448
    
    setLoading(true);
    try {
      const txResponse = await usdtContract.transfer(
        address,
        ethers.utils.parseUnits(amount, 18)
      );
      const txReceipt = await txResponse.wait();
      console.log("onSubmit  txReceipt:", txReceipt); 
      setLoading(false);
      displayMessage("green", `Transaction successful`);

      getUSDTBalance();
    } catch (error) {
      console.log("onSubmit  error:", error);
      setLoading(false);
      alertify.error(error.reason)
      // displayMessage("red", error?.message || JSON.stringify(error));
    }
  };

  const onTransferMulti = async() => {
    if(!inputValueMulti || inputValueMulti=="0") {
      alertify.error("please fill the amount")
    }
    setLoading(true);
    try {
      for ( let i = 0; i < lists.length; i++) {
        const eachAddress = lists[i];
        console.log(eachAddress);
        
        const txResponse = await usdtContract.transfer(
          eachAddress, ethers.utils.parseUnits(inputValueMulti, 18))
          const txReceipt = await txResponse.wait();
          getUSDTBalance();
      }
      setLoading(false);
      alertify.success("Transaction for all address successful")

    } catch (error) {
      console.log("onSubmit  error:", error);
      setLoading(false);
      alertify.error(error.reason)
      // alertify.error(error?.message || JSON.stringify(error));
    }
  }

  const onSubmitTransferFrom = async (e) => {
    // console.log("onSubmit  e:", e.target["address"].value);
    const fromAddress = e.target["fromAddress"].value;
    const toAddress = e.target["toAddress"].value;
    const amount = e.target["amount"].value;
    // console.log("onSubmit  amount:", address, typeof amount);

    if (!fromAddress || !toAddress || !amount || amount == "0") {
      displayMessage("red", "Please fill the inputs");
      return;
    }
    setLoading(true);
    try {
      const txResponse = await usdtContract.transferFrom(
        fromAddress,
        toAddress,
        ethers.utils.parseUnits(amount, 18)
      );
      const txReceipt = await txResponse.wait();
      console.log("onSubmit  txReceipt:", txReceipt);
      setLoading(false);
      displayMessage(
        "green",
        `From ${fromAddress} to ${toAddress} Transaction successful`
      );

      getUSDTBalance();
    } catch (error) {
      console.log("onSubmit  error:", error);
      setLoading(false);
      displayMessage("red", error?.message || JSON.stringify(error));
    }
  };

  const onSubmitApprove = async (e) => {
    const address = e.target["address"].value;
    const amount = e.target["amount"].value;
    // console.log("onSubmit  amount:", address, typeof amount);

    if (!address || !amount || amount == "0") {
      displayMessage("red", "Please fill the inputs");
      return;
    }
    setLoading(true);
    try {
      const txResponse = await usdtContract.approve(
        address,
        ethers.utils.parseUnits(amount, 18)
      );
      const txReceipt = await txResponse.wait();
      console.log("onSubmit  txReceipt:", txReceipt);
      setLoading(false);
      displayMessage("green", `Allowance successful`);
    } catch (error) {
      console.log("onSubmit  error:", error);
      setLoading(false);
      displayMessage("red", error?.message || JSON.stringify(error));
    }
  };

  const onSubmitAllowance = async (e) => {
    const ownerAddress = e.target["ownerAddress"].value;
    const spenderAddress = e.target["spenderAddress"].value;
    if (!ownerAddress || !spenderAddress) {
      displayMessage("red", "Please fill the inputs");
      return;
    }
    setLoading(true);

    try {
      const allowance = await usdtContract.allowance(
        ownerAddress,
        spenderAddress
      );
      console.log("onSubmitAllowance  allowance:", allowance);
      let messageText = `${ownerAddress} is allowed to spend ${ethers.utils.formatEther(
        allowance
      )}`;
      setLoading(false);
      displayMessage("blue", messageText, 15000);
    } catch (error) {
      console.log("onSubmit  error:", error);
      setLoading(false);
      displayMessage("red", error?.message || JSON.stringify(error));
    }
  };

  const displayMessage = (color, msg, duration) => {
    setMessage({
      color,
      text: msg,
    });

    setTimeout(() => {
      setMessage({
        color: "",
        text: "",
      });
    }, duration || 10000);

  };
 

  
  const handleChange = (event) => {
    setInputValue(event.target.value);
    
  };

  const handleChangeMulti = (event) => {
    setInputValueMulti(event.target.value)
  }

  const onAddList = ()=> {
    setInputValue("")
    try {
      const list= inputValue
      
      if (lists.includes(list)) {
        alertify.error("This address already exists.")
      } else if (list === "") {
        alertify.error("Please enter an address.")
      } else {
        const regex = /^[a-zA-Z0-9]{25,42}$/;
        if (!regex.test(list)) {
          alertify.error("Invalid address")
        } else {
            const isMetamaskAddress = list.startsWith("0x");
            if (!isMetamaskAddress) {
              alertify.error("Invalid address")
          } else {
          setInputValue("");
          setLists([...lists, list])
          alertify.success("this address is added.. ")
          }
        }
      }
    } catch (error) {
      
    }
  }

  const handleRemove = (list) => {
    setLists(lists.filter((m) => m !== list));
    alertify.error("address is removed")
  };
  
 
  // useEffect(() => {
  //   const filter = {
  //     address:"0x6175a8471C2122f778445e7E07A164250a19E661",
  //     topic:[ethers.utils.id("Transfer(address,address,uint256)")],
  //   }

  //   console.log(filter);

  //   provider.on(filter,(log)=>{
      
  //     displayMessage("green", "asdfasdfasdf");
  //   })
  
  //   return () => {
      
  //   }
  // }, [])
  

  // const onTransfer =async () => {
  //   const eventFilter = usdtContract.filters.Transfer(address);
  //   const events = await usdtContract.queryFilter(eventFilter);
  //   console.log(events);
  // }

  return (
    <ResponsiveContainer>
      <Container style={{ display: "flex", gap: 20 }}>
        <Segment
          style={{
            width: "30vw",
            padding: 20,
          }}
          size="small"
        >
          <Form onSubmit={onSubmitTransfer} loading={loading}>
            <Label>Transfer</Label>
            <Form.Input
              type="text"
              label="Address"
              name="address"
              placeholder="0x00"
            />
            <Form.Input
              type="number"
              label="Amount"
              name="amount"
              placeholder="20"
            />
            <Button color="green" type="submit">
              Transfer
            </Button>
          </Form>
        </Segment>
        <Segment
          style={{
            width: "30vw",
            padding: 20,
          }}
          size="small"
        >
          <Form onSubmit={onSubmitApprove} loading={loading}>
            <Label>Approve</Label>
            <Form.Input
              type="text"
              label="Address"
              name="address"
              placeholder="0x00"
            />
            <Form.Input
              type="number"
              label="Amount"
              name="amount"
              placeholder="20"
            />
            <Button color="blue" type="submit">
              Approve
            </Button>
          </Form>
        </Segment>
        <Segment
          style={{
            width: "30vw",
            padding: 20,
          }}
          size="small"
        >
          <Form onSubmit={onSubmitAllowance} loading={loading}>
            <Label>Allowances</Label>
            <Form.Input
              type="text"
              label="Owner Address"
              name="ownerAddress"
              placeholder="0x00"
            />
            <Form.Input
              type="text"
              label="Spender Address"
              name="spenderAddress"
              placeholder="0x00"
            />
            <Button color="blue" type="submit">
              Get Allowance
            </Button>
          </Form>
        </Segment>
        <Segment
          style={{
            width: "30vw",
            padding: 20,
          }}
          size="small"
        >
          <Form onSubmit={onSubmitTransferFrom} loading={loading}>
            <Label>Transfer From</Label>
            <Form.Input
              type="text"
              label="From"
              name="fromAddress"
              placeholder="0x00"
            />
            <Form.Input
              type="text"
              label="To"
              name="toAddress"
              placeholder="0x00"
            />
            <Form.Input
              type="number"
              label="Amount"
              name="amount"
              placeholder="20"
            />
            <Button color="blue" type="submit">
              TransferFrom
            </Button>
          </Form>
        </Segment>
      </Container>
      {message.text ? (
        <Message color={message.color}>{message.text}</Message>
      ) : (
        false
      )}
      <Button style={{marginLeft:50, marginTop:50}}>events</Button>
      <br></br>
      <br></br>
      <Label style={{
        width: "30vw",
        padding: 5,
        marginTop:10,
        marginLeft:50,
        marginBottom:10,
      }} >Multi transfer</Label>
      <Container style={{ display: "flex", gap: 20, marginBottom:50, }}>
        
      <Segment
      style={{
        width: "30vw",
        padding: 20,
        marginTop:0,
        marginBottom: 30,
      }}
      size="small"
      ><Form   loading={loading}>
        
            <Form.Input
              type="text"
              label="address to add the list"
              name="ownerAddress"
              placeholder="0x00"
                value={inputValue}
                onChange={handleChange}></Form.Input>
              
           
            <Button color="blue" onClick={onAddList}>
              add to list
            </Button>
          </Form></Segment>
          <Segment 
          style={{
            width: "60vw",
            padding: 20,
            marginTop:0,
            marginBottom:30,
          }}
          size="small"
          >
            <Table>
              <thead>
                <tr>
                  <th>The number of addresses: {lists.length}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lists.map((e, index)=> (
                  <tr key={e.id}>
                    <td>{index + 1} - {e}</td>
                    <td><Button size="mini" color="red" onClick={() => handleRemove(e)}>remove</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            <Form  loading={loading}>
            <Form.Input
              type="number"
              label="Amount"
              name="amount"
              placeholder="20"
              value={inputValueMulti}
                onChange={handleChangeMulti}
            />
            <Button onClick={onTransferMulti} color="green" type="submit">
              Transfer
            </Button>
          </Form></Segment>
      </Container>
    </ResponsiveContainer>
    
  );
};
export default HomepageLayout;

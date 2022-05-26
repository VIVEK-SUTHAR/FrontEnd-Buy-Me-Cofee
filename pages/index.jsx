import { ethers } from "ethers";
import Head from 'next/head';
import React, { useEffect, useState } from "react";
import CONTRACTADDRESS from "../config";
import styles from '../styles/Home.module.css';
import abi from '../utils/BuyMeACoffee.json';
export default function Home() {
  // Contract Address & ABI
  const contractAddress=CONTRACTADDRESS || "0xcF6465aFc2A52a52c012C9b042c5E997052E95a8";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMetamsk, setIsMetamsk] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);
      if (accounts.length > 0) {
        const account = accounts[0];
        // console.log("wallet is connected! " + account);
      } else {
        // console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setIsMetamsk(false);
        // console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "Annoymus",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const buyLargeCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "Annoymus",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.003") }
        );

        await coffeeTxn.wait();

        // console.log("mined ", coffeeTxn.hash);

        // console.log("coffee purchased!");
        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy Vivek S a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Buy Vivek a Coffee!
        </h1>

        {currentAccount ? (
          <div>
            <form>
              <div>
                <label>
                  Name
                </label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="Your beautiful Name"
                  onChange={onNameChange}
                  className="input"
                />
              </div>
              <br />
              <div>
                <label>
                  Send Vivek a message
                </label>
                <br />

                <textarea
                  rows={5}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required

                  className="input"
                >
                </textarea>
              </div>
              <div className="btns">
                <button
                  type="button"
                  onClick={buyCoffee}
                  className="btn submit"
                >
                  Send 1 Coffee ☕ for 0.001ETH
                </button>
                <button
                  type="button"
                  onClick={buyLargeCoffee}
                  className="btn submit"
                >
                  Send 1 Large Coffee ☕ for 0.003ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {
              !isMetamsk ? (
                <>
                  <div className="notfound">
                    Metamsk Not Installed,Please Install it and then try
                  </div>
                </>
              ) : (
                null
              )
            }
            <button onClick={connectWallet} className="btn"> Connect your wallet </button>
          </>
        )}
      </main>

      {currentAccount && (<h1 style={{
        color: "white"
      }}>Memos received</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} className="memoReceivedCard">
            <p className="msg">{memo.message}</p>
            <p className="from">From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}

      <footer className={styles.footer}>
        <a
          href="https://alchemy.com/?a=roadtoweb3weektwo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by @theviveksuthar for Alchemy Road to Web3 lesson two!
        </a>
      </footer>
    </div>
  )
}

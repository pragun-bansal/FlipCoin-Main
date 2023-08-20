import React from "react";
import { ethers } from "ethers";
import { ADMIN_PVT_KEY, TOKEN_ADDRESS } from "../bkd";
import Flcabi from "../utils/flcabi.json";

const FlipcoinPage = () => {
  const [value, setValue] = React.useState(0);
  const [cryptoBalance, setCryptoBalance] = React.useState(0);
  const [sentTransactions, setSentTransactions] = React.useState([]);
  const [receivedTransactions, setReceivedTransactions] = React.useState([]);
  const [totalSpent, setTotalSpent] = React.useState(0);
  const [totalReceived, setTotalReceived] = React.useState(0);

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const sender = new ethers.Wallet(ADMIN_PVT_KEY, provider);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(TOKEN_ADDRESS, Flcabi, sender);
    const walletaddress = await signer.getAddress();
    const balance = await contract.balanceOf(walletaddress);
    setCryptoBalance(ethers.utils.formatEther(balance));
  };

  React.useEffect(() => {
    connectWallet();
  }, []);

  React.useEffect(() => {
    const getTransactionHistory = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const sender = new ethers.Wallet(ADMIN_PVT_KEY, provider);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, Flcabi, sender);
      const walletAddress = await signer.getAddress();
      await provider.send("eth_requestAccounts", []);
      const filter = tokenContract.filters.Transfer(walletAddress, null);
      const transferEventsSent = await tokenContract.queryFilter(filter);
      transferEventsSent.reverse();
      const tmp = [];
      let currsent = 0;
      transferEventsSent.forEach(async (tx) => {
        const ev = await tx.getBlock();
        const datetx = new Date(ev.timestamp * 1000);
        const tmpval = ethers.utils.formatEther(tx.args.value);
        currsent += tmpval;
        tmp.push({
          to: tx.args.to,
          amount: ethers.utils.formatEther(tx.args.value),
          date: datetx.toLocaleString(),
        });
      });

      setSentTransactions(tmp);
      setTotalSpent(currsent);

      const filter2 = tokenContract.filters.Transfer(null, walletAddress);
      const transferEventsReceived = await tokenContract.queryFilter(filter2);

      const tmp2 = [];
      let currreceived = 0;
      transferEventsReceived.forEach(async (tx) => {
        const ev = await tx.getBlock();
        const datetx = new Date(ev.timestamp * 1000);
        const tmpval = ethers.utils.formatEther(tx.args.value);
        currreceived += tmpval;
        tmp2.push({
          from: tx.args.from,
          amount: ethers.utils.formatEther(tx.args.value),
          date: datetx.toLocaleString(),
        });
      });

      setTotalReceived(currreceived);
      setReceivedTransactions(tmp2);
    };
    getTransactionHistory();
  }, []);

  return (
    <div className="flex flex-row px-10 gap-x-6 flipcoinpage">
      <div className="bg-white h-[80vh] mt-24 border-gray rounded-2xl shadow-md  overflow-y-scroll w-2/3 beautifulscroller">
        <div className="flex flex-row justify-between items-center w-full cursor-pointer border-gray-200 border-b-2">
          <div
            className={`flex flex-row justify-between items-center w-1/2 p-4 rounded-t-2xl ${
              value === 0 ? "bg-gray-200" : ""
            }`}
            onClick={() => setValue(0)}
          >
            <p className="text-gray-800 text-lg text-center w-full  border-gray-200">
              Sent Transactions
            </p>
          </div>
          <div
            className={`flex flex-row justify-between items-center w-1/2 p-4 rounded-t-2xl ${
              value === 1 ? "bg-gray-200" : ""
            }`}
            onClick={() => setValue(1)}
          >
            <p className="text-gray-800 text-lg text-center w-full border-gray-200">
              Recived Transactions
            </p>
          </div>
        </div>

        {value === 0 ? (
          <div>
            <table class="min-w-full text-left text-sm font-light">
              <thead class="border-b font-medium dark:border-neutral-500">
                <tr>
                  <th scope="col" class="px-6 py-4">
                    S.No
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Sent to{" "}
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Amount
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {sentTransactions.map((tx, index) => (
                  <tr
                    class="border-b transition duration-300 ease-in-out hover:bg-neutral-200"
                    key={index}
                  >
                    <td class="whitespace-nowrap px-6 py-4 font-medium">
                      {index + 1}
                    </td>
                    <td class="whitespace-nowrap px-6 py-4">{tx.to}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-red-400 font-bold">
                      {tx.amount} FLC
                    </td>
                    <td class="whitespace-nowrap px-6 py-4">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <table class="min-w-full text-left text-sm font-light">
              <thead class="border-b font-medium dark:border-neutral-500">
                <tr>
                  <th scope="col" class="px-6 py-4">
                    S.No
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Recived from{" "}
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Amount
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {receivedTransactions.map((tx, index) => (
                  <tr
                    class="border-b transition duration-300 ease-in-out hover:bg-neutral-200"
                    key={index}
                  >
                    <td class="whitespace-nowrap px-6 py-4 font-medium">
                      {index + 1}
                    </td>
                    <td class="whitespace-nowrap px-6 py-4">{tx.from}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-green-400 font-bold">
                      {tx.amount} FLC
                    </td>
                    <td class="whitespace-nowrap px-6 py-4">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div class="wallet-container iphone h-[80vh] mt-20 mt-24 border-gray rounded-2xl shadow-md w-1/3">
        <div class=" w-full">
          <div class="wallet-header">
            <div class="wallet-header-summary">
              <div class="summary-text">Your Flipcoins Balance</div>
              <div class="summary-balance text-lg">{cryptoBalance} FLCs</div>
            </div>
          </div>
          <div class="content">
            <div class="card">
              <div class="upper-row ">
                <div className="text-[16px] text-center font-medium">
                  <span>You Spent</span>
                  <br />
                  <span> &nbsp; {totalSpent} FLC</span>
                </div>
                <div className="text-[16px] text-center font-medium">
                  <span>You Received</span>
                  <br />
                  <span>&nbsp; {totalReceived} FLC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipcoinPage;
